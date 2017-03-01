import ObjectDataType from '@/src/common/data_type/object';

export default class ArrayDataType {
	static last(value) {
		return value[value.length - 1];
	}

	static shallowLeftMerge(leftValue, rightValue) {
		return leftValue.map((value, index) => {
			return ObjectDataType.shallowLeftMerge(value, rightValue[index] || {});
		});
	}
}
