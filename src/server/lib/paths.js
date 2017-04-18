// Load node modules.
import path from 'path';

// Define 'root' path.
export const root = path.resolve(path.join(__dirname, '..', '..', '..'));

// Define 'build' paths.
export const build = path.join(root, 'build');
export const buildBrowser = path.join(build, 'browser');
export const buildServer = path.join(build, 'server');

// Define 'src' paths.
export const src = path.join(root, 'src');
export const srcBrowser = path.join(src, 'browser');
export const srcBrowserStatic = path.join(srcBrowser, 'static');
export const srcServer = path.join(src, 'server');
export const srcServerKnex = path.join(srcServer, 'knex');
export const srcServerKnexMigrations = path.join(srcServerKnex, 'migrations');
export const srcServerKnexSeeds = path.join(srcServerKnex, 'seeds');
export const srcServerView = path.join(srcServer, 'view');

// Define 'test' path.
export const test = path.join(root, 'test');
