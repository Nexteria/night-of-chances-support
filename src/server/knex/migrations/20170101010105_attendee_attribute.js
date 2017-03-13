import knexMixin from '@/src/server/knex/mixin';

export const up = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.createTable('attendee_attribute', (tab) => {
		tab.increments('key')
			.notNullable()
			.primary();
		tab.string('name', 256)
			.unique();
		tab.string('color', 6)
			.defaultTo('eeeeee');
	});
};

export const down = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.dropTable('attendee_attribute');
};
