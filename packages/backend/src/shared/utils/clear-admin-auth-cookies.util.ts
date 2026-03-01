import type {
	Response,
} from 'express'

import {
	TOKEN_TYPES,
} from '../constants/token-types.constants'
import {
	JWT_COOKIES_OPTIONS,
} from '../configs/cookies.config'

export const clearAdminAuthCookies = (res: Response,): void => {
	res.clearCookie(TOKEN_TYPES.ADMIN_JWT, JWT_COOKIES_OPTIONS,)
	res.clearCookie(TOKEN_TYPES.ADMIN_JWT_REFRESH, JWT_COOKIES_OPTIONS,)
}
