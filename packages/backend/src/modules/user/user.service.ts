import 'multer'
import {
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { v4 as uuid4, } from 'uuid'

import { UserRepository, } from '../../repositories/user/user.repository'
import { CryptoService, } from '../crypto/crypto.service'
import { ClientRepository, } from '../../repositories/client/client.repository'
import { MailService, } from '../mail/mail.service'

import type { AuthRequest, } from '../auth'
import type { TClientRes, } from '../client'
import type { ChangePasswordDto, ConfirmEmailDto, } from './dto'

@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly clientRepository: ClientRepository,
		private readonly prismaService: PrismaService,
		private readonly cryptoService: CryptoService,
		private readonly mailService: MailService,
	) {}

	/**
	* 1.4
	* Confirms a user's email address using a confirmation token and optionally updates their password.
	*
	* @remarks
	* - Validates the provided token against the database.
	* - Verifies the old password before allowing confirmation.
	* - Updates the password with a new hashed one.
	* - Throws an error if the email is not found, already confirmed, or if the password is invalid.
	* - Sets `isConfirmed` to `true` and clears the token upon success.
	*
	* @param token - The unique email confirmation token from the frontend.
	* @param body - Contains the old and new password provided by the user.
	* @returns A Promise that resolves when the email is successfully confirmed and password updated.
	* @throws Will throw an exception if the token is invalid, already used, or the password is incorrect.
	*/
	public async emailConfirmation(token: string, body: ConfirmEmailDto,): Promise<void> {
		const email = await this.prismaService.email.findUnique({
			where: { token, },
		},)

		if (!email?.password) {
			throw new HttpException('Email not found', HttpStatus.NOT_FOUND,)
		}

		if (email.isConfirmed) {
			throw new HttpException('Email already confirmed', HttpStatus.BAD_REQUEST,)
		}

		const isPasswordValid = await this.cryptoService.comparePasswords(body.oldPassword, email.password,)

		if (!isPasswordValid) {
			throw new HttpException('Wrong password', HttpStatus.BAD_REQUEST,)
		}

		const hashedPassword = await this.cryptoService.hashString(body.newPassword,)

		await this.prismaService.email.update({
			where: { id: email.id, },
			data:  {
				isConfirmed: true,
				token:       null,
				password:    hashedPassword,
			},
		},)
	}

	/**
	 * 1.4
	 * Resets the password for a user identified by a valid reset token.
	 *
	 * @remarks
	 * - Finds the user’s email using the token.
	 * - Hashes the new password and updates the record.
	 * - Clears the token after successful password reset.
	 *
	 * @param token - The reset token sent to the user's email.
	 * @param newPassword - The new password to be securely stored.
	 * @returns A Promise that resolves when the password is successfully reset.
	 * @throws Will throw an error if the token is invalid.
	 */
	public async resetPassword({ token, newPassword, }: ChangePasswordDto,): Promise<void> {
		const userEmail = await this.prismaService.email.findUnique({
			where: { token, },
		},)

		if (!userEmail) {
			throw new Error('Invalid token',)
		}

		const hashedPassword = await this.cryptoService.hashString(newPassword,)

		await this.prismaService.email.update({
			where: { id: userEmail.id, },
			data:  {
				password: hashedPassword,
				token:    null,
			},
		},)
	}

	/**
	 * 1.4
	 * Initiates the forgot password flow by sending a reset link.
	 *
	 * @remarks
	 * - Generates a reset token and attaches it to the user's email record.
	 * - Sends a reset email with the token.
	 *
	 * @param email - The email address of the user requesting password reset.
	 * @returns A Promise that resolves once the reset email is sent.
	 * @throws Will throw an error if the email is not found.
	 */
	public async forgotPassword(email: string,): Promise<void> {
		const token: string = uuid4()
		const allEmails = await this.prismaService.email.findMany()
		const emailToUpdate = allEmails.find((item,) => {
			return this.cryptoService.decryptString(item.email,) === email
		},)
		if (!emailToUpdate) {
			throw new HttpException('Email not found!', HttpStatus.NOT_FOUND,)
		}
		await this.prismaService.email.update({
			where: { email: emailToUpdate.email, },
			data:  {
				token,
			},
		},)

		await this.mailService.sendForgot({
			email,
			token,
		},)
	}

	/**
	 * 1.2 / 1.3 / 1.4
	 * Retrieves the currently authenticated client based on the request.
	 *
	 * @remarks
	 * - Uses the authenticated clientId from the request token.
	 * - Throws an exception if the client is not found.
	 *
	 * @param req - The authenticated request containing clientId.
	 * @returns A Promise that resolves to the client's full information.
	 * @throws Will throw if the clientId is missing or not found in the DB.
	 */
	public async me(req: AuthRequest,): Promise<TClientRes> {
		if (!req.clientId) {
			throw new HttpException('Client not found', HttpStatus.NOT_FOUND,)
		}
		return this.clientRepository.findClientById(req.clientId,)
	}
}
