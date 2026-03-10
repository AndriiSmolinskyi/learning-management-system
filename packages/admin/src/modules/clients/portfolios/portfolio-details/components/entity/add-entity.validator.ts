import * as yup from 'yup'
import type {
	ValidationErrors,
} from 'final-form'

import type {
	EntityFormValues,
} from './add-entity.types'
import {
	MAX_EMAIL_LENGTH, MAX_INPUT_LENGTH,
} from '../../../../../../shared/constants'

const addEntitySchema: yup.ObjectSchema<EntityFormValues> = yup.object({
	name: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,)
		.required('Name is required',),
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
	country: yup.object({
		value: yup
			.string()
			.trim()
			.required(),
		label: yup
			.string()
			.required(),
	},).required(),
	authorizedSignatoryName: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,)
		.required('Signatory name is required',),
	email: yup
		.string()
		.max(MAX_EMAIL_LENGTH,)
		.optional()
		.nullable(),
},)

export const validateAddEntityForm = async(values: EntityFormValues,): Promise<ValidationErrors> => {
	try {
		await addEntitySchema.validate(values, {
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

