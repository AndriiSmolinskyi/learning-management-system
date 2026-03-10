import React from 'react'
import {
	useIsAuthenticated,
} from '@azure/msal-react'

import {
	authService,
} from '../services/auth'
import {
	storageService,
	STORAGE_KEYS,
} from '../services/storage'

export interface IAuthContextValue {
  isAuth: boolean;
  setIsAuth: (authStatus: boolean) => void;
  checkAuth: () => Promise<void>
}

export const AuthContext = React.createContext<IAuthContextValue | undefined>(undefined,)

interface IProps {
	children: React.ReactNode;
}

export const AuthContextProvider: React.FC<IProps> = ({
	children,
},) => {
	const [isFirstRender, setIsFirstRender,] = React.useState<boolean>(true,)
	const isAuthenticated = useIsAuthenticated()
	const storageAuth = storageService.getItem(STORAGE_KEYS.AUTH,)
	const [isAuth, setIsAuth,] = React.useState<boolean>(Boolean(storageAuth,),)

	const checkAuth = React.useCallback(async(isAuthenticated?: boolean,): Promise<void> => {
		try {
			const {
				auth,
			} = await authService.check()

			const value = isAuthenticated === undefined ?
				auth :
				(auth && isAuthenticated)

			storageService.setItem(STORAGE_KEYS.AUTH, value,)
			if (!value) {
				storageService.setItem(STORAGE_KEYS.ROLES, [],)
			}
			setIsAuth(value,)
		} catch (error) {
			storageService.setItem(STORAGE_KEYS.ROLES, [],)
			storageService.setItem(STORAGE_KEYS.AUTH, false,)
			setIsAuth(false,)
		}
	}, [],)

	const value: IAuthContextValue = {
		isAuth,
		setIsAuth,
		checkAuth,
	}

	React.useLayoutEffect(() => {
		if (isFirstRender) {
			setIsFirstRender(false,)
			return
		}
		checkAuth(isAuthenticated,)
	}, [isAuthenticated,],)

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}