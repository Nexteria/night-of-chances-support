// Load app modules.
import AddDoubleColumnMixin from '@/src/server/knex/mixin/add_double_column';
import CreateIndexMixin from '@/src/server/knex/mixin/create_index';

// Export general mixin integrator.
export default (knex) => {
	const AddDoubleColumn = AddDoubleColumnMixin(knex);
	const CreateIndex = CreateIndexMixin(knex);

	// Define the wrapper as a function that passes through to the original knex instance.
	const knexWrapper = (...args) => {
		return knex(...args);
	};

	// Add properties to the knex wrapper.
	Object.assign(knexWrapper, {
		schema: {
			addDoubleColumn(name) {
				return new AddDoubleColumn(name);
			},
			createIndex(name) {
				return new CreateIndex(name);
			},
		},
	});

	// Correctly setup the prototype chain for the knex wrapper and its internal objects.
	Object.setPrototypeOf(knexWrapper, knex);
	Object.setPrototypeOf(knexWrapper.schema, knex.schema);

	// Return the knex wrapper.
	return knexWrapper;
};
