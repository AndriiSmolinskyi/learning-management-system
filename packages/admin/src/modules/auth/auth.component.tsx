import React from 'react'
import {
	useTranslation,
} from 'react-i18next'
import {
	ReactComponent as AuthEnter,
} from '../../assets/icons/auth-enter-icon.svg'
import {
	ReactComponent as Microsoft,
} from '../../assets/icons/microsoft.svg'
import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../shared/components'
import {
	Migdal,
} from '../../assets/icons'

import {
	useSignIn,
} from './hooks'

import {
	container,
	innerContainer,
	contentWrapper,
	buttonWrapper,
	logo,
	authBtn,
	logoText,
} from './auth.styles'

const Auth: React.FunctionComponent = () => {
	const {
		handleSignIn,
		isLoading,
	} = useSignIn()

	const {
		t,
	} = useTranslation()

	return (
		<main className={container}>
			<div className={logo} >
				<Migdal height={48} />
				<p className={logoText}>Migdal Management Analytics</p>
			</div>
			<div className={innerContainer}>
				<AuthEnter width={42} height={42}/>
				<div className={contentWrapper}>
					<h4>{t('authWelcome',)}</h4>
					<p>{t('authText',)}</p>
				</div>
				<div className={buttonWrapper}>
					<Button<ButtonType.TEXT>
						disabled={isLoading}
						onClick={handleSignIn}
						className={authBtn}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Sign in with Microsoft',
							size:     Size.MEDIUM,
							color:    Color.MICRO,
							leftIcon: <Microsoft width={21} height={21} />,
						}}
					/>
				</div>
			</div>
		</main>
	)
}

export default Auth
