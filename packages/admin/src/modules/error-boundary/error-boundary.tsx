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

	public static getDerivedStateFromError(): IState {
		return {
			hasError: true,
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
