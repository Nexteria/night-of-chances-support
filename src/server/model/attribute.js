// Load app modules.
import knex from '@/src/server/knex';
import Model from '@/src/server/model';

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
		// Validate attributes.
		// TODO: check if its an object containing string values.

		// Find existing attributes.
		this.attributeModel.find

		// Delete old attribute values.

		// Add attribute values.
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
	// Create a single attribute of the model.
	createAttribute(values) {

	},
	// Retrieve all attributes of the model.
	findAllAttributes() {

	},
	// Update
	// Delete all attributes of the model matching the query.
	destroyAttributes(query) {
	},
};
