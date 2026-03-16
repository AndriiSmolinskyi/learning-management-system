import {
	match, P,
} from 'ts-pattern'

export const alphanumericValidator = (value: string,): string | undefined => {
	return match(value,)
		.with(
			P.when((v,) => {
				return (/^[a-zA-Z0-9 ]*$/).test(v,)
			},),
			() => {
				return undefined
			},
		)
		.otherwise(() => {
			return 'Only letters, numbers, and spaces are allowed.'
		},)
}