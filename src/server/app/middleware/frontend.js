// Load app modules.
import routes from '@/src/browser/router.jsx';
import expressPromise from '@/src/server/lib/express_promise';
import * as paths from '@/src/server/lib/paths';

// Load npm modules.
import Promise from 'bluebird';
import ejs from 'ejs';
import React from 'react';
import {
	renderToString,
} from 'react-dom/server';
import {
	match,
	RouterContext,
} from 'react-router';

// Load node modules.
import fs from 'fs';
import path from 'path';

// Promisify libraries.
const matchAsync = Promise.promisify(match);

// Cache ejs template.
const ejsTemplate = fs.readFileSync(path.join(paths.srcBrowser, 'index.ejs'), 'utf-8');

// Expose react frontend parser.
export default expressPromise((req, res) => {
	// Send all requests to index.html so browserHistory in React Router works.
	return matchAsync({
		routes,
		location: req.url,
	})
		.then((redirect, props) => {
			// Handle `onEnter` hooks and redirection.
			if (redirect) {
				return res.redirect(redirect.pathname + redirect.search);
			}

			if (props) {
				// Render matched route based on props.
				return res.send(ejs.render(ejsTemplate, {
					html: renderToString(React.createElement(RouterContext, {
						...props,
					})),
				}));
			}

			// React router should handle all paths including the not found case.
			throw new Error('React router should handle the not found case');
		});
});
