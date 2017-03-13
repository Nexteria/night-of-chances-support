// TODO: Add pagination.
// TODO: Add relations.
// TODO: Add column aliasing.
// TODO: Add CNF or DNF queries.
// TODO: Add projection to find methods.

// Load app modules.
import * as dataType from '@/src/common/data_type';
import {
	EntityExists as EntityExistsError,
	EntityNotFound as EntityNotFoundError,
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
		model.createValuesValidator = new Validator(
			model.fieldNames().reduce((schema, fieldName) => {
				const field = model.fields[fieldName];

				schema[fieldName] = field.isRequired
					? field.schema.required()
					: field.schema;

				return schema;
			}, {}),
		);

		// Define validator from the schema for the update values.
		// - all specified keys must correspond to fields.
		// - all present fields must conform to the given rules.
		model.createValuesValidator = new Validator(
			model.fieldNames().reduce((schema, fieldName) => {
				schema[fieldName] = model.fields[fieldName].schema;

				return schema;
			}, {}),
		);

		// Outputs the schema for the query during model extension.
		// - all specified keys must correspond to (fields + primary key field).
		// - all present (fields + primary key field) must conform to the given rules.
		model.queryValuesValidator = new Validator(
			model.fieldNames().reduce((schema, fieldName) => {
				schema[fieldName] = model.fields[fieldName].schema;

				return schema;
			}, {
				[model.primaryKeyField.name]: model.primaryKeyField.schema,
			}),
		);

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
	// Information about the primary key field.
	primaryKeyField: {
		name: 'key',
		schema: Joi.number().integer().min(0).max(2147483647),
	},
	// Create a single entity of the model.
	create(values) {
		return Promise.resolve()
			.then(() => {
				// Validate create values.
				this.createValuesValidator.validate(values);

				// Insert values into the underlying data object.
				return knex.instance(this.table)
					.insert(values)
					.returning(this.fieldNames(true));
			})
			.then((createdDocuments) => {
				return createdDocuments[0];
			})
			.catch((err) => {
				switch (err.code) {
					case '23505': {
						throw new EntityExistsError(err);
					}
					default: {
						throw err;
					}
				}
			});
	},
	// Find all entities of the model matching the query.
	find(query) {
		return Promise.resolve()
			.then(() => {
				// Validate query.
				this.queryValidator.validate(query);

				// Select values from the underlying data object.
				return knex.instance(this.table)
					.select(this.fieldNames(true))
					.where(query || {});
			});
	},
	// Find all entities of the model matching the query.
	findOne(query) {
		// Select values from the underlying data object.
		return Promise.resolve()
			.then(() => {
				// Validate query.
				this.queryValidator.validate(query);

				// Exectute the query limited to a single value.
				return knex.instance(this.table)
					.select(this.fieldNames(true))
					.where(query || {})
					.limit(1);
			})
			// Check if at least one value was found.
			.then((foundDocuments) => {
				if (foundDocuments.length === 0) {
					throw new EntityNotFoundError();
				}

				return foundDocuments[0];
			});
	},
	// Find entity of the model matching the key.
	findByKey(key) {
		// Call find one with only the key in the query.
		return this.findOne({
			[this.primaryKeyField.name]: key,
		});
	},
	// Find the count of all entities of the model matching the query.
	count(query) {
		return Promise.resolve()
			.then(() => {
				// Validate query.
				this.queryValidator.validate(query);

				// Select the count from the underlying data object.
				return knex.instance(this.table)
					.count()
					.where(query || {});
			})
			.then((result) => {
				return parseInt(result[0].count, 10);
			});
	},
	// Update all entities of the model matching the query with the supplied values.
	update(query, values) {
		return Promise.resolve()
			.then(() => {
				// Validate update values.
				this.updateValuesValidator.validate(values);

				// Validate query.
				this.queryValidator.validate(query);

				// Update values in the underlying data object.
				return knex.instance(this.table)
					.update(values)
					.where(query || {})
					.returning(this.fieldNames(true));
			});
	},
	// Delete all entities of the model matching the query.
	destroy(query) {
		return Promise.resolve()
			.then(() => {
				// Validate query.
				this.queryValidator.validate(query);

				// Delete values from the underlying data object.
				return knex.instance(this.table)
					.delete()
					.where(query || {})
					.returning(this.fieldNames(true));
			});
	},
	// Update entity indicated by the primary key that's part of the given document.
	save(document) {
		// Update values in the underlying data object with a copy of the document without the primary key field.
		return this.update({
			[this.primaryKeyField.name]: document[this.primaryKeyField.name],
		}, dataType.object.shallowFilter(document, this.fieldNames()))
			.then((savedDocuments) => {
				return savedDocuments[0];
			});
	},
	// Delete entity indicated by the primary key that's part of the given document.
	delete(document) {
		return this.destroy({
			[this.primaryKeyField.name]: document[this.primaryKeyField.name],
		})
			.then((deletedDocuments) => {
				return deletedDocuments[0];
			});
	},
};
