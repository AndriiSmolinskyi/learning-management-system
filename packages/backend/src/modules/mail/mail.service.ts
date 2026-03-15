import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import { ConfigService, } from '@nestjs/config'
import formData from 'form-data'
import Mailgun from 'mailgun.js'
import type { Interfaces, MailgunClientOptions, } from 'mailgun.js'
import { v4 as uuid4, } from 'uuid'
import { PrismaService, } from 'nestjs-prisma'
import * as generatePassword from 'generate-password'
import * as bcrypt from 'bcrypt'
@Injectable()
export class MailService {
	private readonly client: Interfaces.IMailgunClient

	private readonly senderAddress: string

	private readonly domainAddress: string

	constructor(
		private readonly configService: ConfigService,

	) {
		const mailgun = new Mailgun(formData,)
		const clientOptions: MailgunClientOptions = {
			username: 'api',
			// key:      this.configService.getOrThrow<string>('MAILGUN_API_KEY',),
			// url:      'https://api.eu.mailgun.net',
			key:      this.configService.getOrThrow<string>('MAILGUN_API_KEY',),
			url:      this.configService.getOrThrow<string>('MAILGUN_BASE_URL',),
		}
		this.client = mailgun.client(clientOptions,)
		this.senderAddress = this.configService.getOrThrow<string>('MAILGUN_SENDER_ADDRESS',)
		this.domainAddress = this.configService.getOrThrow<string>('MAILGUN_DOMAIN',)
	}

	public async sendForgot({ email, token, portal, }:
		{ email: string, token: string, portal: 'ADMIN' | 'STUDENT' },): Promise<void> {
		const baseUrl = portal === 'ADMIN' ?
			this.configService.getOrThrow<string>('ADMIN_URL',) :
			this.configService.getOrThrow<string>('FRONTEND_URL',)

		const confirmationUrl = `${baseUrl}/reset-password/${token}`

		await this.client.messages.create(this.domainAddress, {
			from:    `Cross-platform LMS <${this.senderAddress}>`,
			to:      [email,],
			subject: 'Reset Password: Cross-platform LMS',
			text:    `Password:`,
			html:    `<div>
	                <h1>This is link for reset password</h1>
	                <a href="${confirmationUrl}" rel="noopener noreferrer nofollow" target="_blank">This is url for reset password ${confirmationUrl}</a>
	              </div>`,
		},)
	}
}
