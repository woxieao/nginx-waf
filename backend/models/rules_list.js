// Objection Docs:
// http://vincit.github.io/objection.js/

const db = require('../db');
const Model = require('objection').Model;
const User = require('./user');
const now = require('./now_helper');

Model.knex(db);

class RulesList extends Model {
	$beforeInsert() {
		this.created_on = now();
		this.modified_on = now();

		// Default for meta
		if (typeof this.meta === 'undefined') {
			this.meta = {};
		}
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

	static get jsonAttributes() {
		return ['meta'];
	}

	static get relationMappings() {
		return {
			user: {
				relation: Model.HasOneRelation,
				modelClass: User,
				join: {
					from: 'rules_list.user_id',
					to: 'user.id',
				},
				filter: {
					is_deleted: 0,
				},
			},
		};
	}
}

module.exports = RulesList;
