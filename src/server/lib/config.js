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
const defaultConfig = dotenv.parse(fs.readFileSync(path.join(paths.root, '.env.default'), 'utf-8'));
Object.keys(defaultConfig).forEach((key) => {
	// Check if all keys are part of the config.
	if (!(key in config)) {
		throw new Error(`Required config '${key}' not found`);
	}

	// Parse based on data type.
	switch (defaultConfig[key]) {
		case 'Boolean':
			config[key] = config[key] === 'TRUE';
			break;
		case 'Integer':
			config[key] = Number.parseInt(config[key], 10);
			break;
		case 'Float':
			config[key] = Number.parseFloat(config[key]);
			break;
		case 'String':
			break;
		case 'JSON':
			config[key] = JSON.parse(config[key]);
			break;
		default:
			throw new Error(`Unknown data type '${defaultConfig[key]}' at key '${key}'`);
	}
});

// Extend config with additional values.
config.APP_VERSION = npmPackage.version;
config.APP_IS_PRODUCTION = config.NODE_ENV === 'production';

// Export as module output.
export default config;

