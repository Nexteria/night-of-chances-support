// Load npm modules.
import * as Knex from 'knex'

export const up = async (knex: Knex) => {
	await knex.schema.createTable('attendee_attribute', (tab) => {
		tab.increments('key')
			.notNullable()
		tab.string('name', 256)
			.notNullable()
		tab.string('color', 6)
			.notNullable()
			.defaultTo('eeeeee')

		tab.primary(['key'])
		tab.unique(['name'])
	})
}

export const down = async (knex: Knex) => {
	await knex.schema.dropTable('attendee_attribute')
}
