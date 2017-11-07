// Load npm modules.
import * as Knex from 'knex'

export const up = async (knex: Knex) => {
	await knex.schema.createTable('attendee_attribute_value', (tab) => {
		tab.string('value', 512)
		tab.integer('attendee_key')
			.notNullable()
			.references('key')
			.inTable('attendee')
			.onDelete('cascade')
		tab.integer('attendee_attribute_key')
			.notNullable()
			.references('key')
			.inTable('attendee_attribute')
			.onDelete('cascade')
	})
}

export const down = async (knex: Knex) => {
	await knex.schema.dropTable('attendee_attribute_value')
}
