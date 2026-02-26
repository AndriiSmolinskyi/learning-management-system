/* eslint-disable max-depth */
/* eslint-disable complexity */
import {
	Inject, Injectable, Logger, UnauthorizedException,
} from '@nestjs/common'
import {
	ConfigService,
} from '@nestjs/config'

import {
	AuthRoutes,
} from '../../modules/auth/auth.constants'
import {
	JWTService,
} from '../../modules/jwt/jwt.service'
import {
	setAdminAuthCookies,
	setClientAuthCookies,
} from '../utils'
import {
	TOKEN_TYPES,
} from '../constants'

import type {
	Response,
} from 'express'
import type {
	CanActivate, ExecutionContext,
} from '@nestjs/common'
import type {
	AuthRequest,
} from '../../modules/auth/auth.types'

@Injectable()
export class JWTAuthGuard implements CanActivate {
	private readonly jwtPublicKey: string

	private readonly refreshJwtPublicKey: string

	private readonly logger = new Logger(JWTAuthGuard.name,)

	constructor(
      @Inject(JWTService,) private readonly jwtService: JWTService,
		private readonly configService: ConfigService,

	) {
		this.jwtPublicKey = this.configService.getOrThrow('JWT_PUBLIC_KEY',).replace(/\\n/g, '\n',)
		this.refreshJwtPublicKey = this.configService.getOrThrow('JWT_PUBLIC_REFRESH_KEY',).replace(/\\n/g, '\n',)
	}

	public async canActivate(
		context: ExecutionContext,
	): Promise<boolean> {
		const request: AuthRequest = context.switchToHttp().getRequest()
		const response: Response = context.switchToHttp().getResponse()

		if (request.headers.origin?.includes(process.env.ADMIN_URL,) ??
			request.headers.referer?.includes(process.env.ADMIN_URL,)
		) {
			const isValid = await this.validateAdminRequest(request, response,)
			if (request.url === `/${AuthRoutes.ADMIN}/${AuthRoutes.CHECK}`) {
				request.auth = isValid

				return true
			}
			return isValid
		}

		if (request.headers.origin?.includes(process.env.FRONTEND_URL,) ??
			request.headers.referer?.includes(process.env.FRONTEND_URL,)
		) {
			const isValid = await this.validateClientRequest(request, response,)

			if (request.url === `/${AuthRoutes.CLIENT}/${AuthRoutes.CHECK}`) {
				request.auth = isValid

				return true
			}

			return isValid
		}
		this.logger.error('[JwtAuthGuardError]', {
			method:  request.method,
			url:     request.url,
			origin:  request.headers.origin,
			referer: request.headers.referer,
			ip:      request.ip,
			headers: request.headers,
		}, request.headers.origin,request.headers.referer,)
		// todo: Replace after check
		// this.logger.error('[JwtAuthGuardError]', request.headers.origin,request.headers.referer,)
		return false
	}

	public async validateAdminRequest(request: AuthRequest, response: Response,): Promise<boolean> {
		const token: string | undefined = request.cookies[TOKEN_TYPES.ADMIN_JWT]
		const refreshToken: string | undefined = request.cookies[TOKEN_TYPES.ADMIN_JWT_REFRESH]

		if (token) {
			try {
				const isValid = this.jwtService.validateJWTToken(token, this.jwtPublicKey,)
				if (isValid) {
					const payload = this.jwtService.decodeJWTToken(token,)
					request.roles = payload.roles
					return true
				}
			} catch {
				if (!refreshToken) {
					return false
				}
				try {
					const isValid = this.jwtService.validateJWTToken(refreshToken, this.refreshJwtPublicKey,)
					if (isValid) {
						const payload = this.jwtService.decodeJWTToken(refreshToken,)
						const tokens = this.jwtService.generateTokensPair({roles: payload.roles,},)
						request.roles = payload.roles
						setAdminAuthCookies(response, tokens.token, tokens.refreshToken,)
						return true
					}
				} catch (err) {
					return false
				}
			}
		} else {
			if (!refreshToken) {
				return false
			}
			try {
				const isValid = this.jwtService.validateJWTToken(refreshToken, this.refreshJwtPublicKey,)
				if (isValid) {
					const payload = this.jwtService.decodeJWTToken(refreshToken,)
					const tokens = this.jwtService.generateTokensPair({roles: payload.roles,},)
					request.roles = payload.roles
					setAdminAuthCookies(response, tokens.token, tokens.refreshToken,)
					return true
				}
			} catch (err) {
				return false
			}
		}
		return false
	}

