import knexMixin from '@/src/server/knex/mixin';

export const up = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.createTable('unresolved_preference_attribute_value', (tab) => {
		tab.string('value', 512);
		tab.integer('unresolved_preference_key')
			.notNullable()
			.references('key')
			.inTable('unresolved_preference')
			.onDelete('cascade');
		tab.integer('unresolved_preference_attribute_key')
			.notNullable()
			.references('key')
			.inTable('unresolved_preference_attribute')
			.onDelete('cascade');
	});
};

export const down = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	return knex.schema.dropTable('unresolved_preference_attribute_value');
};
