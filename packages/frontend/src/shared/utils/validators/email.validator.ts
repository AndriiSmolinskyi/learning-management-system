import {
	match,
} from 'ts-pattern'

import {
	email as emailRegex,
} from '../../constants/regexes.constants'

export const email = (value: string | undefined,): string | undefined => {
	if (!value) {
		return undefined
	}
	const isEmail = emailRegex.test(value,)
	return match(isEmail,)
		.with(true, () => {
			return undefined
		},)
		.otherwise(() => {
			return 'Invalid email or phone number'
		},)
}
