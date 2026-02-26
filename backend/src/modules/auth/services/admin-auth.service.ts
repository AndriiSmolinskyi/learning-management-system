import { Injectable, } from '@nestjs/common'
import type { Response, } from 'express'

import {
	clearAdminAuthCookies,
	clearClientAuthCookies,
} from '../../../shared/utils'

import type {
	AuthCheckReturn,
	AuthRequest,
} from '../auth.types'

@Injectable()
export class AdminAuthService {
	constructor() {}

	/**
	* 1.2/1.3
	 * Logs out the currently authenticated admin user.
 * @remarks
 * Clears both admin and client authentication cookies from the response.
 * Typically used when an admin ends their session or switches context.
 *
 * @param res - Express response object used to clear cookies.
 * @returns A void Promise indicating successful logout.
 */
	public async logout(res: Response,): Promise<void> {
		clearAdminAuthCookies(res,)
		clearClientAuthCookies(res,)
	}

	/**
	* 1.2/1.3
	 * Checks if the current admin user is authenticated.
 * @remarks
 * Extracts the authentication state from the request and returns it.
 * Commonly used to verify session validity.
 *
 * @param req - Request object containing the admin authentication context.
 * @returns An object indicating the current authentication status.
 */
	public async check(req: AuthRequest,): Promise<AuthCheckReturn> {
		return {
			auth: req.auth,
		}
	}
}
