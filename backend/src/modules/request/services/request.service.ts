/* eslint-disable no-nested-ternary */
/* eslint-disable max-lines */
/* eslint-disable complexity */
import {HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Request,} from '@prisma/client'
import { Prisma, } from '@prisma/client'

import type { TRequestExtended, TRequestListRes, } from '../request.types'
import { text, } from '../../../shared/text'
import type { CreateRequestDto, RequestFilterDto, } from '../dto'
import { DocumentService, } from '../../document/document.service'
import { RedisCacheService, } from '../../redis-cache/redis-cache.service'
import { RequestRoutes, } from '../request.constants'
import { CryptoService, } from '../../../modules/crypto/crypto.service'
import { AssetNamesType, } from '../../../modules/asset/asset.types'
// todo: after asset refactor
import type { UpdateRequestDto, } from '../dto'

@Injectable()
export class RequestService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly documentService: DocumentService,
		private readonly cacheService: RedisCacheService,
		private readonly cryptoService: CryptoService,
	) { }

	/**
	* 3.1.1
	 * Creates a new request, optionally linking documents from an existing request draft.
 *
 * @remarks
 * - This method handles the creation of a new request and can associate documents from a request draft if a `requestDraftId` is provided.
 * - The transaction ensures that all actions (creating a request, linking documents, deleting the draft) are performed atomically.
 *
 * @param body - The data required to create a new request.
 * @returns A promise that resolves to the newly created request object.
 */
	// todo: version before asset refactor
	// public async createRequest(body: CreateRequestDto,): Promise<Request> {
	// 	const {requestDraftId, ...data} = body

	// 	const request = await this.prismaService.$transaction(async(tx,) => {
	// 		const newRequest = await this.prismaService.request.create({
	// 			data,
	// 		},)

	// 		if (requestDraftId) {
	// 			const requestDraft = await tx.requestDraft.findUnique({
	// 				where:   { id: requestDraftId, },
	// 				include: {
	// 					documents: true,
	// 				},
	// 			},)

	// 			if (requestDraft && requestDraft.documents.length > 0) {
	// 				const documentIds = requestDraft.documents.map((doc,) => {
	// 					return doc.id
	// 				},)

	// 				await tx.document.updateMany({
	// 					where: {
	// 						id: {
	// 							in: documentIds,
	// 						},
	// 					},
	// 					data: {
	// 						requestId:      newRequest.id,
	// 						requestDraftId: null,
	// 					},
	// 				},)
	// 			}

	// 			if (requestDraft) {
	// 				await tx.requestDraft.delete({
	// 					where: { id: requestDraftId, },
	// 				},)
	// 			}
	// 		}

	// 		return newRequest
	// 	},)
	// 	const cacheKeysToDelete = [
	// 		`/${RequestRoutes.REQUEST}/${RequestRoutes.LIST}`,
	// 		`/${RequestRoutes.REQUEST}/${RequestRoutes.FILTER}`,
	// 		`/${RequestRoutes.REQUEST}/${RequestRoutes.SOURCE}`,
	// 	]
	// 	await this.cacheService.deleteByUrl(cacheKeysToDelete,)
	// 	return request
	// }

	// todo: version after asset refactor
	public async createRequest(body: CreateRequestDto,): Promise<Request> {
		const {requestDraftId, assetId, assetName, ...data} = body

		const request = await this.prismaService.$transaction(async(tx,) => {
			const newRequest = await tx.request.create({
				data: {
					...data,
					...(assetId && assetName === AssetNamesType.BONDS ?
						{ assetBondId: assetId, } :
						{}),
					...(assetId && assetName === AssetNamesType.EQUITY_ASSET ?
						{ assetEquityId: assetId, } :
						{}),
				},
			},)

			if (requestDraftId) {
				const requestDraft = await tx.requestDraft.findUnique({
					where:   { id: requestDraftId, },
					include: {
						documents: true,
					},
				},)

				if (requestDraft && requestDraft.documents.length > 0) {
					const documentIds = requestDraft.documents.map((doc,) => {
						return doc.id
					},)

					await tx.document.updateMany({
						where: {
							id: {
								in: documentIds,
							},
						},
						data: {
							requestId:      newRequest.id,
							requestDraftId: null,
						},
					},)
				}

				if (requestDraft) {
					await tx.requestDraft.delete({
						where: { id: requestDraftId, },
					},)
				}
			}

			return newRequest
		},)
		const cacheKeysToDelete = [
			`/${RequestRoutes.REQUEST}/${RequestRoutes.LIST}`,
			`/${RequestRoutes.REQUEST}/${RequestRoutes.FILTER}`,
			`/${RequestRoutes.REQUEST}/${RequestRoutes.SOURCE}`,
		]
		await this.cacheService.deleteByUrl(cacheKeysToDelete,)
		return request
	}

	/**
	* 3.1.2, 3.1.6, 3.1.7
	* Retrieves a list of requests filtered by various criteria such as status, search terms, and sorting options.
 *
 * @remarks
 * - The method supports multiple filters including `search`, `statuses`, and custom `params` to narrow down the results.
 * - It allows sorting by a field (`sortBy`) and order (`sortOrder`).
 * - The result includes a count of total requests matching the filter criteria.
 *
 * @param filter - The filtering and sorting criteria for retrieving the requests.
 * @returns A promise that resolves to an object containing the total count of requests and a list of filtered requests.
 */
	// todo: version before asset refactor
	// public async getRequestsFiltered(filter: RequestFilterDto,): Promise<TRequestListRes> {
	// 	const {
	// 		sortBy = 'updatedAt',
	// 		sortOrder = Prisma.SortOrder.desc,
	// 		search,
	// 		statuses,
	// 	} = filter
	// 	const orderBy: Prisma.RequestOrderByWithRelationInput = {
	// 		[sortBy]: sortOrder,
	// 	}

	// 	const where: Prisma.RequestWhereInput = {
	// 		...(search && {
	// 			OR: [
	// 				...(isNaN(Number(search,),) ?
	// 					[] :
	// 					[
	// 						{
	// 							id: {
	// 								equals: Number(search,),
	// 							},
	// 						},
	// 					]),
	// 				{
	// 					status: {
	// 						contains: search,
	// 						mode:     Prisma.QueryMode.insensitive,
	// 					},
	// 				},
	// 			],
	// 		}),
	// 		AND: [
	// 			{
	// 				OR: [
	// 					{ portfolio: null, },
	// 					{ portfolio: { isActivated: true, }, },
	// 				],
	// 			},
	// 			{
	// 				OR: [
	// 					{ client: null, },
	// 					{ client: { isActivated: true, }, },
	// 				],
	// 			},
	// 		],
	// 		...(statuses && {
	// 			status: {
	// 				in: statuses,
	// 			},
	// 		}),
	// 		type:        filter.type,
	// 		clientId:    { in: filter.clientIds, },
	// 		portfolioId: { in: filter.portfolioIds, },
	// 		entityId:    { in: filter.entityIds, },
	// 		...(filter.bankListIds?.length ?
	// 			{
	// 				bank: {
	// 					is: {
	// 						bankListId: { in: filter.bankListIds, },
	// 					},
	// 				},
	// 			} :
	// 			undefined),
	// 		bankId:    { in: filter.bankIds, },
	// 		accountId:   { in: filter.accountIds,},
	// 	}

	// 	const [total, list,] = await this.prismaService.$transaction([
	// 		this.prismaService.request.count(),
	// 		this.prismaService.request.findMany({
	// 			where,
	// 			orderBy,
	// 			include: {
	// 				account:   true,
	// 				client:  {
	// 					select: {
	// 						id:        true,
	// 						firstName: true,
	// 						lastName:  true,
	// 					},},
	// 				documents: true,
	// 				bank:      {
	// 					select: {
	// 						id:         true,
	// 						bankName:   true,
	// 						branchName: true,
	// 					},
	// 				},
	// 				entity: {
	// 					select: {
	// 						id:        true,
	// 						name:      true,
	// 						firstName: true,
	// 						lastName:  true,
	// 					},
	// 				},
	// 				portfolio: {
	// 					select: {
	// 						id:   true,
	// 						name: true,
	// 					},
	// 				},
	// 				assetBond: {
	// 					select: { id: true, assetName: true, isin: true, security: true, },
	// 				},
	// 				assetEquity: {
	// 					select: { id: true, assetName: true, isin: true, security: true, type: true, },
	// 				},
	// 			},
	// 		},),
	// 	],)
	// 	const decryptedList = list.map((request,) => {
	// 		return {
	// 			...request,
	// 			bank: {
	// 				...request.bank,
	// 				branchName: request.bank?.branchName && this.cryptoService.decryptString(request.bank.branchName,),
	// 			},
	// 			account: {
	// 				...request.account,
	// 				accountName: request.account?.accountName && this.cryptoService.decryptString(request.account.accountName,),
	// 			},
	// 			portfolio: {
	// 				...request.portfolio,
	// 				name: request.portfolio?.name && this.cryptoService.decryptString(request.portfolio.name,),
	// 			},
	// 			entity: {
	// 				...request.entity,
	// 				name: request.entity?.name && this.cryptoService.decryptString(request.entity.name,),
	// 			},
	// 			asset: request.assetBond ?
	// 				request.assetBond :
	// 				request.assetEquity ?
	// 					request.assetEquity :
	// 					null,
	// 		}
	// 	},)

	// 	const searchLower = search?.trim().toLowerCase() ?? ''

	// 	const filteredList = searchLower ?
	// 		decryptedList.filter((item,) => {
	// 			const portfolioName = item.portfolio.name?.toLowerCase() ?? ''
	// 			const entityName = item.entity.name?.toLowerCase() ?? ''
	// 			const bankName = item.bank.bankName ?
	// 				this.cryptoService.decryptString(item.bank.bankName,).toLowerCase() :
	// 				''
	// 			const status = item.status.toLowerCase() || ''
	// 			const idStr = String(item.id,)

	// 			return (
	// 				portfolioName.includes(searchLower,) ||
	// 			entityName.includes(searchLower,) ||
	// 			bankName.includes(searchLower,) ||
	// 			status.includes(searchLower,) ||
	// 			idStr.includes(searchLower,)
	// 			)
	// 		},) :
	// 		decryptedList
	// 	return {
	// 		total: filteredList.length,
	// 		list:  filteredList,
	// 	}
	// }
	public async getRequestsFiltered(filter: RequestFilterDto,): Promise<TRequestListRes> {
		const {
			sortBy = 'updatedAt',
			sortOrder = Prisma.SortOrder.desc,
			search,
			statuses,
		} = filter

		const orderBy: Prisma.RequestOrderByWithRelationInput = {
			[sortBy]: sortOrder,
		}

		const where: Prisma.RequestWhereInput = {
			...(statuses && {
				status: {
					in: statuses,
				},
			}),
			AND: [
				{
					OR: [
						{ portfolio: null, },
						{ portfolio: { isActivated: true, }, },
					],
				},
				{
					OR: [
						{ client: null, },
						{ client: { isActivated: true, }, },
					],
				},
			],
			type:        filter.type,
			clientId:    { in: filter.clientIds, },
			portfolioId: { in: filter.portfolioIds, },
			entityId:    { in: filter.entityIds, },
			...(filter.bankListIds?.length ?
				{
					bank: {
						is: {
							bankListId: { in: filter.bankListIds, },
						},
					},
				} :
				undefined),
			bankId:    { in: filter.bankIds, },
			accountId: { in: filter.accountIds, },
		}

		const [, list,] = await this.prismaService.$transaction([
			this.prismaService.request.count({ where, },),
			this.prismaService.request.findMany({
				where,
				orderBy,
				include: {
					account:   true,
					client:  {
						select: {
							id:        true,
							firstName: true,
							lastName:  true,
						},
					},
					documents: true,
					bank:      {
						select: {
							id:         true,
							bankName:   true,
							branchName: true,
						},
					},
					entity: {
						select: {
							id:        true,
							name:      true,
							firstName: true,
							lastName:  true,
						},
					},
					portfolio: {
						select: {
							id:   true,
							name: true,
						},
					},
					assetBond: {
						select: { id: true, assetName: true, isin: true, security: true, },
					},
					assetEquity: {
						select: { id: true, assetName: true, isin: true, security: true, type: true, },
					},
				},
			},),
		],)

		const decryptedList = list.map((request,) => {
			return {
				...request,
				bank: request.bank ?
					{
						...request.bank,
						bankName:   request.bank.bankName && this.cryptoService.decryptString(request.bank.bankName,),
						branchName: request.bank.branchName && this.cryptoService.decryptString(request.bank.branchName,),
					} :
					null,
				account: request.account ?
					{
						...request.account,
						accountName: request.account.accountName && this.cryptoService.decryptString(request.account.accountName,),
					} :
					null,
				portfolio: request.portfolio ?
					{
						...request.portfolio,
						name: request.portfolio.name && this.cryptoService.decryptString(request.portfolio.name,),
					} :
					null,
				entity: request.entity ?
					{
						...request.entity,
						name: request.entity.name && this.cryptoService.decryptString(request.entity.name,),
					} :
					null,
				asset: request.assetBond ?
					request.assetBond :
					request.assetEquity ?
						request.assetEquity :
						null,
			}
		},)

		const searchLower = typeof search === 'string' ?
			search.trim().toLowerCase() :
			''

		const filteredList = searchLower ?
			decryptedList.filter((request,) => {
				const portfolioName = request.portfolio?.name ?
					request.portfolio.name.toLowerCase() :
					''
				const entityName = request.entity?.name ?
					request.entity.name.toLowerCase() :
					''
				const bankName = request.bank?.bankName ?
					request.bank.bankName.toLowerCase() :
					''
				const status = request.status ?
					request.status.toLowerCase() :
					''
				const idMatch = String(request.id,).includes(searchLower,)

				return (
					portfolioName.includes(searchLower,) ||
				entityName.includes(searchLower,) ||
				bankName.includes(searchLower,) ||
				status.includes(searchLower,) ||
				idMatch
				)
			},) :
			decryptedList

		return {
			total: filteredList.length,
			list:  filteredList,
		}
	}

	/**
	* 3.1.2, 3.1.6, 3.1.7
	 * Retrieves a list of all requests without any filtering.
 *
 * @remarks
 * - This method returns all requests from the database, including related entities like account, client, documents, bank, etc.
 *
 * @returns A promise that resolves to an array of all request objects.
 */
	// todo: before asset refactor
	// public async getRequests(): Promise<Array<Request>> {
	// 	const requests = await this.prismaService.request.findMany({
	// 		include: {
	// 			account:   true,
	// 			bank:      true,
	// 			client:    true,
	// 			documents: true,
	// 			entity:    true,
	// 			portfolio: true,
	// 			asset:     true,
	// 		},
	// 	},)
	// 	return requests.map((request,) => {
	// 		return {
	// 			...request,
	// 			portfolio: {
	// 				...request.portfolio,
	// 				name: request.portfolio && this.cryptoService.decryptString(request.portfolio.name,),
	// 			},
	// 		}
	// 	},)
	// }

	// todo: after asset refactor
	public async getRequests(): Promise<Array<Request>> {
		const requests = await this.prismaService.request.findMany({
			include: {
				account:   true,
				bank:      true,
				client:    true,
				documents: true,
				entity:    true,
				portfolio: true,
				assetBond: {
					select: {
						id:        true,
						assetName: true,
						isin:      true,
						security:  true,
					},
				},
				assetEquity: {
					select: {
						id:        true,
						assetName: true,
						isin:      true,
						security:  true,
						type:      true,
					},
				},
			},
		},)
		return requests.map((request,) => {
			return {
				...request,
				portfolio: {
					...request.portfolio,
					name: request.portfolio && this.cryptoService.decryptString(request.portfolio.name,),
				},
				asset: request.assetBond ?
					request.assetBond :
					request.assetEquity,
			}
		},)
	}

	/**
	* 3.1.2
	 * Retrieves the extended details of a specific request identified by its ID.
 *
 * @remarks
 * - The method returns a full set of related entities for the request, including account, client, bank, documents, entity, and portfolio.
 * - If the request with the provided ID does not exist, an error is thrown.
 *
 * @param id - The ID of the request to retrieve.
 * @returns A promise that resolves to the extended details of the request.
 * @throws HttpException if the request does not exist.
 */
	// todo: before asset refactor
	// public async getRequestExtendedById(id: number,): Promise<TRequestExtended> {
	// 	const request = await this.prismaService.request.findUnique({
	// 		where:   { id, },
	// 		include: {
	// 			account:   true,
	// 			bank:      true,
	// 			client:    true,
	// 			documents: true,
	// 			entity:    true,
	// 			portfolio: true,
	// 			asset:     true,
	// 		},
	// 	},)

	// 	if (!request) {
	// 		throw new HttpException(text.draftNotExist, HttpStatus.NOT_FOUND,)
	// 	}
	// 	return {
	// 		...request,
	// 		portfolio: {
	// 			...request.portfolio,
	// 			name: request.portfolio ?
	// 				this.cryptoService.decryptString(request.portfolio.name,) :
	// 				undefined,
	// 		},
	// 		entity: {
	// 			...request.entity,
	// 			name: request.entity ?
	// 				this.cryptoService.decryptString(request.entity.name,) :
	// 				undefined,
	// 		},
	// 		account: {
	// 			...request.account,
	// 			accountName: request.account ?
	// 				this.cryptoService.decryptString(request.account.accountName,) :
	// 				undefined,
	// 		},
	// 	}
	// }

	// todo: after asset refactor
	public async getRequestExtendedById(id: number,): Promise<TRequestExtended> {
		const request = await this.prismaService.request.findUnique({
			where:   { id, },
			include: {
				account:   true,
				bank:      true,
				client:    true,
				documents: true,
				entity:    true,
				portfolio: true,
				assetBond: {
					select: { id: true, assetName: true, isin: true, security: true, },
				},
				assetEquity: {
					select: { id: true, assetName: true, isin: true, security: true, type: true, },
				},
			},
		},)

		if (!request) {
			throw new HttpException(text.draftNotExist, HttpStatus.NOT_FOUND,)
		}

		return {
			...request,
			bank: {
				...request.bank,
				branchName: request.bank ?
					this.cryptoService.decryptString(request.bank.branchName,) :
					undefined,
			},
			portfolio: {
				...request.portfolio,
				name: request.portfolio ?
					this.cryptoService.decryptString(request.portfolio.name,) :
					undefined,
			},
			entity: {
				...request.entity,
				name: request.entity ?
					this.cryptoService.decryptString(request.entity.name,) :
					undefined,
			},
			account: {
				...request.account,
				accountName: request.account ?
					this.cryptoService.decryptString(request.account.accountName,) :
					undefined,
			},
			asset: request.assetBond ?
				request.assetBond :
				request.assetEquity ?
					request.assetEquity :
					null,
		}
	}

	/**
	* 3.1.3
	 * Updates the details of a request identified by its ID.
 *
 * @remarks
 * - This method allows updating specific fields of a request, such as account, client, documents, etc.
 * - The updated data is passed in the `data` parameter.
 *
 * @param id - The ID of the request to update.
 * @param data - The updated data for the request.
 * @returns A promise that resolves to the updated request object.
 */
	// todo: before asset refactor
	// public async updateRequest(id: number, data: Prisma.RequestUpdateInput,): Promise<TRequestExtended> {
	// 	// if (!data.comment) {
	// 	// 	data.comment = null
	// 	// }
	// 	const updatedRequest = await this.prismaService.request.update({
	// 		where: {
	// 			id,
	// 		},
	// 		data,
	// 		include: {
	// 			account:   true,
	// 			client:    true,
	// 			bank:      true,
	// 			documents: true,
	// 			entity:    true,
	// 			portfolio: true,
	// 			asset:     true,
	// 		},
	// 	},)
	// 	const cacheKeysToDelete = [
	// 		`/${RequestRoutes.REQUEST}/${RequestRoutes.LIST}`,
	// 		`/${RequestRoutes.REQUEST}/${RequestRoutes.FILTER}`,
	// 		`/${RequestRoutes.REQUEST}/${RequestRoutes.SOURCE}`,
	// 		`/${RequestRoutes.REQUEST}/${id}`,
	// 	]
	// 	await this.cacheService.deleteByUrl(cacheKeysToDelete,)

	// 	return updatedRequest
	// }

	// todo: after asset refactor
	public async updateRequest(
		id: number,
		data: UpdateRequestDto,
	): Promise<TRequestExtended> {
		const { assetId, assetName, ...rest } = data

		const updatedRequest = await this.prismaService.request.update({
			where: {
				id,
			},
			data: {
				...rest,
				...(assetId && assetName === AssetNamesType.BONDS ?
					{ assetBondId: assetId, assetEquityId: null, } :
					{}),
				...(assetId && assetName === AssetNamesType.EQUITY_ASSET ?
					{ assetEquityId: assetId, assetBondId: null, } :
					{}),
			},
			include: {
				account:   true,
				client:    true,
				bank:      true,
				documents: true,
				entity:    true,
				portfolio: true,
				assetBond: {
					select: { id: true, assetName: true, isin: true, security: true, },
				},
				assetEquity: {
					select: { id: true, assetName: true, isin: true, security: true, type: true, },
				},
			},
		},)

		const cacheKeysToDelete = [
			`/${RequestRoutes.REQUEST}/${RequestRoutes.LIST}`,
			`/${RequestRoutes.REQUEST}/${RequestRoutes.FILTER}`,
			`/${RequestRoutes.REQUEST}/${RequestRoutes.SOURCE}`,
			`/${RequestRoutes.REQUEST}/${id}`,
		]
		await this.cacheService.deleteByUrl(cacheKeysToDelete,)

		return {
			...updatedRequest,
			bank: {
				...updatedRequest.bank,
				branchName: updatedRequest.bank ?
					this.cryptoService.decryptString(updatedRequest.bank.branchName,) :
					undefined,
			},
			portfolio: {
				...updatedRequest.portfolio,
				name: updatedRequest.portfolio ?
					this.cryptoService.decryptString(updatedRequest.portfolio.name,) :
					undefined,
			},
			entity: {
				...updatedRequest.entity,
				name: updatedRequest.entity ?
					this.cryptoService.decryptString(updatedRequest.entity.name,) :
					undefined,
			},
			account: {
				...updatedRequest.account,
				accountName: updatedRequest.account ?
					this.cryptoService.decryptString(updatedRequest.account.accountName,) :
					undefined,
			},
			asset: updatedRequest.assetBond ?
				updatedRequest.assetBond :
				updatedRequest.assetEquity ?
					updatedRequest.assetEquity :
					null,
		}
	}

	/**
	* 3.1.9
	 * Retrieves requests that match the provided `sourceId` criteria.
 *
 * @remarks
 * - The method filters the requests by the provided `query` (e.g., source ID).
 *
 * @param query - The filtering criteria for requests, typically based on the source ID.
 * @returns A promise that resolves to an array of requests matching the source ID criteria.
 */
	public async getRequestsBySourceId(query: Prisma.RequestWhereInput,): Promise<Array<Request>> {
		return this.prismaService.request.findMany({
			where: query,
		},)
	}

	/**
		 * CR-071
		 * Deletes a request by its ID along with all associated data.
		 *
		 * @remarks
		 * This method performs a cascading deletion process:
		 * - Retrieves and deletes all documents associated with the request.
		 *
		 * This ensures proper cleanup of all dependent data and avoids orphaned records.
		 *
		 * @param id - The unique identifier of the request to be deleted.
		 * @returns A Promise that resolves when the deletion process is complete.
		 * @throws Will throw an error if the deletion fails at any step.
		 */
	public async deleteRequestById(id: number,): Promise<void> {
		const orderDocumentsIds = await this.prismaService.document.findMany({
			where: {
				requestId: id,
			},
			select: {
				id:    true,
			},
		},)
		const documentIds = orderDocumentsIds.map((document,) => {
			return document.id
		},)
		await this.documentService.deleteDocumentsByIds({id: documentIds,},)
		await this.prismaService.request.delete({
			where: {
				id,
			},
		},)
		const cacheKeysToDelete = [
			`/${RequestRoutes.REQUEST}/${RequestRoutes.LIST}`,
			`/${RequestRoutes.REQUEST}/${RequestRoutes.FILTER}`,
			`/${RequestRoutes.REQUEST}/${RequestRoutes.SOURCE}`,
			`/${RequestRoutes.REQUEST}/${id}`,
		]
		await this.cacheService.deleteByUrl(cacheKeysToDelete,)
	}
}