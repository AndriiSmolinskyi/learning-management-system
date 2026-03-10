import * as yup from 'yup'
import type {
	ValidationErrors,
} from 'final-form'

import {
	MAX_INPUT_LENGTH,
} from '../../../shared/constants'
import type {
	TransactionFormValues,
} from './transaction.types'
import type {
	IOptionType,
} from '../../../shared/types'

const optionSchema: yup.ObjectSchema<IOptionType<string>> = yup
	.object({
		value: yup.string().required('Field is required',),
		label: yup.string().trim()
			.required('Field is required',),
	},)
	.noUnknown()

const transactionTypeSchema: yup.ObjectSchema<TransactionFormValues> = yup.object({
	name: yup
		.string()
		.trim()
		.required('Name is required',)
		.max(MAX_INPUT_LENGTH, `Max length is ${MAX_INPUT_LENGTH} characters`,),
	cashFlow: yup
		.string()
		.trim()
		.required('Cash flow is required',),
	pl: yup
		.string()
		.trim(),
	categoryType: optionSchema.required('Category is required',),
	comment:      yup
		.string()
		.trim()
		.nullable()
		.notRequired()
		.max(MAX_INPUT_LENGTH, `Max length is ${MAX_INPUT_LENGTH} characters`,),
	annualAssets: yup
		.array()
		.of(
			yup
				.string()
				.trim()
				.max(MAX_INPUT_LENGTH, `Max length is ${MAX_INPUT_LENGTH} characters`,),
		)
		.nullable()
		.notRequired(),
	isNewVersion: yup
		.string()
		.trim()
		.notRequired()
	,
},)

export const validateTransactionTypeForm = async(
	values: TransactionFormValues,
): Promise<ValidationErrors> => {
	try {
		await transactionTypeSchema.validate(values, {
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
