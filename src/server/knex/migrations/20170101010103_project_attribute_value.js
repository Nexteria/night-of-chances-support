import knexMixin from '@/src/server/knex/mixin';

export const up = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.createTable('project_attribute_value', (tab) => {
		tab.string('value', 512);
		tab.integer('project_key')
			.notNullable()
			.references('key')
			.inTable('project')
			.onDelete('cascade');
		tab.integer('project_attribute_key')
			.notNullable()
			.references('key')
			.inTable('project_attribute')
			.onDelete('cascade');
	});
};

export const down = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.dropTable('project_attribute_value');
};
