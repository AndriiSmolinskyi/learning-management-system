import * as yup from 'yup'

import type {
	AddTransactionFormValues,
} from './add-transaction.types'
import type {
	ValidationErrors,
} from 'final-form'

const addTransactionSchema: yup.ObjectSchema<AddTransactionFormValues> = yup.object({
	transactionTypes: yup.array().of(
		yup.object({
			value: yup.object({
				id:       yup.string().trim()
					.required(),
				name:     yup.string().required(),
			},),
			label: yup.string().required(),
		},),
	)
		.min(1,)
		.required(),
},)

export const validateAddTransactionForm = async(values: AddTransactionFormValues,): Promise<ValidationErrors> => {
	try {
		await addTransactionSchema.validate(values, {
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