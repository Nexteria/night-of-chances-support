// Load app modules.
import App from '@/src/browser/module/app.jsx';
import Home from '@/src/browser/module/home.jsx';
import About from '@/src/browser/module/about.jsx';
import Repos from '@/src/browser/module/repos.jsx';
import Repo from '@/src/browser/module/repo.jsx';

// Load npm modules.
import React from 'react';
import {
	Route,
	IndexRoute,
} from 'react-router';

export default (
	<Route path="/" component={App}>
		<IndexRoute component={Home} />
		<Route path="/repos" component={Repos}>
			<Route path="/repos/:userName/:repoName" component={Repo} />
		</Route>
		<Route path="/about" component={About} />
	</Route>
);
