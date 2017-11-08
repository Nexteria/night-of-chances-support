// Load npm modules.
import * as Knex from 'knex'

export const up = async (knex: Knex) => {
	await knex.schema.createTable('attendee', (tab) => {
		tab.increments('key')
			.notNullable()
		tab.string('first_name', 256)
			.notNullable()
		tab.string('last_name', 256)
			.notNullable()
		tab.string('email_address', 256)
			.notNullable()
		tab.integer('project_key')
			.notNullable()

		tab.primary(['key'])

		tab.foreign('project_key')
			.references('key')
			.inTable('project')
			.onDelete('cascade')

		tab.index(['project_key'])
	})
}

export const down = async (knex: Knex) => {
	await knex.schema.dropTable('attendee')
}
