import { PrismaService, } from 'nestjs-prisma'
import { Injectable, } from '@nestjs/common'
import type { Prisma, } from '@prisma/client'

import type { CreatePhonesProps, } from './phone.types'
import { CryptoService, } from '../../modules/crypto/crypto.service'

@Injectable()
export class PhoneRepository {
	constructor(
    private readonly prismaService: PrismaService,
    private readonly cryptoService: CryptoService,
	) {}

	/**
 	* 1.5.2
 	* Handles creation of phone records associated with a specific client.
 	* @remarks
 	* This service method is used to add multiple phone numbers for a given client within a transactional context. It ensures the creation of all phone records in a batch process to maintain data consistency and integrity.
 	*
 	* @param {CreatePhonesProps} params - The properties required for creating phone records, including the transaction object, client ID, and a list of phone numbers.
 	* @returns A `Promise` that resolves once the phone records have been successfully created.
 	* @throws Will throw an error if there is a problem with the database query or any other issue during the operation.
 	*/
	public async createPhonesWithClientId({tx, clientId, contacts,}: CreatePhonesProps,): Promise<void> {
		await tx.phone.createMany({
			data: contacts.map((number,) => {
				return {clientId, number: this.cryptoService.encryptString(number,),}
			},),
		},)
	}

	/**
	 * 2.1.3
	 * Updates the client's phone contacts in the database.
	 * This function compares the existing client contacts with the new contacts provided and performs the necessary
	 * database operations to update the client's phone numbers. It deletes any contacts that are no longer present
	 * in the new list and adds any new contacts.
	 * @param tx - The Prisma transaction client to use for database operations.
	 * @param clientId - The ID of the client whose contacts are being updated.
	 * @param contacts - An array of strings representing the new phone contacts for the client.
	 * @returns A Promise that resolves to void when the update operation is complete.
	 */
	public async updateClientContacts(
		tx: Prisma.TransactionClient,
		clientId: string,
		contacts: Array<string>,
	): Promise<void> {
		const existingContacts = await tx.phone.findMany({
			where:  { clientId, },
			select: { number: true, },
		},)
		const existingContactSet = new Set(existingContacts.map((c,) => {
			return c.number
		},),)
		const newContactSet = new Set(contacts,)
		const contactsToDelete = existingContacts
			.filter((c,) => {
				return !newContactSet.has(c.number,)
			},)
			.map((c,) => {
				return c.number
			},)
		const contactsToAdd = contacts.filter((c,) => {
			return !existingContactSet.has(c,)
		},)
		if (contactsToDelete.length > 0) {
			await tx.phone.deleteMany({
				where: {
					clientId,
					number: { in: contactsToDelete, },
				},
			},)
		}
		if (contactsToAdd.length > 0) {
			await tx.phone.createMany({
				data: contactsToAdd.map((number,) => {
					return {
						clientId,
						number: this.cryptoService.encryptString(number,),
					}
				},),
			},)
		}
	}
}
