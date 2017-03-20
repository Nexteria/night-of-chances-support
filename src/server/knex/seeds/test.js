// Load app modules.
import knexMixin from '@/src/server/knex/mixin';

export const seed = (originalKnex) => {
	const knex = knexMixin(originalKnex);

	let projectKey = null;
	let isActiveAttributeKey = null;
	let eventbriteEventIdAttributeKey = null;
	let jotformExportGoogleSpreadsheetIdKey = null;
	let jotformExportGoogleSpreadsheetRangeKey = null;

	return knex('project')
		.insert({
			name: 'Night of Chances 03/2017 - Technology, Bratislava',
			token: 'NoC-03/2017-Tech-BA',
		})
		.returning('key')
		.then((result) => {
			projectKey = result[0];

			return knex('project_attribute')
				.insert({
					name: 'is_active',
				})
				.returning('key');
		})
		.then((result) => {
			isActiveAttributeKey = result[0];

			return knex('project_attribute')
				.insert({
					name: 'eventbrite_event_id',
				})
				.returning('key');
		})
		.then((result) => {
			eventbriteEventIdAttributeKey = result[0];

			return knex('project_attribute')
				.insert({
					name: 'jotform_export_google_spreadsheet_id',
				})
				.returning('key');
		})
		.then((result) => {
			jotformExportGoogleSpreadsheetIdKey = result[0];

			return knex('project_attribute')
				.insert({
					name: 'jotform_export_google_spreadsheet_range',
				})
				.returning('key');
		})
		.then((result) => {
			jotformExportGoogleSpreadsheetRangeKey = result[0];

			return knex('project_attribute_value')
				.insert({
					value: 'TRUE',
					project_key: projectKey,
					project_attribute_key: isActiveAttributeKey,
				});
		})
		.then(() => {
			return knex('project_attribute_value')
				.insert({
					value: '31324642850',
					project_key: projectKey,
					project_attribute_key: eventbriteEventIdAttributeKey,
				});
		})
		.then(() => {
			return knex('project_attribute_value')
				.insert({
					value: '1VWCfpfmuHqDaYtwxBqMuwhd_mS0jpS1FfvrVxXbsoz4',
					project_key: projectKey,
					project_attribute_key: jotformExportGoogleSpreadsheetIdKey,
				});
		})
		.then(() => {
			return knex('project_attribute_value')
				.insert({
					value: 'A:N',
					project_key: projectKey,
					project_attribute_key: jotformExportGoogleSpreadsheetRangeKey,
				});
		});
};
