import knexMixin from '@/src/server/knex/mixin';

export const up = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.createTable('attendee_attribute_value', (tab) => {
		tab.string('value', 512);
		tab.integer('attendee_key')
			.notNullable()
			.references('key')
			.inTable('attendee')
			.onDelete('cascade');
		tab.integer('attendee_attribute_key')
			.notNullable()
			.references('key')
			.inTable('attendee_attribute')
			.onDelete('cascade');
	});
};

export const down = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.dropTable('attendee_attribute_value');
};
