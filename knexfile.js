/* eslint-disable import/no-commonjs */

// Enable the use of transpilation in migration and seed modules.
require('babel-polyfill');
require('babel-register');

// Expose parametrized knex config.
module.exports = require('./src/server/knex/config').default;
