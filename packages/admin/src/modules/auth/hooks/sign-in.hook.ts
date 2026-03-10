import React from 'react'
import {
	useMsal,
} from '@azure/msal-react'

import {
	readRequest,
} from '../../../providers/msal.provider'
import {
	useAuth,
} from '../../../shared/hooks'
import {
	authService,
} from '../../../services/auth'
import {
	storageService,
	STORAGE_KEYS,
} from '../../../services/storage'
import {
	msGraphServise,
} from '../../../services/ms-graph'

type SignInReturn = {
	handleSignIn: () => Promise<void>
	isLoading: boolean
}

export const useSignIn = ():SignInReturn => {
	const [isLoading, setLoading,] = React.useState<boolean>(false,)
	const {
		setIsAuth,
	} = useAuth()
	const {
		instance,
	} = useMsal()

	const handleSignIn = async(): Promise<void> => {
		setLoading(true,)
		try {
			instance.setActiveAccount(null,)
			const {
				accessToken,
			} = await instance.loginPopup(readRequest,)
			const data = await authService.signIn({
				accessToken,
			},)
			if (data.auth) {
				const user = await msGraphServise.getMsUser(accessToken,)
				storageService.setItem(STORAGE_KEYS.ROLES, user.roles,)
				storageService.setItem(STORAGE_KEYS.NAME, user.displayName,)
				storageService.setItem(STORAGE_KEYS.ROLES, user.roles,)
			} else {
				storageService.setItem(STORAGE_KEYS.ROLES, [],)
				storageService.setItem(STORAGE_KEYS.NAME, null,)
			}
			storageService.setItem(STORAGE_KEYS.AUTH, data.auth,)
			setIsAuth(data.auth,)
		} catch (error) {
			storageService.setItem(STORAGE_KEYS.AUTH, false,)
			storageService.setItem(STORAGE_KEYS.NAME, null,)
			storageService.setItem(STORAGE_KEYS.ROLES, [],)
			setIsAuth(false,)
		} finally {
			setLoading(false,)
		}
	}

	return {
		handleSignIn,
		isLoading,
	}
}