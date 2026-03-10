/* eslint-disable complexity */
import type {
	IAccountErrorValues,
	IAccountValidateValues,
} from './form-account.types'
import {
	ValidateAccountMessages,
} from './form-account.constants'

export const validateAccount = (values: IAccountValidateValues, step: number,): IAccountErrorValues => {
	const errors: IAccountErrorValues = {
	}
	if (step === 1 && !values.accountName) {
		errors.accountName = ValidateAccountMessages.ACCOUNT_NAME_ERROR
	}
	if (step === 2 && !values.buyFee) {
		errors.buyFee = ValidateAccountMessages.BUY_FEE_ERROR
	}
	if (step === 2 && !values.holdFee) {
		errors.holdFee = ValidateAccountMessages.HOLD_FEE_ERROR
	}
	if (step === 2 && !values.managementFee) {
		errors.managementFee = ValidateAccountMessages.MANAGEMENT_FEE_ERROR
	}
	if (step === 2 && !values.sellFee) {
		errors.sellFee = ValidateAccountMessages.SELL_FEE_ERROR
	}
	return errors
}

export const validateFee = (value: string,):string => {
	const numberPattern = /^\d+(\.\d+)?$/

	if (!value) {
		return 'This field is required'
	}

	if (!numberPattern.test(value,)) {
		return 'Invalid fee format. Only numbers and one decimal point are allowed.'
	}
	return ''
}

export const validateIBAN = (iban: string | undefined,): string => {
	if (!iban) {
		return ''
	}
	const cleanedIban = iban.replace(/\s+/g, '',)
	if (cleanedIban.length < 15 || cleanedIban.length > 34) {
		return 'IBAN should be between 15 and 34 characters.'
	}
	const countryCode = cleanedIban.slice(0, 2,)
	if (!(/^[A-Z]{2}$/).test(countryCode,)) {
		return 'IBAN should start with two uppercase letters (country code).'
	}
	const checkDigits = cleanedIban.slice(2, 4,)
	if (!(/^\d{2}$/).test(checkDigits,)) {
		return 'IBAN should contain two digits after the country code.'
	}
	const ibanBody = cleanedIban.slice(4,)
	if (!(/^[A-Za-z0-9]+$/).test(ibanBody,)) {
		return 'IBAN should contain only alphanumeric characters after the country code and check digits.'
	}
	return ''
}