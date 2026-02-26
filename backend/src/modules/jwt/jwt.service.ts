import jwt from 'jsonwebtoken'
import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import { ConfigService, } from '@nestjs/config'

import { text, } from '../../shared/text'
import {
	JWT_REFRESH_TOKEN_EXP,
	JWT_TOKEN_EXP,
} from './jwt.constants'

import type {
	GenerateJWTTokenProps,
	GenerateTokensPairProps,
	GenerateTokensPairReturnType,
	JWTPayload,
} from './jwt.types'

@Injectable()
export class JWTService {
	private readonly jwtPrivateKey: string

	private readonly refreshJwtPrivateKey: string

	constructor(
        private readonly configService: ConfigService,
	) {
		this.jwtPrivateKey = this.configService.getOrThrow('JWT_PRIVATE_KEY',).replace(/\\n/g, '\n',)
		this.refreshJwtPrivateKey = this.configService.getOrThrow('JWT_PRIVATE_REFRESH_KEY',).replace(/\\n/g, '\n',)
	}

	/**
	 * 1.2/1.3
	 * Generates a pair of JWT tokens for the given user ID and roles.
	 * @param props - The properties required to generate the tokens.
	 * @param props.id - The user's unique identifier.
	 * @param props.roles - The user's roles.
	 * @returns An object containing the generated JWT token and refresh token.
	 * @throws HttpException - If the JWT token generation fails.
	 */
	public generateTokensPair({roles, clientId,}: GenerateTokensPairProps,): GenerateTokensPairReturnType {
		const token = this.generateJWTToken({
			roles,
			clientId,
			expirationTime: JWT_TOKEN_EXP,
			privateKey:     this.jwtPrivateKey,
		},)
		const refreshToken = this.generateJWTToken({
			roles,
			clientId,
			expirationTime: JWT_REFRESH_TOKEN_EXP,
			privateKey:     this.refreshJwtPrivateKey,
		},)
		return {
			token,
			refreshToken,
		}
	}

	/**
	 * Generates a JWT token for the given user ID, roles, and expiration time using a private key.
	 * @param props - The properties required to generate the JWT token.
	 * @param props.id - The user's unique identifier.
	 * @param props.expirationTime - The token's expiration time in seconds.
	 * @param props.privateKey - The private key used to sign the token.
	 * @param props.roles - The user's roles.
	 * @returns A string representing the generated JWT token.
	 * @throws HttpException - If the JWT token generation fails.
	 */
	public generateJWTToken({
		expirationTime, privateKey, roles, clientId,
	}: GenerateJWTTokenProps,): string {
		const payload: JWTPayload = {
			clientId,
			roles,
			iat:   Math.floor(Date.now() / 1000,),
			exp:   Math.floor(Date.now() / 1000,) + expirationTime,
		}
		return jwt.sign(payload, privateKey, {
			algorithm: 'RS256',
		},)
	}

	/**
	 * Validates a JWT token using a public key.
	 * @param token - The JWT token to validate.
	 * @param publicKey - The public key to verify the token. If not provided, the default public key will be used.
	 * @returns `true` if the token is valid, `false` otherwise.
	 * @throws HttpException - If the token is invalid and a public key is provided.
	 * @remarks
	 * This function uses the `jwt.verify` method to validate the token. If a public key is provided,
	 * it will be used to verify the token. If no public key is provided, the default public key will be used.
	 * If the token is invalid and a public key is provided, an `HttpException` will be thrown with a
	 * status code of `HttpStatus.FORBIDDEN` and a message indicating that the token is invalid.
	 */
	public validateJWTToken(token: string, publicKey?: string,): boolean {
		let isValid = false
		jwt.verify(token, publicKey ?? '', {
			algorithms: ['RS256',],
		}, (err, decoded,) => {
			if (err) {
				throw new HttpException(text.invalidToken, HttpStatus.FORBIDDEN,)
			}
			isValid = Boolean(decoded,)
		},)

		return isValid
	}

	/**
	 * Decodes a JWT token and returns its payload.
	 * @remarks
	 * This function uses the `jwt.decode` method to decode the token.
	 * It does not verify the token's signature or validate its expiration time.
	 * @param token - The JWT token to decode.
	 * @returns The decoded payload of the JWT token.
	 * @throws HttpException - If the token is invalid.
	 */
	public decodeJWTToken(token: string,): JWTPayload {
		return jwt.decode(token,) as JWTPayload
	}
}
