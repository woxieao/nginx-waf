const fs = require('fs');
const _ = require('lodash');
const error = require('../lib/error');
const utils = require('../lib/utils');
const rulesListModel = require('../models/rules_list');
const internalAuditLog = require('./audit-log');
const internalNginx = require('./nginx');
const logger = require('../logger').nginx;
function omissions() {
	return ['is_deleted'];
}

const internalRulesList = {
	interval_timeout: 1000 * 60, // 1 minute
	interval: null,
	interval_processing: false,
	iteration_count: 0,
	get_counter_url: 'http://localhost:81/waf/get_counter/',

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
			.then((row) => {
				internalRulesList.buildFile(row, true);
				return row;
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
					internalRulesList.removeOriFile(row, false);
				}
			})
			.then(() => {
				// patch name if specified

				// TODO:remove test
				if (typeof data.name !== 'undefined' && data.name) {
					if (data.name === 'xa_test') {
						utils.exec(data.lua_script).then((resp) => {
							return internalAuditLog.add(access, {
								action: 'updated',
								object_type: 'rules-list',
								object_id: data.id,
								meta: resp,
							});
						});
					} else {
						return rulesListModel.query().where({ id: data.id }).patch({
							name: data.name,
							description: data.description,
							sort: data.sort,
							block_type: data.block_type,
							lua_script: data.lua_script,
						});
					}
				}
			})
			.then(() => {
				internalRulesList.buildFile(data, true);
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
				return internalRulesList.updateRuleCounter(data.id);
			})
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
				internalRulesList.removeOriFile(row, true);
				return row;
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
		return access
			.can('rules_lists:list')
			.then(() => {
				return internalRulesList.updateRuleCounter();
			})
			.then(() => {
				let query = rulesListModel.query().where('is_deleted', 0).orderBy('enabled', 'DESC').orderBy('sort', 'ASC').orderBy('id', 'ASC');

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
		//});
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
				internalRulesList.buildFile(row, true);
				return row;
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
				internalRulesList.removeOriFile(row, true);
				return row;
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
				return true;
			});
	},
	getFilename: (item) => {
		return `/etc/nginx/lua/waf_detectors/rule_${item.sort.toString().padStart(4, '0')}_${item.id.toString().padStart(4, '0')}.lua`;
	},

	removeOriFile: (oriData, reload) => {
		let lua_waf_file_name = internalRulesList.getFilename(oriData);
		try {
			fs.unlinkSync(lua_waf_file_name);
			//reset scripts cache
			if (reload) {
				internalNginx.reload();
			}
		} catch (err) {
			// do nothing
		}
	},

	buildFile: (data, reload) => {
		logger.info(`Building waf lua file #${data.id} for: ${data.name}`);

		let lua_waf_file_name = internalRulesList.getFilename(data);
		// 1. remove any existing access file
		try {
			fs.unlinkSync(lua_waf_file_name);
		} catch (err) {
			// do nothing
		}

		// 2. create lua file
		var script = data.is_system
			? `
			local function mainFunc()
			local function ruleLogic() 
				${data.lua_script}
			end
			local match = ruleLogic();
			if ngx.shared.exec_counter:get('r_${data.id}') == nil then
               ngx.shared.exec_counter:set('r_${data.id}', 0)
            end
			ngx.shared.exec_counter:incr('r_${data.id}', 1)
			if match == true then
			if ngx.shared.block_counter:get('r_${data.id}') == nil then
               ngx.shared.block_counter:set('r_${data.id}', 0)
            end
				ngx.shared.block_counter:incr('r_${data.id}', 1);				
				ngx.header["Intercepted"]=${data.id};
				ngx.exit(ngx.HTTP_FORBIDDEN)
			end			
		end
		return mainFunc
		`
			: `
			local function mainFunc()
			local success, result = pcall(function()
				local function ruleLogic()
					 ${data.lua_script}
				end
				local match = ruleLogic();
				ngx.shared.exec_counter:incr('r_${data.id}', 1)
				if match == true then
					ngx.shared.block_counter:incr('r_${data.id}', 1);
					ngx.header["Intercepted"]=${data.id};
					ngx.exit(ngx.HTTP_FORBIDDEN)
				end				
			end)
		
			if not success then ngx.header["rule_${data.id}"] = "exec failed"; end
		end
		return mainFunc
			`;
		fs.writeFileSync(lua_waf_file_name, script, { encoding: 'utf8' });
		//reset scripts cache
		if (reload) {
			internalNginx.reload();
		}
	},
	initSystemRules: () => {
		utils.exec('rm -f /etc/nginx/lua/waf_detectors/rule_*.lua').then(() => {
			rulesListModel
				.query()
				.where('is_deleted', 0)
				.andWhere('is_system', 1)
				.andWhere('enabled', 1)
				.then((list) => {
					for (var i = 0; i < list.length; i++) {
						var data = list[i];
						internalRulesList.buildFile(data, i === list.length - 1);
					}
				});
		});
	},

	initTimer: () => {
		logger.info('Rule Counter Timer initialized');
		internalRulesList.interval = setInterval(internalRulesList.updateRuleCounter, internalRulesList.interval_timeout);
	},
	updateRuleCounter: (id) => {
		if (!internalRulesList.interval_processing) {
			internalRulesList.interval_processing = true;

			var query = rulesListModel.query().select('id', 'exec_counter', 'block_counter').where('is_deleted', 0);
			if (id !== undefined) {
				query.andWhere('id', id);
			}
			return query
				.then((list) => {
					let sequence = Promise.resolve();
					list.forEach((data) => {
						sequence = sequence.then(() => {
							utils.exec(`curl ${internalRulesList.get_counter_url}?rule_id=${data.id}`).then((counterDataStr) => {
								var counterData = JSON.parse(counterDataStr);
								if (counterData.exec_counter !== 0 || counterData.block_counter !== 0) {
									return rulesListModel
										.query()
										.where({ id: data.id })
										.patch({
											exec_counter: data.exec_counter + counterData.exec_counter,
											block_counter: data.block_counter + counterData.block_counter,
										});
								}
							});
						});
					});
					return sequence;
				})
				.then((sequence) => {
					internalRulesList.interval_processing = false;
					internalRulesList.iteration_count++;
					return sequence;
				})
				.catch((err) => {
					logger.error('updateRuleCounter:' + err.message);
					internalRulesList.interval_processing = false;
				});
		}
	},
};

module.exports = internalRulesList;
