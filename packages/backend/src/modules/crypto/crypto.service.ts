/* eslint-disable max-lines */
/* eslint-disable complexity */
// import type { OnModuleInit,} from '@nestjs/common'
// import { isMainThread, } from 'worker_threads'
import {  Injectable, } from '@nestjs/common'
import {  PrismaService, } from 'nestjs-prisma'

import * as bcrypt from 'bcrypt'
import * as generatePassword from 'generate-password'
import * as crypto from 'crypto'

import {
	SALT_ROUNDS,
	DEFAULT_PASSWORD_LENGTH,
} from './crypto.constants'

@Injectable()
export class CryptoService {
// export class CryptoService implements OnModuleInit {
	constructor(
		private readonly prismaService: PrismaService,
	) { }

	private readonly algorithm = 'aes-256-cbc'

	private readonly secretKey = Buffer.from(process.env['SECRET_ENCRYPTION_KEY'], 'base64',)

	/**
   * Hashes a plain text string using bcrypt.
   * @param password - The string to hash (usually a password).
   * @returns The hashed string.
   */
	public async hashString(password: string,): Promise<string> {
		return bcrypt.hash(password, SALT_ROUNDS,)
	}

	/**
   * Generates a strong random password.
   * @returns A generated password containing uppercase, lowercase letters, and numbers.
   */
	public generatePassword(): string {
		return generatePassword.generate({
			length:    DEFAULT_PASSWORD_LENGTH,
			numbers:   true,
			uppercase: true,
			lowercase: true,
		},)
	}

	/**
   * Compares a plain text password with a hashed password using bcrypt.
   * @param plainPassword - The plain text password to compare.
   * @param hashedPassword - The hashed password to compare against.
   * @returns True if the passwords match, false otherwise.
   */
	public async comparePasswords(plainPassword: string, hashedPassword: string,): Promise<boolean> {
		return bcrypt.compare(plainPassword, hashedPassword,)
	}

