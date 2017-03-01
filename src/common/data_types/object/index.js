export default class ObjectDataType {
	static validate(value) {
		return value instanceof Object;
	}

	static isEmpty(value) {
		return JSON.stringify(value) === JSON.stringify({});
	}

	static shallowClone(value) {
		return Object.keys(value).reduce((result, key) => {
			result[key] = value[key];
			return result;
		}, {});
	}

	static shallowFilter(value, keys) {
		return keys.reduce((result, key) => {
			if (key in value) {
				result[key] = value[key];
			}
			return result;
		}, {});
	}

	static shallowLeftMerge(leftValue, rightValue) {
		const result = this.shallowClone(leftValue);

		Object.keys(rightValue).forEach((key) => {
			result[key] = rightValue[key];
		});

		return result;
	}
}
