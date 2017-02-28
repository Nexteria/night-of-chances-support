// Load app modules.
import * as paths from '@/src/server/lib/paths';
import npmPackage from '@/package.json';

// Load npm modules.
import dotenv from 'dotenv';

// Load node modules.
import fs from 'fs';
import path from 'path';

// Populate unassigned process env keys with values defined in the .env file.
dotenv.config();

// Load environment variables into config object.
const config = Object.assign({}, process.env);

// Load required config parameters from default env file.
fs.readFileSync(path.join(paths.root, '.env.default'), 'utf-8')
	// Parse keys from file.
	.split('\n').map((line) => {
		return line.split('=')[0];
	})
	// Check if all keys are part of the config.
	.forEach((key) => {
		if (!(key in config)) {
			throw new Error(`Required config '${key}' not found`);
		}
	});

// Apply modifications to config.
config.APP_VERSION = npmPackage.version;
config.APP_IS_PRODUCTION = config.NODE_ENV === 'production';

// TODO: Add.
/*
config.APP_HTTP_PORT = parseInt(config.APP_HTTP_PORT, 10);
config.APP_DATABASE_PORT = parseInt(config.APP_DATABASE_PORT, 10);
*/

// TODO: Add.
/*
config.APP_API_HOSTNAME = `api.${config.APP_HOSTNAME}`;
*/

// Export as module output.
export default config;

