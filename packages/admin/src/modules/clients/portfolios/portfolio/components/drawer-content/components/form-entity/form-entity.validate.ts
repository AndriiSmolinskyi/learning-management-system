/* eslint-disable complexity */
import type {
	IEntityErrorValues,
	IEntityValidateValues,
} from './form-entity.types'
import {
	ValidateEntityMessages,
} from './form-entity.constants'
import {
	match,
} from 'ts-pattern'
import {
	email as emailRegex,
} from '../../../../../../../../shared/constants/regexes.constants'

export const emailNotRequired = (value: string,): string | undefined => {
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
export const validateEntity = (values: IEntityValidateValues, step: number,): IEntityErrorValues => {
	const errors: IEntityErrorValues = {
	}
	if (step === 1 && !values.entityName) {
		errors.entityName = ValidateEntityMessages.ENTITY_NAME_ERROR
	}

	if (step === 1 && !values.country?.label) {
		errors.country = ValidateEntityMessages.ENTITY_COUNTRY_ERROR
	}

	if (step === 2 && !values.authorizedSignatoryName) {
		errors.authorizedSignatoryName = ValidateEntityMessages.ENTITY_AUTH_SIGN_ERROR
	}
	return errors
}