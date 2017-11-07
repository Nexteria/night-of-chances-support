// Load local modules.
import env from '.../src/.env'

// Load scoped modules.
import { Connection as KnexConnection } from '@player1os/knex-utility'

export default new KnexConnection({
	client: 'pg',
	searchPath: 'public',
	connection: {
		host: env.APP_DATABASE_HOST,
		port: env.APP_DATABASE_PORT,
		database: env.APP_DATABASE_NAME,
		user: env.APP_DATABASE_USERNAME,
		password: env.APP_DATABASE_PASSWORD,
	},
	pool: {
		min: env.APP_DATABASE_POOL_MIN,
		max: env.APP_DATABASE_POOL_MAX,
	},
})
