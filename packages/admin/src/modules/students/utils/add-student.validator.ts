import * as yup from 'yup'
import type {
	ValidationErrors,
} from 'final-form'

import {
	MAX_EMAIL_LENGTH,
	MAX_INPUT_LENGTH,
} from '../students.constants'
import type {
	IStudentFormValues,
} from '../students.types'

const studentSchema: yup.ObjectSchema<IStudentFormValues> = yup.object({
	firstName: yup
		.string()
		.trim()
		.min(2, 'First name must be at least 2 characters',)
		.max(MAX_INPUT_LENGTH, `First name must be at most ${MAX_INPUT_LENGTH} characters`,)
		.matches(/^[A-Za-zА-Яа-яЁёІіЄєҐґ' -]+$/, 'First name contains invalid characters',)
		.required('First name is required',),

	lastName: yup
		.string()
		.trim()
		.min(2, 'Last name must be at least 2 characters',)
		.max(MAX_INPUT_LENGTH, `Last name must be at most ${MAX_INPUT_LENGTH} characters`,)
		.matches(/^[A-Za-zА-Яа-яЁёІіЄєҐґ' -]+$/, 'Last name contains invalid characters',)
		.required('Last name is required',),

	email: yup
		.string()
		.trim()
		.email('Email is invalid',)
		.max(MAX_EMAIL_LENGTH, `Email must be at most ${MAX_EMAIL_LENGTH} characters`,)
		.required('Email is required',),

	phoneNumber: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH, `Phone number must be at most ${MAX_INPUT_LENGTH} characters`,)
		.matches(/^[0-9+()\-\s]*$/, 'Phone number contains invalid characters',)
		.nullable()
		.default('',),

	country: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH, `Country must be at most ${MAX_INPUT_LENGTH} characters`,)
		.matches(/^[A-Za-zА-Яа-яЁёІіЄєҐґ' -]*$/, 'Country contains invalid characters',)
		.nullable()
		.default('',),

	city: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH, `City must be at most ${MAX_INPUT_LENGTH} characters`,)
		.matches(/^[A-Za-zА-Яа-яЁёІіЄєҐґ' -]*$/, 'City contains invalid characters',)
		.nullable()
		.default('',),
	comment: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH, `Comment must be at most ${MAX_INPUT_LENGTH} characters`,)
		.nullable()
		.default('',),
},)

export const validateStudentForm = async(
	values: IStudentFormValues,
): Promise<ValidationErrors> => {
	try {
		await studentSchema.validate(values, {
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