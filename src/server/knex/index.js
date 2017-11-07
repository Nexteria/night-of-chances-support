// Load local modules.
import knexConfig from '@/src/server/knex/config';
import knexMixin from '@/src/server/knex/mixin';
import config from '@/src/server/lib/config';

// Load npm modules.
import Promise from 'bluebird';
import knex from 'knex';

export default {
	// Define knex instance.
	instance: knexMixin(knex({
		client: knexConfig.client,
	})),
	// Define connect and disconnect semaphore.
	semaphore: 0,
	// Connect to PostgreSQL through knex.
	connect() {
		++this.semaphore;

		if (this.semaphore === 1) {
			// Create, mixin and expose knex instance based on config.
			this.instance = knexMixin(knex(knexConfig));
		}

		return Promise.resolve({
			host: config.APP_DATABASE_HOST,
			port: config.APP_DATABASE_PORT,
			name: config.APP_DATABASE_NAME,
		});
	},
	// Disconnect from PostgreSQL through knex.
	disconnect() {
		--this.semaphore;

		if (this.semaphore === -1) {
			throw new Error('Disconnect invoked before connect.');
		}

		return (this.semaphore === 0)
			? this.instance.destroy()
				.then(() => {
					this.instance = null;
				})
			: Promise.resolve();
	},
};
