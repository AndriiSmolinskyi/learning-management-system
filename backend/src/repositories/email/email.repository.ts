import { PrismaService, } from 'nestjs-prisma'
import { Injectable, } from '@nestjs/common'
import type { Email, Prisma, } from '@prisma/client'

import type { CreateEmailsProps, UpdateEmailProps, } from './email.types'
import { CryptoService, } from '../../modules/crypto/crypto.service'

@Injectable()
export class EmailRepository {
	constructor(
    private readonly prismaService: PrismaService,
    private readonly cryptoService: CryptoService,
	) {}

	/**
	  * 1.5.2
     * Creates multiple emails for a specific client within a transactional context.
     * @param {CreateEmailsProps} params - The client ID and list of emails to create.
     * @returns A `Promise` that resolves once the emails have been successfully created.
     * @throws Will throw an error if there is a problem with the database query.
     */
	public async createEmailsWithClientId({tx, clientId, emails,}: CreateEmailsProps,): Promise<void> {
		await tx.email.createMany({
			data: emails.map((email,) => {
				return {
					clientId,
					email: this.cryptoService.encryptString(email,),
				}
			},),
		},)
	}

	/**
	  * 2.1.3
     * Updates an existing email record based on specific conditions.
     * @param {UpdateEmailProps} params - The criteria for selecting the email and the update data.
     * @returns A `Promise` that resolves to the updated email record.
     * @throws Will throw an error if there is a problem with the database query.
     */
	public async updateEmail({tx, where, data,}: UpdateEmailProps,):Promise<Email> {
		return tx.email.update({
			where,
			data: {
				...data,
				...(data.email && typeof data.email === 'string' ?
					{email: this.cryptoService.encryptString(data.email,),} :
					{}),
				...(data.password && typeof data.password === 'string' ?
					{email: this.cryptoService.encryptString(data.password,),} :
					{}),
			},
		},)
	}

	/**
	 *  * 2.1.3
	 * Updates the email addresses associated with a client in the database.
	 * This function compares the existing email addresses with the provided ones and performs the necessary database operations
	 * to ensure that the client's email addresses are up-to-date. It deletes any email addresses that are no longer present and
	 * adds any new email addresses.
	 * @param tx - The Prisma transaction client to use for database operations.
	 * @param clientId - The ID of the client whose email addresses are being updated.
	 * @param emails - An array of email addresses to update for the client.
	 * @returns A Promise that resolves to `void` when the update operation is complete.
	 */
	public async updateClientEmails(
		tx: Prisma.TransactionClient,
		clientId: string,
		emails: Array<string>,
	): Promise<void> {
		const existingEmails = await tx.email.findMany({
			where:  { clientId, },
			select: { email: true, },
		},)

		const existingEmailSet = new Set(existingEmails.map((e,) => {
			return e.email
		},),)
		const newEmailSet = new Set(emails,)

		const emailsToDelete = existingEmails
			.filter((e,) => {
				return !newEmailSet.has(e.email,)
			},)
			.map((e,) => {
				return e.email
			},)

		const emailsToAdd = emails.filter((e,) => {
			return !existingEmailSet.has(e,)
		},)

		if (emailsToDelete.length > 0) {
			await tx.email.deleteMany({
				where: {
					clientId,
					email: { in: emailsToDelete, },
				},
			},)
		}

		if (emailsToAdd.length > 0) {
			await tx.email.createMany({
				data: emailsToAdd.map((email,) => {
					return {
						clientId,
						email: this.cryptoService.encryptString(email,),
					}
				},),
			},)
		}
		const allEmails = await tx.email.findMany({
			where: {
				clientId,
			},
			include: {
				user: true,
			},
		},)

		const userEmail = allEmails.find((item,) => {
			return this.cryptoService.decryptString(item.email,) === emails[0]
		},
		)
		if (userEmail && !userEmail.user) {
			await tx.user.create({
				data: {
					emailId: userEmail.id,
					clientId,
				},
			},)
			const secondaryEmailIds = await tx.email.findMany({
				where: {
					email: {
						in: emails.slice(1,),
					},
				},
				select: {
					id: true,
				},
			},)
			if (secondaryEmailIds.length > 0) {
				await tx.user.deleteMany({
					where: {
						emailId: {
							in: secondaryEmailIds.map((email,) => {
								return email.id
							},),
						},
					},
				},)
			}
		}
	}
}
