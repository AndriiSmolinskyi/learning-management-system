import * as yup from 'yup'
import type {
	ValidationErrors,
} from 'final-form'

import {
	MAX_INPUT_LENGTH,
} from '../../../shared/constants'
import type {
	RequestFormValues,
} from './request.types'
import type {
	RequestType,
} from '../../../shared/types'

const requestSchema: yup.ObjectSchema<Omit<RequestFormValues, 'bankId'>> = yup.object({
	type: yup
		.string<RequestType>()
		.trim()
		.max(MAX_INPUT_LENGTH,)
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
	accountId: yup.object({
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
	portfolioId: yup.object({
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
	entityId: yup.object({
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
	amount: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,),
	comment: yup
		.string()
		.trim(),
	assetId: yup.object({
		value: yup.object({
			id: yup
				.string() as yup.MixedSchema<string>,
			name: yup
				.string() as yup.MixedSchema<string>,
		},),
		label: yup
			.string() as yup.MixedSchema<string>,
	},),
},)

export const validateRequestForm = async(values: RequestFormValues,): Promise<ValidationErrors> => {
	try {
		await requestSchema.validate(values, {
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

