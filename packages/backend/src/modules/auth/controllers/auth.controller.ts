import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Query,
	Req,
	Res,
} from '@nestjs/common'
import { ApiBody, ApiTags, } from '@nestjs/swagger'
import { Request, Response, } from 'express'

import { Public, } from '../../../shared/auth/public.decorator'
import { AuthService, } from '../services/auth.service'
import { LoginDto, } from '../dto/login.dto'
import { CheckDto, } from '../dto/check.dto'

import type { AuthCheckReturn, LoginReturn, } from '../auth.types'
import { AuthRoutes, } from '../auth.constants'

@Controller(AuthRoutes.MODULE,)
@ApiTags('Auth',)
export class AuthController {
	constructor(
		private readonly authService: AuthService,
	) {}

	@Public()
	@Post(AuthRoutes.LOGIN,)
	@HttpCode(HttpStatus.OK,)
	@ApiBody({
		description: 'Login with email/password + portal',
		type:        LoginDto,
	},)
	public async login(
		@Body() body: LoginDto,
		@Res({ passthrough: true, },) res: Response,
	): Promise<LoginReturn> {
		return this.authService.login(res, body,)
	}

	@Public()
	@Get(AuthRoutes.CHECK,)
	public async check(
	@Req() req: Request,
	@Res({ passthrough: true, },) res: Response,
	@Query() query: CheckDto,
	): Promise<AuthCheckReturn> {
		return this.authService.check(res, req, query.portal,)
	}
}