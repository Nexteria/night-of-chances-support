// Load app modules.
import knexMixin from '@/src/server/knex/mixin';

// Load npm modeles.
import Promise from 'bluebird';

// TODO: Add entities.
export const entities = {
	project: [],
	project_attribute: [],
	project_attribute_value: [],
};

export const seed = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	// Remove all entities.
	return Promise.all(Object.keys(entities).map((table) => {
		return knex(table).del();
	}));
};
