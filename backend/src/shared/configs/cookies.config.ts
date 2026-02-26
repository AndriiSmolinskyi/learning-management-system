import type {
	CookieOptions,
} from 'express'

const COOKIES_EXPIRES_DATE = new Date(2147483647 * 1000,)

export const JWT_COOKIES_OPTIONS: CookieOptions = {
	path:     '/',
	httpOnly: true,
	expires:  COOKIES_EXPIRES_DATE,
	sameSite: 'none',
	secure:   true,
	domain:   process.env['DOMAIN_URL'],
} as const
