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

// Send all requests to index.html so browserHistory in React Router works.
export default expressPromise((req, res) => {
	return matchAsync({
		routes,
		location: req.url,
	})
		.then((redirect, props) => {
			// Handle `onEnter` hooks and redirection.
			if (redirect) {
				res.redirect(redirect.pathname + redirect.search);
				return null;
			}

			if (props) {
				// Render matched route based on props.
				res.send(ejs.render(ejsTemplate, {
					html: renderToString(React.createElement(RouterContext, {
						...props,
					})),
				}));
				return null;
			}

			return false;
		});
});
