import {
	create,
} from 'zustand'
import type {
	Socket,
} from 'socket.io-client'
import io from 'socket.io-client'
import {
	keysToInvalidateCBondsUpdate,
} from '../shared/constants'
import {
	queryClient,
} from '../providers/query.provider'
import {
	// webSocketsMessages,
	webSocketsNames,
} from '../shared/constants/websocket.constants'

interface IWebSocketState {
	socket: Socket | null;
	connect: (callback?: () => void, logoutCallback?: () => void,) => void;
	disconnect: (callback?: () => void) => void;
}

export const useWebSocketStore = create<IWebSocketState>((set, get,) => {
	return {
		socket:           null,
		isApprovePending: false,
		connect:          (callback?: () => void, logoutCallback?:() => void,): void => {
			const url = import.meta.env.VITE_BACKEND_URL
			const socket = io(url, {
				transports: ['websocket',],
			},)

			socket.on('connect', () => {
				set({
					socket,
				},)
				socket.off(webSocketsNames.CBONDS_UPDATE,)
				socket.on(webSocketsNames.CBONDS_UPDATE, () => {
					keysToInvalidateCBondsUpdate.forEach((key,) => {
						queryClient.invalidateQueries({
							queryKey: key,
							exact:    false,
						},)
					},)
				},)
				if (callback) {
					callback()
				}
			},)
			// todo: Needs enhancements
			// socket.on('connect_error', (error,) => {
			// 	console.error('Connection error:', error,)
			// },)
		},
		disconnect: (callback?: () => void,): void => {
			const {
				socket,
			} = get()
			if (socket) {
				socket.disconnect()
				set({
					socket: null,
				},)
				if (callback) {
					callback()
				}
			}
		},
	}
},
)