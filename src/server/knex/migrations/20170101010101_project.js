import knexMixin from '@/src/server/knex/mixin';

export const up = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.createTable('project', (tab) => {
		tab.increments('key')
			.notNullable()
			.primary();
		tab.string('name', 256)
			.unique();
		tab.string('token', 256)
			.unique();
	});
};

export const down = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.dropTable('project');
};
