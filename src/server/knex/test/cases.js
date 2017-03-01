export const toString = (knexInstance) => {
	return [
		knexInstance.schema.createTable('installation_event', (tab) => {
			tab.increments('key')
				.notNullable()
				.primary();
			tab.string('_id', 24)
				.unique();
			tab.string('player_token', 64);
			tab.string('player_user_id', 64);
			tab.string('player_cookie', 64);
			tab.text('attributes');
			tab.text('properties');
			tab.boolean('is_repeated')
				.notNullable()
				.defaultTo(false);
			tab.boolean('is_attributed')
				.notNullable()
				.defaultTo(false);
			tab.float('timestamp', 53);
			tab.string('datetime', 32);
			tab.float('request_id', 10000, 10000);
			tab.string('game_id', 24)
				.notNullable();
			tab.string('game_token', 254);
		}),
	];
};

export const execute = (knexInstance) => { // eslint-disable-line no-unused-vars
	return [];
};
