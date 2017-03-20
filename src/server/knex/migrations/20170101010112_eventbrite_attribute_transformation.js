import knexMixin from '@/src/server/knex/mixin';

export const up = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.createTable('eventbrite_attribute_transformation', (tab) => {
		tab.increments('key')
			.notNullable()
			.primary();
		tab.string('raw_name', 256)
			.notNullable();
		tab.string('raw_value', 512);
		tab.string('name', 256)
			.notNullable();
		tab.string('value', 512);
		tab.integer('project_key')
			.notNullable()
			.references('key')
			.inTable('project')
			.onDelete('cascade');
	});
};

export const down = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.dropTable('eventbrite_attribute_transformation');
};
