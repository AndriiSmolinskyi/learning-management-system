import {
	match, P,
} from 'ts-pattern'

export const validateDate = (value: string | undefined,): string | undefined => {
	return match(value,)
		.with(P.nullish, () => {
			return 'Required'
		},)
		.with(
			P.when((val,) => {
				return !isNaN(new Date(val,).getTime(),)
			},),
			() => {
				return undefined
			},
		)
		.otherwise(() => {
			return 'Invalid date'
		},)
}
