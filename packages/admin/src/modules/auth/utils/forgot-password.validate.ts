import * as yup from 'yup'
import type {
	ValidationErrors,
} from 'final-form'

export interface IForgotPasswordFormValues {
	email: string
}

const forgotPasswordSchema: yup.ObjectSchema<IForgotPasswordFormValues> = yup.object({
	email: yup
		.string()
		.required('Email is required',)
		.email('Email is invalid',),
},)

export const validateForgotPasswordForm = async(
	values: IForgotPasswordFormValues,
): Promise<ValidationErrors> => {
	try {
		await forgotPasswordSchema.validate(values, {
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