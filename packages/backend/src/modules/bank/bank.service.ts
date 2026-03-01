/* eslint-disable complexity */
import { PrismaService, } from 'nestjs-prisma'
import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import type { Bank, Prisma, } from '@prisma/client'

import type { AddBankDto, UpdateBankDto, GetBanksBySourceIdsDto, } from './dto'
import { text, } from '../../shared/text'
import type { TBankExtended, } from './bank.types'
import { PortfolioRoutes, } from '../portfolio/portfolio.constants'
import { RedisCacheService, } from '../redis-cache/redis-cache.service'
import { CryptoService, } from '../crypto/crypto.service'

@Injectable()
export class BankService {
	constructor(
		private readonly cacheService: RedisCacheService,
		private readonly cryptoService: CryptoService,
		private readonly prismaService: PrismaService,
	) {}

	/**
	 * Creates a new bank record in the database.
	 * @param body - The data for the new bank record.
	 * @throws Will throw an HTTP exception if neither `portfolioId` nor `portfolioDraftId` is provided in the request body.
	 * @returns A promise that resolves to the newly created bank record.
	 */
	public async createBank(body: AddBankDto,): Promise<Bank> {
		if (!body.portfolioId && !body.portfolioDraftId) {
			throw new HttpException(text.wrongId, HttpStatus.BAD_REQUEST,)
		}

		const { bankListId, clientId, entityId, portfolioDraftId, portfolioId, country, branchName, firstName, lastName, email, ...data } = body
		await this.cacheService.deleteByUrl([
			`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${portfolioId}`,
		],)
		return this.prismaService.bank.create({
			data: {
				...data,
				country:    this.cryptoService.encryptString(country,),
				branchName: this.cryptoService.encryptString(branchName,),
				firstName:  firstName ?
					this.cryptoService.encryptString(firstName,) :
					null,
				lastName:   lastName ?
					this.cryptoService.encryptString(lastName,) :
					null,
				email:     email ?
					this.cryptoService.encryptString(email,) :
					null,
				client:     {
					connect: { id: clientId, },
				},
				entity: {
					connect: { id: entityId, },
				},
				...(body.portfolioId && {
					portfolio: { connect: { id: portfolioId, }, },
				}),
				...(body.portfolioDraftId && {
					portfolioDraft: { connect: { id: portfolioDraftId, }, },
				}),
				...(body.bankListId && {
					bankList: { connect: { id: bankListId, }, },
				}),
			},
		},)
	}

	/**
	 * Retrieves a list of bank records associated with a specific client ID.
	 * @param entityId - The unique identifier of the client for which to retrieve bank records.
	 * @returns A promise that resolves to an array of bank records associated with the specified client ID.
	 * @throws Will throw an error if the `clientId` parameter is not provided.
	 */
	public async getBanksByClientId(clientId: string,): Promise<Array<TBankExtended>> {
		const banks = await this.prismaService.bank.findMany({
			where: {
				clientId,
				portfolio: {
					isActivated: true,
				},
			},
			include: {
				bankList: true,
			},
		},)

		return banks.map((bank,) => {
			return {
				...bank,
				country:    this.cryptoService.decryptString(bank.country,),
				branchName: this.cryptoService.decryptString(bank.branchName,),
				firstName:  bank.firstName ?
					this.cryptoService.decryptString(bank.firstName,) :
					null,
				lastName:   bank.lastName ?
					this.cryptoService.decryptString(bank.lastName,) :
					null,
				email:     bank.email ?
					this.cryptoService.decryptString(bank.email,) :
					null,
			}
		},)
	}

	/**
	 * Retrieves a list of bank records associated with a specific entity ID.
	 * @param entityId - The unique identifier of the entity for which to retrieve bank records.
	 * @returns A promise that resolves to an array of bank records associated with the specified entity ID.
	 * @throws Will throw an error if the `entityId` parameter is not provided.
	 */
	public async getBanksByEntityId(entityId: string,): Promise<Array<Bank>> {
		const banks = await this.prismaService.bank.findMany({
			where: {
				entityId,
			},
		},)
		return banks.map((bank,) => {
			return {
				...bank,
				country:    this.cryptoService.decryptString(bank.country,),
				branchName: this.cryptoService.decryptString(bank.branchName,),
				firstName:  bank.firstName ?
					this.cryptoService.decryptString(bank.firstName,) :
					null,
				lastName:   bank.lastName ?
					this.cryptoService.decryptString(bank.lastName,) :
					null,
				email:     bank.email ?
					this.cryptoService.decryptString(bank.email,) :
					null,
			}
		},)
	}

