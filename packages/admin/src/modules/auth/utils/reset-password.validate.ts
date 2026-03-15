import * as yup from 'yup'
import type {
	ValidationErrors,
} from 'final-form'

export interface IResetPasswordFormValues {
	email: string
	newPassword: string
	confirmPassword: string
}

const resetPasswordSchema: yup.ObjectSchema<IResetPasswordFormValues> = yup.object({
	email: yup
		.string()
		.required('Email is required',)
		.email('Email is invalid',),
	newPassword: yup
		.string()
		.required('Password is required',)
		.min(8, 'Password required length is at least 8 symbols, should contain 1 uppercase letter, 1 number',)
		.matches(/[A-Z]/, 'Password required length is at least 8 symbols, should contain 1 uppercase letter, 1 number',)
		.matches(/\d/, 'Password required length is at least 8 symbols, should contain 1 uppercase letter, 1 number',),
	confirmPassword: yup
		.string()
		.required('Confirm Password is required',)
		.oneOf([yup.ref('newPassword',),], 'Passwords do not match',),
},)

export const validateResetPasswordForm = async(
	values: IResetPasswordFormValues,
): Promise<ValidationErrors> => {
	try {
		await resetPasswordSchema.validate(values, {
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