// Load app modules.
import * as dataType from '@/src/common/data_type';
import {
	EntityNotFoundError,
} from '@/src/common/error';
import knex from '@/src/server/knex';

// Load npm modules.
import Promise from 'bluebird';

// Expose base model.
export default {
	// Create new models by extend the current one.
	extend(model) {
		// Set inheritance.
		Object.setPrototypeOf(model, this);

		// Pass on model to caller.
		return model;
	},
	// All fields present in the underlying data object, a parameter specifies whether this includes the primary key.
	fieldNames(isKeyIncluded) {
		const baseFieldNames = Object.keys(this.fields);

		if (isKeyIncluded) {
			return [...baseFieldNames, 'key'];
		}

		return baseFieldNames;
	},
	// Create a single entity of the model.
	create(values) {
		return Promise.resolve()
			.then(() => {
				// TODO: Add.
				/*
				// Validate create values.
				this.createValuesValidator.validate(values);
				*/

				// Insert values into the underlying data object.
				return knex.instance(this.table)
					.insert(values)
					.returning(this.fieldNames(true));
			})
			.then((createdDocuments) => {
				return createdDocuments[0];
			})
			// TODO: Add.
			/*
			.catch((err) => {
				switch (err.code) {
					case '23505': {
						throw new EntityExistsError(err);
					}
					default: {
						throw err;
					}
				}
			})
			*/
			;
	},
	// Find all entities of the model matching the query.
	find(query) {
		return Promise.resolve()
			.then(() => {
				// TODO: Add.
				/*
				// Validate query.
				this.queryValidator.validate(query);
				*/

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
				// TODO: Add.
				/*
				// Validate query.
				this.queryValidator.validate(query);
				*/

				return knex.instance(this.table)
					.select(this.fieldNames(true))
					.where(query || {})
					// Limit to a single value.
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
	// Find the count of all entities of the model matching the query.
	count(query) {
		return Promise.resolve()
			.then(() => {
				// TODO: Add.
				/*
				// Validate query.
				this.queryValidator.validate(query);
				*/

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
				// TODO: Add.
				/*
				// Validate update values.
				this.updateValuesValidator.validate(values);

				// Validate query.
				this.queryValidator.validate(query);
				*/

				// Update values in the underlying data object.
				return knex.instance(this.table)
					.update(values)
					.where(query || {})
					.returning(this.fieldNames(true));
			});
	},
	// Delete all entities of the model matching the query.
	destroy(query) {
		return Promise.resolve().then(() => {
			// TODO: Add.
			/*
			// Validate query.
			this.queryValidator.validate(query);
			*/

			// Delete values from the underlying data object.
			return knex.instance(this.table)
				.delete()
				.where(query || {})
				.returning(this.fieldNames(true));
		});
	},
	save(document) {
		return this.update({
			key: document.key,
		}, dataType.object.shallowFilter(document, this.fieldNames()))
			.then((savedDocuments) => {
				return savedDocuments[0];
			});
	},
	// Delete entity indicated by the primary key that's part of the given values.
	delete(document) {
		return this.destroy({
			key: document.key,
		})
			.then((deletedDocuments) => {
				return deletedDocuments[0];
			});
	},
};
