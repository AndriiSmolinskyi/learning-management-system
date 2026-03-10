import * as yup from 'yup'
import type {
	ValidationErrors,
} from 'final-form'

import {
	MAX_INPUT_LENGTH,
} from '../../../shared/constants'
import type {
	BudgetPlanFormValues,
} from './budget.types'

const budgetSchema: yup.ObjectSchema<BudgetPlanFormValues> = yup.object({
	budgetPlanName: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,)
		.matches(/^[A-Za-z\s]+$/, 'Only Latin letters are allowed',)
		.required(),
	clientId: yup.object({
		value: yup.object({
			id: yup
				.string()
				.trim()
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
	bankIds: yup.array().of(
		yup.object({
			value: yup.string().required(),
			label: yup.string().required(),
		},),
	)
		.min(1,)
		.required(),
	accountIds: yup.array().of(
		yup.object({
			value: yup.object({
				id:       yup.string().trim()
					.required(),
				name:     yup.string().required(),
				bankName: yup.string(),
				bankId:   yup.string(),
			},),
			label: yup.string().required(),
		},),
	)
		.min(1,)
		.required(),
},)

export const validateBudgetForm = async(values: BudgetPlanFormValues,): Promise<ValidationErrors> => {
	try {
		await budgetSchema.validate(values, {
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
