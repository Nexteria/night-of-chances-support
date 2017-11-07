// Load npm modules.
import * as Knex from 'knex'

export const up = async (knex: Knex) => {
	await knex.schema.createTable('unresolved_preference_attribute', (tab) => {
		tab.increments('key')
			.notNullable()
			.primary()
		tab.string('name', 256)
			.unique()
		tab.string('color', 6)
			.defaultTo('eeeeee')
	})
}

export const down = async (knex: Knex) => {
	await knex.schema.dropTable('unresolved_preference_attribute')
}
