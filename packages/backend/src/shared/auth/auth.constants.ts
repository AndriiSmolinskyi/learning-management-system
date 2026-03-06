export const AUTH_META = {
	IS_PUBLIC: 'auth:isPublic',
	ROLES:     'auth:roles',
} as const

export const AUTH_COOKIES = {
	ACCESS:  'lms_at',
	REFRESH: 'lms_rt',
} as const