	/**
	 * Retrieves a list of bank records associated with a specific portfolio or portfolio draft ID.
	 * @param id - The unique identifier of the portfolio or portfolio draft for which to retrieve bank records.
	 * @returns A promise that resolves to an array of bank records associated with the specified portfolio or portfolio draft ID.
	 * @throws Will throw an error if the `id` parameter is not provided.
	 */
	public async getBankListByPortfolioId(id: string,): Promise<Array<Bank>> {
		const banks = await this.prismaService.bank.findMany({
			where: {
				OR: [
					{ portfolioId: id, },
					{ portfolioDraftId: id, },
				],
			},
		},)
		return banks.map((bank,) => {
			return {
				...bank,
				country:    this.cryptoService.decryptString(bank.country,),
				branchName: this.cryptoService.decryptString(bank.branchName,),
				firstName:  bank.firstName ?
					this.cryptoService.decryptString(bank.firstName,) :
					null,
				lastName:   bank.lastName ?
					this.cryptoService.decryptString(bank.lastName,) :
					null,
				email:     bank.email ?
					this.cryptoService.decryptString(bank.email,) :
					null,
			}
		},)
	}

	/**
	 * Retrieves a list of bank records associated with multiple entity IDs.
	 * @param ids - An array of unique identifiers of entities for which to retrieve bank records.
	 * @returns A promise that resolves to an array of bank records associated with the specified entity IDs.
	 * @throws Will throw an error if the `ids` parameter is not provided or is empty.
	 */
	public async getBankListBySourceIds(data: GetBanksBySourceIdsDto, clientId?: string,): Promise<Array<Bank>> {
		const {clientIds, portfolioIds, entityIds,} = data

		const banks = await this.prismaService.bank.findMany({
			where: {
				clientId:    {in: clientIds,},
				portfolioId:  { in: portfolioIds, },
				entityId:    { in: entityIds, },
				...(clientId ?
					{
						client: {
							id: clientId,
						},
					} :
					{}),
				portfolio:   {
					isActivated: true,
				},
			},
		},)
		return banks.map((bank,) => {
			return {
				...bank,
				country:    this.cryptoService.decryptString(bank.country,),
				branchName: this.cryptoService.decryptString(bank.branchName,),
				firstName:  bank.firstName ?
					this.cryptoService.decryptString(bank.firstName,) :
					null,
				lastName:   bank.lastName ?
					this.cryptoService.decryptString(bank.lastName,) :
					null,
				email:     bank.email ?
					this.cryptoService.decryptString(bank.email,) :
					null,
			}
		},)
	}

	/**
	 * Updates an existing bank record in the database.
	 * @param id - The unique identifier of the bank record to update.
	 * @param body - The updated data for the bank record.
	 * @returns A promise that resolves to the updated bank record.
	 * @throws Will throw an error if the `id` parameter is not provided.
	 * @throws Will throw an error if the `body` parameter is not provided.
	 */
	public async updateBank(id: string, body: UpdateBankDto,): Promise<Bank> {
		const {bankListId, country, branchName, firstName, lastName, email, ...data} = body
		const updatedBank = await this.prismaService.bank.update({
			where: {
				id,
			},
			data: {
				...data,
				...(country ?
					{ country: this.cryptoService.encryptString(country,), } :
					{}),
				...(branchName ?
					{ branchName: this.cryptoService.encryptString(branchName,), } :
					{}),
				...(firstName ?
					{ firstName: this.cryptoService.encryptString(firstName,), } :
					{}),
				...(lastName ?
					{ lastName: this.cryptoService.encryptString(lastName,), } :
					{}),
				...(email ?
					{ email: this.cryptoService.encryptString(email,), } :
					{}),
				...(bankListId && {
					bankList: {
						connect: { id: bankListId, },
					},
				}),
			},
		},)
		await this.cacheService.deleteByUrl([
			`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${updatedBank.portfolioId}`,
		],)
		return updatedBank
	}

	public async getBanksBySourceId(query: Prisma.BankWhereInput,): Promise<Array<Bank>> {
		const banks = await this.prismaService.bank.findMany({
			where: query,
		},)
		return banks.map((bank,) => {
			return {
				...bank,
				country:    this.cryptoService.decryptString(bank.country,),
				branchName: this.cryptoService.decryptString(bank.branchName,),
				firstName:  bank.firstName ?
					this.cryptoService.decryptString(bank.firstName,) :
					null,
				lastName:   bank.lastName ?
					this.cryptoService.decryptString(bank.lastName,) :
					null,
				email:     bank.email ?
					this.cryptoService.decryptString(bank.email,) :
					null,
			}
		},)
	}
}