	/**
   * Encrypts a string using AES-256-CBC.
   * @param plainText - The text to encrypt.
   * @returns The encrypted string in base64 format, including IV.
   */
	public encryptString(plainText: string,): string {
		if (plainText.includes(':',) && Buffer.from(plainText.split(':',)[0], 'base64',).length === 16) {
			return plainText
		}
		const iv = crypto.randomBytes(16,)
		const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv,)
		let encrypted = cipher.update(plainText, 'utf8', 'base64',)
		encrypted = encrypted + cipher.final('base64',)
		const ivBase64 = iv.toString('base64',)
		return `${ivBase64}:${encrypted}`
	}

	/**
   * Decrypts a previously encrypted string using AES-256-CBC.
   * @param encryptedText - The base64 string containing IV and encrypted data, separated by ':'.
   * @returns The decrypted plain text.
   */
	public decryptString(encryptedText: string,): string {
		const parts = encryptedText.split(':',)
		if (!encryptedText.includes(':',) || Buffer.from(encryptedText.split(':',)[0], 'base64',).length !== 16) {
			return encryptedText
		}
		const [ivBase64, encryptedData,] = parts
		const iv = Buffer.from(ivBase64, 'base64',)
		const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv,)
		let decrypted = decipher.update(encryptedData, 'base64', 'utf8',)
		decrypted = decrypted + decipher.final('utf8',)
		return decrypted
	}

	/**
 		* Encrypts a binary file (Buffer) using AES-256-CBC.
 		* The IV (initialization vector) is prepended to the encrypted data.
 		* @param buffer - The raw binary content of the file to encrypt.
 		* @returns A Buffer containing the IV followed by the encrypted data.
 	*/
	public encryptDocument(buffer: Buffer,): Buffer {
		const iv = crypto.randomBytes(16,)
		const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv,)
		const encrypted = Buffer.concat([cipher.update(buffer,), cipher.final(),],)
		return Buffer.concat([iv, encrypted,],)
	}

	/**
 		* Decrypts a previously encrypted binary file using AES-256-CBC.
 		* Expects the input Buffer to contain the IV prepended to the encrypted data.
 		* @param encryptedBuffer - A Buffer containing the IV and encrypted data.
 		* @returns A Buffer with the original, decrypted binary file content.
 	*/
	public decryptDocument(encryptedBuffer: Buffer,): Buffer {
		const iv = Buffer.from(encryptedBuffer.subarray(0, 16,),)
		const encrypted = Buffer.from(encryptedBuffer.subarray(16,),)
		const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv,)
		return Buffer.concat([decipher.update(encrypted,), decipher.final(),],)
	}

	/**
   * Generates a strong random password.
   * @returns A generated password containing uppercase, lowercase letters, and numbers.
   */
	public generateRandomWord(wordLength?: number,): string {
		const randomInteger = wordLength ?? Math.floor(Math.random() * (12 - 4 + 1),) + 4
		if (randomInteger < 1) {
			throw new Error('Word length must be at least 1',)
		}
		return generatePassword.generate({
			length:    randomInteger,
			numbers:   false,
			uppercase: true,
			lowercase: true,
		},)
	}

	/**
 * Generates a random number with a random length between 8 and 12 digits.
 * @returns A string containing the generated random number.
 */
	public generateRandomNumber(numberLength?: number,): string {
		const length = numberLength ?? Math.floor(Math.random() * (12 - 8 + 1),) + 8
		if (length < 1) {
			throw new Error('Number length must be at least 1',)
		}
		let result = Math.floor((Math.random() * 9) + 1,).toString()
		while (result.length < length) {
			result = result + Math.floor(Math.random() * 10,).toString()
		}
		return result
	}

	/**
 		* CR-139
 	*/
	private async encryptProdDatabaseForCR139(): Promise<void> {
		const accounts = await this.prismaService.account.findMany()
		if (accounts.length > 0) {
			await Promise.all(accounts.map(async(account,) => {
				return this.prismaService.account.update({
					where: { id: account.id, },
					data:  {
						accountName:   this.encryptString(account.accountName,),
					},
				},)
			},),)
		}

		const banks = await this.prismaService.bank.findMany()
		if (banks.length > 0) {
			await Promise.all(banks.map(async(bank,) => {
				return this.prismaService.bank.update({
					where: { id: bank.id, },
					data:  {
						firstName:  bank.firstName ?
							this.encryptString(bank.firstName,) :
							null,
						lastName:   bank.lastName ?
							this.encryptString(bank.lastName,) :
							null,
						email:      bank.email ?
							this.encryptString(bank.email,) :
							null,
						branchName:     this.encryptString(bank.branchName,),
						country:     this.encryptString(bank.country,),
					},
				},)
			},),)
		}
		const budgetPlans = await this.prismaService.budgetPlan.findMany()
		if (budgetPlans.length > 0) {
			await Promise.all(budgetPlans.map(async(budgetPlan,) => {
				return this.prismaService.budgetPlan.update({
					where: { id: budgetPlan.id, },
					data:  {
						name: this.encryptString(budgetPlan.name,),
					},
				},)
			},),)
		}
		const budgetDraftPlans = await this.prismaService.budgetPlanDraft.findMany()
		if (budgetDraftPlans.length > 0) {
			await Promise.all(budgetDraftPlans.map(async(budgetPlanDraft,) => {
				return this.prismaService.budgetPlanDraft.update({
					where: { id: budgetPlanDraft.id, },
					data:  {
						name: budgetPlanDraft.name ?
							this.encryptString(budgetPlanDraft.name,) :
							null,

					},
				},)
			},),)
		}

		const clients = await this.prismaService.client.findMany()
		if (clients.length > 0) {
			await Promise.all(clients.map(async(client,) => {
				return this.prismaService.client.update({
					where: { id: client.id, },
					data:  {
						firstName:      this.encryptString(client.firstName,),
						lastName:       this.encryptString(client.lastName,),
						residence:      this.encryptString(client.residence,),
						country:        this.encryptString(client.country,),
						region:         this.encryptString(client.region,),
						city:           this.encryptString(client.city,),
						streetAddress:  this.encryptString(client.streetAddress,),
						buildingNumber: this.encryptString(client.buildingNumber,),
						postalCode:     this.encryptString(client.postalCode,),
						comment:        client.comment ?
							this.encryptString(client.comment,) :
							null,
					},
				},)
			},),)
		}

		const clientDrafts = await this.prismaService.clientDraft.findMany()
		if (clientDrafts.length > 0) {
			await Promise.all(clientDrafts.map(async(clientDraft,) => {
				return this.prismaService.clientDraft.update({
					where: { id: clientDraft.id, },
					data:  {
						firstName:      clientDraft.firstName ?
							this.encryptString(clientDraft.firstName,) :
							null,
						lastName:       clientDraft.lastName ?
							this.encryptString(clientDraft.lastName,) :
							null,
						residence:      clientDraft.residence ?
							this.encryptString(clientDraft.residence,) :
							null,
						country:        clientDraft.country  ?
							this.encryptString(clientDraft.country,) :
							null,
						region:         clientDraft.region ?
							this.encryptString(clientDraft.region,) :
							null,
						city:           clientDraft.city ?
							this.encryptString(clientDraft.city,) :
							null,
						streetAddress:  clientDraft.streetAddress ?
							this.encryptString(clientDraft.streetAddress,) :
							null,
						buildingNumber: clientDraft.buildingNumber ?
							this.encryptString(clientDraft.buildingNumber,) :
							null,
						postalCode:    clientDraft.postalCode ?
							this.encryptString(clientDraft.postalCode,) :
							null,
					},
				},)
			},),)
		}

		const documents = await this.prismaService.document.findMany()
		if (documents.length > 0) {
			await Promise.all(documents.map(async(document,) => {
				return this.prismaService.document.update({
					where: { id: document.id, },
					data:  {
						name: this.encryptString(document.name,),
					},
				},)
			},),)
		}

		const emails = await this.prismaService.email.findMany()
		if (emails.length > 0) {
			await Promise.all(emails.map(async(email,) => {
				return this.prismaService.email.update({
					where: { id: email.id, },
					data:  {
						email:    this.encryptString(email.email,),
						password: email.password ?
							this.encryptString(email.password,) :
							null,
					},
				},)
			},),)
		}

		const phones = await this.prismaService.phone.findMany()
		if (phones.length > 0) {
			await Promise.all(phones.map(async(phone,) => {
				return this.prismaService.phone.update({
					where: { id: phone.id, },
					data:  {
						number: this.encryptString(phone.number,),
					},
				},)
			},),)
		}

		const entities = await this.prismaService.entity.findMany()
		if (entities.length > 0) {
			await Promise.all(entities.map(async(entity,) => {
				return this.prismaService.entity.update({
					where: { id: entity.id, },
					data:  {
						name:                    this.encryptString(entity.name,),
						country:                    this.encryptString(entity.country,),
						authorizedSignatoryName: this.encryptString(entity.authorizedSignatoryName,),
						firstName:               entity.firstName  ?
							this.encryptString(entity.firstName,) :
							null,
						lastName:               entity.lastName ?
							this.encryptString(entity.lastName,) :
							null,
						email:                   entity.email ?
							this.encryptString(entity.email,) :
							null,
					},
				},)
			},),)
		}

		const portfolios = await this.prismaService.portfolio.findMany()
		if (portfolios.length > 0) {
			await Promise.all(portfolios.map(async(portfolio,) => {
				return this.prismaService.portfolio.update({
					where: { id: portfolio.id, },
					data:  {
						name:        this.encryptString(portfolio.name,),
						taxResident: portfolio.taxResident ?
							this.encryptString(portfolio.taxResident,) :
							null,
						resident:       portfolio.resident  ?
							this.encryptString(portfolio.resident,) :
							null,
					},
				},)
			},),)
		}

		const portfolioDrafts = await this.prismaService.portfolioDraft.findMany()
		if (portfolioDrafts.length > 0) {
			await Promise.all(portfolioDrafts.map(async(portfolioDraft,) => {
				return this.prismaService.portfolioDraft.update({
					where: { id: portfolioDraft.id, },
					data:  {
						name:        this.encryptString(portfolioDraft.name,),
						taxResident: portfolioDraft.taxResident ?
							this.encryptString(portfolioDraft.taxResident,) :
							null,
						resident:       portfolioDraft.resident  ?
							this.encryptString(portfolioDraft.resident,) :
							null,
					},
				},)
			},),)
		}

		const transactions = await this.prismaService.transaction.findMany()
		if (transactions.length > 0) {
			await Promise.all(transactions.map(async(transaction,) => {
				return this.prismaService.transaction.update({
					where: { id: transaction.id, },
					data:  {
						serviceProvider:    transaction.serviceProvider    ?
							this.encryptString(transaction.serviceProvider,) :
							null,
						comment:         transaction.comment ?
							this.encryptString(transaction.comment,) :
							null,
					},
				},)
			},),)
		}

		const transactionDrafts = await this.prismaService.transactionDraft.findMany()
		if (transactionDrafts.length > 0) {
			await Promise.all(transactionDrafts.map(async(transactionDraft,) => {
				return this.prismaService.transactionDraft.update({
					where: { id: transactionDraft.id, },
					data:  {
						serviceProvider:    transactionDraft.serviceProvider    ?
							this.encryptString(transactionDraft.serviceProvider,) :
							null,
						comment:         transactionDraft.comment ?
							this.encryptString(transactionDraft.comment,) :
							null,
					},
				},)
			},),)
		}

		const serviceProviders = await this.prismaService.serviceProvidersList.findMany()
		if (serviceProviders.length > 0) {
			await Promise.all(serviceProviders.map(async(serviceProvider,) => {
				return this.prismaService.serviceProvidersList.update({
					where: { id: serviceProvider.id, },
					data:  {
						name:   this.encryptString(serviceProvider.name,),
					},
				},)
			},),)
		}
	}

	// WARNING: Do not enable this in production. This method mutates sensitive db data.
	// public async onModuleInit(): Promise<void> {
	// 	if (process.env.NODE_ENV === 'development') {
	// 		await this.encryptProdDatabaseForCR139()
	// 		console.log('DB ENCRYPTED',)
	// 	}
	// }

	private async encryptStagingDatabase(): Promise<void> {
		await this.prismaService.$executeRaw`DELETE from "Document"`

		const clients = await this.prismaService.client.findMany()
		if (clients.length > 0) {
			await Promise.all(clients.map(async(client,) => {
				return this.prismaService.client.update({
					where: { id: client.id, },
					data:  {
						firstName:      this.generateRandomWord(),
						lastName:       this.generateRandomWord(),
						streetAddress:  this.generateRandomWord(),
						buildingNumber: this.generateRandomNumber(2,),
						postalCode:     this.generateRandomNumber(5,),
						comment:        null,
					},
				},)
			},),)
		}

		const clientDrafts = await this.prismaService.clientDraft.findMany()
		if (clientDrafts.length > 0) {
			await Promise.all(clientDrafts.map(async(clientDraft,) => {
				return this.prismaService.clientDraft.update({
					where: { id: clientDraft.id, },
					data:  {
						firstName:      this.generateRandomWord(),
						lastName:       this.generateRandomWord(),
						streetAddress:  this.generateRandomWord(),
						buildingNumber: this.generateRandomNumber(2,),
						postalCode:     this.generateRandomNumber(5,),
					},
				},)
			},),)
		}

		const portfolios = await this.prismaService.portfolio.findMany()
		if (portfolios.length > 0) {
			await Promise.all(portfolios.map(async(portfolio,) => {
				return this.prismaService.portfolio.update({
					where: { id: portfolio.id, },
					data:  {
						name: this.generateRandomWord(),
					},
				},)
			},),)
		}

		const portfolioDrafts = await this.prismaService.portfolioDraft.findMany()
		if (portfolioDrafts.length > 0) {
			await Promise.all(portfolioDrafts.map(async(portfolioDraft,) => {
				return this.prismaService.portfolioDraft.update({
					where: { id: portfolioDraft.id, },
					data:  {
						name: this.generateRandomWord(),
					},
				},)
			},),)
		}

		const emails = await this.prismaService.email.findMany()
		if (emails.length > 0) {
			await Promise.all(emails.map(async(email,) => {
				return this.prismaService.email.update({
					where: { id: email.id, },
					data:  {
						email: `${this.generateRandomWord()}@gmail.com`,
					},
				},)
			},),)
		}

		const phones = await this.prismaService.phone.findMany()
		if (phones.length > 0) {
			await Promise.all(phones.map(async(phone,) => {
				return this.prismaService.phone.update({
					where: { id: phone.id, },
					data:  {
						number: `+${this.generateRandomNumber()}`,
					},
				},)
			},),)
		}

		const accounts = await this.prismaService.account.findMany()
		if (accounts.length > 0) {
			await Promise.all(accounts.map(async(account,) => {
				return this.prismaService.account.update({
					where: { id: account.id, },
					data:  {
						accountName:   this.generateRandomWord(),
						description:   null,
						iban:          null,
						accountNumber: null,
						comment:       null,
					},
				},)
			},),)
		}

		const banks = await this.prismaService.bank.findMany()
		if (banks.length > 0) {
			await Promise.all(banks.map(async(bank,) => {
				return this.prismaService.bank.update({
					where: { id: bank.id, },
					data:  {
						firstName: this.generateRandomWord(),
						lastName:  this.generateRandomWord(),
						email:     `${this.generateRandomWord()}@gmail.com`,
					},
				},)
			},),)
		}

		const entities = await this.prismaService.entity.findMany()
		if (entities.length > 0) {
			await Promise.all(entities.map(async(entity,) => {
				return this.prismaService.entity.update({
					where: { id: entity.id, },
					data:  {
						name:                    this.generateRandomWord(),
						authorizedSignatoryName: this.generateRandomWord(),
						firstName:               this.generateRandomWord(),
						lastName:                this.generateRandomWord(),
						email:                   `${this.generateRandomWord()}@gmail.com`,
					},
				},)
			},),)
		}

		const budgetPlans = await this.prismaService.budgetPlan.findMany()
		if (budgetPlans.length > 0) {
			await Promise.all(budgetPlans.map(async(budgetPlan,) => {
				return this.prismaService.budgetPlan.update({
					where: { id: budgetPlan.id, },
					data:  {
						name: this.generateRandomWord(),
					},
				},)
			},),)
		}
	}

	// WARNING: Do not enable this in production. This method mutates sensitive staging data.
	// public async onModuleInit(): Promise<void> {
	// 	if (!isMainThread) {
	// 		return
	// 	}
	// 	if (process.env.NODE_ENV === 'development') {
	// 		await this.encryptStagingDatabase()
	// 		console.log('STAGING ENCRYPTED',)
	// 	}
	// }
}
