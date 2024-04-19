const _ = require('lodash');
const fs = require('fs');
const batchflow = require('batchflow');
const logger = require('../logger').access;
const error = require('../lib/error');
const utils = require('../lib/utils');
const rulesListModel = require('../models/rules_list');
const internalAuditLog = require('./audit-log');
const internalNginx = require('./nginx');

function omissions() {
	return ['is_deleted'];
}

const internalRulesList = {
	/**
	 * @param   {Access}  access
	 * @param   {Object}  data
	 * @returns {Promise}
	 */
	create: (access, data) => {
		return access
			.can('rules_lists:create', data)
			.then((/*rules_data*/) => {
				return rulesListModel
					.query()
					.insertAndFetch({
						name: data.name,
						description: data.description,
						enabled: !!data.enabled,
						sort: data.sort,
						block_type: data.block_type,
						lua_script: data.lua_script,
					})
					.then(utils.omitRow(omissions()));
			})

			.then(() => {
				return internalRulesList.get(access, {
					id: data.id,
				});
			})
			.then((row) => {
				// Audit log
				data.meta = _.assign({}, data.meta || {}, row.meta);

				return internalRulesList.build(row).then(() => {
					// Add to audit log
					return internalAuditLog.add(access, {
						action: 'created',
						object_type: 'rules-list',
						object_id: row.id,
						meta: data,
					});
				});
			});
	},

	/**
	 * @param  {Access}  access
	 * @param  {Object}  data
	 * @param  {Integer} data.id
	 * @param  {String}  [data.name]
	 * @param  {String}  [data.items]
	 * @return {Promise}
	 */
	update: (access, data) => {
		return access
			.can('rules_lists:update', data.id)
			.then((/*rules_data*/) => {
				return internalRulesList.get(access, { id: data.id });
			})
			.then((row) => {
				if (row.id !== data.id) {
					// Sanity check that something crazy hasn't happened
					throw new error.InternalValidationError('Rules List could not be updated, IDs do not match: ' + row.id + ' !== ' + data.id);
				}
			})
			.then(() => {
				// patch name if specified
				if (typeof data.name !== 'undefined' && data.name) {
					return rulesListModel.query().where({ id: data.id }).patch({
						name: data.name,
						description: data.description,
						enabled: data.enabled,
						sort: data.sort,
						block_type: data.block_type,
						lua_script: data.lua_script,
					});
				}
			})
			.then(() => {
				// Add to audit log
				return internalAuditLog.add(access, {
					action: 'updated',
					object_type: 'rules-list',
					object_id: data.id,
					meta: data,
				});
			})
			.then(() => {
				return internalRulesList.get(access, {
					id: data.id,
				});
			})
			.then((row) => {
				return internalRulesList.build(row).then(internalNginx.reload);
			});
	},

	/**
	 * @param  {Access}   access
	 * @param  {Object}   data
	 * @param  {Integer}  data.id
	 * @param  {Array}    [data.expand]
	 * @param  {Array}    [data.omit]
	 * @return {Promise}
	 */
	get: (access, data) => {
		return access
			.can('settings:get', data.id)
			.then(() => {
				return settingModel.query().where('id', data.id).first();
			})
			.then((row) => {
				if (row) {
					return row;
				} else {
					throw new error.ItemNotFoundError(data.id);
				}
			});
	},

	/**
	 * @param   {Access}  access
	 * @param   {Object}  data
	 * @param   {Integer} data.id
	 * @param   {String}  [data.reason]
	 * @returns {Promise}
	 */
	delete: (access, data) => {
		return access
			.can('rules_lists:delete', data.id)
			.then(() => {
				return internalRulesList.get(access, { id: data.id });
			})
			.then((row) => {
				if (!row) {
					throw new error.ItemNotFoundError(data.id);
				}

				// 1. update row to be deleted
				// 2. update any proxy hosts that were using it (ignoring permissions)
				// 3. reconfigure those hosts
				// 4. audit log

				// 1. update row to be deleted
				return rulesListModel
					.query()
					.where('id', row.id)
					.patch({
						is_deleted: 1,
					})
					.then(() => {
						// 4. audit log
						return internalAuditLog.add(access, {
							action: 'deleted',
							object_type: 'rules-list',
							object_id: row.id,
							meta: _.omit(row, omissions()),
						});
					});
			})
			.then(() => {
				return true;
			});
	},

	getAll: (access, search_query) => {
		return access.can('rules_lists:list').then(() => {
			let query = rulesListModel.query().orderBy('created_on', 'DESC').orderBy('id', 'DESC').limit(100);

			// Query is used for searching
			if (typeof search_query === 'string') {
				query.where(function () {
					this.where('name', 'like', '%' + search_query + '%')
						.orWhere('description', 'like', '%' + search_query + '%')
						.orWhere('lua_script', 'like', '%' + search_query + '%')
						.orWhere('block_type', 'like', '%' + search_query + '%');
				});
			}

			return query;
		});
	},
	/**
	 * Report use
	 *
	 * @param   {Integer} user_id
	 * @param   {String}  visibility
	 * @returns {Promise}
	 */
	getCount: (user_id, visibility) => {
		let query = rulesListModel.query().count('id as count').where('is_deleted', 0);

		if (visibility !== 'all') {
			query.andWhere('owner_user_id', user_id);
		}

		return query.first().then((row) => {
			return parseInt(row.count, 10);
		});
	},


	/**
	 * @param   {Object}  list
	 * @param   {Integer} list.id
	 * @returns {String}
	 */
	getFilename: (list) => {
		return '/data/rules/' + list.id;
	},

	/**
	 * @param   {Object}  list
	 * @param   {Integer} list.id
	 * @param   {String}  list.name
	 * @param   {Array}   list.items
	 * @returns {Promise}
	 */
	build: (list) => {
		logger.info('Building Rules file #' + list.id + ' for: ' + list.name);

		return new Promise((resolve, reject) => {
			let htpasswd_file = internalRulesList.getFilename(list);

			// 1. remove any existing rules file
			try {
				fs.unlinkSync(htpasswd_file);
			} catch (err) {
				// do nothing
			}

			// 2. create empty rules file
			try {
				fs.writeFileSync(htpasswd_file, '', { encoding: 'utf8' });
				resolve(htpasswd_file);
			} catch (err) {
				reject(err);
			}
		}).then((htpasswd_file) => {
			// 3. generate password for each user
			if (list.items.length) {
				return new Promise((resolve, reject) => {
					batchflow(list.items)
						.sequential()
						.each((i, item, next) => {
							if (typeof item.password !== 'undefined' && item.password.length) {
								logger.info('Adding: ' + item.username);

								utils
									.execFile('/usr/bin/htpasswd', ['-b', htpasswd_file, item.username, item.password])
									.then((/*result*/) => {
										next();
									})
									.catch((err) => {
										logger.error(err);
										next(err);
									});
							}
						})
						.error((err) => {
							logger.error(err);
							reject(err);
						})
						.end((results) => {
							logger.success('Built Rules file #' + list.id + ' for: ' + list.name);
							resolve(results);
						});
				});
			}
		});
	},
};

module.exports = internalRulesList;
