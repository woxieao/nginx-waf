const express = require('express');
const validator = require('../../../lib/validator');
const jwtdecode = require('../../../lib/express/jwt-decode');
const internalRulesList = require('../../../internal/rules-list');
const apiValidator = require('../../../lib/validator/api');

let router = express.Router({
	caseSensitive: true,
	strict: true,
	mergeParams: true,
});

/**
 * /api/nginx/rules-lists
 */
router
	.route('/')
	.options((req, res) => {
		res.sendStatus(204);
	})
	.all(jwtdecode())

	/**
	 * GET /api/nginx/rules-lists
	 *
	 * Retrieve all rules-lists
	 */
	.get((req, res, next) => {
		validator(
			{
				additionalProperties: false,
				properties: {
					query: {
						$ref: 'definitions#/definitions/query',
					},
				},
			},
			{
				query: typeof req.query.query === 'string' ? req.query.query : null,
			},
		)
			.then((data) => {
				return internalRulesList.getAll(res.locals.access, data.query);
			})
			.then((rows) => {
				res.status(200).send(rows);
			})
			.catch(next);
	})

	/**
	 * POST /api/nginx/rules-lists
	 *
	 * Create a new rules-list
	 */
	.post((req, res, next) => {
		apiValidator({ $ref: 'endpoints/rules-lists#/links/1/schema' }, req.body)
			.then((payload) => {
				return internalRulesList.create(res.locals.access, payload);
			})
			.then((result) => {
				res.status(201).send(result);
			})
			.catch(next);
	});

/**
 * Specific rules-list
 *
 * /api/nginx/rules-lists/123
 */
router
	.route('/:list_id')
	.options((req, res) => {
		res.sendStatus(204);
	})
	.all(jwtdecode())

	/**
	 * GET /api/nginx/rules-lists/123
	 *
	 * Retrieve a specific rules-list
	 */
	.get((req, res, next) => {
		validator(
			{
				required: ['list_id'],
				additionalProperties: false,
				properties: {
					list_id: {
						$ref: 'definitions#/definitions/id',
					},
					expand: {
						$ref: 'definitions#/definitions/expand',
					},
				},
			},
			{
				list_id: req.params.list_id,
				expand: typeof req.query.expand === 'string' ? req.query.expand.split(',') : null,
			},
		)
			.then((data) => {
				return internalRulesList.get(res.locals.access, {
					id: parseInt(data.list_id, 10),
					expand: data.expand,
				});
			})
			.then((row) => {
				res.status(200).send(row);
			})
			.catch(next);
	})

	/**
	 * PUT /api/nginx/rules-lists/123
	 *
	 * Update and existing rules-list
	 */
	.put((req, res, next) => {
		apiValidator({ $ref: 'endpoints/rules-lists#/links/2/schema' }, req.body)
			.then((payload) => {
				payload.id = parseInt(req.params.list_id, 10);
				return internalRulesList.update(res.locals.access, payload);
			})
			.then((result) => {
				res.status(200).send(result);
			})
			.catch(next);
	})

	/**
	 * DELETE /api/nginx/rules-lists/123
	 *
	 * Delete and existing rules-list
	 */
	.delete((req, res, next) => {
		internalRulesList
			.delete(res.locals.access, { id: parseInt(req.params.list_id, 10) })
			.then((result) => {
				res.status(200).send(result);
			})
			.catch(next);
	});

/**
 * Enable rules-list
 *
 * /api/nginx/proxy-hosts/123/enable
 */
router
	.route('/:rule_id/enable')
	.options((req, res) => {
		res.sendStatus(204);
	})
	.all(jwtdecode())
	/**
	 * POST /api/nginx/rules-lists/123/enable
	 */
	.post((req, res, next) => {
		internalRulesList
			.enable(res.locals.access, { id: parseInt(req.params.rule_id, 10) })
			.then((result) => {
				res.status(200).send(result);
			})
			.catch(next);
	});

/**
 * Disable rules-list
 *
 * /api/nginx/rules-lists/123/disable
 */
router
	.route('/:rule_id/disable')
	.options((req, res) => {
		res.sendStatus(204);
	})
	.all(jwtdecode())
	/**
	 * POST /api/nginx/rules-lists/123/disable
	 */
	.post((req, res, next) => {
		internalRulesList
			.disable(res.locals.access, { id: parseInt(req.params.rule_id, 10) })
			.then((result) => {
				res.status(200).send(result);
			})
			.catch(next);
	});

module.exports = router;
