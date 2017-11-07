// TODO: Add pagination.
// TODO: Add relations.
// TODO: Add column aliasing.
// TODO: Add CNF or DNF queries.
// TODO: Add projection to find methods.

// Load local modules.
import * as dataType from '@/src/common/data_type';
import {
	EntityExistsError,
	EntityNotFoundError,
	MultipleEntitiesFoundError,
} from '@/src/common/error';
import knex from '@/src/server/knex';
import Validator from '@/src/server/lib/validator';

// Load npm modules.
import Promise from 'bluebird';
import Joi from 'joi';

// Expose base model.
export default {
	// Create new models by extending the current one.
	extend(model) {
		// Set inheritance.
		Object.setPrototypeOf(model, this);

		// Define validator from the schema for the create values.
		// - all required fields must be present.
		// - all specified keys must correspond to fields.
		// - all present fields must conform to the given rules.
		model.createValuesValidator = new Validator(Joi.object(
			model.fieldNames().reduce((schema, fieldName) => {
				const field = model.fields[fieldName];

				schema[fieldName] = field.isRequired
					? field.schema.required()
					: field.schema;

				return schema;
			}, {}),
		));

		// Define validator from the schema for the update values.
		// - all specified keys must correspond to fields.
		// - all present fields must conform to the given rules.
		model.updateValuesValidator = new Validator(Joi.object(
			model.fieldNames().reduce((schema, fieldName) => {
				schema[fieldName] = model.fields[fieldName].schema;

				return schema;
			}, {}),
		));

		// Outputs the schema for the query during model extension.
		// - all specified keys must correspond to (fields + primary key field).
		// - all present (fields + primary key field) must conform to the given rules.
		model.queryValidator = new Validator(Joi.object(
			model.fieldNames().reduce((schema, fieldName) => {
				schema[fieldName] = model.fields[fieldName].schema;

				return schema;
			}, {
				[model.primaryKeyField.name]: model.primaryKeyField.schema,
			}),
		));

		// Pass on model to caller.
		return model;
	},
	// All fields present in the underlying data object, a parameter specifies whether this includes the primary key.
	fieldNames(isKeyIncluded) {
		// Retrieve explicit field names.
		const baseFieldNames = Object.keys(this.fields);

		// Conditionally add implicit primary key field.
		if (isKeyIncluded) {
			return [...baseFieldNames, this.primaryKeyField.name];
		}

		return baseFieldNames;
	},
	table: '',
	fields: {},
	// Information about the primary key field.
	primaryKeyField: {
		name: 'key',
		schema: Joi.number().integer().min(0).max(2147483647),
	},
	// Create a single entity of the model.
	create(values, options = {}) {
		// Initialize a promise.
		return Promise.resolve().then(() => {
			// Validate create values.
			this.createValuesValidator.validate(values);

			// Prepare to insert values into the underlying data object.
			let knexQuery = knex.instance(this.table)
				.insert(values)
				.returning(this.fieldNames(true));

			// Process options.
			if (options.transaction) {
				knexQuery = knexQuery.transacting(options.transaction);
			}

			// Exectute the knex query.
			return knexQuery;
		})
		.then((documents) => {
			// Return the single created entity.
			return documents[0];
		})
		.catch((err) => {
			// Process error based on type.
			switch (err.code) {
				case '23505':
					throw new EntityExistsError(err);
				default:
					throw err;
			}
		});
	},
	// Prepare a pluggable knex query based on the query parameters.
	buildKnexQuery(query) {
		return knex.instance(this.table)
			.where(query || {});
	},
	// Find all entities of the model matching the query.
	find(query = {}, options = {}) {
		// Initialize a promise.
		return Promise.resolve().then(() => {
			// Validate query.
			this.queryValidator.validate(query);

			// Prepare to select values from the underlying data object.
			let knexQuery = this.buildKnexQuery(query)
				.select(this.fieldNames(true));

			// Process options.
			if (options.limit) {
				knexQuery = knexQuery.limit(options.limit);
			}

			// Return the knex query to be exectuted.
			return knexQuery;
		});
	},
	// Find a single entity of the model matching the query.
	findOne(query = {}, options = {}) {
		// Exectute the find method limited to a single value.
		return this.find(query, Object.assign({
			limit: 1,
		}, options))
			.then((documents) => {
				// Check if at least one value was found.
				if (documents.length === 0) {
					throw new EntityNotFoundError();
				}

				// Return the found document.
				return documents[0];
			});
	},
	// Find a single entity of the model matching the key.
	findByKey(key, options = {}) {
		// Call the find one method with only the key in the query.
		return this.findOne({
			[this.primaryKeyField.name]: key,
		}, options);
	},
	// Find the count of all entities of the model matching the query.
	count(query = {}, options = {}) {
		// Initialize a promise.
		return Promise.resolve().then(() => {
			// Validate query.
			this.queryValidator.validate(query);

			// Prepare to select the count from the underlying data object.
			let knexQuery = this.buildKnexQuery(query)
				.count();

			// Process options.
			if (options.limit) {
				knexQuery = knexQuery.limit(options.limit);
			}

			// Return the knex query to be exectuted.
			return knexQuery;
		})
		.then((result) => {
			return parseInt(result[0].count, 10);
		});
	},
	// Update all entities of the model matching the query with the supplied values.
	update(query = {}, values, options = {}) {
		// Initialize a promise.
		return Promise.resolve().then(() => {
			// Validate update values.
			this.updateValuesValidator.validate(values);

			// Validate query.
			this.queryValidator.validate(query);

			// Prepare to update values in the underlying data object.
			let knexQuery = this.buildKnexQuery(query)
				.update(values)
				.returning(this.fieldNames(true));

			// Process options.
			if (options.transaction) {
				knexQuery = knexQuery.transacting(options.transaction);
			}

			// Exectute the knex query.
			return knexQuery;
		});
	},
	// Update a single entity of the model matching the query with the supplied values.
	updateOne(query = {}, values, options = {}) {
		// Initialize a transaction.
		return knex.instance.transaction((trx) => {
			// Exectute the update method with the submitted transaction.
			return this.update(query, values, Object.assign({
				transaction: trx,
			}, options))
				.then((documents) => {
					// Check if at least one value was altered.
					if (documents.length === 0) {
						throw new EntityNotFoundError();
					}

					// Check if more than one value was altered.
					if (documents.length > 1) {
						throw new MultipleEntitiesFoundError();
					}

					// Return the returned document.
					return documents[0];
				});
		});
	},
	// Update a single entity of the model matching the key with the supplied values.
	updateByKey(key, values, options = {}) {
		// Call the update one method with only the key in the query.
		return this.updateOne({
			[this.primaryKeyField.name]: key,
		}, values, options);
	},
	// Delete all entities of the model matching the query.
	destroy(query = {}, options = {}) {
		// Initialize a promise.
		return Promise.resolve().then(() => {
			// Validate query.
			this.queryValidator.validate(query);

			// Prepare to delete values from the underlying data object.
			let knexQuery = this.buildKnexQuery(query)
				.delete()
				.returning(this.fieldNames(true));

			// Process options.
			if (options.transaction) {
				knexQuery = knexQuery.transacting(options.transaction);
			}

			// Exectute the knex query.
			return knexQuery;
		});
	},
	// Delete a single entity of the model matching the query.
	destroyOne(query = {}, options = {}) {
		// Initialize a transaction.
		return knex.instance.transaction((trx) => {
			// Exectute the update method with the submitted transaction.
			return this.destroy(query, Object.assign({
				transaction: trx,
			}, options))
				.then((documents) => {
					// Check if at least one value was deleted.
					if (documents.length === 0) {
						throw new EntityNotFoundError();
					}

					// Check if more than one value was deleted.
					if (documents.length > 1) {
						throw new MultipleEntitiesFoundError();
					}

					// Return the returned document.
					return documents[0];
				});
		});
	},
	// Delete a single entity of the model matching the key.
	destroyByKey(key, options = {}) {
		// Call the destroy one method with only the key in the query.
		return this.destroyOne({
			[this.primaryKeyField.name]: key,
		}, options);
	},
	// Update the entity indicated by the primary key that's part of the given document.
	save(document, options = {}) {
		// Filter values that are not the primary key field.
		const values = dataType.object.shallowFilter(document, this.fieldNames());

		// Update values in the underlying data object with a copy of the document without the primary key field.
		return this.updateByKey(document[this.primaryKeyField.name], values, options)
			.then((documents) => {
				// Return the returned document.
				return documents[0];
			});
	},
	// Delete the entity indicated by the primary key that's part of the given document.
	delete(document, options = {}) {
		return this.destroyByKey(document[this.primaryKeyField.name], options)
			.then((documents) => {
				// Return the returned document.
				return documents[0];
			});
	},
};
