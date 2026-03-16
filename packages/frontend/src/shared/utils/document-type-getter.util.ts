import {
	documentTypeOptions,
} from '../constants/documents-types.constants'

export const getLabelByValue = (value: string,): string | null => {
	const option = documentTypeOptions.find((item,) => {
		return item.value === value
	},)
	return option ?
		option.label :
		value
}