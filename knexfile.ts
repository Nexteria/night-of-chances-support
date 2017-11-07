// Load the application runtime.
import '@player1os/node-js-application-support/register'

// Load local module.
import env from '.../src/.env'
import knexConnection from '.../src/knex_connection'

// Load node modules.
import * as path from 'path'

// Expose the config.
export = {
	...knexConnection.config,
	migrations: {
		directory: path.join(env.APP_ROOT_PATH, 'migration'),
		tableName: 'knex_migrations',
	},
	seeds: {
		directory: path.join(env.APP_ROOT_PATH, 'seed'),
	},
}
