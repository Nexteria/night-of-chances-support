// Load app modules.
import config from '@/src/server/lib/config';
import promiseLoop from '@/src/common/promise_loop';
import request from '@/src/server/lib/request';

// Load npm modules.
import httpStatus from 'http-status';

// Define recursive eventbrite rest api call which accumulates the paginated result.
export default (endpointUrl, aggregatedProperty, parameters = {}) => {
	return promiseLoop({
		done: false,
		value: {
			page: 1,
			data: [],
		},
	}, (value) => {
		return request({
			method: 'GET',
			url: `https://www.eventbriteapi.com/v3${endpointUrl}`,
			headers: {
				Authorization: `Bearer ${config.APP_EVENTBRITE_PERSONAL_TOKEN}`,
			},
			json: {
				page: value.page,
				...parameters,
			},
		}).then((res) => {
			if (res.statusCode === httpStatus.OK) {
				return {
					done: false,
					value: {
						page: value.page + 1,
						data: [
							...value.data,
							...res.body[aggregatedProperty],
						],
					},
				};
			} else if ((res.statusCode === httpStatus.BAD_REQUEST) && (res.body.error === 'BAD_PAGE')) {
				return {
					done: true,
					value,
				};
			}

			throw new Error('An error occured while collecting the paginated data from eventbrite.');
		});
	})
		.then(({ data }) => {
			return data;
		});
};
