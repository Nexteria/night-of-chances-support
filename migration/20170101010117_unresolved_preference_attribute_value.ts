// // Load npm modules.
// import * as Knex from 'knex'

// export const up = async (knex: Knex) => {
// 	await knex.schema.createTable('unresolved_preference_attribute_value', (tab) => {
// 		tab.string('value', 512)
// 		tab.integer('unresolved_preference_key')
// 			.notNullable()
// 			.references('key')
// 			.inTable('unresolved_preference')
// 			.onDelete('cascade')
// 		tab.integer('unresolved_preference_attribute_key')
// 			.notNullable()
// 			.references('key')
// 			.inTable('unresolved_preference_attribute')
// 			.onDelete('cascade')
// 	})
// }

// export const down = async (knex: Knex) => {
// 	await knex.schema.dropTable('unresolved_preference_attribute_value')
// }
