import ObjectDataType from '@/src/common/data_types/object';

export default class JsonObjectDataType extends ObjectDataType {
	static validate(value) {
		return super.validate(value)
			&& (JSON.stringify(value) === JSON.stringify(this.clone(value)));
	}

	static serialize(value) {
		return JSON.stringify(value);
	}

	static clone(value) {
		return JSON.parse(JSON.stringify(value));
	}
}
