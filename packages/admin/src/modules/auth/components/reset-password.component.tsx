/* eslint-disable complexity */
import React from 'react'
import {
	Form,
} from 'react-final-form'
import {
	useNavigate,
	useParams,
} from 'react-router-dom'

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
	AuthPortal,
} from '../../../shared/types'
import type {
	ResetPasswordBody,
} from '../../../shared/types'

import {
	useResetPassword,
} from '../../../shared/hooks/auth/auth.hooks'

import type {
	IResetPasswordFormValues,
} from '../utils/reset-password.validate'
import {
	validateResetPasswordForm,
} from '../utils/reset-password.validate'

import {
	RouterKeys,
} from '../../../router/keys'

import * as styles from '../auth.styles'

export const ResetPassword: React.FC = () => {
	const {
		token,
	} = useParams()
	const navigate = useNavigate()

	const {
		mutateAsync: resetPassword,
		isPending,
		error,
	} = useResetPassword()

	const handleSubmit = async(values: IResetPasswordFormValues,): Promise<void> => {
		if (!token) {
			return
		}

		const body: ResetPasswordBody = {
			email:       values.email,
			portal:      AuthPortal.ADMIN,
			token,
			newPassword: values.newPassword,
		}

		await resetPassword(body,)
		navigate(RouterKeys.LOGIN,)
	}

	return (
		<div className={styles.container}>
			<div className={styles.modal}>
				<div className={styles.textBlock}>
					<h2 className={styles.titleModal}>
						<span>Reset password</span>
					</h2>
					<p className={styles.underTitleModal}>
						Enter your email and new password.
					</p>
				</div>

				<Form<IResetPasswordFormValues>
					onSubmit={handleSubmit}
					validate={validateResetPasswordForm}
					initialValues={{
						email:           '',
						newPassword:     '',
						confirmPassword: '',
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

									<div>
										<FormField
											name='newPassword'
											placeholder='New password'
											type='password'
										/>
										{errors?.['newPassword'] && touched?.['newPassword'] && (
											<p className={styles.error}>{errors['newPassword']}</p>
										)}
									</div>

									<div>
										<FormField
											name='confirmPassword'
											placeholder='Confirm password'
											type='password'
										/>
										{errors?.['confirmPassword'] && touched?.['confirmPassword'] && (
											<p className={styles.error}>{errors['confirmPassword']}</p>
										)}
									</div>
								</div>

								{!token && (
									<p className={styles.error}>Invalid reset link</p>
								)}

								{error && (
									<p className={styles.error}>Invalid or expired token</p>
								)}

								<Button<ButtonType.TEXT>
									onClick={handleSubmit}
									type='submit'
									disabled={!token || !valid || isPending}
									className={styles.submitButton}
									additionalProps={{
										btnType: ButtonType.TEXT,
										size:    Size.MEDIUM,
										text:    isPending ?
											'Saving...' :
											'Save new password',
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

export default ResetPassword