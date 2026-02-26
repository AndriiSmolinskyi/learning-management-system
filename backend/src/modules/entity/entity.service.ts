/* eslint-disable complexity */
import { PrismaService, } from 'nestjs-prisma'
import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import type { Entity, Prisma,} from '@prisma/client'

import { text, } from '../../shared/text'
import { PortfolioRoutes, } from '../portfolio/portfolio.constants'
import { RedisCacheService, } from '../redis-cache/redis-cache.service'
import type { AddEntityDto, SourceIdDto,  } from './dto'
import { CryptoService, } from '../crypto/crypto.service'

@Injectable()
export class EntityService {
	constructor(
		private readonly cacheService: RedisCacheService,
		private readonly cryptoService: CryptoService,
		private readonly prismaService: PrismaService,
	) {}

	/**
	 * 1.5.1/1.5.2/2.1.3
	 * Creates a new entity in the database.
	 * @param body - The data for the new entity.
	 * @throws Will throw an HTTP exception if the portfolioId and portfolioDraftId are both missing.
	 * @returns A promise that resolves to the newly created entity.
	 */
	public async createEntity(body: AddEntityDto,): Promise<Entity> {
		if (!body.portfolioId && !body.portfolioDraftId) {
			throw new HttpException(text.wrongId, HttpStatus.BAD_REQUEST,)
		}
		await this.cacheService.deleteByUrl([
			`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${body.portfolioId}`,
		],)
		return this.prismaService.entity.create({
			data: {
				...body,
				name:                    this.cryptoService.encryptString(body.name,),
				country:                 this.cryptoService.encryptString(body.country,),
				authorizedSignatoryName: this.cryptoService.encryptString(body.authorizedSignatoryName,),
				...(body.firstName ?
					{firstName:               this.cryptoService.encryptString(body.firstName,),} :
					{}),
				...(body.lastName ?
					{lastName:               this.cryptoService.encryptString(body.lastName,),} :
					{}),
				...(body.email ?
					{email:               this.cryptoService.encryptString(body.email,),} :
					{}),
			},
		},)
	}

	/**
	 * 1.5.1/1.5.2/2.1.3
	 * Retrieves an entity by its unique identifier from the database.
	 * @param id - The unique identifier of the entity to retrieve.
	 * @throws Will throw an HTTP exception if the entity with the given ID does not exist.
	 * @returns A promise that resolves to the retrieved entity.
	 */
	public async getEntityById(id: string,): Promise<Entity> {
		const entity = await this.prismaService.entity.findUnique({ where: { id, }, },)

		if (!entity) {
			throw new HttpException(text.entityNotExist, HttpStatus.NOT_FOUND,)
		}

		return {
			...entity,
			name:                    this.cryptoService.decryptString(entity.name,),
			country:                 this.cryptoService.decryptString(entity.country,),
			authorizedSignatoryName: this.cryptoService.decryptString(entity.authorizedSignatoryName,),
			...(entity.firstName ?
				{firstName:               this.cryptoService.decryptString(entity.firstName,),} :
				{}),
			...(entity.lastName ?
				{lastName:               this.cryptoService.decryptString(entity.lastName,),} :
				{}),
			...(entity.email ?
				{email:               this.cryptoService.decryptString(entity.email,),} :
				{}),
		}
	}

	/**
	 * 1.5.1/1.5.2/2.1.3
	 * Retrieves a list of entities associated with a given portfolio ID.
	 * @param id - The unique identifier of the portfolio.
	 * @returns A promise that resolves to an array of entities associated with the given portfolio ID.
	 * @throws Will throw an HTTP exception if the portfolio ID is not provided.
	 * @remarks
	 * This function uses the Prisma service to query the database for entities that match the provided portfolio ID.
	 * It supports both the `portfolioId` and `portfolioDraftId` fields for entity association.
	 */
	public async getEntityListByPortfolioId(id: string,): Promise<Array<Entity>> {
		const entities = await this.prismaService.entity.findMany({
			where: {
				OR: [
					{ portfolioId: id, },
					{ portfolioDraftId: id, },
				],
			},
		},)
		return entities.map((entity,) => {
			return {
				...entity,
				name:                    this.cryptoService.decryptString(entity.name,),
				country:                 this.cryptoService.decryptString(entity.country,),
				authorizedSignatoryName: this.cryptoService.decryptString(entity.authorizedSignatoryName,),
				...(entity.firstName ?
					{firstName:               this.cryptoService.decryptString(entity.firstName,),} :
					{}),
				...(entity.lastName ?
					{lastName:               this.cryptoService.decryptString(entity.lastName,),} :
					{}),
				...(entity.email ?
					{email:               this.cryptoService.decryptString(entity.email,),} :
					{}),
			}
		},)
	}

