#!/usr/bin/env node

const logger = require('./logger').global;

async function appStart () {
	const migrate             = require('./migrate');
	const setup               = require('./setup');
	const app                 = require('./app');
	const apiValidator        = require('./lib/validator/api');
	const internalCertificate = require('./internal/certificate');
	const internalIpRanges    = require('./internal/ip_ranges');
	const internalRulesList    = require('./internal/rules-list');

	return migrate.latest()
		.then(setup)
		.then(() => {
			return apiValidator.loadSchemas;
		})
		//.then(internalIpRanges.fetch)//注释这行,否则取ip卡死时会导致登录失败,反正后续有internalIpRanges.initTimer()在运行
		.then(() => {

			internalCertificate.initTimer();
			internalIpRanges.initTimer();
			internalRulesList.initTimer();
			
			const server = app.listen(3000, () => {
				logger.info('Backend PID ' + process.pid + ' listening on port 3000 ...');

				process.on('SIGTERM', () => {
					logger.info('PID ' + process.pid + ' received SIGTERM');
					server.close(() => {
						logger.info('Stopping.');
						process.exit(0);
					});
				});
			});
		})
		.catch((err) => {
			logger.error(err.message);
			setTimeout(appStart, 1000);
		});
}

try {
	appStart();
} catch (err) {
	logger.error(err.message, err);
	process.exit(1);
}

