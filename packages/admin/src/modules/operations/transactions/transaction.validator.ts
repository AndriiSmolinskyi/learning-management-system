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

const transactionSchema: yup.ObjectSchema<Omit<TransactionFormValues, 'bankId'>> = yup.object({
	orderId: yup.object({
		value: yup.object({
			id: yup
				.number()
				.required(),
			name: yup
				.string()
				.required(),
		},)
			.required(),
		label: yup
			.string()
			.required(),
	},)
		.optional()
		.default(undefined,),
	clientId: yup.object({
		value: yup.object({
			id: yup
				.string()
				.required(),
			name: yup
				.string()
				.required(),
		},),
		label: yup
			.string()
			.required(),
	},)
		.required(),
	portfolioId: yup.object({
		value: yup.object({
			id: yup
				.string()
				.required(),
			name: yup
				.string()
				.required(),
		},),
		label: yup
			.string()
			.required(),
	},)
		.required(),
	accountId: yup.object({
		value: yup.object({
			id: yup
				.string()
				.required(),
			name: yup
				.string()
				.required(),
		},),
		label: yup
			.string()
			.required(),
	},)
		.required(),
	entityId: yup.object({
		value: yup.object({
			id: yup
				.string()
				.required(),
			name: yup
				.string()
				.required(),
		},),
		label: yup
			.string()
			.required(),
	},)
		.required(),
	transactionTypeId: yup.object({
		value: yup.object({
			id: yup
				.string()
				.required(),
			name: yup
				.string()
				.required(),
			relatedTypeId: yup
				.string()
				.optional(),
			asset: yup
				.string()
				.optional(),
		},),
		label: yup
			.string()
			.required(),
	},)
		.required(),
	category: yup
		.string(),
	isin: yup.object({
		value: yup
			.string()
			.required(),
		label: yup
			.string()
			.required(),
	},)
		.optional()
		.default(undefined,),
	security: yup
		.string()
		.optional(),
	currency: yup.object({
		value: yup
			.string()
			.required(),
		label: yup
			.string()
			.required(),
	},)
		.required(),
	serviceProvider: yup.object({
		value: yup
			.string()
			.required(),
		label: yup
			.string()
			.required(),
	},)
		.required(),
	expenseCategory: yup.object({
		value: yup.object({
			id: yup
				.string()
				.required(),
			name: yup
				.string()
				.required(),
		},),
		label: yup
			.string()
			.required(),
	},)
		.optional()
		.default(undefined,),
	amount: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,)
		.required(),
	transactionDate: yup
		.date(),
	comment: yup
		.string()
		.trim()
		.optional(),
	isSave: yup
		.boolean()
		.optional(),
	customFields: yup.array(
		yup.object({
			info: yup
				.string()
				.required(),
			label: yup
				.string()
				.required(),
		},),
	)
		.optional()
		.default(undefined,),
},)

export const validateTransactionForm = async(values: TransactionFormValues,): Promise<ValidationErrors> => {
	try {
		await transactionSchema.validate(values, {
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

