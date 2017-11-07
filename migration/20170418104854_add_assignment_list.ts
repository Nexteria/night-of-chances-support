// Load npm modules.
import * as Knex from 'knex'

export const up = async (knex: Knex) => {
	await knex.schema.createTable('assignment_list', (tab) => {
		tab.string('barcode', 32)
			.notNullable()
		tab.string('ws_id', 8)
			.notNullable()
		tab.dateTime('date_time_submitted')
		tab.boolean('is_confirmed')

		tab.primary(['barcode', 'ws_id'])
	})
}

export const down = async (knex: Knex) => {
	await knex.schema.dropTable('assignment_list')
}
