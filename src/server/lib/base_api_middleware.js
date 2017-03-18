// Load app modules.
import expressPromise from '@/src/server/lib/express_promise';

// Load npm modules.
import {
	Router as expressRouter,
} from 'express';

export default (model) => {
	const router = expressRouter();

	router.post(expressPromise((req, res) => {

	}));

	router.get(expressPromise((req, res) => {

	}));

	router.get('/:key', expressPromise((req, res) => {

	}));

	router.put(expressPromise((req, res) => {

	}));

	router.put('/:key', expressPromise((req, res) => {

	}));

	router.delete(expressPromise((req, res) => {

	}));

	router.delete('/:key', expressPromise((req, res) => {

	}));

	router.route('/attribute')
		.post(expressPromise((req, res) => {

		}))
		.get(expressPromise((req, res) => {

		}))
		.get('/:key', expressPromise((req, res) => {

		}))
		.put(expressPromise((req, res) => {

		}))
		.put('/:key', expressPromise((req, res) => {

		}))
		.delete(expressPromise((req, res) => {

		}))
		.delete('/:key', expressPromise((req, res) => {

		}));

	return router;
};
