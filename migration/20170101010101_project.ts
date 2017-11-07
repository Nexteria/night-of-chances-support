// Load npm modules.
import * as Knex from 'knex'

export const up = async (knex: Knex) => {
	await knex.schema.createTable('project', (tab) => {
		tab.increments('key')
			.notNullable()
			.primary()
		tab.string('name', 256)
			.notNullable()
			.unique()
		tab.string('token', 256)
			.notNullable()
			.unique()
	})
}

export const down = async (knex: Knex) => {
	await knex.schema.dropTable('project')
}
