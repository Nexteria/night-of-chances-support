import knexMixin from '@/src/server/knex/mixin';

export const up = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.createTable('jotform_preference', (tab) => {
		tab.increments('key')
			.notNullable()
			.primary();
		tab.string('jotform_id', 256)
			.notNullable();
		tab.text('data'); // (name, surname, email, cv).
		tab.integer('project_key')
			.notNullable()
			.references('key')
			.inTable('project')
			.onDelete('cascade');
	});
};

export const down = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.dropTable('jotform_preference');
};
