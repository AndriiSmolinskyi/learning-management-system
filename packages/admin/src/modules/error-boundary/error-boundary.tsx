/* eslint-disable complexity */
import type {
	ReactNode,
} from 'react'
import React, {
	Component,
} from 'react'

type Props = {
	children?: ReactNode
}

interface IState {
	hasError: boolean
}

class ErrorBoundary extends Component<Props, IState> {
	public state: IState = {
		hasError: false,
	}

	public static getDerivedStateFromError(error: Error,): IState {
		const message = error.message || ''
		const isChunkError =
			message.includes('ChunkLoadError',) ||
			message.includes('Loading chunk',) ||
			message.includes('Failed to fetch dynamically imported module',) ||
			message.includes('Failed to load module script',) ||
			message.includes('text/html',)
		if (isChunkError && !sessionStorage.getItem('reloaded_after_deploy',)) {
			sessionStorage.setItem('reloaded_after_deploy', 'true',)
			setTimeout(() => {
				window.location.reload()
			}, 0,)
			return {
				hasError: false,
			}
		}
		// todo: To adjust or remove after test
		// return {
		// 	hasError: true,
		// }
		return {
			hasError: false,
		}
	}

	public componentDidCatch(error: Error,): void {
		const message = error.message || ''
		const isChunkError =
			message.includes('ChunkLoadError',) ||
			message.includes('Loading chunk',) ||
			message.includes('Failed to fetch dynamically imported module',) ||
			message.includes('Failed to load module script',) ||
			message.includes('text/html',)

		if (isChunkError && !sessionStorage.getItem('reloaded_after_deploy',)) {
			sessionStorage.setItem('reloaded_after_deploy', 'true',)
			setTimeout(() => {
				window.location.reload()
			}, 0,)
		}
	}

	public render(): React.ReactNode {
		if (this.state.hasError) {
			return <h1>Sorry... there was an error</h1>
		}

		return this.props.children
	}
}

export default ErrorBoundary
