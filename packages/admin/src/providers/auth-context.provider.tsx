import * as React from 'react'

import {
	authService,
} from '../services/auth/auth.service'

import type {
	LoginBody,
} from '../shared/types'

type AuthRole = 'ADMIN' | 'STUDENT'

type AuthStatus = 'loading' | 'guest' | 'authed'

type AuthContextValue = {
	status: AuthStatus
	isLoading: boolean
	isAuth: boolean
	role: AuthRole | null

	check: () => Promise<void>
	login: (body: Omit<LoginBody, 'portal'>,) => Promise<void>
	logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null,)

const PORTAL: AuthRole = 'ADMIN'

type Props = {
	children: React.ReactNode
}

export const AuthContextProvider: React.FC<Props> = ({
	children,
},) => {
	const [status, setStatus,] = React.useState<AuthStatus>('loading',)
	const [role, setRole,] = React.useState<AuthRole | null>(null,)

	const isLoading = status === 'loading'
	const isAuth = status === 'authed'

	const check = React.useCallback(async(): Promise<void> => {
		setStatus('loading',)

		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result = await authService.check(`${PORTAL}` as any,)

			if (result.auth) {
				setRole((result.role as AuthRole),)
				setStatus('authed',)
				return
			}

			setRole(null,)
			setStatus('guest',)
		} catch {
			setRole(null,)
			setStatus('guest',)
		}
	}, [],)

	const login = React.useCallback(async(body: Omit<LoginBody, 'portal'>,): Promise<void> => {
		await authService.login({
			...body,
			portal: PORTAL,
		} as LoginBody,)

		await check()
	}, [check,],)

	const logout = React.useCallback(async(): Promise<void> => {
		try {
			await authService.logout()
		} finally {
			setRole(null,)
			setStatus('guest',)
		}
	}, [],)

	React.useEffect(() => {
		check()
	}, [check,],)

	const value = React.useMemo<AuthContextValue>(() => {
		return {
			status,
			isLoading,
			isAuth,
			role,

			check,
			login,
			logout,
		}
	}, [
		status,
		isLoading,
		isAuth,
		role,
		check,
		login,
		logout,
	],)

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = (): AuthContextValue => {
	const ctx = React.useContext(AuthContext,)
	if (!ctx) {
		throw new Error('useAuth must be used within AuthContextProvider',)
	}
	return ctx
}