const migrate_name = 'initialize_firewall';
const logger       = require('../logger').migrate;

/**
 * Migrate
 *
 * @see http://knexjs.org/#Schema
 *
 * @param   {Object} knex
 * @param   {Promise} Promise
 * @returns {Promise}
 */
exports.up = function (knex/*, Promise*/) {
	return knex.schema.createTable('rules_list', (table) => {
		table.increments().primary();
		table.dateTime('created_on').notNull();
		table.dateTime('modified_on').notNull();
		table.string('name').notNull().defaultTo('');
		table.string('description').notNull().defaultTo('');				
		table.integer('enabled').notNull().unsigned().defaultTo(0);
		table.integer('sort').notNull().unsigned().defaultTo(0);				
		table.string('block_type').notNull().defaultTo('');
		table.text('lua_script','longtext').notNull().defaultTo('');	
		table.integer('is_system').notNull().unsigned().defaultTo(0);
		table.integer('block_counter').notNull().unsigned().defaultTo(0);	
		table.integer('exec_counter').notNull().unsigned().defaultTo(0);				
		table.integer('is_deleted').notNull().unsigned().defaultTo(0);
	}).then(()=>{
		logger.info('[' + migrate_name + '] rules_list Table created');
		knex.schema.table('user_permission', (table) => {
			table.string('rules_lists').notNull().defaultTo('manage');
		})	
	})
	.then(function () {
		logger.info('[' + migrate_name + '] user_permission Table altered');
		knex.schema.table('proxy_host', (table) => {
			table.integer('anti_ddos').notNull().unsigned().defaultTo(0);
		})
	})
	.then(function () {
		logger.info('[' + migrate_name + '] proxy_host Table altered');
	});
};

/**
 * Undo Migrate
 *
 * @param   {Object} knex
 * @param   {Promise} Promise
 * @returns {Promise}
 */
exports.down = function (knex/*, Promise*/) {
	logger.warn('[' + migrate_name + '] You can\'t migrate down this one.');
	return Promise.resolve(true);
};
