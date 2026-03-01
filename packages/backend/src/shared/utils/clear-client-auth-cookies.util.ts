import type {
	Response,
} from 'express'

import {
	TOKEN_TYPES,
} from '../constants/token-types.constants'
import {
	JWT_COOKIES_OPTIONS,
} from '../configs/cookies.config'

export const clearClientAuthCookies = (res: Response,): void => {
	res.clearCookie(TOKEN_TYPES.CLIENT_JWT, JWT_COOKIES_OPTIONS,)
	res.clearCookie(TOKEN_TYPES.CLIENT_JWT_REFRESH, JWT_COOKIES_OPTIONS,)
}
