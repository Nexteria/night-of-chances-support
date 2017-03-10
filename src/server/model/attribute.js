// Load app modules.
import * as dataType from '@/src/common/data_type';
import knex from '@/src/server/knex';
import Model from '@/src/server/model';

// Load npm modules.
import Promise from 'bluebird';

// Expose attribute base model.
export default {
	// Create new models by extend the current one.
	extend(model) {
		// Call parent method.
		super.extend(model);

		// Add derived attribute model.
		model.attributeModel = Model.extend({
			table: `${model.table}_attribute`,
			fields: {
				name: String,
				color: String,
			},
		});
		model.attributeValueTable = `${model.table}_attribute_value`;

		// Pass on model to caller.
		return model;
	},
	// Create a single entity of the model.
	create(values) {
		let attributes = [];

		return Promise.resolve()
			.then(() => {
				// Validate attributes.
				// TODO: check if its an object containing string values.

				attributes = Object.keys(values.attributes).map((attribute) => {
					return {
						name: attribute,
					};
				});

				// Find existing attributes.
				return Promise.all(attributes.map((attribute) => {
					return this.attributeModel.count({
						name: attribute.name,
					});
				}));
			})
			.then((attributeCounts) => {
				// Merge result into attributes.
				attributes = dataType.array.shallowLeftMerge(attributes, attributeCounts.map((attributeCount) => {
					return {
						isCreated: attributeCount > 0,
					};
				}));

				// Create attributes that were not found.
				return Promise.all(attributes.map((attribute) => {
					return attribute.isCreated
						? this.attributeModel.findOne({
							name: attribute.name,
						})
						: this.attributeModel.create({
							name: attribute.name,
						});
				}));
			})
			.then(() => {
				// Delete old attribute values.
				return knex(this.attributeValueTable)
					.select(this.fieldNames(true))
					.whereIn('name', )



				// Add attribute values.
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
	},
};
