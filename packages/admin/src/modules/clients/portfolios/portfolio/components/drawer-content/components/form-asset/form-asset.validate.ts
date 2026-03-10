import {
	P, match,
} from 'ts-pattern'
import type {
	IAssetValidateValues,
	IAssetErrorValues,
} from './form-asset.types'
import {
	ValidateAssetMessages,
} from './form-asset.constants'
import {
	localeString,
} from '../../../../../../../../shared/utils'

export const validateAsset = (values: IAssetValidateValues, step: number,): IAssetErrorValues => {
	const errors: IAssetErrorValues = {
	}
	if (step === 1 && !values.assetName?.label) {
		errors.assetName = ValidateAssetMessages.ASSET_NAME_ERROR
	}
	return errors
}

export const requiredIsin = (value: string | undefined,): string | undefined => {
	return match(value,)
		.with(P.nullish, () => {
			return 'Invalid ISIN format or required'
		},)
		.with(P.string, (val,) => {
			const regex = /^[A-Z]{2}[A-Z0-9]{10}$/
			return regex.test(val,) ?
				undefined :
				'Invalid ISIN format or required'
		},)
		.otherwise(() => {
			return 'Invalid ISIN format or required'
		},)
}
export const requiredNumeric = (value: string,): string | undefined => {
	return match(value,)
		.with(P.nullish, () => {
			return 'This field is required'
		},)
		.with(P.string, (val,) => {
			const regex = /^-?\d+$/
			return regex.test(val,) ?
				undefined :
				'Value must be a whole number'
		},)
		.otherwise(() => {
			return 'This field is required'
		},)
}
export const optionalNumeric = (value: string,): string | undefined => {
	return match(value,)
		.with(P.nullish, () => {
			return undefined
		},)
		.with(P.string, (val,) => {
			const regex = /^-?\d+$/
			return regex.test(val,) ?
				undefined :
				'Value must be a whole number'
		},)
		.otherwise(() => {
			return undefined
		},)
}

export const requiredNumericWithDecimal = (value: string,): string | undefined => {
	return match(value,)
		.with(P.nullish, () => {
			return 'This field is required'
		},)
		.with(P.string, (val,) => {
			const trimmed = val.trim()

			if (trimmed === '') {
				return 'This field is required'
			}

			const regex = /^\d+(\.\d+)?$/
			const numericValue = parseFloat(trimmed,)

			if (!regex.test(trimmed,)) {
				return 'Value must be a positive number (integer or decimal)'
			}

			if (numericValue < 0) {
				return 'Value must be greater than zero'
			}

			return undefined
		},)
		.otherwise(() => {
			return 'This field is required'
		},)
}

export const requiredNumericWithDecimalAndNegative = (value: string,): string | undefined => {
	return match(value,)
		.with(P.nullish, () => {
			return 'This field is required'
		},)
		.with(P.string, (val,) => {
			const regex = /^-?\d*(\.\d+)?$/
			return regex.test(val,) ?
				undefined :
				'Value must be a number (can be negative and decimal)'
		},)
		.otherwise(() => {
			return 'This field is required'
		},)
}

export const notZero = (value: string,): string | undefined => {
	return match(value,)
		.with(P.nullish, () => {
			return 'This field is required'
		},)
		.with(P.string, (val,) => {
			const num = parseFloat(val,)
			return num === 0 ?
				'Value must not be zero' :
				undefined
		},)
		.otherwise(() => {
			return 'This field is required'
		},)
}

export const optionalNumericWithDecimal = (value: string,): string | undefined => {
	return match(value,)
		.with(P.nullish, () => {
			return undefined
		},)
		.with(P.string, (val,) => {
			const trimmed = val.trim()

			if (trimmed === '') {
				return undefined
			}

			const regex = /^\d+(\.\d+)?$/
			const numericValue = parseFloat(trimmed,)

			if (!regex.test(trimmed,)) {
				return 'Value must be a positive number (integer or decimal)'
			}

			if (numericValue < 0) {
				return 'Value must be greater than zero'
			}

			return undefined
		},)
		.otherwise(() => {
			return 'Invalid value'
		},)
}

export const calculateAmountTextBond = (units: string | number, unitPrice: string | number, amountTransactionValue: string | undefined,): string | undefined => {
	const parsedUnits = Number(units,)
	const parsedUnitPrice = Number(unitPrice,)
	const totalAmount = parsedUnits * parsedUnitPrice

	if (isNaN(parsedUnits,) || isNaN(parsedUnitPrice,)) {
		return undefined
	}

	if (amountTransactionValue) {
		const cleanedAmount = parseFloat(amountTransactionValue.replace(/,/g, '',),)
		// todo: Check new logic
		// const expectedAmount = cleanedAmount * 10
		const expectedAmount = cleanedAmount

		if (totalAmount !== expectedAmount) {
			return `Asset Cost Value = ${localeString(totalAmount, '', 0, true,)} Transaction Value = ${localeString(expectedAmount, '', 2, true,)}`
		}
	}

	return undefined
}

export const calculateAmountTextEquity = (units: string | number, unitPrice: string | number, amountTransactionValue: string | undefined,): string | undefined => {
	const parsedUnits = Number(units,)
	const parsedUnitPrice = Number(unitPrice,)
	const totalAmount = parsedUnits * parsedUnitPrice

	if (isNaN(parsedUnits,) || isNaN(parsedUnitPrice,)) {
		return undefined
	}

	if (amountTransactionValue) {
		const cleanedAmount = parseFloat(amountTransactionValue.replace(/,/g, '',),)
		const expectedAmount = cleanedAmount

		if (totalAmount !== expectedAmount) {
			return `Asset Cost Value = ${localeString(totalAmount, '', 0, true,)} Transaction Value = ${localeString(expectedAmount, '', 2, true,)}`
		}
	}

	return undefined
}

export const calculateAmountTextMetals = (units: string | number, unitPrice: string | number, amountTransactionValue: string | undefined,): string | undefined => {
	const parsedUnits = Number(units,)
	const parsedUnitPrice = Number(unitPrice,)
	const totalAmount = parsedUnits * parsedUnitPrice

	if (isNaN(parsedUnits,) || isNaN(parsedUnitPrice,)) {
		return undefined
	}

	if (amountTransactionValue) {
		const cleanedAmount = parseFloat(amountTransactionValue.replace(/,/g, '',),)
		const expectedAmount = cleanedAmount

		if (totalAmount !== expectedAmount) {
			return `Asset Cost Value = ${localeString(totalAmount, '', 0, true,)} Transaction Value = ${localeString(expectedAmount, '', 2, true,)}`
		}
	}

	return undefined
}

export const calculateAmountTextCryptoETF = (units: string | number, transactionPrice: string | number, amountTransactionValue: string | undefined,): string | undefined => {
	const parsedUnits = Number(units,)
	const parsedTransactionPrice = Number(transactionPrice,)
	const totalAmount = parsedUnits * parsedTransactionPrice

	if (isNaN(parsedUnits,) || isNaN(parsedTransactionPrice,)) {
		return undefined
	}

	if (amountTransactionValue) {
		const cleanedAmount = parseFloat(amountTransactionValue.replace(/,/g, '',),)
		const expectedAmount = cleanedAmount

		if (totalAmount !== expectedAmount) {
			return `Asset Cost Value = ${localeString(totalAmount, '', 0, true,)} Transaction Value = ${localeString(expectedAmount, '', 2, true,)}`
		}
	}

	return undefined
}