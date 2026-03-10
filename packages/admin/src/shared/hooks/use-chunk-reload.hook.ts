/* eslint-disable complexity */
import React from 'react'

export const useReloadOnChunkError = (): void => {
	React.useEffect(() => {
		const handler = (event: ErrorEvent | PromiseRejectionEvent,): void => {
			let message = ''
			if (event instanceof ErrorEvent) {
				const {
					message: eventMessage,
				} = event
				message = eventMessage
			} else if (event instanceof PromiseRejectionEvent) {
				const {
					reason,
				} = event
				if (typeof reason === 'string') {
					message = reason
				} else if (reason && typeof reason === 'object' && 'message' in reason) {
					message = (reason as { message?: string }).message ?? ''
				}
			}
			const isChunkError =
				message.includes('ChunkLoadError',) ||
				message.includes('Loading chunk',) ||
				message.includes('Failed to fetch dynamically imported module',) ||
				message.includes('Failed to load module script',) ||
				message.includes('text/html',)

			if (isChunkError && !sessionStorage.getItem('reloaded_after_deploy',)) {
				sessionStorage.setItem('reloaded_after_deploy', 'true',)
				window.location.reload()
			}
		}
		window.addEventListener('error', handler,)
		window.addEventListener('unhandledrejection', handler,)
		return () => {
			window.removeEventListener('error', handler,)
			window.removeEventListener('unhandledrejection', handler,)
		}
	}, [],)
}
