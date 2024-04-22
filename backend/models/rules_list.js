// Objection Docs:
// http://vincit.github.io/objection.js/

const db = require('../db');
const Model = require('objection').Model;
const now = require('./now_helper');

Model.knex(db);

class RulesList extends Model {
	$beforeInsert() {
		this.created_on = now();
		this.modified_on = now();
	}

	$beforeUpdate() {
		this.modified_on = now();
	}

	static get name() {
		return 'RulesList';
	}

	static get tableName() {
		return 'rules_list';
	}
}

module.exports = RulesList;
