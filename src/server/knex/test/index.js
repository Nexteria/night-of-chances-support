/* eslint-disable no-console */

// Load app modules.
import * as dataType from '@/src/common/data_type';
import knex from '@/src/server/knex';
import * as testCases from '@/src/server/knex/test/cases';

// Load npm modules.
import Promise from 'bluebird';

// Initialize execute storage.
let executeCasesToString = [];

knex.connect()
	.then(() => {
		// Output toString cases.
		const toStringCases = testCases.toString(knex.instance);

		if (toStringCases.length) {
			console.log('# Output toString cases #');
		}

		toStringCases.forEach((knexQuery) => {
			console.log(knexQuery.toString());
		});

		// Output execute cases.
		const executeCases = testCases.execute(knex.instance);
		executeCasesToString = executeCases.map((knexQuery) => {
			return {
				toString: knexQuery.toString(),
			};
		});

		if (executeCases.length) {
			console.log('# Output execute cases #');
		}

		return Promise.all(executeCases);
	})
	.then((results) => {
		dataType.array.shallowLeftMerge(executeCasesToString, results.map((result) => {
			return {
				result,
			};
		})).forEach((storageObject) => {
			console.log(storageObject.toString);
			console.log(storageObject.result);
		});
	})
	.catch((err) => {
		console.error(err);
	})
	.then(() => {
		return knex.disconnect();
	})
	.catch((err) => {
		throw err;
	});
