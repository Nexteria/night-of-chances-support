import React from 'react';
import {
	Link,
} from 'react-router';

export default function NavLinkComponent() {
	return <Link {...this.props} activeClassName="active" />;
}
