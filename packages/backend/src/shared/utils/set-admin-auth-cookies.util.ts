import type {
	Response,
} from 'express'

import {
	TOKEN_TYPES,
} from '../constants/token-types.constants'
import {
	JWT_COOKIES_OPTIONS,
} from '../configs/cookies.config'

export const setAdminAuthCookies = (res: Response, token: string, refreshToken: string,): void => {
	res.cookie(TOKEN_TYPES.ADMIN_JWT, token, JWT_COOKIES_OPTIONS,)
	res.cookie(TOKEN_TYPES.ADMIN_JWT_REFRESH, refreshToken, JWT_COOKIES_OPTIONS,)
}
