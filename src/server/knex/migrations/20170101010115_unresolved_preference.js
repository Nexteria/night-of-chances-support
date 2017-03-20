import knexMixin from '@/src/server/knex/mixin';

export const up = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.createTable('unresolved_preference', (tab) => {
		tab.increments('key')
			.notNullable()
			.primary();
		tab.string('name', 256)
			.notNullable();
		tab.string('token', 256)
			.notNullable();
		tab.integer('project_key')
			.notNullable()
			.references('key')
			.inTable('project')
			.onDelete('cascade');
	});
};

export const down = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.dropTable('unresolved_preference');
};
