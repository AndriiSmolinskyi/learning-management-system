/* eslint-disable no-negated-condition */
/* eslint-disable max-lines */
/* eslint-disable complexity */
import { PrismaService, } from 'nestjs-prisma'
import {
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common'
import {
	Prisma,} from '@prisma/client'
import type {
	ClientDraft,
} from '@prisma/client'
import type { Client, } from '@prisma/client'
import type { IFilterProps, TAsyncClientsListRes, } from '../../modules/client'
import { PhoneRepository, } from '../phone/phone.repository'
import { EmailRepository, } from '../email/email.repository'
import { text, } from '../../shared/text'

import type {
	TClientRes,
	// TClientsListRes,
	TCreateClient,
	TCreateDraft,
	TDraftsListRes,
} from '../../modules/client'
import { CryptoService, } from '../../modules/crypto/crypto.service'
import { RedisCacheService, } from '../../modules/redis-cache/redis-cache.service'
import { cacheKeysToDeleteAsset, } from '../../modules/asset/asset.constants'

@Injectable()
export class ClientRepository {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly emailRepository: EmailRepository,
		private readonly phoneRepository: PhoneRepository,
		private readonly cryptoService: CryptoService,
		private readonly cacheService: RedisCacheService,
	) {}

	/**
	 * 1.5.2
	 * Creates a new client in the database.
	 * @param body - The data for creating a new client.
	 * @returns A promise that resolves to the created client data.
	 * @remarks
	 * This function uses Prisma transactions to create a new client, their associated emails, and contacts.
	 * It also generates a password, hashes it, and updates the user's email with the token and hashed password.
	 * Finally, it retrieves the created client with their associated emails and contacts.
	 * @throws HttpException - If the client could not be created due to a bad request.
	 */

	public async createClient(body: TCreateClient,): Promise<Omit<Client, 'totals'>> {
		return this.prismaService.$transaction(async(tx,) => {
			const { emails, contacts, firstName, lastName, residence, country, region,city, streetAddress, buildingNumber, postalCode, comment, ...data } = body

			const newClient = await tx.client.create({
				data: {
					...data,
					firstName:      this.cryptoService.encryptString(firstName,),
					lastName:       this.cryptoService.encryptString(lastName,),
					residence:      this.cryptoService.encryptString(residence,),
					country:        this.cryptoService.encryptString(country,),
					region:         this.cryptoService.encryptString(region,),
					city:           this.cryptoService.encryptString(city,),
					streetAddress:  this.cryptoService.encryptString(streetAddress,),
					buildingNumber: this.cryptoService.encryptString(buildingNumber,),
					postalCode:     this.cryptoService.encryptString(postalCode,),
					...(comment ?
						{comment:        this.cryptoService.encryptString(comment,),} :
						{}),
				},
			},)
			if (contacts.length) {
				await this.phoneRepository.createPhonesWithClientId({tx, clientId: newClient.id, contacts,},)
			}
			if (emails.length) {
				await this.emailRepository.createEmailsWithClientId({tx, clientId: newClient.id, emails,},)
			}
			const allEmails = await tx.email.findMany()

			const userEmail = allEmails.find((item,) => {
				return this.cryptoService.decryptString(item.email,) === emails[0]
			},
			)
			if (userEmail) {
				await tx.user.create({
					data: {
						emailId:  userEmail.id,
						clientId: newClient.id,
					},
				},)
			}

			return {
				...data,
				id:          newClient.id,
				firstName,
				lastName,
				residence,
				country,
				region,
				city,
				streetAddress,
				buildingNumber,
				postalCode,
				comment:     comment ?? null,
				createdAt:   newClient.createdAt,
				updatedAt:   newClient.updatedAt,
				isActivated: newClient.isActivated,
				contacts,
				emails,
			}
		},)
	}

	/**
	 * 1.5.2
	 * Creates a new draft in the database.
	 * @param data - The data for creating a new draft.
	 * @returns A promise that resolves to the created draft object.
	 * @remarks
	 * This function uses the Prisma service to create a new draft in the database.
	 * The provided `data` parameter is used to populate the draft's fields.
	 * @throws Prisma.PrismaClientKnownRequestError - If the draft could not be created due to a database error.
	 * @throws Prisma.PrismaClientUnknownRequestError - If the draft could not be created due to an unknown error.
	 * @throws Prisma.PrismaClientValidationError - If the draft could not be created due to validation errors.
	 */
	public async createDraft(data: TCreateDraft,): Promise<ClientDraft> {
		return this.prismaService.clientDraft.create({
			data: {
				...data,
				...(data.firstName && typeof data.firstName === 'string'  ?
					{firstName: this.cryptoService.encryptString(data.firstName,),} :
					{}),
				...(data.lastName && typeof data.lastName === 'string' ?
					{lastName: this.cryptoService.encryptString(data.lastName,),} :
					{}),
				...(data.residence && typeof data.residence === 'string' ?
					{residence: this.cryptoService.encryptString(data.residence,),} :
					{}),
				...(data.country && typeof data.country === 'string' ?
					{country: this.cryptoService.encryptString(data.country,),} :
					{}),
				...(data.region && typeof data.region === 'string' ?
					{region: this.cryptoService.encryptString(data.region,),} :
					{}),
				...(data.city && typeof data.city === 'string' ?
					{city: this.cryptoService.encryptString(data.city,),} :
					{}),
				...(data.streetAddress && typeof data.streetAddress === 'string' ?
					{streetAddress: this.cryptoService.encryptString(data.streetAddress,),} :
					{}),
				...(data.buildingNumber && typeof data.buildingNumber === 'string' ?
					{buildingNumber: this.cryptoService.encryptString(data.buildingNumber,),} :
					{}),
				...(data.postalCode && typeof data.postalCode === 'string' ?
					{postalCode: this.cryptoService.encryptString(data.postalCode,),} :
					{}),
				...(data.emails ?
					{emails: data.emails.map((email,) => {
						return this.cryptoService.encryptString(email,)
					},),} :
					{}),
				...(data.contacts ?
					{contacts: data.contacts.map((contact,) => {
						return this.cryptoService.encryptString(contact,)
					},),} :
					{}),
			},
		},)
	}

	/**
	 * 1.5.1
	 * Retrieves a list of clients based on the provided parameters.
	 * @param params - The parameters for filtering and sorting the clients.
	 * @returns A promise that resolves to an object containing the total count of clients and the list of clients.
	 * @remarks
	 * This function uses Prisma transactions to fetch the total count of clients and the list of clients based on the provided parameters.
	 * The parameters include pagination, sorting, and search functionality.
	 * The returned list of clients includes their associated emails and contacts.
	 * @throws HttpException - If the clients could not be retrieved due to a bad request.
	 */
	// todo: clear if new ver good
	// public async getAllClients(filters: IFilterProps,): Promise<TAsyncClientsListRes> {
	// 	const {
	// 		skip = 0,
	// 		take = 100,
	// 		sortBy = ['createdAt',],
	// 		sortOrder = ['desc',],
	// 		search = '',
	// 		isActivated,
	// 		isDeactivated,
	// 	} = filters

	// 	const sortByArray = Array.isArray(sortBy,) ?
	// 		sortBy :
	// 		[sortBy,]

	// 	const sortOrderArray = Array.isArray(sortOrder,) ?
	// 		sortOrder :
	// 		[sortOrder,]

	// 	const orderBy = sortByArray
	// 		.filter((field,) => {
	// 			return field !== 'totalAssets'
	// 		},)
	// 		.map((field, index,) => {
	// 			return {
	// 				[field]: sortOrderArray[index] ?? 'asc',
	// 			}
	// 		},)
	// 	let isActivatedBoolean: boolean | undefined
	// 	if (isActivated === 'true' || isActivated === true) {
	// 		isActivatedBoolean = true
	// 	}
	// 	if (isDeactivated === 'true' || isDeactivated === true) {
	// 		isActivatedBoolean = false
	// 	}
	// 	const { range, } = filters

	// 	const [min, max,] = Array.isArray(range,) && range.length === 2 ?
	// 		range :
	// 		[null, null,]
	// 	const where: Prisma.ClientWhereInput = {
	// 		totals:          {
	// 			gte: min !== null ?
	// 				new Prisma.Decimal(min,) :
	// 				undefined,
	// 			lte: max !== null ?
	// 				new Prisma.Decimal(max,) :
	// 				undefined,
	// 		},
	// 		OR: [
	// 			{
	// 				firstName: {
	// 					contains: search,
	// 					mode:     'insensitive',
	// 				},
	// 			},
	// 			{
	// 				lastName: {
	// 					contains: search,
	// 					mode:     'insensitive',
	// 				},
	// 			},
	// 			{
	// 				emails: {
	// 					some: {
	// 						email: {
	// 							contains: search,
	// 							mode:     'insensitive',
	// 						},
	// 					},
	// 				},
	// 			},
	// 		],
	// 		...(isActivatedBoolean !== undefined && { isActivated: isActivatedBoolean, }),
	// 	}

	// 	const [total, list,] = await this.prismaService.$transaction([
	// 		this.prismaService.client.count({ where, },),
	// 		this.prismaService.client.findMany({
	// 			skip:    Number(skip,),
	// 			take:    Number(take,),
	// 			orderBy,
	// 			where,
	// 			include: {
	// 				emails:     true,
	// 				contacts:   true,
	// 				user:       true,
	// 				budgetPlan: true,
	// 				// portfolios: {
	// 				// 	include: {
	// 				// 		assets:       {
	// 				// 			where: { isArchived: false, },
	// 				// 		},
	// 				// 		transactions: true,
	// 				// 	},
	// 				// },
	// 			},
	// 		},),
	// 	],)
	// 	const decryptedList = list.map((client,) => {
	// 		const clientEmail = client.emails.find((email,) => {
	// 			return email.id === client.user?.emailId
	// 		},)
	// 		const emails = client.emails.filter((email,) => {
	// 			return email.id !== client.user?.emailId
	// 		},)
	// 			.map(({ email, },) => {
	// 				return this.cryptoService.decryptString(email,)
	// 			},)
	// 		client.user = null
	// 		return {
	// 			...client,
	// 			firstName:      this.cryptoService.decryptString(client.firstName,),
	// 			lastName:       this.cryptoService.decryptString(client.lastName,),
	// 			residence:      this.cryptoService.decryptString(client.residence,),
	// 			country:        this.cryptoService.decryptString(client.country,),
	// 			region:         this.cryptoService.decryptString(client.region,),
	// 			city:           this.cryptoService.decryptString(client.city,),
	// 			streetAddress:  this.cryptoService.decryptString(client.streetAddress,),
	// 			buildingNumber: this.cryptoService.decryptString(client.buildingNumber,),
	// 			postalCode:     this.cryptoService.decryptString(client.postalCode,),
	// 			...(client.comment ?
	// 				{comment:        this.cryptoService.decryptString(client.comment,),} :
	// 				{}),
	// 			emails:   clientEmail?.email ?
	// 				[this.cryptoService.decryptString(clientEmail.email,), ...emails,] :
	// 				emails,
	// 			contacts: client.contacts.map(({ number, },) => {
	// 				return this.cryptoService.decryptString(number,)
	// 			},),
	// 			totalAssets: Number(client.totals,),
	// 		}
	// 	},)
	// 	return {
	// 		total,
	// 		list: decryptedList,
	// 	}
	// }
	public async getAllClients(filters: IFilterProps,): Promise<TAsyncClientsListRes> {
		const {
			skip = 0,
			take = 100,
			sortBy = ['createdAt',],
			sortOrder = ['desc',],
			search = '',
			isActivated,
			isDeactivated,
		} = filters

		const sortByArray = Array.isArray(sortBy,) ?
			sortBy :
			[sortBy,]

		const sortOrderArray = Array.isArray(sortOrder,) ?
			sortOrder :
			[sortOrder,]

		const orderBy = sortByArray
			.filter((field,) => {
				return field !== 'totalAssets'
			},)
			.map((field, index,) => {
				return {
					[field]: sortOrderArray[index] ?? 'asc',
				}
			},)

		let isActivatedBoolean: boolean | undefined
		if (isActivated === 'true' || isActivated === true) {
			isActivatedBoolean = true
		}
		if (isDeactivated === 'true' || isDeactivated === true) {
			isActivatedBoolean = false
		}

		const { range, } = filters

		const [min, max,] = Array.isArray(range,) && range.length === 2 ?
			range :
			[null, null,]

		const where: Prisma.ClientWhereInput = {
			totals: {
				gte: min !== null ?
					new Prisma.Decimal(min,) :
					undefined,
				lte: max !== null ?
					new Prisma.Decimal(max,) :
					undefined,
			},
			...(isActivatedBoolean !== undefined && { isActivated: isActivatedBoolean, }),
		}

		const [, list,] = await this.prismaService.$transaction([
			this.prismaService.client.count({ where, },),
			this.prismaService.client.findMany({
				skip:    Number(skip,),
				take:    Number(take,),
				orderBy,
				where,
				include: {
					emails:     true,
					contacts:   true,
					user:       true,
					budgetPlan: true,
				},
			},),
		],)

		const decryptedList = list.map((client,) => {
			const clientEmail = client.emails.find((email,) => {
				return email.id === client.user?.emailId
			},)
			const emails = client.emails
				.filter((email,) => {
					return email.id !== client.user?.emailId
				},)
				.map(({ email, },) => {
					return this.cryptoService.decryptString(email,)
				},)

			client.user = null

			return {
				...client,
				firstName:      this.cryptoService.decryptString(client.firstName,),
				lastName:       this.cryptoService.decryptString(client.lastName,),
				residence:      this.cryptoService.decryptString(client.residence,),
				country:        this.cryptoService.decryptString(client.country,),
				region:         this.cryptoService.decryptString(client.region,),
				city:           this.cryptoService.decryptString(client.city,),
				streetAddress:  this.cryptoService.decryptString(client.streetAddress,),
				buildingNumber: this.cryptoService.decryptString(client.buildingNumber,),
				postalCode:     this.cryptoService.decryptString(client.postalCode,),
				...(client.comment ?
					{ comment: this.cryptoService.decryptString(client.comment,), } :
					{}),
				emails: clientEmail?.email ?
					[this.cryptoService.decryptString(clientEmail.email,), ...emails,] :
					emails,
				contacts: client.contacts.map(({ number, },) => {
					return this.cryptoService.decryptString(number,)
				},),
				totalAssets: Number(client.totals,),
			}
		},)

		const searchLower = search.trim().toLowerCase()

		const filteredList = searchLower ?
			decryptedList.filter((client,) => {
				const firstName = (client.firstName || '').toLowerCase()
				const lastName = (client.lastName || '').toLowerCase()
				const emailsStr = Array.isArray(client.emails,) ?
					client.emails.join(' ',).toLowerCase() :
					''

				return (
					firstName.includes(searchLower,) ||
				lastName.includes(searchLower,) ||
				emailsStr.includes(searchLower,)
				)
			},) :
			decryptedList

		return {
			total: filteredList.length,
			list:  filteredList,
		}
	}

	/**
	 * 1.5.1
	 * Retrieves a list of drafts based on the provided parameters.
	 * @returns A promise that resolves to an object containing the total count of drafts and the list of drafts.
	 * @remarks
	 * This function uses Prisma transactions to fetch the total count of drafts and the list of drafts based on the provided parameters.
	 * The parameters include pagination.
	 * The returned list of drafts is sorted by the 'updatedAt' field in descending order.
	 * @throws HttpException - If the drafts could not be retrieved due to a bad request.
	 */
	public async getAllDrafts() : Promise<TDraftsListRes> {
		const [total, list,] = await this.prismaService.$transaction([
			this.prismaService.clientDraft.count(),
			this.prismaService.clientDraft.findMany({
				orderBy: {
					updatedAt: 'desc',
				},
			},),
		],)
		const decryptedDrafts = list.map((client,) => {
			return {
				...client,
				...(client.firstName  ?
					{firstName: this.cryptoService.decryptString(client.firstName,),} :
					{}),
				...(client.lastName ?
					{lastName: this.cryptoService.decryptString(client.lastName,),} :
					{}),
				...(client.residence ?
					{residence: this.cryptoService.decryptString(client.residence,),} :
					{}),
				...(client.country ?
					{country: this.cryptoService.decryptString(client.country,),} :
					{}),
				...(client.region ?
					{region: this.cryptoService.decryptString(client.region,),} :
					{}),
				...(client.city  ?
					{city: this.cryptoService.decryptString(client.city,),} :
					{}),
				...(client.streetAddress ?
					{streetAddress: this.cryptoService.decryptString(client.streetAddress,),} :
					{}),
				...(client.buildingNumber ?
					{buildingNumber: this.cryptoService.decryptString(client.buildingNumber,),} :
					{}),
				...(client.postalCode ?
					{postalCode: this.cryptoService.decryptString(client.postalCode,),} :
					{}),
				emails: client.emails.map((email,) => {
					return this.cryptoService.decryptString(email,)
				},),
				contacts: client.contacts.map((contact,) => {
					return this.cryptoService.decryptString(contact,)
				},),
			}
		},)
		return {
			total,
			list: decryptedDrafts,
		}
	}

	/**
	 * 2.1.2
	 * Retrieves a client by their unique identifier.
	 * @param id - The unique identifier of the client.
	 * @returns A promise that resolves to the client data if found, otherwise throws an HTTP exception.
	 * @remarks
	 * This function uses the Prisma service to fetch a client by their unique identifier.
	 * It includes the client's associated emails, contacts, and user data.
	 * If the client is not found, it throws an HTTP exception with a status code of 404 (Not Found).
	 * @throws HttpException - If the client could not be found.
	 */
	public async findClientById(id: string,): Promise<TClientRes> {
		const client = await this.prismaService.client.findUnique({
			where: {
				id,
			},
			include: {
				emails:     true,
				contacts:   true,
				budgetPlan: true,
				user:       {
					include: {
						email: {
							select: {
								isConfirmed: true,
								email:       true,
								token:       true,
							},
						},
					},
				},
			},
		},)
		if (!client) {
			throw new HttpException(text.clientNotExist, HttpStatus.NOT_FOUND,)
		}
		const clientEmail = client.emails.find((email,) => {
			return email.id === client.user?.emailId
		},)
		const emails = client.emails.filter((email,) => {
			return email.id !== client.user?.emailId
		},).map(({email,},) => {
			return this.cryptoService.decryptString(email,)
		},)
		const decryptedClient = {
			...client,
			user: {
				...client.user,
				email: {
					...client.user?.email,
					email: client.user?.email.email ?
						this.cryptoService.decryptString(client.user.email.email,) :
						undefined,

				},
			},
		}
		return {
			...decryptedClient,
			firstName:      this.cryptoService.decryptString(client.firstName,),
			lastName:       this.cryptoService.decryptString(client.lastName,),
			residence:      this.cryptoService.decryptString(client.residence,),
			country:        this.cryptoService.decryptString(client.country,),
			region:         this.cryptoService.decryptString(client.region,),
			city:           this.cryptoService.decryptString(client.city,),
			streetAddress:  this.cryptoService.decryptString(client.streetAddress,),
			buildingNumber: this.cryptoService.decryptString(client.buildingNumber,),
			postalCode:     this.cryptoService.decryptString(client.postalCode,),
			...(client.comment ?
				{comment:        this.cryptoService.decryptString(client.comment,),} :
				{}),
			emails: clientEmail?.email ?
				[this.cryptoService.decryptString(clientEmail.email,), ...emails,] :
				[...emails,],
			contacts: client.contacts.map(({number,},) => {
				return this.cryptoService.decryptString(number,)
			},),
			hasBudgetPlan: Boolean(client.budgetPlan,),
			totalAssets:   Number(client.totals,),
		}
	}

	/**
	 * 2.1.2
	 * Retrieves a draft by its unique identifier.
	 * @param id - The unique identifier of the draft.
	 * @returns A promise that resolves to the draft data if found, otherwise throws an HTTP exception.
	 * @remarks
	 * This function uses the Prisma service to fetch a draft by its unique identifier.
	 * If the draft is not found, it throws an HTTP exception with a status code of 404 (Not Found).
	 * @throws HttpException - If the draft could not be found.
	 */
	public async findDraftById(id: string,): Promise<ClientDraft> {
		const draft = await this.prismaService.clientDraft.findUnique({
			where: {
				id,
			},
		},)
		if (!draft) {
			throw new HttpException(text.clientNotExist, HttpStatus.NOT_FOUND,)
		}
		return {
			...draft,
			...(draft.firstName  ?
				{firstName: this.cryptoService.decryptString(draft.firstName,),} :
				{}),
			...(draft.lastName ?
				{lastName: this.cryptoService.decryptString(draft.lastName,),} :
				{}),
			...(draft.residence ?
				{residence: this.cryptoService.decryptString(draft.residence,),} :
				{}),
			...(draft.country ?
				{country: this.cryptoService.decryptString(draft.country,),} :
				{}),
			...(draft.region ?
				{region: this.cryptoService.decryptString(draft.region,),} :
				{}),
			...(draft.city  ?
				{city: this.cryptoService.decryptString(draft.city,),} :
				{}),
			...(draft.streetAddress ?
				{streetAddress: this.cryptoService.decryptString(draft.streetAddress,),} :
				{}),
			...(draft.buildingNumber ?
				{buildingNumber: this.cryptoService.decryptString(draft.buildingNumber,),} :
				{}),
			...(draft.postalCode ?
				{postalCode: this.cryptoService.decryptString(draft.postalCode,),} :
				{}),
		}
	}

	/**
	 * 2.1.3
	 * Updates a client in the database using a provided transaction client.
	 * @param tx - The transaction client to use for the database operation.
	 * @param id - The unique identifier of the client to update.
	 * @param data - The data to update the client with.
	 * @returns A promise that resolves when the client is updated successfully.
	 * @remarks
	 * This function uses the provided transaction client to update a client in the database.
	 * It takes the client's unique identifier and the data to update as parameters.
	 * The function does not return any data, but it throws an error if the client could not be updated.
	 * @throws Prisma.PrismaClientKnownRequestError - If the client could not be updated due to a database error.
	 * @throws Prisma.PrismaClientUnknownRequestError - If the client could not be updated due to an unknown error.
	 * @throws Prisma.PrismaClientValidationError - If the client could not be updated due to validation errors.
	 */
	public async updateClientById(
		tx: Prisma.TransactionClient,
		id: string,
		data: Prisma.ClientUpdateInput,
	): Promise<void> {
		await tx.client.update({
			where: { id, },
			data:  {
				...(data.firstName && typeof data.firstName === 'string'  ?
					{firstName: this.cryptoService.encryptString(data.firstName,),} :
					{}),
				...(data.lastName && typeof data.lastName === 'string' ?
					{lastName: this.cryptoService.encryptString(data.lastName,),} :
					{}),
				...(data.residence && typeof data.residence === 'string' ?
					{residence: this.cryptoService.encryptString(data.residence,),} :
					{}),
				...(data.country && typeof data.country === 'string' ?
					{country: this.cryptoService.encryptString(data.country,),} :
					{}),
				...(data.region && typeof data.region === 'string' ?
					{region: this.cryptoService.encryptString(data.region,),} :
					{}),
				...(data.city && typeof data.city === 'string' ?
					{city: this.cryptoService.encryptString(data.city,),} :
					{}),
				...(data.streetAddress && typeof data.streetAddress === 'string' ?
					{streetAddress: this.cryptoService.encryptString(data.streetAddress,),} :
					{}),
				...(data.buildingNumber && typeof data.buildingNumber === 'string' ?
					{buildingNumber: this.cryptoService.encryptString(data.buildingNumber,),} :
					{}),
				...(data.postalCode && typeof data.postalCode === 'string' ?
					{postalCode: this.cryptoService.encryptString(data.postalCode,),} :
					{}),
				...(data.comment && typeof data.comment === 'string' ?
					{comment: this.cryptoService.encryptString(data.comment,),} :
					{}),
			},
		},)
	}

	/**
	 * 2.1.3
	 * Updates a client in the database using the provided client ID and data.
	 * @param id - The unique identifier of the client to update.
	 * @param body - The data to update the client with.
	 * @returns A promise that resolves when the client is updated successfully.
	 * @remarks
	 * This function uses the Prisma service to update a client in the database.
	 * It takes the client's unique identifier and the data to update as parameters.
	 * The function does not return any data, but it throws an error if the client could not be updated.
	 * @throws Prisma.PrismaClientKnownRequestError - If the client could not be updated due to a database error.
	 * @throws Prisma.PrismaClientUnknownRequestError - If the client could not be updated due to an unknown error.
	 * @throws Prisma.PrismaClientValidationError - If the client could not be updated due to validation errors.
	 */
	public async updateClient(id: string, body: Prisma.ClientUpdateInput,): Promise<void> {
		await this.prismaService.client.update({
			where:   { id, },
			data:    body,
		},)
		await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.bond,)
		await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.cash,)
		await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.crypto,)
		await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.deposit,)
		await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.equity,)
		await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.loan,)
		await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.metals,)
		await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.options,)
		await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.other,)
		await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.private,)
		await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.real,)
		await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.portfolio,)
		await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.client,)
	}

	/**
	 * 2.2.1
	 * Retrieves a list of clients for a select dropdown component.
	 * @returns A promise that resolves to an array of objects, each containing a `value` and `label` property.
	 * The `value` property represents the client's unique identifier, and the `label` property represents the client's full name.
	 * @remarks
	 * This function retrieves all clients from the database using the Prisma service.
	 * It then transforms the client data into an array of objects with `value` and `label` properties.
	 * The `value` property is set to the client's unique identifier, and the `label` property is set to the client's full name.
	 * @throws Prisma.PrismaClientKnownRequestError - If there is a database error while fetching clients.
	 * @throws Prisma.PrismaClientUnknownRequestError - If there is an unknown error while fetching clients.
	 * @throws Prisma.PrismaClientValidationError - If there are validation errors while fetching clients.
	 */
	public async getClientsForSelect(): Promise<Array<{value: string, label: string}>> {
		const clients = await this.prismaService.client.findMany({
			where: {
				isActivated: true,
			},
		},)
		const transformedData = clients.map((item,) => {
			return {
				value: item.id,
				label: `${this.cryptoService.decryptString(item.firstName,)} ${this.cryptoService.decryptString(item.lastName,)}`,
			}
		},)
		return transformedData
	}

	/**
	 * 1.5.2
	 * Retrieves the token and password associated with a given email address.
	 * @param email - The email address to search for.
	 * @returns A promise that resolves to an object containing the token and password.
	 * @remarks
	 * This function uses the Prisma service to find the unique email record in the database.
	 * It selects the 'token' and 'password' fields from the email record.
	 * If the email record is not found or if either the token or password is missing,
	 * an error is thrown with a descriptive message.
	 * @throws Error - If the email record is not found or if either the token or password is missing.
	 */
	public async findEmailDataByEmail(email: string,): Promise<{ token: string; password: string }> {
		const emailData = await this.prismaService.email.findUnique({
			where:  { email, },
			select: {
				token:    true,
				password: true,
			},
		},)

		if (!emailData?.token || !emailData.password) {
			throw new Error(`Email ${email} is missing token or password.`,)
		}

		return {
			token:    emailData.token,
			password: emailData.password,
		}
	}

	/**
	 * 2.1.3
	 * Updates the activation status of all portfolios associated with a specific client.
	 * @param id - The unique identifier of the client whose portfolios should be updated.
	 * @param isActivated - A boolean value indicating whether the portfolios should be activated or deactivated.
	 * @returns A promise that resolves when the update operation is complete.
	 * @remarks
	 * This function utilizes the Prisma service to update the `isActivated` status
	 * of all portfolios linked to the provided client ID.
	 * It applies the update using `updateMany`, ensuring that all matching records are modified.
	 */
	public async updateClientPortfolios(id: string, isActivated:boolean,): Promise<void> {
		await this.prismaService.portfolio.updateMany({
			where:   {
				clientId: id,
			},
			data:    {
				isActivated,
			},
		},)
	}
}