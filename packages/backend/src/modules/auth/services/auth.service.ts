/* eslint-disable complexity */
import {
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import * as bcrypt from 'bcrypt'

import { JWTService, } from '../../../shared/auth/jwt.service'
import { clearAuthCookies, setAuthCookies, } from '../../../shared/auth/cookies.utils'

import { AuthPortal, } from '../auth.types'

import type { Request, Response, } from 'express'
import type { Role, } from '@prisma/client'
import type { LoginDto, } from '../dto/login.dto'
import type { AuthCheckReturn, LoginReturn, } from '../auth.types'

const PORTAL_ROLE: Record<AuthPortal, Role> = {
	[AuthPortal.ADMIN]:   'ADMIN',
	[AuthPortal.STUDENT]: 'STUDENT',
}

@Injectable()
export class AuthService {
	constructor(
			private readonly prismaService: PrismaService,
			private readonly jwtService: JWTService,
	) {}

	public async login(res: Response, body: LoginDto,): Promise<LoginReturn> {
		const user = await this.prismaService.user.findUnique({
			where:  { email: body.email, },
			select: {
				id:           true,
				role:         true,
				password:     true,
				tokenVersion: true,
			},
		},)

		if (!user) {
			throw new UnauthorizedException('Invalid credentials',)
		}

		const isValid = await bcrypt.compare(body.password, user.password,)
		if (!isValid) {
			throw new UnauthorizedException('Invalid credentials',)
		}

		if (user.role !== PORTAL_ROLE[body.portal]) {
			throw new ForbiddenException('No access to this portal',)
		}

		const tokens = this.jwtService.generateTokensPair({
			sub:  user.id,
			role: user.role,
			tv:   user.tokenVersion,
		},)

		await this.prismaService.user.update({
			where: { id: user.id, },
			data:  {
				refreshTokenHash: this.jwtService.hashToken(tokens.refreshToken,),
			},
		},)

		setAuthCookies(res, tokens.accessToken, tokens.refreshToken,)

		return {
			ok: true,
		}
	}

	public async check(res: Response, req: Request, portal: AuthPortal,): Promise<AuthCheckReturn> {
		const accessToken = req.cookies?.['lms_at'] as string | undefined
		const refreshToken = req.cookies?.['lms_rt'] as string | undefined

		const requiredRole = PORTAL_ROLE[portal]

		// 1) access ok
		if (accessToken) {
			const payload = this.jwtService.tryVerifyAccess(accessToken,)
			if (payload && payload.role === requiredRole) {
				return {
					auth:   true,
					role:   payload.role,
					userId: payload.sub,
				}
			}
		}

		// 2) refresh -> rotate
		if (!refreshToken) {
			clearAuthCookies(res,)
			return { auth: false, }
		}

		const rPayload = this.jwtService.tryVerifyRefresh(refreshToken,)
		if (!rPayload) {
			clearAuthCookies(res,)
			return { auth: false, }
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

		if (!user) {
			clearAuthCookies(res,)
			return { auth: false, }
		}

		if (user.role !== requiredRole) {
			clearAuthCookies(res,)
			return { auth: false, }
		}

		if (user.tokenVersion !== rPayload.tv) {
			clearAuthCookies(res,)
			return { auth: false, }
		}

		if (!user.refreshTokenHash || !this.jwtService.compareToken(refreshToken, user.refreshTokenHash,)) {
			clearAuthCookies(res,)
			return { auth: false, }
		}

		const tokens = this.jwtService.generateTokensPair({
			sub:  user.id,
			role: user.role,
			tv:   user.tokenVersion,
		},)

		await this.prismaService.user.update({
			where: { id: user.id, },
			data:  {
				refreshTokenHash: this.jwtService.hashToken(tokens.refreshToken,),
			},
		},)

		setAuthCookies(res, tokens.accessToken, tokens.refreshToken,)

		return {
			auth:   true,
			role:   user.role,
			userId: user.id,
		}
	}
}