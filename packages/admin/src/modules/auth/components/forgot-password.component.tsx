/* eslint-disable complexity */
import React from 'react'
import {
	Form,
} from 'react-final-form'

import {
	FormField,
} from '../../../shared/components'
import {
	Button, ButtonType, Size, Color,
} from '../../../shared/components'

import {
	Mail,
} from '../../../assets/icons'

import {
	useForgotPassword,
} from '../../../shared/hooks/auth/auth.hooks'
import {
	AuthPortal,
} from '../../../shared/types'

import type {
	ForgotPasswordBody,
} from '../../../shared/types'
import type {
	IForgotPasswordFormValues,
} from '../utils/forgot-password.validate'
import {
	validateForgotPasswordForm,
} from '../utils/forgot-password.validate'

import * as styles from '../auth.styles'

export const ForgotPassword: React.FC = () => {
	const {
		mutateAsync: forgotPassword,
		isPending,
		error,
	} = useForgotPassword()

	const handleSubmit = async(values: IForgotPasswordFormValues,): Promise<void> => {
		const body: ForgotPasswordBody = {
			email:  values.email,
			portal: AuthPortal.ADMIN,
		}

		await forgotPassword(body,)
	}

	return (
		<div className={styles.container}>
			<div className={styles.modal}>
				<div className={styles.textBlock}>
					<h2 className={styles.titleModal}>
						<span>Forgot password</span>
					</h2>
					<p className={styles.underTitleModal}>
						Enter your email and we’ll send you a reset link.
					</p>
				</div>

				<Form<IForgotPasswordFormValues>
					onSubmit={handleSubmit}
					validate={validateForgotPasswordForm}
					initialValues={{
						email: '',
					}}
					render={({
						handleSubmit,
						valid,
						touched,
						errors,
					},) => {
						return (
							<form>
								<div className={styles.inputBlock}>
									<div>
										<FormField
											name='email'
											placeholder='Enter email'
											leftIcon={<Mail />}
										/>
										{errors?.['email'] && touched?.['email'] && (
											<p className={styles.error}>{errors['email']}</p>
										)}
									</div>
								</div>

								{error && (
									<p className={styles.error}>Failed to send email</p>
								)}

								<Button<ButtonType.TEXT>
									onClick={handleSubmit}
									type='submit'
									disabled={!valid || isPending}
									className={styles.submitButton}
									additionalProps={{
										btnType: ButtonType.TEXT,
										size:    Size.MEDIUM,
										text:    isPending ?
											'Sending...' :
											'Send reset link',
										color:   Color.BLUE,
									}}
								/>
							</form>
						)
					}}
				/>
			</div>
		</div>
	)
}

export default ForgotPassword