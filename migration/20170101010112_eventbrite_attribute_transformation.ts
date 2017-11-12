// // Load npm modules.
// import * as Knex from 'knex'

// export const up = async (knex: Knex) => {
// 	await knex.schema.createTable('eventbrite_attribute_transformation', (tab) => {
// 		tab.increments('key')
// 			.notNullable()
// 			.primary()
// 		tab.string('raw_name', 256)
// 			.notNullable()
// 		tab.string('raw_value', 512)
// 		tab.string('name', 256)
// 			.notNullable()
// 		tab.string('value', 512)
// 		tab.integer('project_key')
// 			.notNullable()
// 			.references('key')
// 			.inTable('project')
// 			.onDelete('cascade')
// 	})
// }

// export const down = async (knex: Knex) => {
// 	await knex.schema.dropTable('eventbrite_attribute_transformation')
// }
