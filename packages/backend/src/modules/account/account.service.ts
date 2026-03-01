/* eslint-disable complexity */
import { PrismaService, } from 'nestjs-prisma'
import type { Account, Prisma, } from '@prisma/client'
import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'

import { CBondsCurrencyService, } from '../apis/cbonds-api/services'
import { AssetService, } from '../asset/asset.service'
import { text, } from '../../shared/text'
import { RedisCacheService, } from '../redis-cache/redis-cache.service'
import type { AccountSourceIdsDto, AddAccountDto, GetAccountsBySourceIdsDto, } from './dto'
import type { IAccountExtended, } from './accout.types'
import { PortfolioRoutes, } from '../portfolio/portfolio.constants'
import { CryptoService, } from '../crypto/crypto.service'

@Injectable()
export class AccountService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly cacheService: RedisCacheService,
		private readonly cryptoService: CryptoService,
		private readonly assetService: AssetService,
	) {}

	/**
	 * 2.2.1
	 * Creates a new account with the provided data.
	 * @param body - An object containing the data for the new account, including portfolio or draft IDs.
	 * @throws Will throw an HTTP exception with status 400 if neither `portfolioId` nor `portfolioDraftId` is provided.
	 * @returns A promise that resolves to the newly created account.
	 */
	public async createAccount(body: AddAccountDto,): Promise<Account> {
		if (!body.portfolioId && !body.portfolioDraftId) {
			throw new HttpException(text.wrongId, HttpStatus.BAD_REQUEST,)
		}
		const {accountName,} = body
		await this.cacheService.deleteByUrl([
			`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${body.portfolioId}`,
		],)
		return this.prismaService.account.create({
			data: {
				...body,
				accountName: this.cryptoService.encryptString(accountName,),
			},
		},)
	}

	/**
	 * 2.3.4
	 * Updates an existing account with the provided data.
	 * @param id - The unique identifier of the account to update.
	 * @param body - An object containing the updated data for the account.
	 * @throws Will throw an HTTP exception with status 404 if no account with the provided `id` is found.
	 * @returns A promise that resolves to the updated account.
	 */
	public async updateAccount(id: string, body: Prisma.AccountUpdateInput,): Promise<Account> {
		const {accountName,} = body
		const updatedAccount = await this.prismaService.account.update({
			where: {
				id,
			},
			data: {
				...body,
				...(accountName && typeof accountName === 'string' ?
					{ accountName: this.cryptoService.encryptString(accountName,), } :
					{}),
			},
		},)
		await this.cacheService.deleteByUrl([
			`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${updatedAccount.portfolioId}`,
		],)
		return updatedAccount
	}

	/**
	 * 4.2.1
	 * Retrieves a list of accounts associated with a specific entity.
	 * @param entityId - The unique identifier of the entity for which to retrieve accounts.
	 * @throws Will not throw any exceptions.
	 * @returns A promise that resolves to an array of accounts associated with the specified entity.
	 */
	public async getAccountsByEntityId(entityId: string,): Promise<Array<Account>> {
		const accounts = await this.prismaService.account.findMany({
			where: {
				entityId,
			},
			include: {
				assets: true,
			},
		},)
		return accounts.map((account,) => {
			const accountName = this.cryptoService.decryptString(account.accountName,)
			return {
				...account,
				accountName,
			}
		},)
	}

	/**
	 * 2.3.4
	 * Retrieves a list of accounts associated with a specific bank.
	 * @param bankId - The unique identifier of the bank for which to retrieve accounts.
	 * @throws Will not throw any exceptions.
	 * @returns A promise that resolves to an array of accounts associated with the specified bank.
	 */
	public async getAccountsByBankId(bankId: string,): Promise<Array<Account>> {
		const accounts = await this.prismaService.account.findMany({
			where: {
				bankId,
			},
		},)
		return accounts.map((account,) => {
			const accountName = this.cryptoService.decryptString(account.accountName,)
			return {
				...account,
				accountName,
			}
		},)
	}

	/**
 * 2.3.4
 * Retrieves a list of accounts associated with specific banks.
 * @param bankIds - The unique identifiers of the banks for which to retrieve accounts.
 * @throws Will not throw any exceptions.
 * @returns A promise that resolves to an array of accounts associated with the specified banks.
 */
	public async getAccountsByBanksIds(data: GetAccountsBySourceIdsDto, clientId?: string,): Promise<Array<Account>> {
		const {portfolioIds, clientIds, entityIds, bankIds,} = data
		const accounts = await this.prismaService.account.findMany({
			where: {
				bankId:      { in: bankIds, },
				portfolioId:  { in: portfolioIds, },
				entityId:    { in: entityIds, },
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
		return accounts.map((account,) => {
			const accountName = this.cryptoService.decryptString(account.accountName,)
			return {
				...account,
				accountName,
			}
		},)
	}

	/**
	 * 2.3.4
	 * Retrieves a list of account records associated with a specific portfolio or portfolio draft ID.
	 * @param id - The unique identifier of the portfolio or portfolio draft for which to retrieve bank records.
	 * @throws Will throw an error if the `id` parameter is not provided.
	 * @returns A promise that resolves to an array of account records associated with the specified portfolio or portfolio draft ID.
	 */
	public async getAccountListByPortfolioId(id: string,): Promise<Array<Account>> {
		const accounts = await this.prismaService.account.findMany({
			where: {
				OR: [
					{ portfolioId: id, },
					{ portfolioDraftId: id, },
				],
			},
		},)
		return accounts.map((account,) => {
			const accountName = this.cryptoService.decryptString(account.accountName,)
			return {
				...account,
				accountName,
			}
		},)
	}

	/**
 * Retrieves the total assets of a specific account.
 * @remarks
 * This endpoint fetches the account based on its unique identifier and calculates the total assets associated with it.
 * It aggregates asset data from various sources including currency, metals, crypto, bonds, and CBonds.
 * @param id - The unique identifier of the account to retrieve assets for.
 * @throws Will throw an HTTP exception with status 404 if no account with the provided `id` is found.
 * @returns A promise that resolves to the account data along with the calculated total assets.
 */
	public async getAccountAssetsTotalById(id: string,): Promise<IAccountExtended & { totalAssets: number }> {
		const account = await this.prismaService.account.findUnique({
			where: {
				id,
			},
			include: {
				assets: true,
			},
		},)
		if (!account) {
			throw new HttpException(text.accountNotExist, HttpStatus.NOT_FOUND,)
		}
		const [currencyList,metalList,cryptoList,transactions, bonds, equities, etfs,] = await Promise.all([
			this.cBondsCurrencyService.getAllCurrencies(),
			this.prismaService.metalData.findMany(),
			this.prismaService.cryptoData.findMany(),
			this.prismaService.transaction.findMany({ where: {
				accountId: id,
			}, },),
			this.prismaService.bond.findMany(),
			this.prismaService.equity.findMany(),
			this.prismaService.etf.findMany(),
		],)
		const accountName = this.cryptoService.decryptString(account.accountName,)
		const totalAssets = account.assets.reduce((sum, asset,) => {
			const { totalAssets, } = this.assetService.getTotalByAssetCBondsParted(asset, {
				currencyList,
				metalList,
				cryptoList,
				bonds,
				equities,
				etfs,
			},)
			return sum + totalAssets
		}, 0,)
		const totalTransactions = transactions.reduce((sum, transaction,) => {
			return sum + (Number(transaction.amount,) * (transaction.rate ?? 1))
		}, 0,)
		return {
			...account,
			accountName,
			totalAssets: totalTransactions + totalAssets,
		}
	}

	public async getAccountsBySourceIds(body: AccountSourceIdsDto,): Promise<Array<Account>> {
		const filters: Array<Prisma.AccountWhereInput> = [
			body.portfolioIds?.length ?
				{ portfolioId: { in: body.portfolioIds, }, } :
				undefined,
			body.portfolioDraftIds?.length ?
				{ portfolioDraftId: { in: body.portfolioDraftIds, }, } :
				undefined,
			body.entityIds?.length ?
				{ entityId: { in: body.entityIds, }, } :
				undefined,
			body.bankIds ?
				{ bankId: { in: body.bankIds, }, } :
				undefined,
			...(body.bankListIds?.length ?
				[{
					bank: {
						is: {
							bankListId: { in: body.bankListIds, },
						},
					},
				},] :
				[]),
		].filter((f,): f is NonNullable<typeof f> => {
			return Boolean(f,)
		},)

		const accounts = await this.prismaService.account.findMany({
			where: {
				AND: filters.length > 0 ?
					filters :
					undefined ,
				portfolio: {
					isActivated: true,
					clientId:    {
						in:  body.clientIds,
					},
				},
			},
		},)
		return accounts.map((account,) => {
			const accountName = this.cryptoService.decryptString(account.accountName,)
			return {
				...account,
				accountName,
			}
		},)
	}
}