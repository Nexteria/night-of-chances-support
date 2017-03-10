// Load npm modules.
import React from 'react';

export default function RepoComponent() {
	return (
		<div>
			<h2>{this.props.params.repoName}</h2>
		</div>
	);
}
