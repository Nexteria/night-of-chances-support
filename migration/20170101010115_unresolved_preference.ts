// // Load npm modules.
// import * as Knex from 'knex'

// export const up = async (knex: Knex) => {
// 	await knex.schema.createTable('unresolved_preference', (tab) => {
// 		tab.increments('key')
// 			.notNullable()
// 			.primary()
// 		tab.string('name', 256)
// 			.notNullable()
// 		tab.string('token', 256)
// 			.notNullable()
// 		tab.integer('project_key')
// 			.notNullable()
// 			.references('key')
// 			.inTable('project')
// 			.onDelete('cascade')
// 	})
// }

// export const down = async (knex: Knex) => {
// 	await knex.schema.dropTable('unresolved_preference')
// }
