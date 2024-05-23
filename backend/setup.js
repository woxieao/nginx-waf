const config = require('./lib/config');
const logger = require('./logger').setup;
const certificateModel = require('./models/certificate');
const userModel = require('./models/user');
const userPermissionModel = require('./models/user_permission');
const utils = require('./lib/utils');
const authModel = require('./models/auth');
const settingModel = require('./models/setting');
const certbot = require('./lib/certbot');
const ruleListModel = require('./models/rules_list');
const internalRulesList = require('./internal/rules-list');
const fs = require('fs');
/**
 * Creates a default admin users if one doesn't already exist in the database
 *
 * @returns {Promise}
 */
const setupDefaultUser = () => {
	return userModel
		.query()
		.select(userModel.raw('COUNT(`id`) as `count`'))
		.where('is_deleted', 0)
		.first()
		.then((row) => {
			if (!row.count) {
				// Create a new user and set password
				logger.info('Creating a new user: admin@example.com with password: changeme');

				let data = {
					is_deleted: 0,
					email: 'admin@example.com',
					name: 'Administrator',
					nickname: 'Admin',
					avatar: '',
					roles: ['admin'],
				};

				return userModel
					.query()
					.insertAndFetch(data)
					.then((user) => {
						return authModel
							.query()
							.insert({
								user_id: user.id,
								type: 'password',
								secret: 'changeme',
								meta: {},
							})
							.then(() => {
								return userPermissionModel.query().insert({
									user_id: user.id,
									visibility: 'all',
									proxy_hosts: 'manage',
									redirection_hosts: 'manage',
									dead_hosts: 'manage',
									streams: 'manage',
									access_lists: 'manage',
									rules_lists: 'manage',
									certificates: 'manage',
								});
							});
					})
					.then(() => {
						logger.info('Initial admin setup completed');
					});
			} else if (config.debug()) {
				logger.info('Admin user setup not required');
			}
		});
};

/**
 * Creates default settings if they don't already exist in the database
 *
 * @returns {Promise}
 */
const setupDefaultSettings = () => {
	return settingModel
		.query()
		.select(settingModel.raw('COUNT(`id`) as `count`'))
		.where({ id: 'default-site' })
		.first()
		.then((row) => {
			if (!row.count) {
				settingModel
					.query()
					.insert({
						id: 'default-site',
						name: 'Default Site',
						description: 'What to show when Nginx is hit with an unknown Host',
						value: 'congratulations',
						meta: {},
					})
					.then(() => {
						logger.info('Default settings added');
					});
			}
			if (config.debug()) {
				logger.info('Default setting setup not required');
			}
		});
};

/**
 * Installs all Certbot plugins which are required for an installed certificate
 *
 * @returns {Promise}
 */
const setupCertbotPlugins = () => {
	return certificateModel
		.query()
		.where('is_deleted', 0)
		.andWhere('provider', 'letsencrypt')
		.then((certificates) => {
			if (certificates && certificates.length) {
				let plugins = [];
				let promises = [];

				certificates.map(function (certificate) {
					if (certificate.meta && certificate.meta.dns_challenge === true) {
						if (plugins.indexOf(certificate.meta.dns_provider) === -1) {
							plugins.push(certificate.meta.dns_provider);
						}

						// Make sure credentials file exists
						const credentials_loc = '/etc/letsencrypt/credentials/credentials-' + certificate.id;
						// Escape single quotes and backslashes
						const escapedCredentials = certificate.meta.dns_provider_credentials.replaceAll("'", "\\'").replaceAll('\\', '\\\\');
						const credentials_cmd = "[ -f '" + credentials_loc + "' ] || { mkdir -p /etc/letsencrypt/credentials 2> /dev/null; echo '" + escapedCredentials + "' > '" + credentials_loc + "' && chmod 600 '" + credentials_loc + "'; }";
						promises.push(utils.exec(credentials_cmd));
					}
				});

				return certbot.installPlugins(plugins).then(() => {
					if (promises.length) {
						return Promise.all(promises).then(() => {
							logger.info('Added Certbot plugins ' + plugins.join(', '));
						});
					}
				});
			}
		});
};

