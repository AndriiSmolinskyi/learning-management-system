import {
	Controller,
	Body,
	Res,
	UseGuards,
	Req,
	Delete,
	HttpCode,
	HttpStatus,
	Post,
	Get,
	Param,
	Query,
} from '@nestjs/common'
import {
	ApiBody,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger'
import { Response, } from 'express'

import {
	JWTAuthGuard,
	RedirectJWTAuthGuard,
	RolesGuard,
} from '../../../shared/guards'
import { ClientAuthService, } from '../services/client-auth.service'
import { AuthRoutes, } from '../auth.constants'
import { RolesDecorator, } from '../../../shared/decorators'
import { Roles, } from '../../../shared/types'

import type { AuthCheckReturn, TLoginReturn,} from '../auth.types'
import { AuthRequest, } from '../auth.types'
import { CheckDto, IdDto, LoginDto, TwoFAVerificationDto, } from '../dto'

@Controller(AuthRoutes.CLIENT,)
@ApiTags('Client Auth',)
export class ClientAuthController {
	constructor(
		private readonly clientAuthService: ClientAuthService,
	) {}

	/**
 * Performs initial login step using email and password.
 * @remarks
 * If credentials are valid and 2FA is not yet enabled, returns a QR code and secret for setup.
 * If 2FA is already configured, proceeds without QR.
 *
 * @param body - Login credentials (email and password).
 * @param res - Express response used to set auth cookies (if 2FA is not required).
 * @returns Object indicating if 2FA is required, and setup data if needed.
 */
	@Post(AuthRoutes.LOGIN,)
	@ApiBody({
		description: 'Login user',
		type:        LoginDto,
	},)
	public async login(
		@Body() body: LoginDto,
		@Res({ passthrough: true, },) res: Response,
	): Promise<TLoginReturn> {
		return this.clientAuthService.login(res, body,)
	}

	/**
 * Verifies the user's TOTP 2FA code as part of the authentication process.
 * @remarks
 * This endpoint finalizes the login process by validating the 2FA code and setting session cookies.
 * If the user's 2FA is not yet set up, a valid secret and code can initialize it.
 *
 * @param body - DTO including email, password, TOTP code, and optionally a secret.
 * @param res - Express response object used to set auth cookies upon success.
 * @returns Object indicating whether authentication was successful.
 */
	@Post(AuthRoutes.TWO_FA_VERIFY,)
	@ApiBody({
		description: '2FA user verification',
		type:        TwoFAVerificationDto,
	},)
	public async twoFAVerify(
		@Body() body: TwoFAVerificationDto,
		@Res({ passthrough: true, },) res: Response,
	): Promise<AuthCheckReturn> {
		return this.clientAuthService.twoFAVerify(res, body,)
	}

	/**
 * Verifies the current authentication status of the client.
 * @remarks
 * This endpoint checks whether the client is authenticated based on the JWT in their request.
 * Typically used to validate session persistence on client load.
 *
 * @param req - The request object containing the user’s JWT.
 * @returns Authentication status and user info if authenticated.
 */
	@Get(AuthRoutes.CHECK,)
	@UseGuards(JWTAuthGuard,)
	public async check(
		@Req() req: AuthRequest,
		@Query() query: CheckDto,
	): Promise<AuthCheckReturn> {
		return this.clientAuthService.check(req, query.isDeactivatedClientAllowed,)
	}

	/**
 * Allows a Back Office or Family Office manager to assume the identity of a client by their ID.
 * @remarks
 * Used internally by admins to perform operations on behalf of a specific client.
 * This method sets session cookies for the selected client.
 *
 * @param params - Object containing the ID of the client to impersonate.
 * @param res - Express response object used to set new session cookies.
 * @returns Authentication status for the redirected session.
 */
	@Get(`${AuthRoutes.ADMIN_REDIRECT}/:id`,)
	@UseGuards(RedirectJWTAuthGuard, RolesGuard,)
	@RolesDecorator({
		roles: [
			Roles.BACK_OFFICE_MANAGER,
			Roles.FAMILY_OFFICE_MANAGER,
		],
	},)
	@ApiParam({
		name:        'id',
		description: 'Client ID',
	},)
	public async adminRedirect(
		@Param() params: IdDto,
		@Res({ passthrough: true, },) res: Response,
	): Promise<AuthCheckReturn> {
		return this.clientAuthService.adminRedirect(res, params.id,)
	}

	/**
 * Logs out the currently authenticated client.
 * @remarks
 * Clears the authentication cookies from the response and ends the session.
 *
 * @param res - Express response object used to clear cookies.
 * @returns A void Promise indicating successful logout.
 */
	@UseGuards(JWTAuthGuard,)
	@Delete(AuthRoutes.LOGOUT,)
	@HttpCode(HttpStatus.NO_CONTENT,)
	public async logout(@Res({
		passthrough: true,
	},) res: Response,): Promise<void> {
		await this.clientAuthService.logout(res,)
	}
}
