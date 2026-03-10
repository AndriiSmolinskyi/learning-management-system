import {
	P, match,
} from 'ts-pattern'

export const required = (value: string,): string | undefined => {
	return match(value,)
		.with(P.when((v,) => {
			return typeof v === 'string' && v.trim().length > 0
		},), () => {
			return undefined
		},)
		.otherwise(() => {
			return 'This field is required'
		},)
}
