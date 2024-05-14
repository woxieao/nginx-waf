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
	var content = fs.readFileSync(`/etc/nginx/lua/preset_rules/${rule.name}.lua`, { encoding: 'utf8' });
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
				// "sql-injection": "SQL注入",
				// "xss": "跨站脚本攻击",
				// "ip-policy": "IP访问控制",
				// "malicious-crawlers":"恶意爬虫",
				// "sensitive-path": "敏感目录",
				// "cc-attack": "CC攻击",
				// "malicious-file-upload": "恶意文件上传",
				// "others": "其他"
				return initRule({
					name: 'ip_whitelist',
					description: 'IP白名单,该IP范围内的请求直接放行',
					block_type: 'ip-policy',
					sort:0
				})
					.then(() => {
						return initRule({
							name: 'ip_blacklist',
							description: 'IP黑名单,该IP范围内的请求直接拦截',
							block_type: 'ip-policy',
							sort:1
						});
					})
					.then(() => {
						return initRule({
							name: 'cc_blocker_per_minute',
							description: '单个IP请求次数限制(每分钟)',
							block_type: 'cc-attack',
						});
					})
					.then(() => {
						return initRule({
							name: 'cc_blocker_per_hour',
							description: '单个IP请求次数限制(每小时)',
							block_type: 'cc-attack',
						});
					})
					.then(() => {
						return initRule({
							name: 'cc_blocker_per_day',
							description: '单个IP请求次数限制(每天)',
							block_type: 'cc-attack',
						});
					})
					.then(() => {
						return initRule({
							name: 'rogue_crawler',
							description: '拦截流氓爬虫',
							block_type: 'malicious-crawlers',
						});
					})
					.then(() => {
						return initRule({
							name: 'scanner',
							description: '拦截扫描工具',
							block_type: 'malicious-crawlers',
						});
					})
					.then(() => {
						return initRule({
							name: 'xss',
							description: '拦截XSS攻击',
							block_type: 'xss',
						});
					})
					.then(() => {
						return initRule({
							name: 'sql_injection',
							description: '拦截数据库注入',
							block_type: 'sql-injection',
						});
					})
					.then(() => {
						return initRule({
							name: 'sensitive_path',
							description: '拦截敏感目录',
							block_type: 'sensitive-path',
						});
					})
					.then(() => {
						return initRule({
							name: 'big_stream_block',
							description: '拦截过大报文',
							block_type: 'malicious-file-upload',
						});
					})
					.then(() => {
						return true;
					});
			} else {
				return false;
			}
		})
		.then((isFirstTime) => {
			if (isFirstTime) {
				internalRulesList.initSystemRules();
			}
		})
		.then(() => {
			logger.info('System waf rule added');
		});
};

module.exports = function () {
	return setupDefaultUser().then(setupDefaultSettings).then(setupCertbotPlugins).then(setupLogrotation).then(setupWafScripts);
};
