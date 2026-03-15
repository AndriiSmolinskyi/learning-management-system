/* eslint-disable complexity */
import * as bcrypt from 'bcrypt'
import {
	ForbiddenException,
	Injectable,
	UnauthorizedException,
	BadRequestException,
} from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Request, Response, } from 'express'
import type { Role, } from '@prisma/client'
import { randomBytes, } from 'crypto'

import { JWTService, } from '../../../shared/auth/jwt.service'
import { clearAuthCookies, setAuthCookies, } from '../../../shared/auth/cookies.utils'
import { AuthPortal, } from '../auth.types'

import type { AuthCheckReturn, LoginReturn, } from '../auth.types'

import type { LoginDto, } from '../dto/login.dto'
import { MailService, } from '../../../modules/mail/mail.service'
import type { ForgotPasswordDto, } from '../dto/forgot-password.dto'
import type { ResetPasswordDto, } from '../dto/reset-password.dto'

const PORTAL_ROLE: Record<AuthPortal, Role> = {
	[AuthPortal.ADMIN]:   'ADMIN',
	[AuthPortal.STUDENT]: 'STUDENT',
}

@Injectable()
export class AuthService {
	constructor(
			private readonly prismaService: PrismaService,
		private readonly jwtService: JWTService,
			private readonly mailService: MailService,
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

	public async forgotPassword(body: ForgotPasswordDto,): Promise<{ ok: true }> {
		const user = await this.prismaService.user.findUnique({
			where:  { email: body.email, },
			select: {
				id:   true,
				role: true,
			},
		},)

		if (!user) {
			return { ok: true, }
		}

		if (user.role !== PORTAL_ROLE[body.portal]) {
			return { ok: true, }
		}

		const token = randomBytes(32,).toString('hex',)
		const tokenHash = this.jwtService.hashToken(token,)
		// eslint-disable-next-line no-mixed-operators
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000,)

		await this.prismaService.user.update({
			where: { id: user.id, },
			data:  {
				resetPasswordTokenHash:      tokenHash,
				resetPasswordTokenExpiresAt: expiresAt,
			},
		},)

		await this.mailService.sendForgot({
			email:  body.email,
			token,
			portal: body.portal,
		},)

		return { ok: true, }
	}

	public async resetPassword(res: Response, body: ResetPasswordDto,): Promise<{ ok: true }> {
		const requiredRole = PORTAL_ROLE[body.portal]

		const user = await this.prismaService.user.findUnique({
			where:  { email: body.email, },
			select: {
				id:                          true,
				role:                        true,
				tokenVersion:                true,
				resetPasswordTokenHash:      true,
				resetPasswordTokenExpiresAt: true,
			},
		},)

		if (!user) {
			throw new UnauthorizedException('Invalid reset token',)
		}

		if (user.role !== requiredRole) {
			throw new ForbiddenException('No access to this portal',)
		}

		if (!user.resetPasswordTokenHash || !user.resetPasswordTokenExpiresAt) {
			throw new UnauthorizedException('Invalid reset token',)
		}

		if (Date.now() > user.resetPasswordTokenExpiresAt.getTime()) {
			throw new BadRequestException('Reset token expired',)
		}

		const isTokenValid = this.jwtService.compareToken(body.token, user.resetPasswordTokenHash,)
		if (!isTokenValid) {
			throw new BadRequestException('Invalid reset token',)
		}

		const passwordHash = await bcrypt.hash(body.newPassword, 10,)

		await this.prismaService.user.update({
			where: { id: user.id, },
			data:  {
				password: passwordHash,

				resetPasswordTokenHash:      null,
				resetPasswordTokenExpiresAt: null,

				refreshTokenHash: null,
				tokenVersion:     {
					increment: 1,
				},
			},
		},)

		// full logout
		clearAuthCookies(res,)

		return { ok: true, }
	}

	public async logout(res: Response, req: Request,): Promise<{ ok: true }> {
		try {
			const refreshToken = req.cookies?.['lms_rt'] as string | undefined
			if (!refreshToken) {
				return { ok: true, }
			}

			const payload = this.jwtService.tryVerifyRefresh(refreshToken,)
			if (!payload) {
				return { ok: true, }
			}

			const user = await this.prismaService.user.findUnique({
				where:  { id: payload.sub, },
				select: {
					id:               true,
					refreshTokenHash: true,
					tokenVersion:     true,
				},
			},)

			if (!user?.refreshTokenHash) {
				return { ok: true, }
			}

			if (user.tokenVersion !== payload.tv) {
				return { ok: true, }
			}

			if (!this.jwtService.compareToken(refreshToken, user.refreshTokenHash,)) {
				return { ok: true, }
			}

			await this.prismaService.user.update({
				where: { id: user.id, },
				data:  {
					refreshTokenHash: null,
				},
			},)

			return { ok: true, }
		} finally {
			clearAuthCookies(res,)
		}
	}
}