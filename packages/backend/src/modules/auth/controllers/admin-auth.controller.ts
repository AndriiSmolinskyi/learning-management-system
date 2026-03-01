import { Response, } from 'express'
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common'
import { ApiBody, ApiTags, } from '@nestjs/swagger'

import { JWTAuthGuard, } from '../../../shared/guards/jwt.guard'
import { AdminAuthService, } from '../services/admin-auth.service'
import { AuthRoutes, } from '../auth.constants'
import { MsalService, } from '../services/msal.service'

import type { AuthCheckReturn,} from '../auth.types'
import { AuthRequest,} from '../auth.types'
import { SignInDto, } from '../dto'

@Controller(AuthRoutes.ADMIN,)
@ApiTags('Admin Auth',)
export class AdminAuthController {
	constructor(
      private readonly authService: AdminAuthService,
		private readonly msalService: MsalService,
	) {}

	/**
	 * 1.2/1.3
	 * Handles the sign-in process using Microsoft Authentication Library (MSAL).
	 * @remarks
	 * This function is responsible for initiating the sign-in process and validating the user's credentials.
	 * It uses the provided `SignInDto` to authenticate the user and returns an `AuthCheckReturn` object.
	 * @param res - The response object to handle the HTTP response.
	 * @param body - The `SignInDto` containing the user's credentials.
	 * @returns A promise that resolves to an `AuthCheckReturn` object containing the authentication status and user information.
	 */
	@Post(AuthRoutes.ACCESS,)
	@ApiBody({
		description: 'Login employee with MS Entra',
		type:        SignInDto,
	},)
	public async signIn(
		@Res({
			passthrough: true,
		},) res: Response,
		@Body() body: SignInDto,
	): Promise<AuthCheckReturn> {
		return this.msalService.signIn(res, body,)
	}

	/**
	 * 1.2/1.3
	 * Handles the authentication check for a user with a valid JWT token.
	 * @remarks
	 * This function is a protected route that requires a valid JWT token to access.
	 * It checks the user's authentication status and returns an `AuthCheckReturn` object.
	 * @param request - The `AuthRequest` object containing the user's request and JWT token.
	 * @returns A promise that resolves to an `AuthCheckReturn` object containing the authentication status and user information.
	 */
	@UseGuards(JWTAuthGuard,)
	@Get(AuthRoutes.CHECK,)
	public async authCheck(@Req() request: AuthRequest,): Promise<AuthCheckReturn> {
		return this.authService.check(request,)
	}

	/**
	 * 1.2/1.3
	 * Handles the user's logout process.
	 * @remarks
	 * This function is a protected route that requires a valid JWT token to access.
	 * It logs out the user by invalidating the JWT token and clears the session.
	 * @param res - The response object to handle the HTTP response.
	 * @returns A promise that resolves to a `Message` object indicating the success of the logout process.
	 */
	@UseGuards(JWTAuthGuard,)
	@Delete(AuthRoutes.LOGOUT,)
	@HttpCode(HttpStatus.NO_CONTENT,)
	public async logout(@Res({passthrough: true,},) res: Response,): Promise<void> {
		return this.authService.logout(res,)
	}
}
