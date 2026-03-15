/* eslint-disable complexity */
import React from 'react'
import {
	Form,
} from 'react-final-form'
import {
	useNavigate,
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
	useLogin,
} from '../../../shared/hooks/auth.hooks'
import {
	AuthPortal,
} from '../../../shared/types'
import type {
	LoginBody,
} from '../../../shared/types'
import type {
	ILoginFormValues,
} from '../utils/login.validate'
import {
	validateLoginForm,
} from '../utils/login.validate'
import {
	useAuth,
} from '../../../providers/auth-context.provider'
import {
	RouterKeys,
} from '../../../router/keys'
import * as styles from '../auth.styles'

export const Login: React.FC = () => {
	const {
		mutateAsync: login,
		isPending,
		error,
	} = useLogin()
	const {
		check,
	} = useAuth()
	const navigate = useNavigate()

	const handleSubmit = async(values: ILoginFormValues,): Promise<void> => {
		const body: LoginBody = {
			email:    values.email,
			password: values.password,
			portal:   AuthPortal.ADMIN,
		}

		await login(body,)
		await check()
	}

	const handleForgotPassword = (): void => {
		navigate(RouterKeys.FORGOT_PASSWORD,)
	}

	return (
		<div className={styles.container}>
			<div className={styles.modal}>
				<div className={styles.textBlock}>
					<h2 className={styles.titleModal}>
						<span>Welcome to</span>
						<span className={styles.titleModalMig}>Cross-platform LMS</span>
					</h2>
					<p className={styles.underTitleModal}>Welcome back! Please enter your details.</p>
				</div>

				<Form<ILoginFormValues>
					onSubmit={handleSubmit}
					validate={validateLoginForm}
					initialValues={{
						email:    '',
						password: '',
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
											name='password'
											placeholder='Enter password'
											type='password'
										/>
										{errors?.['password'] && touched?.['password'] && (
											<p className={styles.error}>{errors['password']}</p>
										)}
									</div>
								</div>
								{error && (
									<p className={styles.error}>Incorrect email or password</p>
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
											'Logging in...' :
											'Log in',
										color:   Color.BLUE,
									}}
								/>
							</form>
						)
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={handleForgotPassword}
					type='submit'
					className={styles.submitButton}
					additionalProps={{
						btnType: ButtonType.TEXT,
						size:    Size.MEDIUM,
						text:    'Forgot password?',
						color:   Color.TERTIARY_GREY,
					}}
				/>
			</div>
		</div>
	)
}

export default Login