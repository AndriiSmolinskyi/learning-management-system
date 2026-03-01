/* eslint-disable complexity */
import { PrismaService, } from 'nestjs-prisma'
import { Injectable, HttpException, HttpStatus,} from '@nestjs/common'
import type { Response, } from 'express'
import type { Client, } from '@prisma/client'
import { authenticator, } from 'otplib'
import * as qrcode from 'qrcode'

import {
	JWTService,
} from '../../jwt/jwt.service'
import {
	clearClientAuthCookies,
	setClientAuthCookies,
} from '../../../shared/utils'
import { CryptoService, } from '../../../modules/crypto/crypto.service'

import type { LoginDto, } from '../dto/client-login.dto'
import type { AuthCheckReturn, AuthRequest, GenerateSecretReturn, TLoginReturn,} from '../auth.types'
import type { TwoFAVerificationDto, } from '../dto'

@Injectable()
export class ClientAuthService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly jwtService: JWTService,
		private readonly cryptoService: CryptoService,
	) {}

	/**
 * Authenticates a client using email and password.
 * @remarks
 * Verifies email confirmation, password validity, and client activation.
 * If successful, sets authentication cookies.
 *
 * @param res - Express response object to set auth cookies.
 * @param body - DTO containing the user's login credentials.
 * @returns A Promise resolving to an object indicating successful authentication.
 * @throws HttpException if the user is not found, the password is invalid, or the client is deactivated.
 */
	public async login(res: Response, body: LoginDto,): Promise<TLoginReturn> {
		// const userEmail = await this.prismaService.email.findUnique({
		// 	where:   { email: body.email, },
		// },)
		const allEmails = await this.prismaService.email.findMany()
		const emailToCheck = allEmails.find((item,) => {
			return this.cryptoService.decryptString(item.email,) === body.email
		},)
		if (!emailToCheck || !emailToCheck.isConfirmed || !emailToCheck.password) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND,)
		}

		const isPasswordValid = await this.cryptoService.comparePasswords(body.password, emailToCheck.password,)

		if (!isPasswordValid) {
			throw new HttpException('Wrong password', HttpStatus.BAD_REQUEST,)
		}
		const client = await this.prismaService.client.findUnique({
			where:   { id: emailToCheck.clientId, },
		},)

		if (!client || !client.isActivated) {
			throw new HttpException('Client is deactivated', HttpStatus.BAD_REQUEST,)
		}

		if (!emailToCheck.twoFactorSecret) {
			const { secret, otpauth, } = this.generate2FASecret(this.cryptoService.decryptString(emailToCheck.email,),)
			const qrCodeDataURL = await this.generateQRCode(otpauth,)

			return {
				has2FASetup:   Boolean(emailToCheck.twoFactorSecret,),
				secret,
				qrCodeDataURL,
			}
		}
		return {
			has2FASetup:   Boolean(emailToCheck.twoFactorSecret,),
		}
	}

	/**
 * Verifies the user's 2FA code after primary authentication (email/password).
 * @remarks
 * This method finalizes login by verifying the 2FA code using the stored or newly provided secret.
 * If the user does not yet have a stored 2FA secret, it can be confirmed and saved during this step.
 *
 * @param res - Express response object to set auth cookies if verification succeeds.
 * @param body - DTO containing email, password, 2FA code, and optionally the secret.
 * @returns Object indicating whether authentication was successful.
 * @throws HttpException if the user is invalid, 2FA code is incorrect, or authentication fails.
 */
	public async twoFAVerify(res: Response, body: TwoFAVerificationDto,): Promise<AuthCheckReturn> {
		const allEmails = await this.prismaService.email.findMany()
		const userEmail = allEmails.find((item,) => {
			return this.cryptoService.decryptString(item.email,) === body.email
		},)
		if (!userEmail || !userEmail.isConfirmed || !userEmail.password) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND,)
		}

		const isPasswordValid = await this.cryptoService.comparePasswords(body.password, userEmail.password,)

		if (!isPasswordValid) {
			throw new HttpException('Wrong password', HttpStatus.BAD_REQUEST,)
		}
		const client = await this.prismaService.client.findUnique({
			where:   { id: userEmail.clientId, },
		},)

		if (!client || !client.isActivated) {
			throw new HttpException('Client is deactivated', HttpStatus.BAD_REQUEST,)
		}
		if (!userEmail.twoFactorSecret && !body.secret) {
			throw new HttpException('2FA authentication failed', HttpStatus.BAD_REQUEST,)
		}

		let auth: boolean = false

		if (userEmail.twoFactorSecret) {
			const decodedSecret = this.cryptoService.decryptString(userEmail.twoFactorSecret,)
			auth = this.verify2FACode(decodedSecret, body.code,)
		} else if (body.secret) {
			auth = this.verify2FACode(body.secret, body.code,)
			if (auth) {
				const encryptedSecret = this.cryptoService.encryptString(body.secret,)
				await this.prismaService.email.update({
					where: { id: userEmail.id, },
					data:  {
						twoFactorSecret: encryptedSecret,
					},
				},)
			}
		}

		if (!auth) {
			throw new HttpException('2FA authentication failed', HttpStatus.BAD_REQUEST,)
		}

		this.authorizeUser(client, res,)

		return {
			auth,
		}
	}

	/**
 * Checks if the request contains a valid and active client session.
 * @remarks
 * Used to verify client authentication state based on the JWT payload.
 *
 * @param req - Authenticated request object.
 * @returns A Promise resolving to an object indicating whether the client is authenticated.
 */
	public async check(req: AuthRequest, isDeactivatedClientAllowed?: boolean,): Promise<AuthCheckReturn> {
		if (!req.clientId) {
			return {
				auth: false,
			}
		}

		const client = await this.prismaService.client.findUnique({
			where: { id: req.clientId, },
		},)

		return {
			auth: isDeactivatedClientAllowed ?
				Boolean(client,) :
				Boolean(client && client.isActivated,),
		}
	}

	/**
 * Allows an admin to log in as a client by setting authentication cookies.
 * @remarks
 * This is typically used for admin-side client impersonation.
 *
 * @param res - Express response to set client auth cookies.
 * @param clientId - ID of the client to impersonate.
 * @returns A Promise resolving to an object indicating successful authentication.
 * @throws HttpException if the client is not found.
 */
	public async adminRedirect(res: Response, clientId: string,): Promise<AuthCheckReturn> {
		const client = await this.prismaService.client.findUnique({
			where:   { id: clientId, },
		},)

		if (!client) {
			throw new HttpException('Client not found', HttpStatus.NOT_FOUND,)
		}

		this.authorizeUser(client, res,)

		return {
			auth: true,
		}
	}

	/**
 * Logs out the client by clearing authentication cookies.
 *
 * @param res - Express response object used to clear cookies.
 * @returns A Promise resolving once logout is completed.
 */
	public async logout(res: Response,): Promise<void> {
		clearClientAuthCookies(res,)
	}

	/**
 * Sets authentication and refresh tokens for the given client.
 * @remarks
 * Internal method to handle cookie setting logic using JWT.
 *
 * @param client - The client object to generate tokens for.
 * @param res - Express response to apply the cookies.
 */
	private authorizeUser(client: Client, res: Response,): void {
		const tokens = this.jwtService.generateTokensPair({
			roles:    [],
			clientId: client.id,
		},)

		setClientAuthCookies(res, tokens.token, tokens.refreshToken,)
	}

	/**
 * Generates a TOTP secret and otpauth URL for 2FA setup.
 *
 * @param userEmail - The user's email address used in the otpauth URI.
 * @returns Object containing the secret and the otpauth URI string.
 */
	private generate2FASecret(userEmail: string,): GenerateSecretReturn {
		const secret = authenticator.generateSecret()
		const otpauth = authenticator.keyuri(userEmail, 'Migdal Management Analytics', secret,)
		return { secret, otpauth, }
	}

	/**
 * Generates a base64-encoded QR code from the provided otpauth URI.
 *
 * @param otpauth - The otpauth URI string to be encoded as a QR code.
 * @returns A Promise resolving to a data URL representing the QR image.
 */
	private async generateQRCode(otpauth: string,): Promise<string> {
		return qrcode.toDataURL(otpauth,)
	}

	/**
 * Verifies a 2FA token against the provided secret.
 *
 * @param secret - The TOTP secret used for verification.
 * @param code - The 2FA code input by the user.
 * @returns True if the code is valid; false otherwise.
 */
	private verify2FACode(secret: string, code: string,): boolean {
		return authenticator.verify({ token: code, secret, },)
	}
}
