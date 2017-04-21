export const up = async (knex) => {
	await knex.schema.createTable('confirmation_list', (tab) => {
		tab.string('barcode', 32)
			.notNullable();
		tab.string('ws_id', 8)
			.notNullable();
		tab.dateTime('date_time_submitted');
		tab.boolean('is_confirmed');

		tab.primary(['barcode', 'ws_id']);
	});
};

export const down = async (knex) => {
	await knex.schema.dropTable('confirmation_list');
};
