/* eslint-disable complexity */
/* eslint-disable max-depth */
import type { CanActivate, ExecutionContext, } from '@nestjs/common'
import {
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { Reflector, } from '@nestjs/core'
import type { Response, } from 'express'
import { PrismaService, } from 'nestjs-prisma'

import { AUTH_COOKIES, AUTH_META, } from './auth.constants'
// eslint-disable-next-line no-unused-vars
import type { AuthRequest, JwtPayload, } from './auth.types'
import { JWTService, } from './jwt.service'
import { clearAuthCookies, setAuthCookies, } from './cookies.utils'

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly prismaService: PrismaService,
		@Inject(JWTService,) private readonly jwtService: JWTService,
	) {}

	public async canActivate(context: ExecutionContext,): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(
			AUTH_META.IS_PUBLIC,
			[
				context.getHandler(),
				context.getClass(),
			],
		)

		if (isPublic) {
			return true
		}

		const request: AuthRequest = context.switchToHttp().getRequest()
		const response: Response = context.switchToHttp().getResponse()

		const access = request.cookies?.[AUTH_COOKIES.ACCESS] as string | undefined
		const refresh = request.cookies?.[AUTH_COOKIES.REFRESH] as string | undefined

		// 1) access
		if (access) {
			const payload = this.jwtService.tryVerifyAccess(access,)
			if (payload) {
				request.user = {
					userId: payload.sub,
					role:   payload.role,
				}
				return true
			}
		}

		// 2) refresh
		if (!refresh) {
			clearAuthCookies(response,)
			throw new UnauthorizedException('Unauthorized',)
		}

		const rPayload = this.jwtService.tryVerifyRefresh(refresh,)
		if (!rPayload) {
			clearAuthCookies(response,)
			throw new UnauthorizedException('Unauthorized',)
		}

		const user = await this.prismaService.user.findUnique({
			where:  { id: rPayload.sub, },
			select: {
				id:               true,
				role:             true,
				tokenVersion:     true,
				refreshTokenHash: true,
			},
		},)

		if (!user?.refreshTokenHash) {
			clearAuthCookies(response,)
			throw new UnauthorizedException('Unauthorized',)
		}

		if (rPayload.tv !== user.tokenVersion) {
			clearAuthCookies(response,)
			throw new UnauthorizedException('Unauthorized',)
		}

		if (!this.jwtService.compareToken(refresh, user.refreshTokenHash,)) {
			clearAuthCookies(response,)
			throw new UnauthorizedException('Unauthorized',)
		}

		// rotation
		const tokens = this.jwtService.generateTokensPair({
			sub:  user.id,
			role: user.role,
			tv:   user.tokenVersion,
		},)

		await this.prismaService.user.update({
			where: { id: user.id, },
			data:  { refreshTokenHash: this.jwtService.hashToken(tokens.refreshToken,), },
		},)

		setAuthCookies(response, tokens.accessToken, tokens.refreshToken,)

		request.user = {
			userId: user.id,
			role:   user.role,
		}

		return true
	}
}