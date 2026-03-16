import * as yup from 'yup'
import type {
	ValidationErrors,
} from 'final-form'

export interface ILoginFormValues {
	email: string
	password: string
}

const loginSchema: yup.ObjectSchema<ILoginFormValues> = yup.object({
	email: yup
		.string()
		.required('Email is required',)
		.email('Email is invalid',),
	password: yup
		.string()
		.required('Password is required',),
},)

export const validateLoginForm = async(
	values: ILoginFormValues,
): Promise<ValidationErrors> => {
	try {
		await loginSchema.validate(values, {
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