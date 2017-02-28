// Load app modules.
import * as paths from '@/src/server/lib/paths';

// Load npm modules.
import webpack from 'webpack';

// Load node modules.
import fs from 'fs';
import path from 'path';

export default {
	entry: [
		'babel-polyfill',
		path.resolve(paths.srcServer, 'index.js'),
	],
	output: {
		path: path.resolve(paths.buildServer),
		filename: 'index.js',
	},
	target: 'node',
	externals: fs.readdirSync(path.resolve(paths.root, 'node_modules'))
		.filter((fileSystemObjectName) => {
			return fileSystemObjectName !== '.bin';
		})
		.reduce((externals, module) => {
			externals[module] = `commonjs ${module}`;
			return externals;
		}, {}),
	node: {
		__filename: true,
		__dirname: true,
	},
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel-loader',
		}],
	},
	plugins: [
		new webpack.BannerPlugin({
			banner: "require('source-map-support').install();\n",
			raw: true,
			entryOnly: false,
		}),
	],
	devtool: 'source-map',
};
