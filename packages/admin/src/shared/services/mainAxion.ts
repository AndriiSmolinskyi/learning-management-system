import type {
	AxiosResponse,
} from 'axios'
import axios from 'axios'

import {
	AxiosEvent,
} from '../constants'
import {
	HttpStatusCode,
} from './types'

export const mainAxios = axios.create({
	withCredentials: true,
},)

mainAxios.interceptors.response.use(
	(response,): AxiosResponse<unknown, unknown> => {
		return response
	},
	async(error,) => {
		if (error.response?.status === HttpStatusCode.FORBIDDEN) {
			window.dispatchEvent(new CustomEvent(AxiosEvent.UNAUTHORIZED,),)
		}
		return Promise.reject(error,)
	},
)
