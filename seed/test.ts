// // Load npm modules.
// import * as Knex from 'knex'

// const extractFirst = async (knexQuery: Knex.QueryBuilder) => {
// 	const result = await knexQuery
// 	return result[0]
// }

// export const seed = async (knex: Knex) => {
// 	const projectKey = await extractFirst(knex('project')
// 		.insert({
// 			name: 'Night of Chances 03/2017 - Technology, Bratislava',
// 			token: 'NoC-03/2017-Tech-BA',
// 		})
// 		.returning('key'))

// 	const isActiveAttributeKey = await extractFirst(knex('project_attribute')
// 		.insert({
// 			name: 'is_active',
// 		})
// 		.returning('key'))

// 	const eventbriteEventIdAttributeKey = await extractFirst(knex('project_attribute')
// 		.insert({
// 			name: 'eventbrite_event_id',
// 		})
// 		.returning('key'))

// 	const jotformExportGoogleSpreadsheetIdKey = await extractFirst(knex('project_attribute')
// 		.insert({
// 			name: 'jotform_export_google_spreadsheet_id',
// 		})
// 		.returning('key'))

// 	const jotformExportGoogleSpreadsheetRangeKey = await extractFirst(knex('project_attribute')
// 		.insert({
// 			name: 'jotform_export_google_spreadsheet_range',
// 		})
// 		.returning('key'))

// 	await knex('project_attribute_value')
// 		.insert({
// 			value: 'TRUE',
// 			project_key: projectKey,
// 			project_attribute_key: isActiveAttributeKey,
// 		})
// 	await knex('project_attribute_value')
// 		.insert({
// 			value: '31324642850',
// 			project_key: projectKey,
// 			project_attribute_key: eventbriteEventIdAttributeKey,
// 		})

// 	await knex('project_attribute_value')
// 		.insert({
// 			value: '1VWCfpfmuHqDaYtwxBqMuwhd_mS0jpS1FfvrVxXbsoz4',
// 			project_key: projectKey,
// 			project_attribute_key: jotformExportGoogleSpreadsheetIdKey,
// 		})

// 	await knex('project_attribute_value')
// 		.insert({
// 			value: 'A:N',
// 			project_key: projectKey,
// 			project_attribute_key: jotformExportGoogleSpreadsheetRangeKey,
// 		})
// }
