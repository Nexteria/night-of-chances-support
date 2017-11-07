// Load npm modules.
import * as Knex from 'knex'

export const up = async (knex: Knex) => {
	await knex.schema.createTable('eventbrite_attendee', (tab) => {
		tab.increments('key')
			.notNullable()
			.primary()
		tab.string('eventbrite_id', 256)
			.notNullable()
		tab.text('data') // (name, surname, email, tel. number, barcode, email, school, grade)
		tab.integer('project_key')
			.notNullable()
			.references('key')
			.inTable('project')
			.onDelete('cascade')
	})
}

export const down = async (knex: Knex) => {
	await knex.schema.dropTable('eventbrite_attendee')
}
