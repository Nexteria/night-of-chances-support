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
		model.attributeValueTable = Model.extend({
			table: `${model.table}_attribute_value`,

		});

		// Pass on model to caller.
		return model;
	},
	// Create a single entity of the model.
	create(values) {
		// Isolate attributes.

		// Find existing attributes.

		// Delete old attribute values.

		// Add attribute values.
	},


};
