const _ = require('lodash');
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
						enabled: true,
						sort: data.sort,
						block_type: data.block_type,
						lua_script: data.lua_script,
						is_system: false,
					})
					.then(utils.omitRow(omissions()));
			})
			.then((data) => {
				internalRulesList.buildFile(data);
			})
			.then((row) => {
				// Add to audit log
				return internalAuditLog
					.add(access, {
						action: 'created',
						object_type: 'rules-list',
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
				return row;
			})
			.then((row) => {
				if (row.sort != data.sort) {
					internalRulesList.removeOriFile(row);
				}
			})
			.then(() => {
				// patch name if specified
				if (typeof data.name !== 'undefined' && data.name) {
					return rulesListModel.query().where({ id: data.id }).patch({
						name: data.name,
						description: data.description,
						sort: data.sort,
						block_type: data.block_type,
						lua_script: data.lua_script,
					});
				}
			})
			.then((data) => {
				internalRulesList.buildFile(data);
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
	 * @param {Access}  access
	 * @param {Object}  data
	 * @param {Number}  data.id
	 * @param {String}  [data.reason]
	 * @returns {Promise}
	 */
	enable: (access, data) => {
		return access
			.can('rules_lists:update', data.id)
			.then(() => {
				return internalRulesList.get(access, { id: data.id });
			})
			.then((row) => {
				if (!row) {
					throw new error.ItemNotFoundError(data.id);
				} else if (row.enabled) {
					throw new error.ValidationError('Rule is already enabled');
				}

				row.enabled = 1;

				return rulesListModel
					.query()
					.where('id', row.id)
					.patch({
						enabled: 1,
					})
					.then(() => {
						// Add to audit log
						return internalAuditLog.add(access, {
							action: 'enabled',
							object_type: 'rules-list',
							object_id: row.id,
							meta: _.omit(row, omissions()),
						});
					});
			})
			.then(() => {
				internalRulesList.buildFile(data);
			})
			.then(() => {
				return true;
			});
	},

	/**
	 * @param {Access}  access
	 * @param {Object}  data
	 * @param {Number}  data.id
	 * @param {String}  [data.reason]
	 * @returns {Promise}
	 */
	disable: (access, data) => {
		return access
			.can('rules_lists:update', data.id)
			.then(() => {
				return internalRulesList.get(access, { id: data.id });
			})
			.then((row) => {
				if (!row) {
					throw new error.ItemNotFoundError(data.id);
				} else if (!row.enabled) {
					throw new error.ValidationError('Rule is already disabled');
				}
				row.enabled = 0;

				return rulesListModel
					.query()
					.where('id', row.id)
					.patch({
						enabled: 0,
					})
					.then(() => {
						// Add to audit log
						return internalAuditLog.add(access, {
							action: 'disabled',
							object_type: 'rules-list',
							object_id: row.id,
							meta: _.omit(row, omissions()),
						});
					});
			})
			.then(() => {
				internalRulesList.removeOriFile(data);
			})
			.then(() => {
				return true;
			});
	},
	getFilename: (item) => {
		return `/etc/nginx/lua/waf_detectors/rule_${item.sort.toString().padStart(4, '0')}_${item.id.toString().padStart(4, '0')}.lua`;
	},

	removeOriFile: (oriData) => {
		let lua_waf_file_name = internalRulesList.getFilename(oriData);
		try {
			fs.unlinkSync(lua_waf_file_name);
			//reset scripts cache
			internalNginx.cleanDictKey('shared_data', 'waf_detectors_list');
		} catch (err) {
			// do nothing
		}
	},

	buildFile: (data) => {
		logger.info('Building waf lua file #' + data.id + ' for: ' + data.name);

		let lua_waf_file_name = internalRulesList.getFilename(data);
		// 1. remove any existing access file
		try {
			fs.unlinkSync(lua_waf_file_name);
		} catch (err) {
			// do nothing
		}

		// 2. create lua file
		try {
			fs.writeFileSync(
				lua_waf_file_name,
				`local function mainFunc()
						${data.lua_script}
					end
					return mainFunc`,
				{ encoding: 'utf8' },
			);
			//reset scripts cache
			internalNginx.cleanDictKey('shared_data', 'waf_detectors_list');
		} catch (err) {
			reject(err);
		}
	},
};

module.exports = internalRulesList;
//todo reload nginx?