	/**
	 * 1.5.1/1.5.2/2.1.3
	 * Updates an existing entity in the database.
	 * @param {string} id - The unique identifier of the entity to update.
	 * @param {Prisma.EntityUpdateInput} body - The updated data for the entity.
	 * @returns {Promise<Entity>} - A promise that resolves to the updated entity.
	 * @throws Will throw an HTTP exception if any error occurs during the update process.
	 * @remarks
	 * This function uses the Prisma service to update the entity in the database.
	 * It takes the entity's unique identifier and the updated data as parameters.
	 * The function returns the updated entity.
	 */
	public async updateEntity(id: string, body : Prisma.EntityUpdateInput,): Promise<Entity> {
		const updatedEntity = await this.prismaService.entity.update({
			where: {
				id,
			},
			data: {
				...body,
				...(body.name && typeof body.name === 'string' ?
					{name:               this.cryptoService.encryptString(body.name,),} :
					{}),
				...(body.country && typeof body.country === 'string' ?
					{country:               this.cryptoService.encryptString(body.country,),} :
					{}),
				...(body.authorizedSignatoryName && typeof body.authorizedSignatoryName === 'string' ?
					{authorizedSignatoryName:               this.cryptoService.encryptString(body.authorizedSignatoryName,),} :
					{}),
				...(body.firstName && typeof body.firstName === 'string' ?
					{firstName:               this.cryptoService.encryptString(body.firstName,),} :
					{}),
				...(body.lastName && typeof body.lastName === 'string' ?
					{lastName:               this.cryptoService.encryptString(body.lastName,),} :
					{}),
				...(body.email && typeof body.email === 'string' ?
					{email:               this.cryptoService.encryptString(body.email,),} :
					{}),
			},
		},)
		await this.cacheService.deleteByUrl([
			`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${updatedEntity.portfolioId}`,
		],)
		return updatedEntity
	}

	/**
	 * 3.5.3
	 * Retrieves a list of entities associated with multiple portfolio IDs.
	 * @param ids - An array of portfolio unique identifiers.
	 * @returns A promise that resolves to an array of entities matching the provided portfolio IDs.
	 * @remarks Searches for entities linked to the specified portfolio IDs.
	 */
	public async getEntityListBySourceIds(data: SourceIdDto, clientId?: string,): Promise<Array<Entity>> {
		const {clientIds, portfolioIds,} = data
		const entities = await this.prismaService.entity.findMany({
			where: {
				portfolioId:  { in: portfolioIds, },
				portfolio:   {
					isActivated: true,
					...(clientIds?.length ?
						{
							client: {
								id: {
									in: clientIds,
								},
							},
						} :
						{}),
					...(clientId ?
						{
							client: {
								id: clientId,
							},
						} :
						{}),
				},
			},
		},)
		return entities.map((entity,) => {
			return {
				...entity,
				name:                    this.cryptoService.decryptString(entity.name,),
				country:                 this.cryptoService.decryptString(entity.country,),
				authorizedSignatoryName: this.cryptoService.decryptString(entity.authorizedSignatoryName,),
				...(entity.firstName ?
					{firstName:               this.cryptoService.decryptString(entity.firstName,),} :
					{}),
				...(entity.lastName ?
					{lastName:               this.cryptoService.decryptString(entity.lastName,),} :
					{}),
				...(entity.email ?
					{email:               this.cryptoService.decryptString(entity.email,),} :
					{}),
			}
		},)
	}

	/**
 * 3.5.3
 * Retrieves a list of entities filtered by custom source criteria.
 * @remarks
 * Accepts a Prisma-compatible filter object to query entities by fields such as accountId or portfolioId.
 * This is useful for flexible retrieval via source ID or combinations of fields.
 *
 * @param query - The Prisma `EntityWhereInput` object used for filtering entities.
 * @returns A promise that resolves to an array of matching entities.
 */
	public async getEntitiesBySourceIds(query: SourceIdDto,): Promise<Array<Entity>> {
		const filters: Array<Prisma.EntityWhereInput> = [
			query.portfolioIds?.length ?
				{ portfolioId: { in: query.portfolioIds, }, } :
				undefined,
			query.portfolioDraftIds?.length ?
				{ portfolioDraftId: { in: query.portfolioDraftIds, }, } :
				undefined,
		].filter((f,): f is NonNullable<typeof f> => {
			return Boolean(f,)
		},)

		const entities = await this.prismaService.entity.findMany({
			where: {
				AND: filters.length > 0 ?
					filters :
					undefined,
				portfolio: {
					isActivated: true,
					clientId:    {
						in:  query.clientIds,
					},
				},
			},
		},)
		return entities.map((entity,) => {
			return {
				...entity,
				name:                    this.cryptoService.decryptString(entity.name,),
				country:                 this.cryptoService.decryptString(entity.country,),
				authorizedSignatoryName: this.cryptoService.decryptString(entity.authorizedSignatoryName,),
				...(entity.firstName ?
					{firstName:               this.cryptoService.decryptString(entity.firstName,),} :
					{}),
				...(entity.lastName ?
					{lastName:               this.cryptoService.decryptString(entity.lastName,),} :
					{}),
				...(entity.email ?
					{email:               this.cryptoService.decryptString(entity.email,),} :
					{}),
			}
		},)
	}
}