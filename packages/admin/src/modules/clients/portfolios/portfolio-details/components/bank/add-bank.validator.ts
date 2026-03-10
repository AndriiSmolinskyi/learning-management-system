import * as yup from 'yup'
import type {
	ValidationErrors,
} from 'final-form'

import type {
	BankFormValues,
} from './add-bank.types'
import {
	MAX_EMAIL_LENGTH, MAX_INPUT_LENGTH,
} from '../../../../../../shared/constants'

const addBankSchema: yup.ObjectSchema<BankFormValues> = yup.object({
	branchName: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,)
		.required('Branch name is required',),
	firstName: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,)
		.optional()
		.nullable(),
	lastName: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,)
		.optional()
		.nullable(),
	country: yup
		.object({
			value: yup
				.string()
				.trim()
				.required(),
			label: yup
				.string()
				.required(),
		},)
		.required(),
	bankName: yup
		.object({
			value: yup.object({
				name: yup
					.string()
					.trim()
					.required(),
				id: yup
					.string()
					.required(),
			},),
			label: yup
				.string()
				.required(),
		},)
		.required(),
	email: yup
		.string()
		.email('Email is invalid',)
		.max(MAX_EMAIL_LENGTH,)
		.optional()
		.nullable(),
},)

export const validateAddBankForm = async(values: BankFormValues,): Promise<ValidationErrors> => {
	try {
		await addBankSchema.validate(values, {
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

