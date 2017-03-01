import knexMixin from '@/src/server/knex/mixin';

export const up = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.createTable('attendee', (tab) => {
		tab.increments('key')
			.notNullable()
			.primary();
		tab.string('first_name', 256);
		tab.string('last_name', 256);
		tab.string('email_address', 256);
		tab.integer('project_key')
			.notNullable()
			.references('key')
			.inTable('project')
			.onDelete('cascade');
	});
};

export const down = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.dropTable('attendee');
};
