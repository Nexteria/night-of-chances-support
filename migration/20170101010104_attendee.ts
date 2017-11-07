// Load npm modules.
import * as Knex from 'knex'

export const up = async (knex: Knex) => {
	await knex.schema.createTable('attendee', (tab) => {
		tab.increments('key')
			.notNullable()
			.primary()
		tab.string('first_name', 256)
			.notNullable()
		tab.string('last_name', 256)
			.notNullable()
		tab.string('email_address', 256)
			.notNullable()
		tab.integer('project_key')
			.notNullable()
			.references('key')
			.inTable('project')
			.onDelete('cascade')
	})
}

export const down = async (knex: Knex) => {
	await knex.schema.dropTable('attendee')
}