/**
 * Starts a timer to call run the logrotation binary every two days
 * @returns {Promise}
 */
const setupLogrotation = () => {
	const intervalTimeout = 1000 * 60 * 60 * 24 * 2; // 2 days

	const runLogrotate = async () => {
		try {
			await utils.exec('logrotate /etc/logrotate.d/nginx-proxy-manager');
			logger.info('Logrotate completed.');
		} catch (e) {
			logger.warn(e);
		}
	};

	logger.info('Logrotate Timer initialized');
	setInterval(runLogrotate, intervalTimeout);
	// And do this now as well
	return runLogrotate();
};

const initRule = (rule) => {
	var content = fs.readFileSync(`/etc/nginx/lua/preset_rules/${rule.file_name}.lua`, { encoding: 'utf8' });
	return ruleListModel.query().insert({
		name: rule.name,
		description: rule.description,
		block_type: rule.block_type,
		lua_script: content,
		enabled: 1,
		sort:rule.sort===undefined?50:rule.sort,
		is_system: 1,
		block_counter: 0,
		exec_counter: 0,
	});
};

/**
 * Starts a timer to call run the logrotation binary every two days
 * @returns {Promise}
 */
const setupWafScripts = () => {
	return ruleListModel
		.query()
		.select(ruleListModel.raw('COUNT(`id`) as `count`'))
		.where('is_system', 1)
		.andWhere('is_deleted', 0)
		.andWhere('enabled', 1)
		.first()
		.then((row) => {
			if (!row.count) {
				return  initRule({
					file_name: 'ip_whitelist',
					name:"IP白名单",
					description: '对指定的IP不进行任何规则校验,直接放行',
					block_type: 'ip-policy',
					sort:0
				})
				.then(() => {
					return initRule({
						file_name: 'ip_blacklist',
						name:"IP黑名单",
						description: 'IP黑名单,该IP范围内的请求直接拦截',
						block_type: 'ip-policy',
						sort:0
					});
				})
				.then(() => {
					return initRule({
						file_name: 'path_whitelist',
						name:"路径白名单",
						description: '对指定路径可以放行,不进行规则校验',
						block_type: 'others',
					});
				})
					.then(() => {
						return initRule({
							file_name: 'cc_blocker_per_minute',
							name:"每分钟请求次数达到上限",
							description: '单个IP请求次数限制,每分钟最多能访问600次',
							block_type: 'cc-attack',
						});
					})
					.then(() => {
						return initRule({
							file_name: 'cc_blocker_per_hour',
							name:"每小时请求次数达到上限",
							description: '单个IP请求次数限制,每小时最多能访问6000次',
							block_type: 'cc-attack',
						});
					})
					.then(() => {
						return initRule({
							file_name: 'cc_blocker_per_day',
							name:"每天请求次数达到上限",
							description: '单个IP请求次数限制,每天最多能访问60000次',
							block_type: 'cc-attack',
						});
					})					
					.then(() => {
						return initRule({
							file_name: 'big_stream_block',
							name:"请求报文过大",
							description: '拦截大于10m的请求',
							block_type: 'malicious-file-upload',
						});
					})
					.then(() => {
						return initRule({
							file_name: 'rogue_crawler',
							name:"流氓爬虫",
							description: '拦截流氓爬虫',
							block_type: 'malicious-crawlers',
						});
					})
					.then(() => {
						return initRule({
							file_name: 'scanner',
							name:"恶意扫描工具",
							description: '拦截恶意扫描工具',
							block_type: 'malicious-crawlers',
						});
					})
					.then(() => {
						return initRule({
							file_name: 'xss_tags',
							name:"XSS标签拦截",
							description: '拦截HTML标签',
							block_type: 'xss',
						});
					})
					.then(() => {
						return initRule({
							file_name: 'xss_events',
							name:"XSS事件拦截",
							description: '拦截HTML事件',
							block_type: 'xss',
						});
					})
					.then(() => {
						return initRule({
							file_name: 'sql_injection_0',
							name:"数据库注入-0",
							description: '拦截数据库注入',
							block_type: 'sql-injection',
						});
					})
					.then(() => {
						return initRule({
							file_name: 'sql_injection_1',
							name:"数据库注入-1",
							description: '拦截数据库注入',
							block_type: 'sql-injection',
						});
					})
					.then(() => {
						return initRule({
							file_name: 'sql_injection_2',
							name:"数据库注入-2",
							description: '拦截数据库注入',
							block_type: 'sql-injection',
						});
					})
					.then(() => {
						return initRule({
							file_name: 'sql_injection_3',
							name:"数据库注入-3",
							description: '拦截数据库注入',
							block_type: 'sql-injection',
						});
					})
					.then(() => {
						return initRule({
							file_name: 'sql_injection_4',
							name:"数据库注入-4",
							description: '拦截数据库注入',
							block_type: 'sql-injection',
						});
					})
					.then(() => {
						return initRule({
							file_name: 'sql_injection_5',
							name:"数据库注入-5",
							description: '拦截数据库注入',
							block_type: 'sql-injection',
						});
					})
					.then(() => {
						return initRule({
							file_name: 'sql_injection_6',
							name:"数据库注入-6",
							description: '拦截数据库注入',
							block_type: 'sql-injection',
						});
					})
					.then(() => {
						return initRule({
							file_name: 'sql_injection_7',
							name:"数据库注入-7",
							description: '拦截数据库注入',
							block_type: 'sql-injection',
						});
					})
					.then(() => {
						return initRule({
							file_name: 'sql_injection_8',
							name:"数据库注入-8",
							description: '拦截数据库注入',
							block_type: 'sql-injection',
						});
					})
					.then(() => {
						return initRule({
							file_name: 'sql_injection_9',
							name:"数据库注入-9",
							description: '拦截数据库注入',
							block_type: 'sql-injection',
						});
					})
					.then(() => {
						return initRule({
							file_name: 'sql_injection_10',
							name:"数据库注入-10",
							description: '拦截数据库注入',
							block_type: 'sql-injection',
						});
					})
					.then(() => {
						return initRule({
							file_name: 'useragent_atk',
							name:"恶意User-Agent",
							description: '拦截恶意User-Agent',
							block_type: 'others',
						});
					})		
					.then(() => {
						return initRule({
							file_name: 'log4j',
							name:"Log4J漏洞",
							description: '拦截Log4J漏洞',
							block_type: 'others',
						});
					})		
					.then(() => {
						return initRule({
							file_name: 'malicious_functions',
							name:"恶意函数执行",
							description: '恶意函数执行',
							block_type: 'malicious-file-upload',
						});
					})				
					.then(() => {
						return initRule({
							file_name: 'sensitive_path_0',
							name:"敏感目录-0",
							description: '拦截敏感目录',
							block_type: 'sensitive-path',
						});
					})		
					.then(() => {
						return initRule({
							file_name: 'sensitive_path_1',
							name:"敏感目录-1",
							description: '拦截敏感目录',
							block_type: 'sensitive-path',
						});
					})		
					.then(() => {
						return initRule({
							file_name: 'sensitive_path_2',
							name:"敏感目录-2",
							description: '拦截敏感目录',
							block_type: 'sensitive-path',
						});
					})		
					.then(() => {
						return initRule({
							file_name: 'sensitive_path_3',
							name:"敏感目录-3",
							description: '拦截敏感目录',
							block_type: 'sensitive-path',
						});
					})		
					.then(() => {
						return initRule({
							file_name: 'sensitive_path_4',
							name:"敏感目录-4",
							description: '拦截敏感目录',
							block_type: 'sensitive-path',
						});
					})
					.then(() => {
						return true;
					});
			} else {
				return false;
			}
		})
		.then(() => {
			//regenerate evertime incase of update docker image,lua file not exist
			internalRulesList.initSystemRules();
		})
		.then(() => {
			logger.info('System waf rule added');
		});
};

module.exports = function () {
	return setupDefaultUser().then(setupDefaultSettings).then(setupCertbotPlugins).then(setupLogrotation).then(setupWafScripts);
};
