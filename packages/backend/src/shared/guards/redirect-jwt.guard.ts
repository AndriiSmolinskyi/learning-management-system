import {
	Inject, Injectable,
} from '@nestjs/common'
import {
	ConfigService,
} from '@nestjs/config'

import {
	JWTService,
} from '../../modules/jwt/jwt.service'
import {
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
export class RedirectJWTAuthGuard implements CanActivate {
	private readonly jwtPublicKey: string

	private readonly refreshJwtPublicKey: string

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

		if (request.headers.origin?.includes(process.env.FRONTEND_URL,) ??
			request.headers.referer?.includes(process.env.FRONTEND_URL,)
		) {
			const isValid = await this.validateRequest(request, response,)

			return isValid
		}
		return false
	}

	public async validateRequest(request: AuthRequest, response: Response,): Promise<boolean> {
		const token: string | undefined = request.cookies[TOKEN_TYPES.ADMIN_JWT]

		if (!token) {
			return false
		}

		try {
			const isValid = this.jwtService.validateJWTToken(token, this.jwtPublicKey,)

			if (isValid) {
				const payload = this.jwtService.decodeJWTToken(token,)

				request.roles = payload.roles

				return true
			}
		} catch {
			const refreshToken: string | undefined = request.cookies[TOKEN_TYPES.ADMIN_JWT_REFRESH]

			if (!refreshToken) {
				return false
			}

			try {
				const isValid = this.jwtService.validateJWTToken(refreshToken, this.refreshJwtPublicKey,)

				if (isValid) {
					const payload = this.jwtService.decodeJWTToken(refreshToken,)

					const tokens = this.jwtService.generateTokensPair({roles: payload.roles,},)

					request.roles = payload.roles

					setClientAuthCookies(response, tokens.token, tokens.refreshToken,)

					return true
				}
			} catch (err) {
				return false
			}
		}

		return false
	}
}
