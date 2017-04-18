export const up = async (knex) => {
	await knex.schema.createTable('mailer_list', (tab) => {
		tab.string('email', 256)
			.notNullable();
		tab.string('ws_id', 8)
			.notNullable();
		tab.string('ws_name', 512)
			.notNullable();
		tab.dateTime('date_time_submitted');
		tab.boolean('is_confirmed');
	});
};

export const down = async (knex) => {
	await knex.schema.dropTable('mailer_list');
};
