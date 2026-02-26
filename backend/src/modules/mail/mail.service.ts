import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import { ConfigService, } from '@nestjs/config'
import formData from 'form-data'
import Mailgun from 'mailgun.js'
import type { Interfaces, MailgunClientOptions, } from 'mailgun.js'
import { v4 as uuid4, } from 'uuid'
import { PrismaService, } from 'nestjs-prisma'
import * as generatePassword from 'generate-password'
import * as bcrypt from 'bcrypt'

import { ClientRepository, } from '../../repositories/client/client.repository'
import { sendEmailConfirmationTemplate, } from '../../shared/utils/mail-templates'
import { CryptoService, } from '../crypto/crypto.service'
import { RedisCacheService, } from '../redis-cache/redis-cache.service'
import { ClientRoutes, } from '../client/client.constants'

@Injectable()
export class MailService {
	private readonly client: Interfaces.IMailgunClient

	private readonly senderAddress: string

	private readonly domainAddress: string

	constructor(
		private readonly configService: ConfigService,
		private readonly clientRepository: ClientRepository,
		private readonly prismaService: PrismaService,
		private readonly cryptoService: CryptoService,
		private readonly cacheService: RedisCacheService,

	) {
		const mailgun = new Mailgun(formData,)
		const clientOptions: MailgunClientOptions = {
			username: 'api',
			key:      this.configService.getOrThrow<string>('MAILGUN_API_KEY',),
			url:      'https://api.eu.mailgun.net',
		}
		this.client = mailgun.client(clientOptions,)
		this.senderAddress = this.configService.getOrThrow<string>('MAILGUN_SENDER_ADDRESS',)
		this.domainAddress = this.configService.getOrThrow<string>('MAILGUN_DOMAIN',)
	}

	/**
	 * 1.4
	 * Sends a confirmation email to the provided recipient with a password and a confirmation URL.
	 * @param props - The properties required to send the confirmation email.
	 * @param props.to - The email address of the recipient.
	 * @param props.password - The password to be included in the email.
	 * @param props.token - The token to be included in the confirmation URL.
	 * @returns A Promise that resolves when the email is sent successfully.
	 */
	public async sendConfirmation(
		clientId: string,
	): Promise<void> {
		const client = await this.clientRepository.findClientById(clientId,)
		const [email,] = client.emails

		const token: string = uuid4()
		const password = generatePassword.generate({
			length:    12,
			numbers:   true,
			uppercase: true,
			strict:    true,
		},)
		if (!email || !token || !password) {
			throw new Error(`Client with ID ${clientId} is missing required information.`,)
		}
		const hashedPassword = await bcrypt.hash(password, 10,)
		const allEmails = await this.prismaService.email.findMany({
			where: {
				clientId: client.id,
			},
		},)
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
				password:        hashedPassword,
				isConfirmed:     false,
				twoFactorSecret: null,
			},
		},)
		const confirmationUrl = `${this.configService.getOrThrow<string>('FRONTEND_URL',)}/auth/email-confirmation/${token}`
		const content = sendEmailConfirmationTemplate({email, password, name: client.firstName, link: confirmationUrl,},)
		try {
			await this.client.messages.create(this.domainAddress, {
				from:    `MML Analytics <${this.senderAddress}>`,
				to:      [email,],
				text:    `Password: ${password}`,
				...content,
			},)
			await this.cacheService.deleteByUrl([
				`/${ClientRoutes.MODULE}/${client.id}`,
			],)
		} catch (error) {
			throw new HttpException('Mailgun error', HttpStatus.INTERNAL_SERVER_ERROR,)
		}
	}

	/**
 * Sends a password reset email to the specified user.
 *
 * @remarks
 * This method constructs a password reset URL containing a unique token
 * and sends it to the user's email. The email includes a link that directs
 * the user to the reset password page on the frontend.
 *
 * @param props - An object containing the email and reset token.
 * @param props.email - The recipient's email address.
 * @param props.token - The unique token used for password reset.
 *
 * @returns A Promise that resolves once the email has been successfully sent.
 */
	public async sendForgot({ email, token,}:{email: string,token: string},): Promise<void> {
		const confirmationUrl = `${this.configService.getOrThrow<string>('FRONTEND_URL',)}/reset-password/${token}`

		await this.client.messages.create(this.domainAddress, {
			from:    `MML Analytics <${this.senderAddress}>`,
			to:      [email,],
			subject: 'Reset Password: MML Analytics',
			text:    `Password:`,
			html:    `<div>
	                <h1>This is link for reset password</h1>
	                <a href="${confirmationUrl}" rel="noopener noreferrer nofollow" target="_blank">This is url for reset password</a>
	              </div>`,
		},)
	}
}
