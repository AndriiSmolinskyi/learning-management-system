import {
	match,
} from 'ts-pattern'

import {
	amount as amountRegex,
	formatAmountRegex,
} from '../../constants/regexes.constants'

export const amountValidator = (value: string,): string | undefined => {
	const isValid = amountRegex.test(value,)

	return match(isValid,)
		.with(true, () => {
			return undefined
		},)
		.otherwise(() => {
			return 'Invalid amount'
		},)
}

export const formatAmountValidator = (value: string,): string | undefined => {
	const isValid = formatAmountRegex.test(value,)

	return match(isValid,)
		.with(true, () => {
			return undefined
		},)
		.otherwise(() => {
			return 'Invalid amount'
		},)
}

export const limitedAmountValidator = (value: string, maxAmount: number,): string | undefined => {
	const isValidAmount = amountRegex.test(value,)
	return match(isValidAmount,)
		.with(true, () => {
			const numericValue = parseFloat(value,)
			return match(numericValue <= maxAmount,)
				.with(true, () => {
					return undefined
				},)
				.otherwise(() => {
					return 'Amount cannot exceed the maximum allowed value'
				},)
		},)
		.otherwise(() => {
			return 'Invalid amount'
		},)
}
