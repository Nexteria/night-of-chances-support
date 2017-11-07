// Load npm modules.
import * as Knex from 'knex'

export const up = async (knex: Knex) => {
	await knex.schema.createTable('jotform_preference', (tab) => {
		tab.increments('key')
			.notNullable()
			.primary()
		tab.string('jotform_id', 256)
			.notNullable()
		tab.text('data') // (name, surname, email, cv).
		tab.integer('project_key')
			.notNullable()
			.references('key')
			.inTable('project')
			.onDelete('cascade')
	})
}

export const down = async (knex: Knex) => {
	await knex.schema.dropTable('jotform_preference')
}
