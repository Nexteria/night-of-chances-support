// // Load npm modules.
// import * as Knex from 'knex'

// export const up = async (knex: Knex) => {
// 	await Promise.all([
// 		knex.schema.createTable('project', (tab) => {
// 			tab.increments('key')
// 				.notNullable()
// 			tab.string('name', 256)
// 				.notNullable()

// 			tab.primary(['key'])
// 			tab.unique(['name'])
// 		}),
// 		knex.schema.createTable('project_attribute', (tab) => {
// 			tab.increments('key')
// 				.notNullable()
// 			tab.string('name', 256)
// 				.notNullable()
// 			tab.string('color', 6)
// 				.notNullable()
// 				.defaultTo('eeeeee')

// 			tab.primary(['key'])
// 			tab.unique(['name'])
// 		}),
// 	])

// 	await knex.schema.createTable('project_attribute_value', (tab) => {
// 		tab.integer('project_key')
// 			.notNullable()
// 		tab.integer('project_attribute_key')
// 			.notNullable()
// 		tab.string('value', 512)
// 			.notNullable()

// 		tab.foreign('project_key')
// 			.references('key')
// 			.inTable('project')
// 			.onDelete('cascade')
// 		tab.foreign('project_attribute_key')
// 			.references('key')
// 			.inTable('project_attribute')
// 			.onDelete('cascade')

// 		tab.index(['project_key'])
// 	})
// }

// export const down = async (knex: Knex) => {
// 	await knex.schema.dropTable('project_attribute_value')

// 	await Promise.all([
// 		knex.schema.dropTable('project'),
// 		knex.schema.dropTable('project_attribute'),
// 	])
// }
