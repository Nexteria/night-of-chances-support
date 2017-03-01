import knexMixin from '@/src/server/knex/mixin';

export const up = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.createTable('event_attribute_values', (tab) => {
		tab.string('value', 512);
		tab.integer('event_key')
			.notNullable()
			.references('key')
			.inTable('event')
			.onDelete('cascade');
		tab.integer('event_attribute_key')
			.notNullable()
			.references('key')
			.inTable('event_attribute')
			.onDelete('cascade');
	});
};

export const down = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.dropTable('event_attribute_values');
};
