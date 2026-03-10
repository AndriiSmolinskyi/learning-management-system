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
	useUserStore,
} from '../../../store/user.store'
import {
	LOCAL_STORAGE_WHITELIST,
} from '../auth.constants'

type SignOutReturn = {
	handleSignOut: () => Promise<void>
	handleIdleSignOut: () => Promise<void>
}

export const useSignOut = (): SignOutReturn => {
	const {
		setIsAuth,
	} = useAuth()
	const {
		instance,
	} = useMsal()
	const {
		resetUser,
	} = useUserStore()

	const safeLocalStorageClear = (): void => {
		Object.keys(localStorage,).forEach((key,) => {
			if (!LOCAL_STORAGE_WHITELIST.includes(key,)) {
				localStorage.removeItem(key,)
			}
		},)
	}

	const handleSignOut = async() : Promise<void> => {
		try {
			await authService.logout()
			setIsAuth(false,)
		} catch (error) {
			setIsAuth(false,)
		} finally {
			instance.setActiveAccount(null,)
			await instance.logoutPopup(readRequest,)
			resetUser()
			sessionStorage.clear()
			// localStorage.clear()
			safeLocalStorageClear()
		}
	}

	const handleIdleSignOut = async() : Promise<void> => {
		try {
			await authService.logout()
			setIsAuth(false,)
		} catch (error) {
			setIsAuth(false,)
		} finally {
			resetUser()
			sessionStorage.clear()
			// localStorage.clear()
			safeLocalStorageClear()
		}
	}
	return {
		handleSignOut,
		handleIdleSignOut,
	}
}