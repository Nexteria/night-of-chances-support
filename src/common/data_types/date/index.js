import NumberDataType from '@/src/common/data_types/number';

export default class DateDataType {
	static timestamp(value) {
		return value.getTime() / 1000;
	}

	static fullUTCDateTime(value) {
		return [
			[
				NumberDataType.pad(value.getUTCFullYear(), 4),
				NumberDataType.pad((value.getUTCMonth() + 1), 2),
				NumberDataType.pad(value.getUTCDate().toString(), 2),
			].join('/'), [
				NumberDataType.pad(value.getUTCHours(), 2),
				NumberDataType.pad(value.getUTCMinutes(), 2),
				NumberDataType.pad(value.getUTCSeconds(), 2),
			].join(':'),
			NumberDataType.pad(value.getUTCMilliseconds(), 3),
		].join('_');
	}
}
