const _ = require('lodash');
const error = require('../lib/error');
const utils = require('../lib/utils');
const rulesListModel = require('../models/rules_list');
const internalAuditLog = require('./audit-log');

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
				internalAuditLog.add(access, {
					action: 'created',
					object_type: 'proxy-host',
					object_id: 1,
					meta: { test: 1 },
				});
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
			// .then((row) => {
			// 	return internalRulesList.get(access, {
			// 		id: row.id,
			// 	});
			// })
			.then((row) => {
				// Audit log
				data.meta = _.assign({}, data.meta || {}, row.meta);

				// Add to audit log
				return internalAuditLog
					.add(access, {
						action: 'created',
						object_type: 'proxy-host',
						object_id: row.id,
						meta: data,
					})
					.then(() => {
						return row;
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
			});
		//todo nginx reload
		// .then((row) => {
		// 	return internalRulesList.build(row).then(internalNginx.reload);
		// });
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
			.can('rules_lists:get', data.id)
			.then(() => {
				return rulesListModel.query().where('id', data.id).first();
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
};

module.exports = internalRulesList;
