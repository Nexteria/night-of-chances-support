import NumberDataType from '@/src/common/data_type/number';

export default class UtcTimestampNumberDataType extends NumberDataType {
	static toDate(value) {
		return new Date(value * 1000);
	}
}
