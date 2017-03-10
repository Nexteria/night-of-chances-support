// Load npm modules.
import httpStatus from 'http-status';

export default (req, res) => {
	res.status(httpStatus.NOT_FOUND).send('Not Found');
};
