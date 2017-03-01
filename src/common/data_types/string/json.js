import StringDataType from '@/src/common/data_types/string';

export default class JsonStringDataTypes extends StringDataType {
	static validate(value) {
		try {
			return super.validate(value)
				&& JSON.parse(value);
		} catch (err) {
			return false;
		}
	}

	static deserialize(value) {
		return JSON.parse(value);
	}
}
