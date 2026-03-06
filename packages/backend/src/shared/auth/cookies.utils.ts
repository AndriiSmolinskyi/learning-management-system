import type { Response, } from 'express'
import { AUTH_COOKIES, } from './auth.constants'
import { getAccessCookieOptions, getRefreshCookieOptions, } from './cookies.config'

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string,): void => {
	res.cookie(AUTH_COOKIES.ACCESS, accessToken, getAccessCookieOptions(),)
	res.cookie(AUTH_COOKIES.REFRESH, refreshToken, getRefreshCookieOptions(),)
}

export const clearAuthCookies = (res: Response,): void => {
	res.clearCookie(AUTH_COOKIES.ACCESS, getAccessCookieOptions(),)
	res.clearCookie(AUTH_COOKIES.REFRESH, getRefreshCookieOptions(),)
}