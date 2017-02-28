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

config.APP_TEST_TIMEOUT = parseInt(config.APP_TEST_TIMEOUT, 10);
config.APP_TEST_PING_SERVER_DELAY = parseInt(config.APP_TEST_PING_SERVER_DELAY, 10);
config.APP_TEST_EVENT_PROCESSING_DELAY = parseInt(config.APP_TEST_EVENT_PROCESSING_DELAY, 10);
config.APP_TEST_SERVER_PORT = parseInt(config.APP_TEST_SERVER_PORT, 10);

config.APP_HTTP_PORT = parseInt(config.APP_HTTP_PORT, 10);
config.APP_DATABASE_PORT = parseInt(config.APP_DATABASE_PORT, 10);
config.APP_LEGACY_DATABASE_PORT = parseInt(config.APP_LEGACY_DATABASE_PORT, 10);

config.APP_API_HOSTNAME = `api.${config.APP_HOSTNAME}`;
config.APP_GUI_HOSTNAME = `app.${config.APP_HOSTNAME}`;

config.APP_MAIL_REDIRECT_TO_CONSOLE = config.APP_MAIL_REDIRECT_TO_CONSOLE === 'TRUE';
config.APP_MAIL_CONTACTS_APPLICATION = JSON.parse(config.APP_MAIL_CONTACTS_APPLICATION);
config.APP_MAIL_CONTACTS_ADMINISTRATORS = JSON.parse(config.APP_MAIL_CONTACTS_ADMINISTRATORS);
config.APP_MAIL_CONTACTS_STAKEHOLDERS = JSON.parse(config.APP_MAIL_CONTACTS_STAKEHOLDERS);

config.APP_REQUEST_INITIAL_RETRY_OFFSET = parseInt(config.APP_REQUEST_INITIAL_RETRY_OFFSET, 10);
config.APP_REQUEST_MAX_RETRY_COUNT = parseInt(config.APP_REQUEST_MAX_RETRY_COUNT, 10);

// Export as module output.
export default config;

