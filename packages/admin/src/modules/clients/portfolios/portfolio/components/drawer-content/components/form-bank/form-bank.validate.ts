/* eslint-disable complexity */
import type {
	IBankErrorValues,
	IBankValidateValues,
} from './form-bank.types'
import {
	ValidateBankMessages,
} from './form-bank.constants'

export const validateBank = (values: IBankValidateValues, step: number,): IBankErrorValues => {
	const errors: IBankErrorValues = {
	}
	if (step === 1 && !values.bankName?.label) {
		errors.bankName = ValidateBankMessages.BANK_NAME_ERROR
	}
	if (step === 2 && !values.country?.label) {
		errors.country = ValidateBankMessages.COUNTRY_TYPE_ERROR
	}
	if (step === 2 && !values.branchName) {
		errors.country = ValidateBankMessages.COUNTRY_TYPE_ERROR
	}
	return errors
}