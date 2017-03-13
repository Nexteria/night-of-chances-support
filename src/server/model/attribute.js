// Load app modules.
import * as dataType from '@/src/common/data_type';
import knex from '@/src/server/knex';
import Model from '@/src/server/model';
import Validator from '@/src/server/lib/validator';

// Load npm modules.
import Promise from 'bluebird';
import Joi from 'joi';

// Expose attribute base model.
export default {
	// Create new models by extending the current one.
	extend(model) {
		// Call parent method.
		super.extend(model);

		// Add derived attribute model.
		model.attributeModel = Model.extend({
			table: `${model.table}_attribute`,
			fields: {
				name: {
					isRequired: true,
					schema: Joi.string().max(256),
				},
				color: {
					schema: Joi.string().length(6),
				},
			},
		});
		model.attributeValueTable = {
			name: `${model.table}_attribute_value`,
			parentKeyField: `${model.table}_key`,
			attributeKeyField: `${model.table}_attribute_key`,
		};

		// Add attribute value validator.
		model.attributeValueValidator = new Validator(Joi.string().max(512));

		// Pass on model to caller.
		return model;
	},
	// Check if the attributes string values contained within an object.
	validateAttributes(attributes) {
		Object.keys(attributes).forEach((attributeName) => {
			this.attributeValueValidator.validate(attributes[attributeName]);
		});
	},
	retrieveAttributes(attributes) {
		// Objectify attribute names.
		let objectifiedAttributes = Object.keys(attributes).map((attribute) => {
			return {
				name: attribute,
			};
		});

		// Find existing attributes.
		return Promise.all(attributes.map((attribute) => {
			return this.attributeModel.count({
				name: attribute.name,
			});
		}))
			.then((attributeCounts) => {
				// Merge counts into objectified attributes.
				objectifiedAttributes = dataType.array.shallowLeftMerge(
					attributes,
					attributeCounts.map((attributeCount) => {
						return {
							isCreated: attributeCount > 0,
						};
					}));

				// Create attributes that were not found.
				return Promise.all(objectifiedAttributes.map((attribute) => {
					return attribute.isCreated
						? this.attributeModel.findOne({
							name: attribute.name,
						})
						: this.attributeModel.create({
							name: attribute.name,
						});
				}));
			});
	},
	createAttributeValues(key) {

	},
	destroyAttributeValues(key) {
		return Promise.all(attributeDocuments.map((attributeDocument) => {
			return knex(this.attributeValueTable.name)
				.delete()
				.where({
					[this.attributeValueTable.attributeKeyfield]: attributeDocument.key,
					[this.attributeValueTable.attributeKeyfield]: attributeDocument.key,
				});
		}));
	},
	// Create a single entity of the model.
	create(values) {
		let entityPrimaryKey = null;
		return Promise.resolve()
			.then(() => {
				// Validate attributes.
				this.validateAttributes(values.attributes);

				// Create the base entity.
				super.create(dataType.object.shallowFilter(values, this.fieldNames()));
			})
			.then((createdEntity) => {
				// Store the new entity key.
				entityPrimaryKey = createdEntity[this.primaryKeyField.name];

				// Retrieve the associated attribute documents.
				return this.retrieveAttributes(values.attributes);
			})
			.then((attributeDocuments) => {
				// Insert attribute values.
				return knex(this.attributeValueTable.name)
					.insert(attributeDocuments.map((attributeDocument) => {
						return {
							value: values.attributes[attributeDocument.name],
							[this.attributeValueTable.parentKeyField]: entityPrimaryKey,
							[this.attributeValueTable.attributeKeyField]: attributeDocument[this.primaryKeyField.name],
						};
					}));
			});
	},
	// Find all entities of the model matching the query.
	find(query) {
		// TODO: Search using attributes in query.
		// TODO: Add attributes to result.
	},
	// Find all entities of the model matching the query.
	findOne(query) {
		// TODO: Search using attributes in query.
		// TODO: Add attributes to result.
	},
	// Update all entities of the model matching the query with the supplied values.
	update(query, values) {
		// TODO: Search using attributes in query.
		// TODO: Consider attributes in values.
		// TODO: Add attributes to result.

		// Delete old attribute values.

	},
};
