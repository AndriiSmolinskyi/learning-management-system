import { Injectable, } from '@nestjs/common'
import { ConfigService, } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'
import { createHash, timingSafeEqual, } from 'crypto'

import type { JwtPayload, } from './auth.types'

type TokensPair = {
	accessToken:  string
	refreshToken: string
}

@Injectable()
export class JWTService {
	private readonly accessSecret: string

	private readonly refreshSecret: string

	private readonly accessTtl: string

	private readonly refreshTtl: string

	constructor(
		private readonly configService: ConfigService,
	) {
		this.accessSecret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET',)
		this.refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET',)

		this.accessTtl = this.configService.getOrThrow<string>('JWT_ACCESS_TTL',)
		this.refreshTtl = this.configService.getOrThrow<string>('JWT_REFRESH_TTL',)
	}

	public generateTokensPair(payload: JwtPayload,): TokensPair {
		const accessToken = jwt.sign(payload, this.accessSecret, {
			algorithm: 'HS256',
			expiresIn: this.accessTtl,
		},)

		const refreshToken = jwt.sign(payload, this.refreshSecret, {
			algorithm: 'HS256',
			expiresIn: this.refreshTtl,
		},)

		return {
			accessToken,
			refreshToken,
		}
	}

	public verifyAccessToken(token: string,): JwtPayload {
		return jwt.verify(token, this.accessSecret,) as JwtPayload
	}

	public verifyRefreshToken(token: string,): JwtPayload {
		return jwt.verify(token, this.refreshSecret,) as JwtPayload
	}

	public tryVerifyAccess(token: string,): JwtPayload | null {
		try {
			return this.verifyAccessToken(token,)
		} catch {
			return null
		}
	}

	public tryVerifyRefresh(token: string,): JwtPayload | null {
		try {
			return this.verifyRefreshToken(token,)
		} catch {
			return null
		}
	}

	public hashToken(token: string,): string {
		return createHash('sha256',).update(token,)
			.digest('hex',)
	}

	public safeCompareHash(a: string, b: string,): boolean {
		const aBuf = Buffer.from(a,)
		const bBuf = Buffer.from(b,)

		if (aBuf.length !== bBuf.length) {
			return false
		}

		return timingSafeEqual(aBuf, bBuf,)
	}

	public compareToken(token: string, storedHash: string,): boolean {
		return this.safeCompareHash(this.hashToken(token,), storedHash,)
	}
}