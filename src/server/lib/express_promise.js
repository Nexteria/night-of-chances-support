export default (promise) => {
	return (req, res, next) => {
		promise
			.then((result) => {
				if (result === true) {
					next('route');
				} else if (result === false) {
					next();
				}
			})
			.catch((err) => {
				next(err);
			});
	};
};
