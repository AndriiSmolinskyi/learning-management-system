import * as yup from 'yup'
import type {
	ValidationErrors,
} from 'final-form'

import type {
	AccountFormValues,
} from './add-account.types'
import {
	MAX_INPUT_LENGTH,
} from '../../../../../../shared/constants'

const addAccountSchema: yup.ObjectSchema<AccountFormValues> = yup.object({
	accountName: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,)
		.required(),
	managementFee: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,)
		.required(),
	holdFee: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,)
		.required(),
	sellFee: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,)
		.required(),
	buyFee: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,)
		.required(),
	description: yup
		.string()
		.trim(),
	dataCreated: yup
		.date()
		.max(new Date(),)
		.nullable(),
	iban: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,),
	accountNumber: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,),
	comment: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,),
},)

export const validateAddAccountForm = async(values: AccountFormValues,): Promise<ValidationErrors> => {
	try {
		await addAccountSchema.validate(values, {
			abortEarly: false,
		},)

		return {
		}
	} catch (err) {
		const errors: ValidationErrors = {
		}

		if (err instanceof yup.ValidationError) {
			err.inner.forEach((error,) => {
				if (error.path) {
					errors[error.path] = error.message
				}
			},)
		}
		return errors
	}
}