	public async validateClientRequest(request: AuthRequest, response: Response,): Promise<boolean> {
		const token: string | undefined = request.cookies[TOKEN_TYPES.CLIENT_JWT]
		const refreshToken: string | undefined = request.cookies[TOKEN_TYPES.CLIENT_JWT_REFRESH]
		if (token) {
			try {
				const isValid = this.jwtService.validateJWTToken(token, this.jwtPublicKey,)
				if (isValid) {
					const payload = this.jwtService.decodeJWTToken(token,)
					request.clientId = payload.clientId
					request.roles = payload.roles
					return true
				}
			} catch {
				if (!refreshToken) {
					this.logger.error('[JwtAuthGuardError]', refreshToken, 'No client refresh token',)
					throw new UnauthorizedException('No client refresh token provided',)
				}
				try {
					const isValid = this.jwtService.validateJWTToken(refreshToken, this.refreshJwtPublicKey,)
					if (isValid) {
						const payload = this.jwtService.decodeJWTToken(refreshToken,)
						const tokens = this.jwtService.generateTokensPair({roles: [], clientId: payload.clientId,},)
						request.roles = payload.roles
						request.clientId = payload.clientId
						setClientAuthCookies(response, tokens.token, tokens.refreshToken,)
						return true
					}
				} catch (err) {
					this.logger.error('[JwtAuthGuardError]', token, err, 'Validate JWT Token',)
					return false
				}
			}
		} else {
			if (!refreshToken) {
				this.logger.error('[JwtAuthGuardError]', refreshToken, 'No client refresh token',)
				throw new UnauthorizedException('No client refresh token provided',)
			}
			try {
				const isValid = this.jwtService.validateJWTToken(refreshToken, this.refreshJwtPublicKey,)
				if (isValid) {
					const payload = this.jwtService.decodeJWTToken(refreshToken,)
					const tokens = this.jwtService.generateTokensPair({ roles: [], clientId: payload.clientId, },)
					request.roles = payload.roles
					request.clientId = payload.clientId
					setClientAuthCookies(response, tokens.token, tokens.refreshToken,)
					return true
				}
			} catch (err) {
				return false
			}
		}
		return false
	}

	// todo: Admin / Client validate methods before changes, remove after testing is ok
	// 	public async validateAdminRequest(request: AuthRequest, response: Response,): Promise<boolean> {
	// 	const token: string | undefined = request.cookies[TOKEN_TYPES.ADMIN_JWT]

	// 	if (!token) {
	// 		return false
	// 	}

	// 	try {
	// 		const isValid = this.jwtService.validateJWTToken(token, this.jwtPublicKey,)
	// 		if (isValid) {
	// 			const payload = this.jwtService.decodeJWTToken(token,)

	// 			request.roles = payload.roles

	// 			return true
	// 		}
	// 	} catch {
	// 		const refreshToken: string | undefined = request.cookies[TOKEN_TYPES.ADMIN_JWT_REFRESH]
	// 		if (!refreshToken) {
	// 			return false
	// 		}

	// 		try {
	// 			const isValid = this.jwtService.validateJWTToken(refreshToken, this.refreshJwtPublicKey,)

	// 			if (isValid) {
	// 				const payload = this.jwtService.decodeJWTToken(refreshToken,)

	// 				const tokens = this.jwtService.generateTokensPair({roles: payload.roles,},)

	// 				request.roles = payload.roles

	// 				setAdminAuthCookies(response, tokens.token, tokens.refreshToken,)

	// 				return true
	// 			}
	// 		} catch (err) {
	// 			return false
	// 		}
	// 	}

	// 	return false
	// }

	// public async validateClientRequest(request: AuthRequest, response: Response,): Promise<boolean> {
	// 	const token: string | undefined = request.cookies[TOKEN_TYPES.CLIENT_JWT]

