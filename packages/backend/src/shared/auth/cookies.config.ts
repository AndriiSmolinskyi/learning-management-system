/* eslint-disable prefer-named-capture-group */
import type { CookieOptions, } from 'express'

const parseDurationToMs = (value: string,): number => {
	const match = (/^(\d+)(s|m|h|d)$/i).exec(value.trim(),)
	if (!match) {
		throw new Error(`Invalid duration: ${value}`,)
	}

	const amount = Number(match[1],)
	const unit = match[2].toLowerCase()

	switch (unit) {
	case 's': return amount * 1000
	case 'm': return amount * 60 * 1000
	case 'h': return amount * 60 * 60 * 1000
	case 'd': return amount * 24 * 60 * 60 * 1000
	default:  throw new Error(`Invalid duration unit: ${unit}`,)
	}
}

export const getAccessCookieOptions = (): CookieOptions => {
	const isProd = process.env.NODE_ENV === 'production'
	const maxAge = parseDurationToMs(process.env.JWT_ACCESS_TTL ?? '15m',)

	return {
		path:     '/',
		httpOnly: true,
		maxAge,
		secure:   isProd,
		sameSite: isProd ?
			'none' :
			'lax',
		...(isProd && process.env.DOMAIN_URL ?
			{ domain: process.env.DOMAIN_URL, } :
			{}),
	} as const
}

export const getRefreshCookieOptions = (): CookieOptions => {
	const isProd = process.env.NODE_ENV === 'production'
	const maxAge = parseDurationToMs(process.env.JWT_REFRESH_TTL ?? '14d',)

	return {
		path:     '/',
		httpOnly: true,
		maxAge,
		secure:   isProd,
		sameSite: isProd ?
			'none' :
			'lax',
		...(isProd && process.env.DOMAIN_URL ?
			{ domain: process.env.DOMAIN_URL, } :
			{}),
	} as const
}