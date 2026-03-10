import React from 'react'
import {
	useSignOut,
} from './sign-out.hook'
import {
	IDLE_TIMEOUT,
} from '../auth.constants'
import {
	useAuth,
} from '../../../shared/hooks'

export const useAutoLogout = (idleTimeout = IDLE_TIMEOUT,): void => {
	const {
		isAuth,
	} = useAuth()
	const {
		handleIdleSignOut,
	} = useSignOut()
	React.useEffect(() => {
		if (!isAuth) {
			return
		}
		let idleTimer: ReturnType<typeof setTimeout>
		const resetIdleTimer = (): void => {
			localStorage.setItem('lastActivity', Date.now().toString(),)
			clearTimeout(idleTimer,)
			idleTimer = setTimeout(() => {
				handleIdleSignOut()
			}, idleTimeout,)
		}
		const syncResetFromStorage = (e: StorageEvent,): void => {
			if (e.key === 'lastActivity') {
				clearTimeout(idleTimer,)
				idleTimer = setTimeout(() => {
					handleIdleSignOut()
				}, idleTimeout,)
			}
		}
		localStorage.setItem('lastActivity', Date.now().toString(),)
		const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart',]
		events.forEach((event,) => {
			window.addEventListener(event, resetIdleTimer,)
		},)
		window.addEventListener('storage', syncResetFromStorage,)
		resetIdleTimer()
		// eslint-disable-next-line consistent-return
		return (): void => {
			events.forEach((event,) => {
				window.removeEventListener(event, resetIdleTimer,)
			},)
			window.removeEventListener('storage', syncResetFromStorage,)
			clearTimeout(idleTimer,)
		}
	}, [idleTimeout,isAuth,],)
}

// todo: Remove after new logic tested

// export const useAutoLogout = (idleTimeout = IDLE_TIMEOUT,): void => {
// 	const {
// 		handleIdleSignOut,
// 	} = useSignOut()

// 	React.useEffect(() => {
// 		let idleTimer: ReturnType<typeof setTimeout> | null = null

// 		const resetIdleTimer = (): void => {
// 			if (idleTimer) {
// 				clearTimeout(idleTimer,)
// 			}
// 			idleTimer = setTimeout(() => {
// 				handleIdleSignOut()
// 			}, idleTimeout,)
// 		}
// 		const updateActivity = (): void => {
// 			localStorage.setItem('lastActivity', Date.now().toString(),)
// 			resetIdleTimer()
// 		}
// 		const onStorage = (e: StorageEvent,): void => {
// 			if (e.key === 'lastActivity') {
// 				resetIdleTimer()
// 			}
// 		}
// 		try {
// 			const last = localStorage.getItem('lastActivity',)
// 			if (!last) {
// 				updateActivity()
// 			} else if (Date.now() - Number(last,) > idleTimeout) {
// 				localStorage.removeItem('lastActivity',)
// 				handleIdleSignOut()
// 				return
// 			} else {
// 				resetIdleTimer()
// 			}
// 		} catch {
// 			resetIdleTimer()
// 		}

// 		const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart',] as const
// 		events.forEach((ev,) => {
// 			window.addEventListener(ev, updateActivity, {
// 				passive: true,
// 			},)
// 		},)
// 		window.addEventListener('storage', onStorage,)

// 		return () => {
// 			events.forEach((ev,) => {
// 				window.removeEventListener(ev, updateActivity,)
// 			},)
// 			window.removeEventListener('storage', onStorage,)
// 			if (idleTimer) {
// 				clearTimeout(idleTimer,)
// 			}
// 		}
// 	}, [idleTimeout, handleIdleSignOut,],)
// }