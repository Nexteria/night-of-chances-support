import config from '@/src/server/lib/config';
import * as paths from '@/src/server/lib/paths';

export default {
	client: 'pg',
	connection: {
		host: config.APP_DATABASE_HOST,
		port: config.APP_DATABASE_PORT,
		database: config.APP_DATABASE_NAME,
		user: config.APP_DATABASE_USERNAME,
		password: config.APP_DATABASE_PASSWORD,
	},
	pool: {
		min: 2,
		max: 10,
	},
	migrations: {
		directory: paths.srcServerKnexMigrations,
		tableName: 'knex_migrations',
	},
	seeds: {
		directory: paths.srcServerKnexSeeds,
	},
};
