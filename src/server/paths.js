// Load node modules.
import path from 'path';

// Define 'root' path.
export const root = path.resolve(path.join(__dirname, '..', '..'));

// Define 'build' paths.
export const build = path.join(root, 'build');
export const buildBrowser = path.join(build, 'browser');
export const buildServer = path.join(build, 'server');

// Define 'src' paths.
export const src = path.join(root, 'src');
export const srcCommon = path.join(src, 'common');
export const srcServer = path.join(src, 'server');

// Define 'test' path.
export const test = path.join(root, 'test');
