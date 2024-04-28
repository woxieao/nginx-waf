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

const proxyHostModel = require('./models/proxy_host');
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
				return ruleListModel
					.query()
					.insert({
						name: 'url_demo',
						description: '请求参数拦截示例',
						enabled: 1,
						sort: 50,
						block_type: 'others',
						lua_script: `local args = ngx.req.get_uri_args()
						local test_param = args["test"]
						if test_param == 'block' then
							return true;
						else
							return false;
						end
						`,
						is_system: 1,
						block_counter: 0,
						exec_counter: 0,
					})
					.then(() => {
						return ruleListModel.query().insert({
							name: 'ip_blacklist_demo',
							description: '黑名单Ip拦截示例',
							enabled: 1,
							sort: 50,
							block_type: 'others',
							lua_script: `local blacklist_ips = {
								"111.111.111.111", "222.222.222.222"
								-- 添加其他需要加入黑名单的IP地址
							}
							local client_ip = ngx.var.remote_addr
							for _, black_ip in ipairs(blacklist_ips) do
								if black_ip == client_ip then return true end
							end
							return false
							`,
							is_system: 1,
							block_counter: 0,
							exec_counter: 0,
						});
					});
			}
		})
		.then(() => {
			internalRulesList.initSystemRules();
		})
		.then(() => {
			logger.info('System waf rule added');
		});
};

const debug = () => {
	return proxyHostModel
		.query()
		.select(proxyHostModel.raw('COUNT(`id`) as `count`'))
		.first()
		.then((row) => {
			if (!row.count) {
				return proxyHostModel.query().insert({
					domain_names: ['debug-waf.xazrael.cn'],
					forward_scheme: 'http',
					forward_host: '172.17.0.1',
					forward_port: 5001,
					access_list_id: 0,
					certificate_id: 0,
					ssl_forced: false,
					hsts_enabled: false,
					hsts_subdomains: false,
					caching_enabled: false,
					allow_websocket_upgrade: false,
					block_exploits: true,
					anti_ddos: true,
					http2_support: false,
					advanced_config: '',
					enabled: true,
					meta: {},
					// The following are expansions:
				});
			}
		});
};

module.exports = function () {
	return setupDefaultUser().then(setupDefaultSettings).then(setupCertbotPlugins).then(setupLogrotation).then(setupWafScripts).then(debug);
};
