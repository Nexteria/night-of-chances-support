// Load app modules.
import NavLink from '@/src/browser/module/nav_link.jsx';

// Load npm modules.
import React from 'react';

export default function AppComponent() {
	return (
		<div>
			<h1>React Router Tutorial</h1>
			<ul role="nav">
				<li><NavLink to="/" onlyActiveOnIndex>Home</NavLink></li>
				<li><NavLink to="/about">About</NavLink></li>
				<li><NavLink to="/repos">Repos</NavLink></li>
			</ul>
			{this.props.children}
		</div>
	);
}
