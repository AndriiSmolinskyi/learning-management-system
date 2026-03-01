import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Req,
	UseGuards,
} from '@nestjs/common'
import { ApiBody, ApiParam, } from '@nestjs/swagger'

import { JWTAuthGuard, } from '../../shared/guards'
import { UserService, } from './user.service'
import { UserRoutes, } from './user.constants'

import {
	AuthRequest,
} from '../auth/auth.types'
import {
	ChangePasswordDto,
	ConfirmEmailDto,
	ForgotPasswordDto,
	TokenDto,
} from './dto'
import type {
	TClientRes,
} from '../client'

@Controller(UserRoutes.MODULE,)
export class UserController {
	constructor(
		private readonly userService: UserService,
	) {}

	/**
	 * Confirms a user's email address and updates their password.
	 *
	 * @remarks
	 * - Accepts a confirmation token via the URL and old/new passwords in the request body.
	 * - Delegates the logic to the service, which validates the token and passwords.
	 * - Used when a user needs to confirm their email and simultaneously set a new password.
	 *
	 * @param token - The email confirmation token passed as a URL parameter.
	 * @param body - The request body containing `oldPassword` and `newPassword`.
	 * @returns void
	 */
	@Patch(`${UserRoutes.EMAIL_CONFIRMATION}/:token`,)
	@ApiParam({
		name: 'token',
	},)
	@ApiBody({
		type: ConfirmEmailDto,
	},)
	public async emailConfirmation(
		@Param() params: TokenDto,
		@Body() body: ConfirmEmailDto,
	): Promise<void> {
		await this.userService.emailConfirmation(params.token, body,)
	}

	/**
	 * 1.2/1.3/1.4
	 * Retrieves the current user's profile information.
	 * @remarks
	 * This function is a protected route and requires a valid JWT token.
	 * It retrieves the user's profile information from the database using the user's ID.
	 * @param req - The request object containing the user's ID.
	 * @returns A Promise that resolves to the user's profile information or null if the user is not found.
	 * @throws Will throw an error if the JWT token is invalid or expired.
	 */
	@UseGuards(JWTAuthGuard,)
	@Get(UserRoutes.ME,)
	public async me(
		@Req() req: AuthRequest,
	): Promise<TClientRes> {
		return this.userService.me(req,)
	}

	@Patch(UserRoutes.RESET_PASSWORD,)
	@ApiBody({
		type: ChangePasswordDto,
	},)
	public async resetPassword(
		@Body() body: ChangePasswordDto,
	): Promise<void> {
		return this.userService.resetPassword(body,)
	}

	@Patch(UserRoutes.FORGOT_PASSWORD,)
	@ApiBody({
		type:        ForgotPasswordDto,
	},)
	public async forgotPassword(
		@Body() body: ForgotPasswordDto,
	): Promise<void> {
		return this.userService.forgotPassword(body.email,)
	}
}
