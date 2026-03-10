import {
	P, match,
} from 'ts-pattern'

export const maxLengthValidator = (limit: number, text?: string,) => {
	return (value: string,): string | undefined => {
		return match(value,)
			.with(P.nullish, () => {
				return undefined
			},)
			.with(P.string, (val,) => {
				return (val.length <= limit ?
					undefined :
					text ?? 'Username is too long')
			},)
			.otherwise(() => {
				return undefined
			},)
	}
}