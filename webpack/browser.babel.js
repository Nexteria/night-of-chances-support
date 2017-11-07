// Load local modules.
import config from '@/src/server/lib/config';
import * as paths from '@/src/server/lib/paths';

// Load npm modules.
import webpack from 'webpack';

// Load node modules.
import path from 'path';

// Expose configuration object.
export default {
	entry: [
		'babel-polyfill',
		path.resolve(paths.srcBrowser, 'index.js'),
	],
	output: {
		path: paths.buildBrowser,
		filename: 'index.js',
	},
	module: {
		loaders: [{
			test: /\.jsx?$/,
			exclude: /node_modules/,
			loader: 'babel-loader',
		}],
	},
	plugins: config.APP_IS_PRODUCTION
		? [
			new webpack.optimize.DedupePlugin(),
			new webpack.optimize.OccurrenceOrderPlugin(),
			new webpack.optimize.UglifyJsPlugin(),
		]
		: [],
};
