import {
	P, match,
} from 'ts-pattern'
import type {
	SelectOptionType,
	SelectValueType,
} from '../../../shared/types'

export const requiredSelect = (
	value: SelectValueType,
): string | undefined => {
	return match(value,)
		.with(undefined, () => {
			return 'Required'
		},)
		.with(P.array(P._,), (arr,) => {
			return (arr.length === 0 ?
				'Required' :
				undefined)
		},)
		.otherwise(() => {
			return undefined
		},)
}

export const requiredSelectObject = (
	value: SelectValueType<SelectOptionType>,
): string | undefined => {
	return match(value,)
		.with(undefined, () => {
			return 'Required'
		},)
		.with(P.array(P._,), (arr,) => {
			return (arr.length === 0 ?
				'Required' :
				undefined)
		},)
		.otherwise(() => {
			return undefined
		},)
}