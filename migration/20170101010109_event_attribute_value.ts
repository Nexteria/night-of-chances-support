// // Load npm modules.
// import * as Knex from 'knex'

// export const up = async (knex: Knex) => {
// 	await knex.schema.createTable('event_attribute_value', (tab) => {
// 		tab.string('value', 512)
// 		tab.integer('event_key')
// 			.notNullable()
// 			.references('key')
// 			.inTable('event')
// 			.onDelete('cascade')
// 		tab.integer('event_attribute_key')
// 			.notNullable()
// 			.references('key')
// 			.inTable('event_attribute')
// 			.onDelete('cascade')
// 	})
// }

// export const down = async (knex: Knex) => {
// 	await knex.schema.dropTable('event_attribute_value')
// }
