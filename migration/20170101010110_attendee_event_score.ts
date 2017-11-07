// Load npm modules.
import * as Knex from 'knex'

export const up = async (knex: Knex) => {
	await knex.schema.createTable('attendee_event_score', (tab) => {
		tab.increments('key')
			.notNullable()
			.primary()
		tab.string('value', 512)
			.notNullable()
		tab.integer('score')
			.notNullable()
		tab.integer('attendee_attribute_key')
			.notNullable()
			.references('key')
			.inTable('attendee_attribute')
			.onDelete('cascade')
		tab.integer('event_key')
			.notNullable()
			.references('key')
			.inTable('event')
			.onDelete('cascade')
	})
}

export const down = async (knex: Knex) => {
	await knex.schema.dropTable('attendee_event_score')
}
