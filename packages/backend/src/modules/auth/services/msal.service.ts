import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import type { AxiosResponse, } from 'axios'
import axios from 'axios'
import type { Response, } from 'express'
import { ConfigService, } from '@nestjs/config'

import { JWTService, } from '../../jwt/jwt.service'
import { setAdminAuthCookies, } from '../../../shared/utils'
import { text, } from '../../../shared/text'

import type { SignInDto, } from '../dto'
import type { AuthCheckReturn, MsGroups, MsUser, } from '../auth.types'
import { Roles, } from '../../../shared/types'
import type { GenerateTokensPairProps, } from '../../../modules/jwt/jwt.types'

@Injectable()
export class MsalService {
	private readonly module = 'v1.0/me'

	private readonly baseUrl: string

	constructor(
		private readonly jwtService: JWTService,
		private readonly configService: ConfigService,
	) {
		this.baseUrl = this.configService.getOrThrow<string>('MSAL_GRAPH_API_ENDPOINT',)
	}

	/**
	 * 1.2/1.3
	 * Handles user sign-in using Microsoft Graph API.
	 * @param res - The Express response object to set cookies.
	 * @param body - The sign-in data containing the access token.
	 * @returns A promise that resolves to an object indicating whether the sign-in was successful.
	 * @throws HttpException - If the user does not exist in the system.
	 */
	public async signIn(res: Response, body: SignInDto,): Promise<AuthCheckReturn> {
		try {
			const  {data: userData,}: AxiosResponse<MsUser> = await axios.get(`${this.baseUrl}/${this.module}`, {
				headers: {
					Authorization: `Bearer ${body.accessToken}`,
				},
			},)
			const {data: groupsData,}: AxiosResponse<MsGroups> = await axios.get(`${this.baseUrl}/${this.module}/memberOf`, {
				headers: {
					Authorization: `Bearer ${body.accessToken}`,
				},
			},)
			const roles = groupsData.value ?
				groupsData.value
					.map((group,) => {
						return group.id
					},)
					.filter((group,) => {
						return Object.values(Roles,).includes(group,)
					},) :
				[]

			if (!userData.id || !roles.length) {
				return {
					auth: false,
				}
			}
			this.authorizeUser({ roles, }, res,)
			return {
				auth: true,
			}
		} catch (error) {
			throw new HttpException(text.userNotExist, HttpStatus.NOT_FOUND,)
		}
	}

	/**
	 * 1.2/1.3
	 * Authorizes a user by generating JWT tokens and setting authentication cookies.
	 * @param props - An object containing the user's ID and roles.
	 * @param props.id - The user's unique identifier.
	 * @param props.roles - An array of roles assigned to the user.
	 * @param res - The Express response object to set cookies.
	 * @remarks
	 * This function is responsible for authorizing a user by generating JWT tokens and setting authentication cookies.
	 * It uses the provided user ID and roles to generate tokens using the JWT service.
	 * The generated tokens are then used to set authentication cookies in the provided Express response object.
	 */
	private authorizeUser({ roles, }: GenerateTokensPairProps, res: Response,): void {
		const tokens = this.jwtService.generateTokensPair({ roles, },)

		setAdminAuthCookies(res, tokens.token, tokens.refreshToken,)
	}
}
