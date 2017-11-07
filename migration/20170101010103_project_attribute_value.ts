// Load npm modules.
import * as Knex from 'knex'

export const up = async (knex: Knex) => {
	await knex.schema.createTable('project_attribute_value', (tab) => {
		tab.string('value', 512)
		tab.integer('project_key')
			.notNullable()
			.references('key')
			.inTable('project')
			.onDelete('cascade')
		tab.integer('project_attribute_key')
			.notNullable()
			.references('key')
			.inTable('project_attribute')
			.onDelete('cascade')
	})
}

export const down = async (knex: Knex) => {
	await knex.schema.dropTable('project_attribute_value')
}
