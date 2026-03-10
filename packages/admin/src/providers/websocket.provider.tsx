import React from 'react'
import {
	useWebSocketStore,
} from '../store/websocket.store'
import {
	useAuth,
} from '../shared/hooks'

interface IProps {
	children: React.ReactNode;
}

export const WebSocketProvider: React.FC<IProps> = ({
	children,
},) => {
	const {
		connect, disconnect,
	} = useWebSocketStore()
	const {
		isAuth,
	} = useAuth()
	React.useEffect(() => {
		if (isAuth) {
			connect()
		}
		return () => {
			disconnect()
		}
	}, [isAuth,],)

	return (
		<div>
			{children}
		</div>
	)
}