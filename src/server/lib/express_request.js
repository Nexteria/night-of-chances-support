export const getIpAddress = (req) => {
	const ipAddress = req.ip
		|| req.headers['x-forwarded-for']
		|| req.connection.remoteAddress
		|| req.socket.remoteAddress;

	// Handle case where the unknown ip address is reported by a string.
	if (!ipAddress || (ipAddress === 'unknown')) {
		return null;
	}

	// Handle the case where multiple ip addresses are retrieved.
	return ipAddress.split(', ')[0];
};

export const getFullUrl = (req) => {
	return `${req.protocol}://${req.headers.host}${req.originalUrl}`;
};