	// 	// [FIX #1] Якщо access-токена немає — пробуємо refresh замість 401
	// 	if (!token) {
	// 		const refreshToken: string | undefined = request.cookies[TOKEN_TYPES.CLIENT_JWT_REFRESH]

	// 		if (!refreshToken) {
	// 			this.logger.error('[JwtAuthGuardError]', request.cookies[TOKEN_TYPES.CLIENT_JWT], 'No client refresh token',)
	// 			throw new UnauthorizedException('No client refresh token provided',)
	// 		}

	// 		try {
	// 			const isValid = this.jwtService.validateJWTToken(refreshToken, this.refreshJwtPublicKey,)
	// 			if (isValid) {
	// 				const payload = this.jwtService.decodeJWTToken(refreshToken,)

	// 				const tokens = this.jwtService.generateTokensPair({ roles: [], clientId: payload.clientId, },)
	// 				request.roles = payload.roles
	// 				request.clientId = payload.clientId

	// 				setClientAuthCookies(response, tokens.token, tokens.refreshToken,)
	// 				return true
	// 			}
	// 		} catch (err) {
	// 			this.logger.error('[JwtAuthGuardError]', request.cookies[TOKEN_TYPES.CLIENT_JWT_REFRESH], err, 'Validate JWT Token (no access token)',)
	// 			return false
	// 		}
	// 	}

	// 	try {
	// 		if (!token) {
	// 			return false
	// 		}

	// 		const isValid = this.jwtService.validateJWTToken(token, this.jwtPublicKey,)
	// 		if (isValid) {
	// 			const payload = this.jwtService.decodeJWTToken(token,)
	// 			request.clientId = payload.clientId
	// 			request.roles = payload.roles
	// 			return true
	// 		}

	// 		const refreshToken: string | undefined = request.cookies[TOKEN_TYPES.CLIENT_JWT_REFRESH]
	// 		if (!refreshToken) {
	// 			this.logger.error('[JwtAuthGuardError]', request.cookies[TOKEN_TYPES.CLIENT_JWT_REFRESH], 'No client refresh token',)
	// 			throw new UnauthorizedException('No client refresh token provided',)
	// 		}

	// 		try {
	// 			const rIsValid = this.jwtService.validateJWTToken(refreshToken, this.refreshJwtPublicKey,)
	// 			if (rIsValid) {
	// 				const payload = this.jwtService.decodeJWTToken(refreshToken,)
	// 				const tokens = this.jwtService.generateTokensPair({ roles: [], clientId: payload.clientId, },)

	// 				request.roles = payload.roles
	// 				request.clientId = payload.clientId

	// 				setClientAuthCookies(response, tokens.token, tokens.refreshToken,)
	// 				return true
	// 			}
	// 		} catch (err) {
	// 			this.logger.error('[JwtAuthGuardError]', request.cookies[TOKEN_TYPES.CLIENT_JWT_REFRESH], err, 'Validate JWT Token (invalid access path)',)
	// 			return false
	// 		}
	// 	} catch {
	// 		const refreshToken: string | undefined = request.cookies[TOKEN_TYPES.CLIENT_JWT_REFRESH]

	// 		if (!refreshToken) {
	// 			this.logger.error('[JwtAuthGuardError]', request.cookies[TOKEN_TYPES.CLIENT_JWT_REFRESH], 'No client refresh token',)
	// 			throw new UnauthorizedException('No client refresh token provided',)
	// 		}

	// 		try {
	// 			const isValid = this.jwtService.validateJWTToken(refreshToken, this.refreshJwtPublicKey,)
	// 			if (isValid) {
	// 				const payload = this.jwtService.decodeJWTToken(refreshToken,)
	// 				const tokens = this.jwtService.generateTokensPair({ roles: [], clientId: payload.clientId, },)

	// 				request.roles = payload.roles
	// 				request.clientId = payload.clientId

	// 				setClientAuthCookies(response, tokens.token, tokens.refreshToken,)
	// 				return true
	// 			}
	// 		} catch (err) {
	// 			this.logger.error('[JwtAuthGuardError]', request.cookies[TOKEN_TYPES.CLIENT_JWT_REFRESH], err, 'Validate JWT Token',)
	// 			return false
	// 		}
	// 	}

	// 	return false
	// }
}
