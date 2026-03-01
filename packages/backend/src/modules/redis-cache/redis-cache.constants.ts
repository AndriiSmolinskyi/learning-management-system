export const TTL_CACHE_TIME = 5 * 60 * 1000
export const MINUTE_CACHE_TIME = 1 * 60 * 1000
export const HOUR_CACHE_TIME = 1 * 60 * 60 * 1000
export const DAY_CACHE_TIME = 24 * 60 * 60 * 1000
export const THREE_DAYS_CACHE_TIME = 3 * 24 * 60 * 60 * 1000
export const MAX_RECONNECT_ATTEMPTS = 3
export const REDIS_CONNECT_TIMEOUT_MS = 2000
export const REDIS_KEEP_ALIVE_TIMEOUT_MS = 30 * 1000
export const REDIS_CLIENT_TOKEN = 'REDIS_CLIENT'

export const RedisRoutes = {
	MODULE:              'redis',
	CLEAR_CACHE:                'clear-cache',
}

export const SwaggerDescriptions = {
	REDIS_TAG:     'Redis',
}