import knexMixin from '@/src/server/knex/mixin';

export const up = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.createTable('jotform_attendee', (tab) => {
		tab.string('id', 256);
		tab.string('email_address', 256);
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

	return knex.schema.dropTable('jotform_attendee');
};
