import * as yup from 'yup'
import type {
	ValidationErrors,
} from 'final-form'

import {
	MAX_INPUT_LENGTH,
} from '../groups.constants'
import type {
	IGroupFormValues,
} from '../groups.types'

const groupSchema: yup.ObjectSchema<IGroupFormValues> = yup.object({
	groupName: yup
		.string()
		.trim()
		.min(2, 'Group name must be at least 2 characters',)
		.max(MAX_INPUT_LENGTH, `Group name must be at most ${MAX_INPUT_LENGTH} characters`,)
		.required('Group name is required',),

	courseName: yup
		.string()
		.trim()
		.min(2, 'Course name must be at least 2 characters',)
		.max(MAX_INPUT_LENGTH, `Course name must be at most ${MAX_INPUT_LENGTH} characters`,)
		.required('Course name is required',),

	startDate: yup
		.date()
		.nullable()
		.required('Start date is required',),

	comment: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH, `Comment must be at most ${MAX_INPUT_LENGTH} characters`,)
		.nullable()
		.optional(),
},)

export const validateGroupForm = async(
	values: IGroupFormValues,
): Promise<ValidationErrors> => {
	try {
		await groupSchema.validate(values, {
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