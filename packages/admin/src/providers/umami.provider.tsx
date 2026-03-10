import {
	useEffect,
} from 'react'

export const UmamiTracker = (): null => {
	useEffect(() => {
		if (import.meta.env['VITE_APP_ENV'] !== 'production' && import.meta.env['VITE_APP_ENV'] !== 'staging') {
			return
		}
		const script = document.createElement('script',)
		script.async = true
		script.src = import.meta.env['VITE_UMAMI_URL']
		script.setAttribute('data-website-id', import.meta.env['VITE_UMAMI_WEBSITE_ID'],)
		document.body.appendChild(script,)
		// eslint-disable-next-line consistent-return
		return () => {
			document.body.removeChild(script,)
		}
	}, [],)
	return null
}