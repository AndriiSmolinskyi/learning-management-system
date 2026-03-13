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

export const Login: React.FC = () => {
	const {
		mutate,
		isPending,
		error,
	} = useLogin()

	const handleSubmit = async(values: ILoginFormValues,): Promise<void> => {
		const body: LoginBody = {
			email:    values.email,
			password: values.password,
			portal:   AuthPortal.ADMIN,
		}

		mutate(body,)
	}

	return (
		<div>
			<h2>Admin login</h2>

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
							<div>
								<FormField
									name='email'
									placeholder='Enter email'
									leftIcon={<Mail />}
								/>
								{errors?.['email'] && touched?.['email'] && (
									<p>{errors['email']}</p>
								)}
							</div>

							<div>
								<FormField
									name='password'
									placeholder='Enter password'
									type='password'
								/>
								{errors?.['password'] && touched?.['password'] && (
									<p>{errors['password']}</p>
								)}
							</div>

							{error && (
								<p>Incorrect email or password</p>
							)}

							<Button<ButtonType.TEXT>
								onClick={handleSubmit}
								type='submit'
								disabled={!valid || isPending}
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
		</div>
	)
}

export default Login