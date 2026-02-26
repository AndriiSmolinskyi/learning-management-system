/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
/* eslint-disable max-lines */
import { PrismaService,} from 'nestjs-prisma'
import {HttpException, HttpStatus, Injectable,} from '@nestjs/common'

import {ERROR_MESSAGES, } from '../../shared/constants'
import {AssetService,} from '../../modules/asset/asset.service'
import {CBondsCurrencyService,} from '../../modules/apis/cbonds-api/services'
import {DocumentService,} from '../../modules/document/document.service'

import type {InstancesTotalAssets, RefactoredInstancesTotalAssets,} from './portfolio.types'
import type {IPortfolio, IPortfolioDetailedThirdPartyList, IPortfolioDetailedThirdPartyListCBondsParted, TPortfolioForCalcsForCacheUpdate, TPortfolioForCalcsWithRelations,} from '../../modules/portfolio/portfolio.types'
import {
	type IPortfolioChartResponse,
	PortfolioChartFilterEnum,
	type PortfolioWithExtendedRelations,
} from '../../modules/portfolio/portfolio.types'
import {AssetOperationType, CryptoType, MetalType,} from '../../shared/types'
import type {Asset,} from '@prisma/client'
import {CurrencyDataList,} from '@prisma/client'
import type {
	IBondsAsset,
	ICashAsset,
	ICollateralAsset,
	ICryptoAsset,
	IDepositAsset,
	IEquityAsset,
	IGetTotalByAssetLists,
	IGetTotalByAssetListsCBondsParted,
	ILoanAsset,
	IMetalsAsset,
	IOptionAsset,
	IOtherAsset,
	IPrivateAsset,
	IRealEstateAsset,
	TAssetExtended,
} from '../../modules/asset/asset.types'
import {AssetNamesType,} from '../../modules/asset/asset.types'
import type {UnionAssetType,} from '../../shared/utils'
import {assetParser,} from '../../shared/utils'
import type {TCurrencyDataWithHistory,} from '../../modules/apis/cbonds-api/cbonds-api.types'
import type {TUsdTotals,} from '../../modules/analytics/analytics.types'
import { CryptoService, } from '../../modules/crypto/crypto.service'

@Injectable()
export class PortfolioRepository {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly assetService: AssetService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly documentService: DocumentService,
		private readonly cryptoService: CryptoService,
	) {}

	/**
 	* 2.2.5
 	* Retrieves portfolio details by its unique identifier.
 	* @remarks
 	* This method is designed to fetch detailed information about a specific portfolio, including its related documents, entities, banks, accounts, and assets. The related entities and assets are included with descending order of their creation dates for chronological relevance.
 	*
 	* @param {string} id - The unique identifier of the portfolio to retrieve.
 	* @returns A `Promise` that resolves to a `PortfolioWithRelations` object containing the portfolio details, or `null` if no portfolio is found.
 	* @throws Will throw an error if there is an issue with the database query.
 	*/
	public async getPortfolioDetailsById(id: string,): Promise<PortfolioWithExtendedRelations | null> {
		const portfolio = await this.prismaService.portfolio.findUnique({
			where: {
				id,
			},
			include: {
				documents:       {
					orderBy: {
						createdAt: 'desc',
					},
				},
				entities:        {
					include: {
						assets: {
							orderBy: {
								createdAt: 'desc',
							},
						},
						transactions: true,
					},
					orderBy: {
						createdAt: 'desc',
					},
				},
				banks:     {
					include: {
						assets: {
							orderBy: {
								createdAt: 'desc',
							},
						},
						bankList:     true,
						transactions: true,
					},
					orderBy: {
						createdAt: 'desc',
					},
				},
				accounts:  {
					include: {
						assets: {
							orderBy: {
								createdAt: 'desc',
							},
						},
						transactions: true,
					},
					orderBy: {
						createdAt: 'desc',
					},
				},
				assets:    {
					where: {
						isArchived: false,
					},
					orderBy: {
						createdAt: 'desc',
					},
				},
				client: {
					select: {
						lastName:  true,
						firstName: true,
					},
				},
			},
		},)
		if (!portfolio) {
			return null
		}
		return {
			...portfolio,
			name:        this.cryptoService.decryptString(portfolio.name,),
			...(portfolio.resident ?
				{resident:    this.cryptoService.decryptString(portfolio.resident,),} :
				{}),
			...(portfolio.taxResident ?
				{taxResident:    this.cryptoService.decryptString(portfolio.taxResident,),} :
				{}),
			entities: portfolio.entities.map((entity,) => {
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
			},),
			banks: portfolio.banks.map((bank,) => {
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
			},),
			accounts: portfolio.accounts.map((account,) => {
				return {
					...account,
					accountName: this.cryptoService.decryptString(account.accountName,),
				}
			},),
			client: {
				lastName:  this.cryptoService.decryptString(portfolio.client.lastName,),
				firstName: this.cryptoService.decryptString(portfolio.client.firstName,),
			},
		}
	}

	/**
 	* 2.2.5
 	* Calculates the total assets of various instances (entities, banks, accounts, and assets) within a portfolio.
 	* @remarks
	 * This method aggregates the total asset values for all entities, banks, accounts, and assets in a given portfolio. The values are retrieved using `assetService` and optionally converted to USD using the `cBondsCurrencyService`.
 	*
 	* @param {PortfolioWithRelations} portfolio - The portfolio containing instances (entities, banks, accounts, assets) for which total asset values are calculated.
 	* @returns A `Promise` that resolves to an `InstancesTotalAssets` object containing the total asset values for each instance category.
 	* @throws Will throw an error if there is an issue during asset calculation or data retrieval.
 	*/
	// New Version
	public async getInstancesTotalAssetsOfPortfolio(portfolio: PortfolioWithExtendedRelations,): Promise<RefactoredInstancesTotalAssets & {assetsAmount:number}> {
		try {
			const currencyListPromise = this.cBondsCurrencyService.getAllCurrencies()
			const transactionsPromise = this.prismaService.transaction.findMany({
				where: {
					portfolioId: portfolio.id,
				},
			},)
			const now = new Date()
			const bondAssetsPromise = this.prismaService.assetBondGroup.findMany({
				where: {
					portfolioId:  portfolio.id,
					portfolio:   {
						isActivated: true,
					},
					totalUnits: {
						gt: 0,
					},
					marketPrice: {
						not: 0,
					},
					OR: [
						{ maturityDate: null, },
						{ maturityDate: { gte: now, }, },
					],
					transferDate: null,
				},
				select: {
					marketValueUSD: true,
					entityId:       true,
					bankId:         true,
					accountId:      true,
					assetName:      true,
					id:             true,
				},
			},)
			const cryptoAssetsPromise = this.prismaService.assetCryptoGroup.findMany({
				where: {
					portfolioId:  portfolio.id,
					portfolio:   {
						isActivated: true,
					},
					totalUnits: {
						gt: 0,
					},
					transferDate: null,
				},
				select: {
					marketValueUSD: true,
					entityId:       true,
					bankId:         true,
					accountId:      true,
					assetName:      true,
					id:             true,
				},
			},)
			const equityAssetsPromise = this.prismaService.assetEquityGroup.findMany({
				where: {
					portfolioId:  portfolio.id,
					portfolio:   {
						isActivated: true,
					},
					totalUnits: {
						gt: 0,
					},
					currentStockPrice: {
						not: 0,
					},
					transferDate: null,
				},
				select: {
					marketValueUSD: true,
					entityId:       true,
					bankId:         true,
					accountId:      true,
					assetName:      true,
					id:             true,
				},
			},)
			const metalAssetsPromise = this.prismaService.assetMetalGroup.findMany({
				where: {
					portfolioId:  portfolio.id,
					portfolio:   {
						isActivated: true,
					},
					totalUnits: {
						gt: 0,
					},
					transferDate: null,
				},
				select: {
					marketValueUSD: true,
					entityId:       true,
					bankId:         true,
					accountId:      true,
					assetName:      true,
					id:             true,
				},
			},)
			const depositAssetsPromise = this.prismaService.assetDeposit.findMany({
				where: {
					portfolioId:  portfolio.id,
					portfolio:   {
						isActivated: true,
					},
					usdValue: {
						not: 0,
					},
					OR: [
						{ maturityDate: null, },
						{ maturityDate: { gt: now, }, },
					],
					transferDate: null,
				},
				select: {
					usdValue:  true,
					entityId:  true,
					bankId:    true,
					accountId: true,
					assetName:      true,
					id:        true,
				},
			},)
			const loanAssetsPromise = this.prismaService.assetLoan.findMany({
				where: {
					portfolioId:  portfolio.id,
					portfolio:   {
						isActivated: true,
					},
					usdValue: {
						not: 0,
					},
					maturityDate: { gt: now, },
					transferDate: null,
				},
				select: {
					usdValue:  true,
					entityId:  true,
					bankId:    true,
					accountId: true,
					assetName:      true,
					id:        true,
				},
			},)
			const optionAssetsPromise = this.prismaService.assetOption.findMany({
				where: {
					portfolioId:  portfolio.id,
					portfolio:   {
						isActivated: true,
					},
					marketValueUSD: {
						not: 0,
					},
					maturityDate: { gt: now, },
					transferDate: null,
				},
				select: {
					marketValueUSD: true,
					entityId:       true,
					bankId:         true,
					accountId:      true,
					assetName:      true,
					id:             true,
				},
			},)
			const otherAssetsPromise = this.prismaService.assetOtherInvestment.findMany({
				where: {
					portfolioId:  portfolio.id,
					portfolio:   {
						isActivated: true,
					},
					usdValue: {
						not: 0,
					},
					transferDate: null,
				},
				select: {
					marketValueUSD: true,
					entityId:       true,
					bankId:         true,
					accountId:      true,
					assetName:      true,
					id:             true,
				},
			},)
			const peAssetsPromise = this.prismaService.assetPrivateEquity.findMany({
				where: {
					portfolioId:  portfolio.id,
					portfolio:   {
						isActivated: true,
					},
					marketValueUSD: {
						not: 0,
					},
					transferDate: null,
				},
				select: {
					marketValueUSD: true,
					entityId:       true,
					bankId:         true,
					accountId:      true,
					assetName:      true,
					id:             true,
				},
			},)
			const reAssetsPromise = this.prismaService.assetRealEstate.findMany({
				where: {
					portfolioId:  portfolio.id,
					portfolio:   {
						isActivated: true,
					},
					usdValue: {
						not: 0,
					},
					transferDate: null,
				},
				select: {
					marketValueUSD: true,
					entityId:       true,
					bankId:         true,
					accountId:      true,
					assetName:      true,
					id:             true,
				},
			},)
			const cashAssetsPromise = this.prismaService.assetCash.findMany({
				where: {
					portfolioId:  portfolio.id,
					portfolio:   {
						isActivated: true,
					},
				},
			},)
			const [
				cashAssets,
				bondAssets,
				cryptoAssets,
				equityAssets,
				metalAssets,
				depositAssets,
				loanAssets,
				optionAssets,
				otherAssets,
				peAssets,
				reAssets,
				currencyList,
				transactions,
			] = await Promise.all([
				cashAssetsPromise,
				bondAssetsPromise,
				cryptoAssetsPromise,
				equityAssetsPromise,
				metalAssetsPromise,
				depositAssetsPromise,
				loanAssetsPromise,
				optionAssetsPromise,
				otherAssetsPromise,
				peAssetsPromise,
				reAssetsPromise,
				currencyListPromise,
				transactionsPromise,
			],)
			const assetsAmount = [
				cashAssets,
				bondAssets,
				cryptoAssets,
				equityAssets,
				metalAssets,
				depositAssets,
				loanAssets,
				optionAssets,
				otherAssets,
				peAssets,
				reAssets,
			].reduce<number>((acc, item,) => {
				return acc + item.length
			},0,)

			const entitiesWithTotalAssetsValue = portfolio.entities.map((entity,) => {
				const entitiesTotalTransactions = entity.transactions.reduce((sum, transaction,) => {
					return sum + this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
						currency:      transaction.currency as CurrencyDataList,
						currencyValue: Number(transaction.amount,),
						currencyList,
					},)
				}, 0,)
				const marketValueUSDs = [
					...bondAssets,
					...cryptoAssets,
					...equityAssets,
					...metalAssets,
					...optionAssets,
					...otherAssets,
					...peAssets,
					...reAssets,
				].reduce<number>((acc, item,) => {
					if (item.entityId !== entity.id) {
						return acc
					}
					return item.marketValueUSD + acc
				}, 0,)
				const valueUSDs = [
					...depositAssets,
					...loanAssets,
				].reduce<number>((acc, item,) => {
					if (item.entityId !== entity.id) {
						return acc
					}
					return item.usdValue + acc
				}, 0,)
				return {
					...entity,
					assets:       [],
					transactions: [],
					name:         this.cryptoService.decryptString(entity.name,),
					totalAssets:  marketValueUSDs + valueUSDs + entitiesTotalTransactions,
				}
			},)
			const banksWithTotalAssetsValue = portfolio.banks.map((bank,) => {
				const banksTotalTransactions = bank.transactions.reduce((sum, transaction,) => {
					return sum + this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
						currency:      transaction.currency as CurrencyDataList,
						currencyValue: Number(transaction.amount,),
						currencyList,
					},)
				}, 0,)
				const marketValueUSDs = [
					...bondAssets,
					...cryptoAssets,
					...equityAssets,
					...metalAssets,
					...optionAssets,
					...otherAssets,
					...peAssets,
					...reAssets,
				].reduce<number>((acc, item,) => {
					if (item.bankId !== bank.id) {
						return acc
					}
					return item.marketValueUSD + acc
				}, 0,)
				const valueUSDs = [
					...depositAssets,
					...loanAssets,
				].reduce<number>((acc, item,) => {
					if (item.bankId !== bank.id) {
						return acc
					}
					return item.usdValue + acc
				}, 0,)
				return {
					...bank,
					assets:       [],
					transactions: [],
					totalAssets:  marketValueUSDs + valueUSDs + banksTotalTransactions,
				}
			},)
			// clear if good version good
			// const accountsWithTotalAssetsValue = portfolio.accounts.map((account,) => {
			// 	const filteredTransactions = account.transactions.filter((transaction,) => {
			// 		return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
			// 	},)
			// 	const accountsTotalTransactions = filteredTransactions.reduce((sum, transaction,) => {
			// 		return sum + this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
			// 			currency:      transaction.currency as CurrencyDataList,
			// 			currencyValue: Number(transaction.amount,),
			// 			currencyList,
			// 		},)
			// 	}, 0,)
			// 	const initialCurrencyTotals: Record<CurrencyDataList, number> = Object.fromEntries(
			// 		Object.values(CurrencyDataList,).map((currency,) => {
			// 			return [currency, 0,]
			// 		},),
			// 	) as Record<CurrencyDataList, number>

			// 	const accountsCurrencyTotals = account.transactions.reduce<Record<CurrencyDataList, number>>(
			// 		(acc, transaction,) => {
			// 			const currency = transaction.currency as CurrencyDataList
			// 			acc[currency] = (acc[currency] ?? 0) + this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
			// 				currency:      transaction.currency as CurrencyDataList,
			// 				currencyValue: Number(transaction.amount,),
			// 				currencyList,
			// 			},)
			// 			return acc
			// 		},
			// 		initialCurrencyTotals,
			// 	)
			// 	const marketValueUSDs = [
			// 		...bondAssets,
			// 		...cryptoAssets,
			// 		...equityAssets,
			// 		...metalAssets,
			// 		...optionAssets,
			// 		...otherAssets,
			// 		...peAssets,
			// 		...reAssets,
			// 	].reduce<number>((acc, item,) => {
			// 		if (item.accountId !== account.id) {
			// 			return acc
			// 		}
			// 		return item.marketValueUSD + acc
			// 	}, 0,)
			// 	const valueUSDs = [
			// 		...depositAssets,
			// 		...loanAssets,
			// 	].reduce<number>((acc, item,) => {
			// 		if (item.accountId !== account.id) {
			// 			return acc
			// 		}
			// 		return item.usdValue + acc
			// 	}, 0,)
			// 	const bondValues = bondAssets.reduce<number>((acc, item,) => {
			// 		if (item.accountId !== account.id) {
			// 			return acc
			// 		}
			// 		return item.marketValueUSD + acc
			// 	}, 0,)
			// 	const depositValues = depositAssets.reduce<number>((acc, item,) => {
			// 		if (item.accountId !== account.id) {
			// 			return acc
			// 		}
			// 		return item.usdValue + acc
			// 	}, 0,)
			// 	const loanValues = loanAssets.reduce<number>((acc, item,) => {
			// 		if (item.accountId !== account.id) {
			// 			return acc
			// 		}
			// 		return item.usdValue + acc
			// 	}, 0,)
			// 	const equityValues = equityAssets.reduce<number>((acc, item,) => {
			// 		if (item.accountId !== account.id) {
			// 			return acc
			// 		}
			// 		return item.marketValueUSD + acc
			// 	}, 0,)
			// 	const cryptoValues = cryptoAssets.reduce<number>((acc, item,) => {
			// 		if (item.accountId !== account.id) {
			// 			return acc
			// 		}
			// 		return item.marketValueUSD + acc
			// 	}, 0,)
			// 	const metalValues = metalAssets.reduce<number>((acc, item,) => {
			// 		if (item.accountId !== account.id) {
			// 			return acc
			// 		}
			// 		return item.marketValueUSD + acc
			// 	}, 0,)
			// 	const optionValues = optionAssets.reduce<number>((acc, item,) => {
			// 		if (item.accountId !== account.id) {
			// 			return acc
			// 		}
			// 		return item.marketValueUSD + acc
			// 	}, 0,)
			// 	const otherValues = otherAssets.reduce<number>((acc, item,) => {
			// 		if (item.accountId !== account.id) {
			// 			return acc
			// 		}
			// 		return item.marketValueUSD + acc
			// 	}, 0,)
			// 	const peValues = peAssets.reduce<number>((acc, item,) => {
			// 		if (item.accountId !== account.id) {
			// 			return acc
			// 		}
			// 		return item.marketValueUSD + acc
			// 	}, 0,)
			// 	const reValues = reAssets.reduce<number>((acc, item,) => {
			// 		if (item.accountId !== account.id) {
			// 			return acc
			// 		}
			// 		return item.marketValueUSD + acc
			// 	}, 0,)
			// 	return {
			// 		...account,
			// 		accountName:                this.cryptoService.decryptString(account.accountName,),
			// 		totalAssets:                marketValueUSDs + valueUSDs + accountsTotalTransactions,
			// 		accountsTotalTransactions,
			// 		accountsCurrencyTotals,
			// 		assets:                     [],
			// 		transactions:               [],
			// 		assetsWithTotalAssetsValue: [
			// 			{
			// 				assetName:   AssetNamesType.BONDS,
			// 				totalAssets:    bondValues,
			// 				portfolioId:  account.portfolioId,
			// 				entityId:    account.entityId,
			// 				bankId:      account.bankId ?? '',
			// 				accountId:    account.id,
			// 			},
			// 			{
			// 				assetName:   AssetNamesType.CASH_DEPOSIT,
			// 				totalAssets:    depositValues,
			// 				portfolioId:  account.portfolioId,
			// 				entityId:    account.entityId,
			// 				bankId:      account.bankId ?? '',
			// 				accountId:    account.id,
			// 			},
			// 			{
			// 				assetName:   AssetNamesType.LOAN,
			// 				totalAssets:    loanValues,
			// 				portfolioId:  account.portfolioId,
			// 				entityId:    account.entityId,
			// 				bankId:      account.bankId ?? '',
			// 				accountId:    account.id,
			// 			},
			// 			{
			// 				assetName:   AssetNamesType.EQUITY_ASSET,
			// 				totalAssets:    equityValues,
			// 				portfolioId:  account.portfolioId,
			// 				entityId:    account.entityId,
			// 				bankId:      account.bankId ?? '',
			// 				accountId:    account.id,
			// 			},
			// 			{
			// 				assetName:   AssetNamesType.CRYPTO,
			// 				totalAssets:    cryptoValues,
			// 				portfolioId:  account.portfolioId,
			// 				entityId:    account.entityId,
			// 				bankId:      account.bankId ?? '',
			// 				accountId:    account.id,
			// 			},
			// 			{
			// 				assetName:   AssetNamesType.METALS,
			// 				totalAssets:    metalValues,
			// 				portfolioId:  account.portfolioId,
			// 				entityId:    account.entityId,
			// 				bankId:      account.bankId ?? '',
			// 				accountId:    account.id,
			// 			},
			// 			{
			// 				assetName:   AssetNamesType.OPTIONS,
			// 				totalAssets:    optionValues,
			// 				portfolioId:  account.portfolioId,
			// 				entityId:    account.entityId,
			// 				bankId:      account.bankId ?? '',
			// 				accountId:    account.id,
			// 			},
			// 			{
			// 				assetName:   AssetNamesType.OTHER,
			// 				totalAssets:    otherValues,
			// 				portfolioId:  account.portfolioId,
			// 				entityId:    account.entityId,
			// 				bankId:      account.bankId ?? '',
			// 				accountId:    account.id,
			// 			},
			// 			{
			// 				assetName:   AssetNamesType.PRIVATE_EQUITY,
			// 				totalAssets:    peValues,
			// 				portfolioId:  account.portfolioId,
			// 				entityId:    account.entityId,
			// 				bankId:      account.bankId ?? '',
			// 				accountId:    account.id,
			// 			},
			// 			{
			// 				assetName:   AssetNamesType.REAL_ESTATE,
			// 				totalAssets:    reValues,
			// 				portfolioId:  account.portfolioId,
			// 				entityId:    account.entityId,
			// 				bankId:      account.bankId ?? '',
			// 				accountId:    account.id,
			// 			},
			// 		],
			// 	}
			// },)

			const accountCashCurrenciesMap = cashAssets.reduce<Record<string, Array<CurrencyDataList>>>(
				(acc, cash,) => {
					if (!cash.accountId) {
						return acc
					}

					const currency = cash.currency as CurrencyDataList

					if (!acc[cash.accountId]) {
						acc[cash.accountId] = []
					}

					if (!acc[cash.accountId].includes(currency,)) {
						acc[cash.accountId].push(currency,)
					}

					return acc
				},
				{},
			)
			const totalCurrencyValuesByCurrency = transactions.reduce<Record<string, number>>(
				(acc, transaction,) => {
					const curr = transaction.currency
					acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
					return acc
				},
				{},
			)
			const accountsWithTotalAssetsValue = portfolio.accounts.map((account,) => {
				const filteredTransactions = account.transactions.filter((transaction,) => {
					return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
				},)

				const accountsTotalTransactions = filteredTransactions.reduce((sum, transaction,) => {
					return sum + this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
						currency:      transaction.currency as CurrencyDataList,
						currencyValue: Number(transaction.amount,),
						currencyList,
					},)
				}, 0,)

				const initialCurrencyTotals: Record<CurrencyDataList, number> = Object.fromEntries(
					Object.values(CurrencyDataList,).map((currency,) => {
						return [currency, 0,]
					},),
				) as Record<CurrencyDataList, number>

				const accountsCurrencyTotals = account.transactions.reduce<Record<CurrencyDataList, number>>(
					(acc, transaction,) => {
						const currency = transaction.currency as CurrencyDataList
						acc[currency] = (acc[currency] ?? 0) + this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
							currency:      transaction.currency as CurrencyDataList,
							currencyValue: Number(transaction.amount,),
							currencyList,
						},)
						return acc
					},
					initialCurrencyTotals,
				)

				const cashCurrencies = accountCashCurrenciesMap[account.id] ?? []

				const finalAccountsCurrencyTotals = {} as Record<CurrencyDataList, number>

				Object.entries(accountsCurrencyTotals,).forEach(([currency, total,],) => {
					const curr = currency as CurrencyDataList
					if (total !== 0 || cashCurrencies.includes(curr,)) {
						finalAccountsCurrencyTotals[curr] = total
					}
				},)

				const marketValueUSDs = [
					...bondAssets,
					...cryptoAssets,
					...equityAssets,
					...metalAssets,
					...optionAssets,
					...otherAssets,
					...peAssets,
					...reAssets,
				].reduce<number>((acc, item,) => {
					if (item.accountId !== account.id) {
						return acc
					}
					return item.marketValueUSD + acc
				}, 0,)

				const valueUSDs = [
					...depositAssets,
					...loanAssets,
				].reduce<number>((acc, item,) => {
					if (item.accountId !== account.id) {
						return acc
					}
					return item.usdValue + acc
				}, 0,)

				const bondValues = bondAssets.reduce<number>((acc, item,) => {
					if (item.accountId !== account.id) {
						return acc
					}
					return item.marketValueUSD + acc
				}, 0,)

				const depositValues = depositAssets.reduce<number>((acc, item,) => {
					if (item.accountId !== account.id) {
						return acc
					}
					return item.usdValue + acc
				}, 0,)

				const loanValues = loanAssets.reduce<number>((acc, item,) => {
					if (item.accountId !== account.id) {
						return acc
					}
					return item.usdValue + acc
				}, 0,)

				const equityValues = equityAssets.reduce<number>((acc, item,) => {
					if (item.accountId !== account.id) {
						return acc
					}
					return item.marketValueUSD + acc
				}, 0,)

				const cryptoValues = cryptoAssets.reduce<number>((acc, item,) => {
					if (item.accountId !== account.id) {
						return acc
					}
					return item.marketValueUSD + acc
				}, 0,)

				const metalValues = metalAssets.reduce<number>((acc, item,) => {
					if (item.accountId !== account.id) {
						return acc
					}
					return item.marketValueUSD + acc
				}, 0,)

				const optionValues = optionAssets.reduce<number>((acc, item,) => {
					if (item.accountId !== account.id) {
						return acc
					}
					return item.marketValueUSD + acc
				}, 0,)

				const otherValues = otherAssets.reduce<number>((acc, item,) => {
					if (item.accountId !== account.id) {
						return acc
					}
					return item.marketValueUSD + acc
				}, 0,)

				const peValues = peAssets.reduce<number>((acc, item,) => {
					if (item.accountId !== account.id) {
						return acc
					}
					return item.marketValueUSD + acc
				}, 0,)

				const reValues = reAssets.reduce<number>((acc, item,) => {
					if (item.accountId !== account.id) {
						return acc
					}
					return item.marketValueUSD + acc
				}, 0,)

				return {
					...account,
					accountName:                this.cryptoService.decryptString(account.accountName,),
					totalAssets:                marketValueUSDs + valueUSDs + accountsTotalTransactions,
					accountsTotalTransactions,
					accountsCurrencyTotals:     finalAccountsCurrencyTotals,
					assets:                     [],
					transactions:               [],
					assetsWithTotalAssetsValue: [
						{
							assetName:   AssetNamesType.BONDS,
							totalAssets: bondValues,
							portfolioId: account.portfolioId,
							entityId:    account.entityId,
							bankId:      account.bankId ?? '',
							accountId:   account.id,
						},
						{
							assetName:   AssetNamesType.CASH_DEPOSIT,
							totalAssets: depositValues,
							portfolioId: account.portfolioId,
							entityId:    account.entityId,
							bankId:      account.bankId ?? '',
							accountId:   account.id,
						},
						{
							assetName:   AssetNamesType.LOAN,
							totalAssets: loanValues,
							portfolioId: account.portfolioId,
							entityId:    account.entityId,
							bankId:      account.bankId ?? '',
							accountId:   account.id,
						},
						{
							assetName:   AssetNamesType.EQUITY_ASSET,
							totalAssets: equityValues,
							portfolioId: account.portfolioId,
							entityId:    account.entityId,
							bankId:      account.bankId ?? '',
							accountId:   account.id,
						},
						{
							assetName:   AssetNamesType.CRYPTO,
							totalAssets: cryptoValues,
							portfolioId: account.portfolioId,
							entityId:    account.entityId,
							bankId:      account.bankId ?? '',
							accountId:   account.id,
						},
						{
							assetName:   AssetNamesType.METALS,
							totalAssets: metalValues,
							portfolioId: account.portfolioId,
							entityId:    account.entityId,
							bankId:      account.bankId ?? '',
							accountId:   account.id,
						},
						{
							assetName:   AssetNamesType.OPTIONS,
							totalAssets: optionValues,
							portfolioId: account.portfolioId,
							entityId:    account.entityId,
							bankId:      account.bankId ?? '',
							accountId:   account.id,
						},
						{
							assetName:   AssetNamesType.OTHER,
							totalAssets: otherValues,
							portfolioId: account.portfolioId,
							entityId:    account.entityId,
							bankId:      account.bankId ?? '',
							accountId:   account.id,
						},
						{
							assetName:   AssetNamesType.PRIVATE_EQUITY,
							totalAssets: peValues,
							portfolioId: account.portfolioId,
							entityId:    account.entityId,
							bankId:      account.bankId ?? '',
							accountId:   account.id,
						},
						{
							assetName:   AssetNamesType.REAL_ESTATE,
							totalAssets: reValues,
							portfolioId: account.portfolioId,
							entityId:    account.entityId,
							bankId:      account.bankId ?? '',
							accountId:   account.id,
						},
					],
				}
			},)
			return {
				entitiesWithTotalAssetsValue,
				banksWithTotalAssetsValue,
				accountsWithTotalAssetsValue,
				assetsWithTotalAssetsValue: [],
				assetsAmount,
			}
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.INSTANCES_TOTAL_ASSETS_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	// public async getInstancesTotalAssetsOfPortfolio(portfolio: PortfolioWithExtendedRelations,): Promise<InstancesTotalAssets> {
	// 	try {
	// 		const currencyListPromise = this.cBondsCurrencyService.getAllCurrencies()
	// 		const cryptoListPromise = this.prismaService.cryptoData.findMany()
	// 		const metalListPromise = this.prismaService.metalData.findMany()
	// 		const bondPromise = this.prismaService.bond.findMany()
	// 		const equityPromise = this.prismaService.equity.findMany()
	// 		const etfPromise = this.prismaService.etf.findMany()
	// 		const transactionsPromise = this.prismaService.transaction.findMany({
	// 			where: {
	// 				portfolioId: portfolio.id,
	// 			},
	// 		},)
	// 		const [currencyList,cryptoList,transactions, metalList, bonds, equities, etfs,] = await Promise.all([
	// 			currencyListPromise,
	// 			cryptoListPromise,
	// 			transactionsPromise,
	// 			metalListPromise,
	// 			bondPromise,
	// 			equityPromise,
	// 			etfPromise,,
	// 		],)
	// 		const totalCurrencyValuesByCurrency = transactions.reduce<Record<string, number>>(
	// 			(acc, transaction,) => {
	// 				const curr = transaction.currency
	// 				acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
	// 				return acc
	// 			},
	// 			{},
	// 		)
	// 		const entitiesWithTotalAssetsValue = portfolio.entities.map((entity,) => {
	// 			const assetMap = new Map<string, { totalAssets: number; totalUnits: number | undefined }>()
	// 			const filteredTransactions = entity.transactions.filter((transaction,) => {
	// 				return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
	// 			},)
	// 			const entitiesTotalTransactions = filteredTransactions.reduce((sum, transaction,) => {
	// 				return sum + this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 					currency:      transaction.currency as CurrencyDataList,
	// 					currencyValue: Number(transaction.amount,),
	// 					currencyList,
	// 				},)
	// 			}, 0,)
	// 			entity.assets.forEach((asset,) => {
	// 				const { totalAssets, } = this.assetService.getTotalByAssetCBondsParted(asset, {
	// 					currencyList,
	// 					cryptoList,
	// 					bonds,
	// 					equities,
	// 					etfs,
	// 					metalList,
	// 				},)

	// 				const parsedPayload = JSON.parse(asset.payload as string,)
	// 				const operation = parsedPayload?.operation
	// 				const units = parsedPayload?.units
	// 				const isin = parsedPayload?.isin
	// 				const {currency,} = parsedPayload
	// 				const metalType = parsedPayload?.metalType

	// 				const key = isin ?
	// 					`${asset.assetName}_${asset.entityId}_${asset.bankId}_${asset.accountId}_${isin}_${currency}` :
	// 					metalType ?
	// 						`${asset.entityId}_${asset.bankId}_${asset.accountId}_${metalType}` :
	// 						`${asset.id}`
	// 				if (!assetMap.has(key,)) {
	// 					assetMap.set(key, { totalAssets: 0, totalUnits: 0, },)
	// 				}
	// 				const assetData = assetMap.get(key,)!
	// 				if (operation === AssetOperationType.SELL) {
	// 					assetData.totalAssets = assetData.totalAssets - totalAssets
	// 					if (units !== undefined) {
	// 						assetData.totalUnits = (assetData.totalUnits ?? 0) - units
	// 					}
	// 				} else {
	// 					assetData.totalAssets = assetData.totalAssets + totalAssets
	// 					if (units !== undefined) {
	// 						assetData.totalUnits = assetData.totalUnits + units
	// 					}
	// 				}
	// 			},)
	// 			const filteredAssets = Array.from(assetMap.entries(),)
	// 				.filter(([_, assetData,],) => {
	// 					const originalAsset = entity.assets.find((a,) => {
	// 						const parsed = JSON.parse(a.payload as string,)
	// 						const currency = parsed?.currency
	// 						const isin = parsed?.isin
	// 						const metalType = parsed?.metalType
	// 						const key = isin ?
	// 							`${a.assetName}_${a.entityId}_${a.bankId}_${a.accountId}_${isin}_${currency}` :
	// 							metalType ?
	// 								`${a.entityId}_${a.bankId}_${a.accountId}_${metalType}` :
	// 								`${a.id}`
	// 						return key === _
	// 					},)
	// 					if (!originalAsset) {
	// 						return false
	// 					}
	// 					const parsedPayload = JSON.parse(originalAsset.payload as string,)
	// 					const hasUnits = parsedPayload?.units !== undefined
	// 					if (hasUnits) {
	// 						return (assetData.totalUnits ?? 0) > 0
	// 					}
	// 					return true
	// 				},)
	// 				.map(([_, assetData,],) => {
	// 					return assetData
	// 				},)
	// 			const entityTotalAssets = filteredAssets.reduce((sum, asset,) => {
	// 				return sum + asset.totalAssets
	// 			}, 0,)
	// 			const entityTotalUnits = filteredAssets.reduce((sum, asset,) => {
	// 				return sum + (asset.totalUnits ?? 0)
	// 			}, 0,)
	// 			return {
	// 				...entity,
	// 				name:        this.cryptoService.decryptString(entity.name,),
	// 				totalAssets: entityTotalAssets + entitiesTotalTransactions,
	// 				totalUnits:  entityTotalUnits,
	// 				assets:      filteredAssets,
	// 			}
	// 		},)
	// 		const banksWithTotalAssetsValue = portfolio.banks.map((bank,) => {
	// 			const assetMap = new Map<string, { totalAssets: number; totalUnits: number | undefined }>()
	// 			const filteredTransactions = bank.transactions.filter((transaction,) => {
	// 				return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
	// 			},)
	// 			const banksTotalTransactions = filteredTransactions.reduce((sum, transaction,) => {
	// 				return sum + this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 					currency:      transaction.currency as CurrencyDataList,
	// 					currencyValue: Number(transaction.amount,),
	// 					currencyList,
	// 				},)
	// 			}, 0,)
	// 			bank.assets.forEach((asset,) => {
	// 				const { totalAssets, } = this.assetService.getTotalByAssetCBondsParted(asset, {
	// 					currencyList,
	// 					cryptoList,
	// 					bonds,
	// 					equities,
	// 					etfs,
	// 					metalList,
	// 				},)

	// 				const parsedPayload = JSON.parse(asset.payload as string,)
	// 				const operation = parsedPayload?.operation
	// 				const units = parsedPayload?.units
	// 				const isin = parsedPayload?.isin
	// 				const metalType = parsedPayload?.metalType
	// 				const {currency,} = parsedPayload
	// 				const key = isin ?
	// 					`${asset.assetName}_${asset.entityId}_${asset.bankId}_${asset.accountId}_${isin}_${currency}` :
	// 					metalType ?
	// 						`${asset.entityId}_${asset.bankId}_${asset.accountId}_${metalType}` :
	// 						`${asset.id}`
	// 				if (!assetMap.has(key,)) {
	// 					assetMap.set(key, { totalAssets: 0, totalUnits: 0, },)
	// 				}

	// 				const assetData = assetMap.get(key,)!
	// 				if (operation === AssetOperationType.SELL) {
	// 					assetData.totalAssets = assetData.totalAssets - totalAssets
	// 					if (units !== undefined) {
	// 						assetData.totalUnits = (assetData.totalUnits ?? 0) - units
	// 					}
	// 				} else {
	// 					assetData.totalAssets = assetData.totalAssets + totalAssets
	// 					if (units !== undefined) {
	// 						assetData.totalUnits = assetData.totalUnits + units
	// 					}
	// 				}
	// 			},)
	// 			const filteredAssets = Array.from(assetMap.entries(),)
	// 				.filter(([_, assetData,],) => {
	// 					const originalAsset = bank.assets.find((a,) => {
	// 						const parsed = JSON.parse(a.payload as string,)
	// 						const currency = parsed?.currency
	// 						const isin = parsed?.isin
	// 						const metalType = parsed?.metalType
	// 						const key = isin ?
	// 							`${a.assetName}_${a.entityId}_${a.bankId}_${a.accountId}_${isin}_${currency}` :
	// 							metalType ?
	// 								`${a.entityId}_${a.bankId}_${a.accountId}_${metalType}` :
	// 								`${a.id}`
	// 						return key === _
	// 					},)
	// 					if (!originalAsset) {
	// 						return false
	// 					}
	// 					const parsedPayload = JSON.parse(originalAsset.payload as string,)
	// 					const hasUnits = parsedPayload?.units !== undefined
	// 					if (hasUnits) {
	// 						return (assetData.totalUnits ?? 0) > 0
	// 					}
	// 					return true
	// 				},)
	// 				.map(([_, assetData,],) => {
	// 					return assetData
	// 				},)
	// 			const bankTotalAssets = filteredAssets.reduce((sum, asset,) => {
	// 				return sum + asset.totalAssets
	// 			}, 0,)
	// 			const bankTotalUnits = filteredAssets.reduce((sum, asset,) => {
	// 				return sum + (asset.totalUnits ?? 0)
	// 			}, 0,)

	// 			return {
	// 				...bank,
	// 				totalAssets: bankTotalAssets + banksTotalTransactions,
	// 				totalUnits:  bankTotalUnits,
	// 				assets:      filteredAssets,
	// 			}
	// 		},)
	// 		const accountsWithTotalAssetsValue = portfolio.accounts.map((account,) => {
	// 			const assetMap = new Map<string, { totalAssets: number; totalUnits: number | undefined; hasUnitsInPayload: boolean; }>()

	// 			const filteredTransactions = account.transactions.filter((transaction,) => {
	// 				return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
	// 			},)
	// 			const accountsTotalTransactions = filteredTransactions.reduce((sum, transaction,) => {
	// 				return sum + this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 					currency:      transaction.currency as CurrencyDataList,
	// 					currencyValue: Number(transaction.amount,),
	// 					currencyList,
	// 				},)
	// 			}, 0,)
	// 			const initialCurrencyTotals: Record<CurrencyDataList, number> = Object.fromEntries(
	// 				Object.values(CurrencyDataList,).map((currency,) => {
	// 					return [currency, 0,]
	// 				},),
	// 			) as Record<CurrencyDataList, number>

	// 			const accountsCurrencyTotals = account.transactions.reduce<Record<CurrencyDataList, number>>(
	// 				(acc, transaction,) => {
	// 					const currency = transaction.currency as CurrencyDataList
	// 					acc[currency] = (acc[currency] ?? 0) + this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 						currency:      transaction.currency as CurrencyDataList,
	// 						currencyValue: Number(transaction.amount,),
	// 						currencyList,
	// 					},)
	// 					return acc
	// 				},
	// 				initialCurrencyTotals,
	// 			)
	// 			account.assets.forEach((asset,) => {
	// 				const { totalAssets, } = this.assetService.getTotalByAssetCBondsParted(asset, {
	// 					currencyList,
	// 					cryptoList,
	// 					bonds,
	// 					equities,
	// 					etfs,
	// 					metalList,
	// 				},)

	// 				const parsedPayload = JSON.parse(asset.payload as string,)
	// 				const operation = parsedPayload?.operation
	// 				const units = parsedPayload?.units
	// 				const isin = parsedPayload?.isin
	// 				const metalType = parsedPayload?.metalType
	// 				const hasUnitsInPayload = parsedPayload?.units !== undefined
	// 				const {currency,} = parsedPayload
	// 				const key = isin ?
	// 					`${asset.assetName}_${asset.entityId}_${asset.bankId}_${asset.accountId}_${isin}_${currency}` :
	// 					metalType ?
	// 						`${asset.entityId}_${asset.bankId}_${asset.accountId}_${metalType}` :
	// 						`${asset.id}`
	// 				if (!assetMap.has(key,)) {
	// 					assetMap.set(key, { totalAssets: 0, totalUnits: 0, hasUnitsInPayload,},)
	// 				}

	// 				const assetData = assetMap.get(key,)!
	// 				if (operation === AssetOperationType.SELL) {
	// 					assetData.totalAssets = assetData.totalAssets - totalAssets
	// 					if (units !== undefined) {
	// 						assetData.totalUnits = (assetData.totalUnits ?? 0) - units
	// 					}
	// 				} else {
	// 					assetData.totalAssets = assetData.totalAssets + totalAssets
	// 					if (units !== undefined) {
	// 						assetData.totalUnits = assetData.totalUnits + units
	// 					}
	// 				}
	// 			},)
	// 			const filteredAssets = Array.from(assetMap.entries(),)
	// 				.filter(([_, assetData,],) => {
	// 					const originalAsset = account.assets.find((a,) => {
	// 						const parsed = JSON.parse(a.payload as string,)
	// 						const currency = parsed?.currency
	// 						const isin = parsed?.isin
	// 						const metalType = parsed?.metalType
	// 						const key = isin ?
	// 							`${a.assetName}_${a.entityId}_${a.bankId}_${a.accountId}_${isin}_${currency}` :
	// 							metalType ?
	// 								`${a.entityId}_${a.bankId}_${a.accountId}_${metalType}` :
	// 								`${a.id}`
	// 						return key === _
	// 					},)
	// 					if (!originalAsset) {
	// 						return false
	// 					}
	// 					const parsedPayload = JSON.parse(originalAsset.payload as string,)
	// 					const hasUnits = parsedPayload?.units !== undefined
	// 					if (hasUnits) {
	// 						return (assetData.totalUnits ?? 0) > 0
	// 					}
	// 					return true
	// 				},)
	// 				.map(([_, assetData,],) => {
	// 					return assetData
	// 				},)
	// 			const accountTotalAssets = filteredAssets.reduce((sum, asset,) => {
	// 				return sum + asset.totalAssets
	// 			}, 0,)
	// 			const accountTotalUnits = filteredAssets.reduce((sum, asset,) => {
	// 				return sum + (asset.totalUnits ?? 0)
	// 			}, 0,)

	// 			return {
	// 				...account,
	// 				accountName:        this.cryptoService.decryptString(account.accountName,),
	// 				totalAssets: accountTotalAssets + accountsTotalTransactions,
	// 				accountsTotalTransactions,
	// 				accountsCurrencyTotals,
	// 				totalUnits:  accountTotalUnits,
	// 				assets:      filteredAssets,
	// 			}
	// 		},)
	// 		const assetsWithTotalAssetsValue = ((): Array<Asset & { totalAssets: number; totalUnits: number | undefined }> => {
	// 			const assetMap = new Map<string, { totalAssets: number; totalUnits: number | undefined; asset: Asset }>()
	// 			portfolio.assets.forEach((asset,) => {
	// 				const { totalAssets, } = this.assetService.getTotalByAssetCBondsParted(asset, {
	// 					currencyList,
	// 					cryptoList,
	// 					bonds,
	// 					equities,
	// 					etfs,
	// 					metalList,
	// 				},)

	// 				const parsedPayload = JSON.parse(asset.payload as string,)
	// 				const operation = parsedPayload?.operation
	// 				const units = parsedPayload?.units ?? 0
	// 				const isin = parsedPayload?.isin
	// 				const metalType = parsedPayload?.metalType
	// 				const { currency, } = parsedPayload
	// 				const key = isin ?
	// 					`${asset.assetName}_${asset.entityId}_${asset.bankId}_${asset.accountId}_${isin}_${currency}` :
	// 					metalType ?
	// 						`${asset.entityId}_${asset.bankId}_${asset.accountId}_${metalType}` :
	// 						`${asset.id}`
	// 				if (!assetMap.has(key,)) {
	// 					assetMap.set(key, { totalAssets: 0, totalUnits: 0, asset, },)
	// 				}

	// 				const assetData = assetMap.get(key,)!
	// 				if (operation === AssetOperationType.SELL) {
	// 					assetData.totalAssets = assetData.totalAssets - totalAssets
	// 					if (units !== undefined) {
	// 						assetData.totalUnits = (assetData.totalUnits ?? 0) - units
	// 					}
	// 				} else {
	// 					assetData.totalAssets = assetData.totalAssets + totalAssets
	// 					if (units !== undefined) {
	// 						assetData.totalUnits = assetData.totalUnits + units
	// 					}
	// 				}
	// 			},)
	// 			return Array.from(assetMap.values(),)
	// 				.filter(({ asset, totalUnits, },) => {
	// 					const parsedPayload = JSON.parse(asset.payload as string,)
	// 					const hasUnits = parsedPayload?.units !== undefined
	// 					if (hasUnits) {
	// 						return (totalUnits ?? 0) > 0
	// 					}
	// 					return true
	// 				},)
	// 				.map(({ asset, totalAssets, totalUnits, },) => {
	// 					return {
	// 						...asset,
	// 						totalAssets,
	// 						totalUnits,
	// 					}
	// 				},)
	// 		})()
	// 		return {
	// 			entitiesWithTotalAssetsValue,
	// 			banksWithTotalAssetsValue,
	// 			accountsWithTotalAssetsValue,
	// 			assetsWithTotalAssetsValue,
	// 		}
	// 	} catch (error) {
	// 		throw new HttpException(ERROR_MESSAGES.INSTANCES_TOTAL_ASSETS_ERROR, HttpStatus.BAD_REQUEST,)
	// 	}
	// }

	/**
 * Collects all document IDs linked to a portfolio and its related entities.
 *
 * @remarks
 * - Includes documents from assets, entities, reports, transactions, requests, and their drafts.
 *
 * @param id - The portfolio's unique identifier.
 * @returns A Promise resolving to an array of document IDs.
 * @throws HttpException if the portfolio is not found.
 */
	public async getAllDocumentIdsOfPortfolioAndItsEntities(id: string,): Promise<Array<string>> {
		const portfolio = await this.prismaService.portfolio.findUnique({
			where: {
				id,
			},
			include: {
				assets:    {
					include: {
						documents: {
							select: {id: true,},
						},
					},
				},
				entities:  {
					include: {
						documents: {
							select: {id: true,},
						},
					},
				},
				reports: {
					include: {
						documents: {
							select: {id: true,},
						},
					},
				},
				reportDrafts: {
					include: {
						documents: {
							select: {id: true,},
						},
					},
				},
				transactions: {
					include: {
						documents: {
							select: {id: true,},
						},
					},
				},
				transactionDrafts: {
					include: {
						documents: {
							select: {id: true,},
						},
					},
				},
				requests: {
					include: {
						documents: {
							select: {id: true,},
						},
					},
				},
				requestDrafts: {
					include: {
						documents: {
							select: {id: true,},
						},
					},
				},
				documents:  { select: { id: true, }, },
			},
		},)
		if (!portfolio) {
			throw new HttpException(ERROR_MESSAGES.PORTFOLIO_NOT_FOUND, HttpStatus.NOT_FOUND,)
		}
		const documentIds = [
			...portfolio.documents.map((doc,) => {
				return doc.id
			},),
			...portfolio.assets.flatMap((asset,) => {
				return asset.documents.map((doc,) => {
					return doc.id
				},)
			},),
			...portfolio.entities.flatMap((entity,) => {
				return entity.documents.map((doc,) => {
					return doc.id
				},)
			},),
			...portfolio.reports.flatMap((report,) => {
				return report.documents.map((doc,) => {
					return doc.id
				},)
			},),
			...portfolio.reportDrafts.flatMap((draft,) => {
				return draft.documents.map((doc,) => {
					return doc.id
				},)
			},),
			...portfolio.transactions.flatMap((tx,) => {
				return tx.documents.map((doc,) => {
					return doc.id
				},)
			},),
			...portfolio.transactionDrafts.flatMap((draft,) => {
				return draft.documents.map((doc,) => {
					return doc.id
				},)
			},),
			...portfolio.requests.flatMap((req,) => {
				return req.documents.map((doc,) => {
					return doc.id
				},)
			},),
			...portfolio.requestDrafts.flatMap((draft,) => {
				return draft.documents.map((doc,) => {
					return doc.id
				},)
			},),
		]
		return documentIds
	}

	/**
 * Collects all document IDs linked to all portfolios belonging to a specific client.
 *
 * @remarks
 * - Includes direct client documents and those from all portfolios and their nested entities.
 *
 * @param clientId - The unique identifier of the client.
 * @returns A Promise resolving to a flat array of document IDs.
 */
	public async getAllDocumentIdsOfPortfoliosByClientId(clientId: string,): Promise<Array<string>> {
		const clientDocumentsIds = await this.prismaService.document.findMany({
			where: {
				clientId,
			},
			select: {
				id:    true,
			},
		},)
		const portfolios = await this.prismaService.portfolio.findMany({
			where: {
				clientId,
			},
			include: {
				assets: {
					include: {
						documents: {
							select: { id: true, },
						},
					},
				},
				entities: {
					include: {
						documents: {
							select: { id: true, },
						},
					},
				},
				reports: {
					include: {
						documents: {
							select: { id: true, },
						},
					},
				},
				reportDrafts: {
					include: {
						documents: {
							select: { id: true, },
						},
					},
				},
				transactions: {
					include: {
						documents: {
							select: { id: true, },
						},
					},
				},
				transactionDrafts: {
					include: {
						documents: {
							select: { id: true, },
						},
					},
				},
				requests: {
					include: {
						documents: {
							select: { id: true, },
						},
					},
				},
				requestDrafts: {
					include: {
						documents: {
							select: { id: true, },
						},
					},
				},
				documents: {
					select: { id: true, },
				},
			},
		},)

		if (!portfolios.length) {
			return []
		}
		const documentIds = portfolios.flatMap((portfolio,) => {
			return [
				...clientDocumentsIds.map((doc,) => {
					return doc.id
				},),
				...portfolio.documents.map((doc,) => {
					return doc.id
				},),
				...portfolio.assets.flatMap((asset,) => {
					return asset.documents.map((doc,) => {
						return doc.id
					},)
				},),
				...portfolio.entities.flatMap((entity,) => {
					return entity.documents.map((doc,) => {
						return doc.id
					},)
				},),
				...portfolio.reports.flatMap((report,) => {
					return report.documents.map((doc,) => {
						return doc.id
					},)
				},),
				...portfolio.reportDrafts.flatMap((draft,) => {
					return draft.documents.map((doc,) => {
						return doc.id
					},)
				},),
				...portfolio.transactions.flatMap((tx,) => {
					return tx.documents.map((doc,) => {
						return doc.id
					},)
				},),
				...portfolio.transactionDrafts.flatMap((draft,) => {
					return draft.documents.map((doc,) => {
						return doc.id
					},)
				},),
				...portfolio.requests.flatMap((req,) => {
					return req.documents.map((doc,) => {
						return doc.id
					},)
				},),
				...portfolio.requestDrafts.flatMap((draft,) => {
					return draft.documents.map((doc,) => {
						return doc.id
					},)
				},),
			]
		},)
		return documentIds
	}

	/**
 * Deletes a portfolio draft and all documents associated with it.
 *
 * @remarks
 * - Removes related asset and entity documents.
 * - Invokes `documentService` to ensure documents are cleaned up properly.
 *
 * @param id - The unique identifier of the portfolio draft.
 * @returns A Promise that resolves once the deletion process completes.
 */
	public async deletePortfolioDraftWithDocuments(id: string,): Promise<void> {
		const portfolio = await this.prismaService.portfolioDraft.delete({
			where: {
				id,
			},
			include: {
				documents: {
					select: {
						id: true,
					},
				},
				assets: {
					include: {
						documents: {
							select: {
								id: true,
							},
						},
					},
				},
				entities: {
					include: {
						documents: {
							select: {
								id: true,
							},
						},
					},
				},
			},
		},)
		const documentIds = [
			...portfolio.documents.map((doc,) => {
				return doc.id
			},),
			...portfolio.assets.flatMap((asset,) => {
				return asset.documents.map((doc,) => {
					return doc.id
				},)
			},),
			...portfolio.entities.flatMap((entity,) => {
				return entity.documents.map((doc,) => {
					return doc.id
				},)
			},),
		]
		await this.documentService.deleteDocumentsByIds({id: documentIds,},)
	}

	/**
 * Generates analytics for portfolio charts grouped by entity, bank, or asset.
 *
 * @remarks
 * - Data is grouped based on the provided `filterType`.
 * - Each group includes total USD value calculated from assets and transactions.
 *
 * @param portfolio - The portfolio with its extended relations.
 * @param filterType - The chart grouping filter (ENTITY, BANK, or ASSET).
 * @returns A Promise resolving to an array of chart-ready data grouped by the selected type.
 */
	// New version
	public async getPortfolioChartAnalyticsById(portfolio: Partial<PortfolioWithExtendedRelations>, filterType: PortfolioChartFilterEnum,): Promise<Array<IPortfolioChartResponse>> {
		const currencyListPromise = this.cBondsCurrencyService.getAllCurrencies()
		const now = new Date()
		const bondAssetsPromise = this.prismaService.assetBondGroup.findMany({
			where: {
				portfolioId:  portfolio.id,
				portfolio:   {
					isActivated: true,
				},
				totalUnits: {
					gt: 0,
				},
				marketPrice: {
					not: 0,
				},
				OR: [
					{ maturityDate: null, },
					{ maturityDate: { gte: now, }, },
				],

			},
			select: {
				marketValueUSD: true,
				entity:         {
					select: {
						name: true,
						id:   true,
					},
				},
				bank:       {
					select: {
						bankName: true,
						id:       true,
					},
				},
				assetName:      true,
				id:             true,
			},
		},)
		const cryptoAssetsPromise = this.prismaService.assetCryptoGroup.findMany({
			where: {
				portfolioId:  portfolio.id,
				portfolio:   {
					isActivated: true,
				},
				totalUnits: {
					gt: 0,
				},
			},
			select: {
				marketValueUSD: true,
				entity:         {
					select: {
						name: true,
						id:   true,
					},
				},
				bank:       {
					select: {
						bankName: true,
						id:       true,
					},
				},
				assetName:      true,
				id:             true,
			},
		},)
		const equityAssetsPromise = this.prismaService.assetEquityGroup.findMany({
			where: {
				portfolioId:  portfolio.id,
				portfolio:   {
					isActivated: true,
				},
				totalUnits: {
					gt: 0,
				},
				currentStockPrice: {
					not: 0,
				},
			},
			select: {
				marketValueUSD: true,
				entity:         {
					select: {
						name: true,
						id:   true,
					},
				},
				bank:       {
					select: {
						bankName: true,
						id:       true,
					},
				},
				assetName:      true,
				id:             true,
			},
		},)
		const metalAssetsPromise = this.prismaService.assetMetalGroup.findMany({
			where: {
				portfolioId:  portfolio.id,
				portfolio:   {
					isActivated: true,
				},
				totalUnits: {
					gt: 0,
				},
			},
			select: {
				marketValueUSD: true,
				entity:         {
					select: {
						name: true,
						id:   true,
					},
				},
				bank:       {
					select: {
						bankName: true,
						id:       true,
					},
				},
				assetName:      true,
				id:             true,
			},
		},)
		const depositAssetsPromise = this.prismaService.assetDeposit.findMany({
			where: {
				portfolioId:  portfolio.id,
				portfolio:   {
					isActivated: true,
				},
				usdValue: {
					not: 0,
				},
				OR: [
					{ maturityDate: null, },
					{ maturityDate: { gt: now, }, },
				],
			},
			select: {
				usdValue:  true,
				entity:         {
					select: {
						name: true,
						id:   true,
					},
				},
				bank:       {
					select: {
						bankName: true,
						id:       true,
					},
				},
				assetName:      true,
				id:             true,
			},
		},)
		const loanAssetsPromise = this.prismaService.assetLoan.findMany({
			where: {
				portfolioId:  portfolio.id,
				portfolio:   {
					isActivated: true,
				},
				usdValue: {
					not: 0,
				},
				maturityDate: { gt: now, },
			},
			select: {
				usdValue:  true,
				entity:         {
					select: {
						name: true,
						id:   true,
					},
				},
				bank:       {
					select: {
						bankName: true,
						id:       true,
					},
				},
				assetName:      true,
				id:             true,
			},
		},)
		const optionAssetsPromise = this.prismaService.assetOption.findMany({
			where: {
				portfolioId:  portfolio.id,
				portfolio:   {
					isActivated: true,
				},
				marketValueUSD: {
					not: 0,
				},
				maturityDate: { gt: new Date(), },
			},
			select: {
				marketValueUSD: true,
				entity:         {
					select: {
						name: true,
						id:   true,
					},
				},
				bank:       {
					select: {
						bankName: true,
						id:       true,
					},
				},
				assetName:      true,
				id:             true,
			},
		},)
		const otherAssetsPromise = this.prismaService.assetOtherInvestment.findMany({
			where: {
				portfolioId:  portfolio.id,
				portfolio:   {
					isActivated: true,
				},
				usdValue: {
					not: 0,
				},
			},
			select: {
				marketValueUSD: true,
				entity:         {
					select: {
						name: true,
						id:   true,
					},
				},
				bank:       {
					select: {
						bankName: true,
						id:       true,
					},
				},
				assetName:      true,
				id:             true,
			},
		},)
		const peAssetsPromise = this.prismaService.assetPrivateEquity.findMany({
			where: {
				portfolioId:  portfolio.id,
				portfolio:   {
					isActivated: true,
				},
				marketValueUSD: {
					not: 0,
				},
			},
			select: {
				marketValueUSD: true,
				entity:         {
					select: {
						name: true,
						id:   true,
					},
				},
				bank:       {
					select: {
						bankName: true,
						id:       true,
					},
				},
				assetName:      true,
				id:             true,
			},
		},)
		const reAssetsPromise = this.prismaService.assetRealEstate.findMany({
			where: {
				portfolioId:  portfolio.id,
				portfolio:   {
					isActivated: true,
				},
				usdValue: {
					not: 0,
				},
			},
			select: {
				marketValueUSD: true,
				entity:         {
					select: {
						name: true,
						id:   true,
					},
				},
				bank:       {
					select: {
						bankName: true,
						id:       true,
					},
				},
				assetName:      true,
				id:             true,
			},
		},)
		const [
			bondAssets,
			cryptoAssets,
			equityAssets,
			metalAssets,
			depositAssets,
			loanAssets,
			optionAssets,
			otherAssets,
			peAssets,
			reAssets,
			currencyList,
		] = await Promise.all([
			bondAssetsPromise,
			cryptoAssetsPromise,
			equityAssetsPromise,
			metalAssetsPromise,
			depositAssetsPromise,
			loanAssetsPromise,
			optionAssetsPromise,
			otherAssetsPromise,
			peAssetsPromise,
			reAssetsPromise,
			currencyListPromise,
		],)
		if (filterType === PortfolioChartFilterEnum.ENTITY && portfolio.entities && portfolio.entities.length > 0) {
			const groupedEntities = portfolio.entities.map((entity,) => {
				const entitiesTotalTransactions = entity.transactions.reduce((sum, transaction,) => {
					const total = this.cBondsCurrencyService.getCurrencyValueExchangedToUSD(
						{
							currency:      transaction.currency as CurrencyDataList,
							currencyValue: Number(transaction.amount,),
						},
						currencyList,
					)
					return sum + total
				}, 0,)
				const marketValueUSDs = [
					...bondAssets,
					...cryptoAssets,
					...equityAssets,
					...metalAssets,
					...optionAssets,
					...otherAssets,
					...peAssets,
					...reAssets,
				].reduce<number>((acc, item,) => {
					if (item.entity.id !== entity.id) {
						return acc
					}
					return item.marketValueUSD + acc
				}, 0,)
				const valueUSDs = [
					...depositAssets,
					...loanAssets,
				].reduce<number>((acc, item,) => {
					if (item.entity.id !== entity.id) {
						return acc
					}
					return item.usdValue + acc
				}, 0,)
				return {
					id:    entity.id,
					name:  this.cryptoService.decryptString(entity.name,),
					value:  marketValueUSDs + valueUSDs + entitiesTotalTransactions,
				}
			},)
			return groupedEntities
		}
		if (filterType === PortfolioChartFilterEnum.BANK && portfolio.banks && portfolio.banks.length > 0) {
			const groupedBanks = portfolio.banks.map((bank,) => {
				const banksTotalTransactions = bank.transactions.reduce((sum, transaction,) => {
					const total = this.cBondsCurrencyService.getCurrencyValueExchangedToUSD(
						{
							currency:      transaction.currency as CurrencyDataList,
							currencyValue: Number(transaction.amount,),
						},
						currencyList,
					)
					return sum + total
				}, 0,)
				const marketValueUSDs = [
					...bondAssets,
					...cryptoAssets,
					...equityAssets,
					...metalAssets,
					...optionAssets,
					...otherAssets,
					...peAssets,
					...reAssets,
				].reduce<number>((acc, item,) => {
					if (item.bank.id !== bank.id) {
						return acc
					}
					return item.marketValueUSD + acc
				}, 0,)
				const valueUSDs = [
					...depositAssets,
					...loanAssets,
				].reduce<number>((acc, item,) => {
					if (item.bank.id !== bank.id) {
						return acc
					}
					return item.usdValue + acc
				}, 0,)
				return {
					id:    bank.id,
					name:  bank.bankName,
					value:  marketValueUSDs + valueUSDs + banksTotalTransactions,
				}
			},)
			return groupedBanks
		}
		if (filterType === PortfolioChartFilterEnum.ASSET) {
			const assetGroups = [
				{ name: AssetNamesType.BONDS, assets: bondAssets, },
				{ name: AssetNamesType.CRYPTO, assets: cryptoAssets, },
				{ name: AssetNamesType.EQUITY_ASSET, assets: equityAssets, },
				{ name: AssetNamesType.METALS, assets: metalAssets, },
				{ name: AssetNamesType.OPTIONS, assets: optionAssets, },
				{ name: AssetNamesType.OTHER, assets: otherAssets, },
				{ name: AssetNamesType.PRIVATE_EQUITY, assets: peAssets, },
				{ name: AssetNamesType.REAL_ESTATE, assets: reAssets, },
				{ name: AssetNamesType.CASH_DEPOSIT, assets: depositAssets, },
				{ name: AssetNamesType.LOAN, assets: loanAssets, },
				{ name: AssetNamesType.CASH, assets: [], },
			]

			const totalByAssetType = assetGroups.reduce<Record<string, number>>((acc, { name, assets, },) => {
				if (name === AssetNamesType.CASH) {
					const totalTransactions = portfolio.entities?.reduce((sum, entity,) => {
						if (entity.transactions.length > 0) {
							const total = entity.transactions.reduce((entitySum, transaction,) => {
								const transactionValueInUSD = this.cBondsCurrencyService.getCurrencyValueExchangedToUSD(
									{
										currency:      transaction.currency as CurrencyDataList,
										currencyValue: Number(transaction.amount,),
									},
									currencyList,
								)
								return entitySum + transactionValueInUSD
							}, 0,)
							return sum + total
						}
						return sum
					}, 0,)
					acc[name] = (acc[name] ?? 0) + (totalTransactions ?? 0)
					return acc
				}
				if (!assets?.length) {
					return acc
				}
				const total = assets.reduce((sum, item,) => {
					const value = 'marketValueUSD' in item ?
						item.marketValueUSD :
						item.usdValue
					return sum + value
				}, 0,)

				acc[name] = (acc[name] ?? 0) + total
				return acc
			}, {},)
			const assetsWithTotalAssetsValue = Object.entries(totalByAssetType,).map(([name, value,],) => {
				return {
					name,
					value,
				}
			},)

			return assetsWithTotalAssetsValue
		}
		return []
	}

	// public async getPortfolioChartAnalyticsById(portfolio: Partial<PortfolioWithExtendedRelations>, filterType: PortfolioChartFilterEnum,): Promise<Array<IPortfolioChartResponse>> {
	// 	const currencyListPromise = this.cBondsCurrencyService.getAllCurrencies()
	// 	const metalListPromise = this.prismaService.metalData.findMany()
	// 	const cryptoListPromise = this.prismaService.cryptoData.findMany()
	// 	const bondPromise = this.prismaService.bond.findMany()
	// 	const equityPromise = this.prismaService.equity.findMany()
	// 	const etfPromise = this.prismaService.etf.findMany()
	// 	const [currencyList,metalList,cryptoList,bonds,equities,etfs,] = await Promise.all([
	// 		currencyListPromise,
	// 		metalListPromise,
	// 		cryptoListPromise,
	// 		bondPromise,
	// 		equityPromise,
	// 		etfPromise,,
	// 	],)
	// 	const totalTransactions = portfolio.entities?.reduce((sum, entity,) => {
	// 		if (entity.transactions.length > 0) {
	// 			const total = entity.transactions.reduce((entitySum, transaction,) => {
	// 				const transactionValueInUSD = this.cBondsCurrencyService.getCurrencyValueExchangedToUSD(
	// 					{
	// 						currency:      transaction.currency as CurrencyDataList,
	// 						currencyValue: Number(transaction.amount,),
	// 					},
	// 					currencyList,
	// 				)
	// 				return entitySum + transactionValueInUSD
	// 			}, 0,)
	// 			return sum + total
	// 		}
	// 		return sum
	// 	}, 0,)
	// 	if (filterType === PortfolioChartFilterEnum.ENTITY && portfolio.entities && portfolio.entities.length > 0) {
	// 		const groupedEntities = portfolio.entities.map((entity,) => {
	// 			const assetMap = new Map<string, { totalAssets: number; totalUnits: number | undefined }>()
	// 			const entitiesTotalTransactions = entity.transactions.reduce((sum, transaction,) => {
	// 				const total = this.cBondsCurrencyService.getCurrencyValueExchangedToUSD(
	// 					{
	// 						currency:      transaction.currency as CurrencyDataList,
	// 						currencyValue: Number(transaction.amount,),
	// 					},
	// 					currencyList,
	// 				)
	// 				return sum + total
	// 			}, 0,)
	// 			entity.assets.forEach((asset,) => {
	// 				const { totalAssets, } = this.assetService.getTotalByAssetCBondsParted(asset, {
	// 					currencyList,
	// 					cryptoList,
	// 					bonds,
	// 					equities,
	// 					etfs,
	// 					metalList,
	// 				},)

	// 				const parsedPayload = JSON.parse(asset.payload as string,)
	// 				const operation = parsedPayload?.operation
	// 				const units = parsedPayload?.units
	// 				const isin = parsedPayload?.isin
	// 				const metalType = parsedPayload?.metalType
	// 				const {currency,} = parsedPayload
	// 				const key = isin ?
	// 					`${asset.entityId}_${asset.bankId}_${asset.accountId}_${isin}_${currency}` :
	// 					metalType ?
	// 						`${asset.entityId}_${asset.bankId}_${asset.accountId}_${metalType}` :
	// 						`${asset.id}`

	// 				if (!assetMap.has(key,)) {
	// 					assetMap.set(key, { totalAssets: 0, totalUnits: units, },)
	// 				}

	// 				const assetData = assetMap.get(key,)!
	// 				if (operation === AssetOperationType.SELL) {
	// 					assetData.totalAssets = assetData.totalAssets - totalAssets
	// 					if (units !== undefined) {
	// 						assetData.totalUnits = (assetData.totalUnits ?? 0) - units
	// 					}
	// 				} else {
	// 					assetData.totalAssets = assetData.totalAssets + totalAssets
	// 					if (units !== undefined) {
	// 						assetData.totalUnits = assetData.totalUnits + units
	// 					}
	// 				}
	// 			},)
	// 			const filteredAssets = Array.from(assetMap.values(),).filter(
	// 				(asset,) => {
	// 					return asset.totalUnits === undefined || asset.totalUnits > 0
	// 				},
	// 			)
	// 			const entityTotalAssets = filteredAssets.reduce((sum, asset,) => {
	// 				return sum + asset.totalAssets
	// 			}, 0,)
	// 			return {
	// 				id:    entity.id,
	// 				name:  this.cryptoService.decryptString(entity.name,),
	// 				value:  entityTotalAssets + entitiesTotalTransactions,
	// 			}
	// 		},)
	// 		return groupedEntities
	// 	}
	// 	if (filterType === PortfolioChartFilterEnum.BANK && portfolio.banks && portfolio.banks.length > 0) {
	// 		const groupedBanks = portfolio.banks.map((entity,) => {
	// 			const assetMap = new Map<string, { totalAssets: number; totalUnits: number | undefined }>()
	// 			const banksTotalTransactions = entity.transactions.reduce((sum, transaction,) => {
	// 				const total = this.cBondsCurrencyService.getCurrencyValueExchangedToUSD(
	// 					{
	// 						currency:      transaction.currency as CurrencyDataList,
	// 						currencyValue: Number(transaction.amount,),
	// 					},
	// 					currencyList,
	// 				)
	// 				return sum + total
	// 			}, 0,)
	// 			entity.assets.forEach((asset,) => {
	// 				const { totalAssets, } = this.assetService.getTotalByAssetCBondsParted(asset, {
	// 					currencyList,
	// 					cryptoList,
	// 					bonds,
	// 					equities,
	// 					etfs,
	// 					metalList,
	// 				},)

	// 				const parsedPayload = JSON.parse(asset.payload as string,)
	// 				const operation = parsedPayload?.operation
	// 				const units = parsedPayload?.units
	// 				const isin = parsedPayload?.isin
	// 				const metalType = parsedPayload?.metalType
	// 				const {currency,} = parsedPayload
	// 				const key = isin ?
	// 					`${asset.entityId}_${asset.bankId}_${asset.accountId}_${isin}_${currency}` :
	// 					metalType ?
	// 						`${asset.entityId}_${asset.bankId}_${asset.accountId}_${metalType}` :
	// 						`${asset.id}`
	// 				if (!assetMap.has(key,)) {
	// 					assetMap.set(key, { totalAssets: 0, totalUnits: units, },)
	// 				}

	// 				const assetData = assetMap.get(key,)!
	// 				if (operation === AssetOperationType.SELL) {
	// 					assetData.totalAssets = assetData.totalAssets - totalAssets
	// 					if (units !== undefined) {
	// 						assetData.totalUnits = (assetData.totalUnits ?? 0) - units
	// 					}
	// 				} else {
	// 					assetData.totalAssets = assetData.totalAssets + totalAssets
	// 					if (units !== undefined) {
	// 						assetData.totalUnits = assetData.totalUnits + units
	// 					}
	// 				}
	// 			},)
	// 			const filteredAssets = Array.from(assetMap.values(),).filter(
	// 				(asset,) => {
	// 					return asset.totalUnits === undefined || asset.totalUnits > 0
	// 				},
	// 			)
	// 			const entityTotalAssets = filteredAssets.reduce((sum, asset,) => {
	// 				return sum + asset.totalAssets
	// 			}, 0,)
	// 			return {
	// 				id:    entity.id,
	// 				name:  entity.bankName,
	// 				value:  entityTotalAssets + banksTotalTransactions,
	// 			}
	// 		},)
	// 		return groupedBanks
	// 	}
	// 	if (filterType === PortfolioChartFilterEnum.ASSET && portfolio.assets && portfolio.assets.length > 0) {
	// 		const assetsWithTotalAssetsValue = ((): Array<{name: string, value: number}> => {
	// 			const assetMap = new Map<string, { totalAssets: number; totalUnits: number | undefined; asset: Asset }>()

	// 			portfolio.assets.forEach((asset,) => {
	// 				const { totalAssets, } = this.assetService.getTotalByAssetCBondsParted(asset, {
	// 					currencyList,
	// 					cryptoList,
	// 					bonds,
	// 					equities,
	// 					etfs,
	// 					metalList,
	// 				},)

	// 				const parsedPayload = JSON.parse(asset.payload as string,)
	// 				const operation = parsedPayload?.operation
	// 				const units = parsedPayload?.units ?? 0
	// 				const isin = parsedPayload?.isin
	// 				const metalType = parsedPayload?.metalType
	// 				const {currency,} = parsedPayload
	// 				const key = isin ?
	// 					`${asset.entityId}_${asset.bankId}_${asset.accountId}_${isin}_${currency}` :
	// 					metalType ?
	// 						`${asset.entityId}_${asset.bankId}_${asset.accountId}_${metalType}` :
	// 						`${asset.id}`
	// 				if (!assetMap.has(key,)) {
	// 					assetMap.set(key, { totalAssets: 0, totalUnits: 0, asset, },)
	// 				}

	// 				const assetData = assetMap.get(key,)!
	// 				if (operation === AssetOperationType.SELL) {
	// 					assetData.totalAssets = assetData.totalAssets - totalAssets
	// 					if (units !== undefined) {
	// 						assetData.totalUnits = (assetData.totalUnits ?? 0) - units
	// 					}
	// 				} else {
	// 					assetData.totalAssets = assetData.totalAssets + totalAssets
	// 					if (units !== undefined) {
	// 						assetData.totalUnits = assetData.totalUnits + units
	// 					}
	// 				}
	// 			},)

	// 			const assetsArray = Array.from(assetMap.values(),)
	// 				.filter((asset,) => {
	// 					const parsedPayload = JSON.parse(asset.asset.payload as string,)
	// 					const units = parsedPayload?.units ?? 0
	// 					if (!units) {
	// 						return asset
	// 					}
	// 					if (asset.totalUnits) {
	// 						return asset.totalUnits > 0
	// 					}
	// 					return asset
	// 				},)
	// 				.map(({ asset, totalAssets,  },) => {
	// 					return {
	// 						id:    asset.id,
	// 						value: totalAssets,
	// 						name:  asset.assetName,
	// 					}
	// 				},)
	// 			const totalByAssetType = assetsArray.reduce<Record<string, number>>((acc, asset,) => {
	// 				if (!acc[asset.name]) {
	// 					acc[asset.name] = 0
	// 				}
	// 				acc[asset.name] = acc[asset.name] + asset.value
	// 				return acc
	// 			}, {},)
	// 			const result = Object.entries(totalByAssetType,).map(([name, value,],) => {
	// 				if (name === AssetNamesType.CASH) {
	// 					return {
	// 						name,
	// 						value: value + (totalTransactions ?? 0),
	// 					}
	// 				}
	// 				return {
	// 					name,
	// 					value,
	// 				}
	// 			},)
	// 			return result
	// 		})()
	// 		return assetsWithTotalAssetsValue
	// 	}
	// 	return []
	// }

	/**
 		* CR-135
 		* Calculates the total USD-equivalent value of all assets in the given portfolio.
 		* @param portfolio - The portfolio with related data (transactions, assets, etc.).
 		* @param lists - Supporting lists for exchange rates and bond/crypto data.
 		* @returns The portfolio object with an added `totalAssets` field in USD.
 		*
 		* This method processes all asset types in the portfolio (cash, bonds, crypto, metals, etc.),
 		* converts their values to USD using current or historical rates,
 		* and sums them up to compute the total portfolio value in USD.
 		*
 		* Assets with invalid state (e.g., expired deposits, zero units) are excluded.
 	*/
	// New Version
	public getPortfolioTotals(portfolio: TPortfolioForCalcsForCacheUpdate, lists: IGetTotalByAssetListsCBondsParted,): IPortfolio & {totalAssets: number} {
		const {cryptoList, bonds, equities, etfs, currencyList, metalList,} = lists
		const totalCurrencyValuesByCurrency = portfolio.transactions.reduce<Record<string, number>>(
			(acc, transaction,) => {
				const curr = transaction.currency
				acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
				return acc
			},
			{},
		)
		const filteredTransactions = portfolio.transactions.filter((transaction,) => {
			return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
		},)
		const parsedAssets = this.parseAndFilterAssets(portfolio.assets,)
		const transactionUsdValue = portfolio.transactions.reduce((acc, transaction,) => {
			return acc +  this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
				currency:      transaction.currency as CurrencyDataList,
				currencyValue: Number(transaction.amount,),
				currencyList,
			},)
		}, 0,)

		const bondsAssets = parsedAssets.filter((asset,): asset is IBondsAsset => {
			return asset.assetName === AssetNamesType.BONDS
		},)
		const aggregatedBondsAssets = bondsAssets.reduce<Record<
			string,
			{ totalUnits: number; assets: Array<IBondsAsset> }>>((acc, asset,) => {
				const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency,} = asset

				if (!entityId || !bankId || !accountId || !isin) {
					return acc
				}
				const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
				if (!acc[key]) {
					acc[key] = { totalUnits: 0, assets: [], }
				}
				if (operation === AssetOperationType.BUY) {
					acc[key].totalUnits = acc[key].totalUnits + units
				} else if (operation === AssetOperationType.SELL) {
					acc[key].totalUnits = acc[key].totalUnits - units
				}
				acc[key].assets.push(asset,)
				return acc
			}, {},)
		const filteredBondsAssets = Object.values(aggregatedBondsAssets,)
			.filter(({ totalUnits, },) => {
				return totalUnits > 0
			},)
			.flatMap(({ assets, },) => {
				return assets
			},)
		const bondsBankData = filteredBondsAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { isin, units, operation, currency,} = asset
				const bond = bonds.find((bond,) => {
					return bond.isin === isin
				},)
				if (!bond) {
					return null
				}
				if (bond.maturityDate && (new Date(bond.maturityDate,) < new Date())) {
					return null
				}
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)
				const rate = currencyData?.rate ?? asset.rate ?? 1
				const usdValue = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
					isin,
					units:              Number(units,),
					dirtyPriceCurrency: bond.dirtyPriceCurrency,
					nominalPrice:       bond.nominalPrice,
					rate,
					marketPrice:        bond.marketPrice,
				},)
				return {
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)

		const depositsAssets = parsedAssets.filter((asset,): asset is IDepositAsset => {
			return asset.assetName === AssetNamesType.CASH_DEPOSIT
		},)
		const depositsBankData = depositsAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, currency, maturityDate,} = asset
				if (maturityDate && new Date(maturityDate,) < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
				},)
				return {
					usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)

		const collateralAssets = parsedAssets.filter((asset,): asset is ICollateralAsset => {
			return asset.assetName === AssetNamesType.COLLATERAL
		},)
		const collateralBankData = collateralAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const {currencyValue, currency,} = asset
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
				},)
				return {
					usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)
		const cryptoAssets = parsedAssets.filter((asset,): asset is ICryptoAsset => {
			return asset.assetName === AssetNamesType.CRYPTO
		},)
		const cryptoETFAssets = cryptoAssets.filter(
			(item,): item is NonNullable<typeof item> => {
				return item.productType === CryptoType.ETF
			},
		)
		const cryptoDirectAssets = cryptoAssets.filter(
			(item,): item is NonNullable<typeof item> => {
				return item.productType === CryptoType.DIRECT_HOLD
			},
		)
		const aggregatedCryptoETFAssets = cryptoETFAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<ICryptoAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

			if (!entityId || !bankId || !accountId || !isin || !units) {
				return acc
			}
			const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
			if (!acc[key]) {
				acc[key] = { totalUnits: 0, assets: [], }
			}
			if (operation === AssetOperationType.BUY) {
				acc[key].totalUnits = acc[key].totalUnits + units
			} else if (operation === AssetOperationType.SELL) {
				acc[key].totalUnits = acc[key].totalUnits - units
			}
			acc[key].assets.push(asset,)
			return acc
		}, {},)
		const filteredCryptoEtfAssets = Object.values(aggregatedCryptoETFAssets,)
			.filter(({ totalUnits, },) => {
				return totalUnits > 0
			},)
			.flatMap(({ assets, },) => {
				return assets
			},)
		const ctryptoETFData = filteredCryptoEtfAssets
			.map((asset,) => {
				const { isin, units, operation, currency, } = asset
				if (!isin || !currency || !units) {
					return null
				}
				const equityAsset = equities.find((equity,) => {
					return equity.isin === isin
				},) ?? etfs.find((etf,) => {
					return etf.isin === isin
				},) ?? null
				if (!equityAsset) {
					return null
				}
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)
				const rate = currencyData?.rate ?? asset.rate ?? 1
				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				const usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)

				return {
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)
		const cryptoBankData = cryptoDirectAssets
			.map((asset,) => {
				const { cryptoCurrencyType, cryptoAmount,}  = asset
				const usdValue = cryptoCurrencyType && cryptoAmount ?
					this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
						token: cryptoCurrencyType,
						cryptoAmount,
					}, cryptoList,) :
					0
				return {
					usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)

		const equityAssets = parsedAssets.filter((asset,): asset is IEquityAsset => {
			return asset.assetName === AssetNamesType.EQUITY_ASSET
		},)
		const aggregatedEquityAssets = equityAssets.reduce<Record<string, { totalUnits: number; assets: Array<IEquityAsset> }>>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency,} = asset
			if (!entityId || !bankId || !accountId || !isin) {
				return acc
			}
			const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
			if (!acc[key]) {
				acc[key] = { totalUnits: 0, assets: [], }
			}
			if (operation === AssetOperationType.BUY) {
				acc[key].totalUnits = acc[key].totalUnits + units
			} else if (operation === AssetOperationType.SELL) {
				acc[key].totalUnits = acc[key].totalUnits - units
			}
			acc[key].assets.push(asset,)
			return acc
		}, {},)
		const filteredEquityAssets = Object.values(aggregatedEquityAssets,)
			.filter(({ totalUnits, },) => {
				return totalUnits > 0
			},)
			.flatMap(({ assets, },) => {
				return assets
			},)
		const equityBankData = filteredEquityAssets
			.map((asset,) => {
				const { isin, units, operation, currency, } = asset
				const equityAsset = equities.find((equity,) => {
					return equity.isin === isin
				},) ?? etfs.find((etf,) => {
					return etf.isin === isin
				},) ?? null
				if (!equityAsset) {
					return null
				}
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)
				const rate = currencyData?.rate ?? asset.rate ?? 1
				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				const usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)

				return {
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)

		const loanAssets = parsedAssets.filter((asset,): asset is ILoanAsset => {
			return asset.assetName === AssetNamesType.LOAN
		},)
		const loanBankData = loanAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, maturityDate, currency,} = asset
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
				},)
				return {
					usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)

		const metalAssets = parsedAssets.filter((asset,): asset is IMetalsAsset => {
			return asset.assetName === AssetNamesType.METALS
		},)
		const metalETFAssets = metalAssets.filter(
			(item,): item is NonNullable<typeof item> => {
				return item.productType === MetalType.ETF
			},
		)
		const aggregatedMetalETFAssets = metalETFAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

			if (!entityId || !bankId || !accountId || !isin || !units) {
				return acc
			}
			const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
			if (!acc[key]) {
				acc[key] = { totalUnits: 0, assets: [], }
			}
			if (operation === AssetOperationType.BUY) {
				acc[key].totalUnits = acc[key].totalUnits + units
			} else if (operation === AssetOperationType.SELL) {
				acc[key].totalUnits = acc[key].totalUnits - units
			}
			acc[key].assets.push(asset,)
			return acc
		}, {},)
		const filteredMetalEtfAssets = Object.values(aggregatedMetalETFAssets,)
			.filter(({ totalUnits, },) => {
				return totalUnits > 0
			},)
			.flatMap(({ assets, },) => {
				return assets
			},)
		const metalETFData = filteredMetalEtfAssets
			.map((asset,) => {
				const { isin, units, operation, currency, } = asset
				if (!isin || !currency || !units) {
					return null
				}
				const equityAsset = equities.find((equity,) => {
					return equity.isin === isin
				},) ?? etfs.find((etf,) => {
					return etf.isin === isin
				},) ?? null
				if (!equityAsset) {
					return null
				}
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)
				const rate = currencyData?.rate ?? asset.rate ?? 1
				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				const usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)

				return {
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)
		const metalDirectAssets = metalAssets.filter(
			(item,): item is NonNullable<typeof item> => {
				return item.productType === MetalType.DIRECT_HOLD
			},
		)
		const aggregatedMetalAssets = metalDirectAssets.reduce<Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>>((acc, asset,) => {
			const { entityId, bankId, accountId, units, operation, portfolioId, metalType,} = asset

			if (!entityId || !bankId || !accountId || !metalType) {
				return acc
			}
			const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${metalType}`
			if (!acc[key]) {
				acc[key] = { totalUnits: 0, assets: [], }
			}
			if (operation === AssetOperationType.BUY) {
				acc[key].totalUnits = acc[key].totalUnits + units
			} else if (operation === AssetOperationType.SELL) {
				acc[key].totalUnits = acc[key].totalUnits - units
			}
			acc[key].assets.push(asset,)
			return acc
		}, {},)
		const filteredMetalAssets = Object.values(aggregatedMetalAssets,)
			.filter(({ totalUnits, },) => {
				return totalUnits > 0
			},)
			.flatMap(({ assets, },) => {
				return assets
			},)
		const metalsBankData = filteredMetalAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { units,operation,metalType, } = asset
				if (!metalType) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
					metalList,
					metalType,
					units,
				},)

				return {
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)

		const optionsAssets = parsedAssets.filter((asset,): asset is IOptionAsset => {
			return asset.assetName === AssetNamesType.OPTIONS
		},)
		const optionsBankData = optionsAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { maturityDate, currentMarketValue,currency, } = asset
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: currentMarketValue,
					currencyList,
				},)
				return {
					usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)

		const otherAssets = parsedAssets.filter((asset,): asset is IOtherAsset => {
			return asset.assetName === AssetNamesType.OTHER
		},)
		const otherBankData = otherAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, currency, } = asset
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
				},)
				return {
					usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)

		const privateEquityAssets = parsedAssets.filter((asset,): asset is IPrivateAsset => {
			return asset.assetName === AssetNamesType.PRIVATE_EQUITY
		},)
		const privateEquityBankData = privateEquityAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue,currency,} = asset
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
				},)
				return {
					usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)

		const realEstateAssets = parsedAssets.filter((asset,): asset is IRealEstateAsset => {
			return asset.assetName === AssetNamesType.REAL_ESTATE
		},)
		const realEstateBankData = realEstateAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, currency,} = asset
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
				},)

				return {
					usdValue,
				} as TUsdTotals
			},)
			.filter((item,): item is TUsdTotals => {
				return item !== null
			},)
		const sumByAccountId = [
			...metalETFData,
			...bondsBankData,
			...depositsBankData,
			...collateralBankData,
			...cryptoBankData,
			...ctryptoETFData,
			...equityBankData,
			...loanBankData,
			...metalsBankData,
			...optionsBankData,
			...otherBankData,
			...privateEquityBankData,
			...realEstateBankData,
		].reduce<number>((acc, { usdValue, },) => {
			return acc + usdValue
		}, 0,)
		return {
			...portfolio,
			totalAssets: sumByAccountId + transactionUsdValue,
		}
	}

	// New Version
	public syncGetInstancesTotalAssetsOfPortfolio(portfolio: PortfolioWithExtendedRelations, data: IPortfolioDetailedThirdPartyListCBondsParted,): InstancesTotalAssets {
		try {
			const {currencyList,cryptoList, bonds, equities, etfs, transactions, metalList,} = data
			const totalCurrencyValuesByCurrency = transactions.reduce<Record<string, number>>(
				(acc, transaction,) => {
					const curr = transaction.currency
					acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
					return acc
				},
				{},
			)
			const entitiesWithTotalAssetsValue = portfolio.entities.map((entity,) => {
				const assetMap = new Map<string, { totalAssets: number; totalUnits: number | undefined }>()
				const filteredTransactions = entity.transactions.filter((transaction,) => {
					return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
				},)
				const entitiesTotalTransactions = filteredTransactions.reduce((sum, transaction,) => {
					return sum + this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
						currency:      transaction.currency as CurrencyDataList,
						currencyValue: Number(transaction.amount,),
						currencyList,
					},)
				}, 0,)
				entity.assets.forEach((asset,) => {
					const { totalAssets, } = this.assetService.getTotalByAssetCBondsParted(asset, {
						currencyList,
						cryptoList,
						bonds,
						equities,
						etfs,
						metalList,
					},)

					const parsedPayload = JSON.parse(asset.payload as string,)
					const operation = parsedPayload?.operation
					const units = parsedPayload?.units
					const isin = parsedPayload?.isin
					const {currency,} = parsedPayload
					const metalType = parsedPayload?.metalType

					const key = isin ?
						`${asset.assetName}_${asset.entityId}_${asset.bankId}_${asset.accountId}_${isin}_${currency}` :
						metalType ?
							`${asset.entityId}_${asset.bankId}_${asset.accountId}_${metalType}` :
							`${asset.id}`
					if (!assetMap.has(key,)) {
						assetMap.set(key, { totalAssets: 0, totalUnits: 0, },)
					}
					const assetData = assetMap.get(key,)!
					if (operation === AssetOperationType.SELL) {
						assetData.totalAssets = assetData.totalAssets - totalAssets
						if (units !== undefined) {
							assetData.totalUnits = (assetData.totalUnits ?? 0) - units
						}
					} else {
						assetData.totalAssets = assetData.totalAssets + totalAssets
						if (units !== undefined) {
							assetData.totalUnits = assetData.totalUnits + units
						}
					}
				},)
				const filteredAssets = Array.from(assetMap.entries(),)
					.filter(([_, assetData,],) => {
						const originalAsset = entity.assets.find((a,) => {
							const parsed = JSON.parse(a.payload as string,)
							const currency = parsed?.currency
							const isin = parsed?.isin
							const metalType = parsed?.metalType
							const key = isin ?
								`${a.assetName}_${a.entityId}_${a.bankId}_${a.accountId}_${isin}_${currency}` :
								metalType ?
									`${a.entityId}_${a.bankId}_${a.accountId}_${metalType}` :
									`${a.id}`
							return key === _
						},)
						if (!originalAsset) {
							return false
						}
						const parsedPayload = JSON.parse(originalAsset.payload as string,)
						const hasUnits = parsedPayload?.units !== undefined
						if (hasUnits) {
							return (assetData.totalUnits ?? 0) > 0
						}
						return true
					},)
					.map(([_, assetData,],) => {
						return assetData
					},)
				const entityTotalAssets = filteredAssets.reduce((sum, asset,) => {
					return sum + asset.totalAssets
				}, 0,)
				const entityTotalUnits = filteredAssets.reduce((sum, asset,) => {
					return sum + (asset.totalUnits ?? 0)
				}, 0,)
				return {
					...entity,
					name:        this.cryptoService.decryptString(entity.name,),
					totalAssets: entityTotalAssets + entitiesTotalTransactions,
					totalUnits:  entityTotalUnits,
					assets:      filteredAssets,
				}
			},)
			const banksWithTotalAssetsValue = portfolio.banks.map((bank,) => {
				const assetMap = new Map<string, { totalAssets: number; totalUnits: number | undefined }>()
				const filteredTransactions = bank.transactions.filter((transaction,) => {
					return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
				},)
				const banksTotalTransactions = filteredTransactions.reduce((sum, transaction,) => {
					return sum + this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
						currency:      transaction.currency as CurrencyDataList,
						currencyValue: Number(transaction.amount,),
						currencyList,
					},)
				}, 0,)
				bank.assets.forEach((asset,) => {
					const { totalAssets, } = this.assetService.getTotalByAssetCBondsParted(asset, {
						currencyList,
						cryptoList,
						bonds,
						equities,
						etfs,
						metalList,
					},)

					const parsedPayload = JSON.parse(asset.payload as string,)
					const operation = parsedPayload?.operation
					const units = parsedPayload?.units
					const isin = parsedPayload?.isin
					const metalType = parsedPayload?.metalType
					const {currency,} = parsedPayload
					const key = isin ?
						`${asset.assetName}_${asset.entityId}_${asset.bankId}_${asset.accountId}_${isin}_${currency}` :
						metalType ?
							`${asset.entityId}_${asset.bankId}_${asset.accountId}_${metalType}` :
							`${asset.id}`
					if (!assetMap.has(key,)) {
						assetMap.set(key, { totalAssets: 0, totalUnits: 0, },)
					}

					const assetData = assetMap.get(key,)!
					if (operation === AssetOperationType.SELL) {
						assetData.totalAssets = assetData.totalAssets - totalAssets
						if (units !== undefined) {
							assetData.totalUnits = (assetData.totalUnits ?? 0) - units
						}
					} else {
						assetData.totalAssets = assetData.totalAssets + totalAssets
						if (units !== undefined) {
							assetData.totalUnits = assetData.totalUnits + units
						}
					}
				},)
				const filteredAssets = Array.from(assetMap.entries(),)
					.filter(([_, assetData,],) => {
						const originalAsset = bank.assets.find((a,) => {
							const parsed = JSON.parse(a.payload as string,)
							const currency = parsed?.currency
							const isin = parsed?.isin
							const metalType = parsed?.metalType
							const key = isin ?
								`${a.assetName}_${a.entityId}_${a.bankId}_${a.accountId}_${isin}_${currency}` :
								metalType ?
									`${a.entityId}_${a.bankId}_${a.accountId}_${metalType}` :
									`${a.id}`
							return key === _
						},)
						if (!originalAsset) {
							return false
						}
						const parsedPayload = JSON.parse(originalAsset.payload as string,)
						const hasUnits = parsedPayload?.units !== undefined
						if (hasUnits) {
							return (assetData.totalUnits ?? 0) > 0
						}
						return true
					},)
					.map(([_, assetData,],) => {
						return assetData
					},)
				const bankTotalAssets = filteredAssets.reduce((sum, asset,) => {
					return sum + asset.totalAssets
				}, 0,)
				const bankTotalUnits = filteredAssets.reduce((sum, asset,) => {
					return sum + (asset.totalUnits ?? 0)
				}, 0,)

				return {
					...bank,
					totalAssets: bankTotalAssets + banksTotalTransactions,
					totalUnits:  bankTotalUnits,
					assets:      filteredAssets,
				}
			},)
			const accountsWithTotalAssetsValue = portfolio.accounts.map((account,) => {
				const assetMap = new Map<string, { totalAssets: number; totalUnits: number | undefined; hasUnitsInPayload: boolean; }>()

				const filteredTransactions = account.transactions.filter((transaction,) => {
					return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
				},)
				const accountsTotalTransactions = filteredTransactions.reduce((sum, transaction,) => {
					return sum + this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
						currency:      transaction.currency as CurrencyDataList,
						currencyValue: Number(transaction.amount,),
						currencyList,
					},)
				}, 0,)
				const initialCurrencyTotals: Record<CurrencyDataList, number> = Object.fromEntries(
					Object.values(CurrencyDataList,).map((currency,) => {
						return [currency, 0,]
					},),
				) as Record<CurrencyDataList, number>
				const accountsCurrencyTotals = account.transactions.reduce<Record<CurrencyDataList, number>>(
					(acc, transaction,) => {
						const currency = transaction.currency as CurrencyDataList
						acc[currency] = (acc[currency] ?? 0) + this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
							currency:      transaction.currency as CurrencyDataList,
							currencyValue: Number(transaction.amount,),
							currencyList,
						},)
						return acc
					},
					initialCurrencyTotals,
				)
				account.assets.forEach((asset,) => {
					const { totalAssets, } = this.assetService.getTotalByAssetCBondsParted(asset, {
						currencyList,
						cryptoList,
						bonds,
						equities,
						etfs,
						metalList,
					},)

					const parsedPayload = JSON.parse(asset.payload as string,)
					const operation = parsedPayload?.operation
					const units = parsedPayload?.units
					const isin = parsedPayload?.isin
					const metalType = parsedPayload?.metalType
					const hasUnitsInPayload = parsedPayload?.units !== undefined
					const {currency,} = parsedPayload
					const key = isin ?
						`${asset.assetName}_${asset.entityId}_${asset.bankId}_${asset.accountId}_${isin}_${currency}` :
						metalType ?
							`${asset.entityId}_${asset.bankId}_${asset.accountId}_${metalType}` :
							`${asset.id}`
					if (!assetMap.has(key,)) {
						assetMap.set(key, { totalAssets: 0, totalUnits: 0, hasUnitsInPayload,},)
					}

					const assetData = assetMap.get(key,)!
					if (operation === AssetOperationType.SELL) {
						assetData.totalAssets = assetData.totalAssets - totalAssets
						if (units !== undefined) {
							assetData.totalUnits = (assetData.totalUnits ?? 0) - units
						}
					} else {
						assetData.totalAssets = assetData.totalAssets + totalAssets
						if (units !== undefined) {
							assetData.totalUnits = assetData.totalUnits + units
						}
					}
				},)
				const filteredAssets = Array.from(assetMap.entries(),)
					.filter(([_, assetData,],) => {
						const originalAsset = account.assets.find((a,) => {
							const parsed = JSON.parse(a.payload as string,)
							const currency = parsed?.currency
							const isin = parsed?.isin
							const metalType = parsed?.metalType
							const key = isin ?
								`${a.assetName}_${a.entityId}_${a.bankId}_${a.accountId}_${isin}_${currency}` :
								metalType ?
									`${a.entityId}_${a.bankId}_${a.accountId}_${metalType}` :
									`${a.id}`
							return key === _
						},)
						if (!originalAsset) {
							return false
						}
						const parsedPayload = JSON.parse(originalAsset.payload as string,)
						const hasUnits = parsedPayload?.units !== undefined
						if (hasUnits) {
							return (assetData.totalUnits ?? 0) > 0
						}
						return true
					},)
					.map(([_, assetData,],) => {
						return assetData
					},)
				const accountTotalAssets = filteredAssets.reduce((sum, asset,) => {
					return sum + asset.totalAssets
				}, 0,)
				const accountTotalUnits = filteredAssets.reduce((sum, asset,) => {
					return sum + (asset.totalUnits ?? 0)
				}, 0,)

				return {
					...account,
					accountName:        this.cryptoService.decryptString(account.accountName,),
					totalAssets: accountTotalAssets + accountsTotalTransactions,
					accountsTotalTransactions,
					accountsCurrencyTotals,
					totalUnits:  accountTotalUnits,
					assets:      filteredAssets,
				}
			},)
			const assetsWithTotalAssetsValue = ((): Array<Asset & { totalAssets: number; totalUnits: number | undefined }> => {
				const assetMap = new Map<string, { totalAssets: number; totalUnits: number | undefined; asset: Asset }>()
				portfolio.assets.forEach((asset,) => {
					const { totalAssets, } = this.assetService.getTotalByAssetCBondsParted(asset, {
						currencyList,
						cryptoList,
						bonds,
						equities,
						etfs,
						metalList,
					},)

					const parsedPayload = JSON.parse(asset.payload as string,)
					const operation = parsedPayload?.operation
					const units = parsedPayload?.units ?? 0
					const isin = parsedPayload?.isin
					const metalType = parsedPayload?.metalType
					const { currency, } = parsedPayload
					const key = isin ?
						`${asset.assetName}_${asset.entityId}_${asset.bankId}_${asset.accountId}_${isin}_${currency}` :
						metalType ?
							`${asset.entityId}_${asset.bankId}_${asset.accountId}_${metalType}` :
							`${asset.id}`
					if (!assetMap.has(key,)) {
						assetMap.set(key, { totalAssets: 0, totalUnits: 0, asset, },)
					}

					const assetData = assetMap.get(key,)!
					if (operation === AssetOperationType.SELL) {
						assetData.totalAssets = assetData.totalAssets - totalAssets
						if (units !== undefined) {
							assetData.totalUnits = (assetData.totalUnits ?? 0) - units
						}
					} else {
						assetData.totalAssets = assetData.totalAssets + totalAssets
						if (units !== undefined) {
							assetData.totalUnits = assetData.totalUnits + units
						}
					}
				},)
				return Array.from(assetMap.values(),)
					.filter(({ asset, totalUnits, },) => {
						const parsedPayload = JSON.parse(asset.payload as string,)
						const hasUnits = parsedPayload?.units !== undefined
						if (hasUnits) {
							return (totalUnits ?? 0) > 0
						}
						return true
					},)
					.map(({ asset, totalAssets, totalUnits, },) => {
						return {
							...asset,
							totalAssets,
							totalUnits,
						}
					},)
			})()
			return {
				entitiesWithTotalAssetsValue,
				banksWithTotalAssetsValue,
				accountsWithTotalAssetsValue,
				assetsWithTotalAssetsValue,
			}
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.INSTANCES_TOTAL_ASSETS_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
 		* Synchronous asset parser that transforms an array of extended asset objects (`TAssetExtended`)
 		* into a filtered and type-safe array of parsed assets of type `T`.
 		*
 		* - Uses the `assetParser` function to convert each raw asset into a typed asset.
 		* - Filters out any `null` results in case parsing fails.
 		*
 		* @template T - The target asset type extending `UnionAssetType`.
 		* @param assets - Array of raw extended assets to parse.
 		* @returns Filtered array of successfully parsed assets of type `T`.
 	*/
	private parseAndFilterAssets<T extends UnionAssetType = UnionAssetType>(assets: Array<TAssetExtended>,): Array<T> {
		const parsedAssets = assets
			.map((asset,) => {
				const parsedAsset = assetParser<T>(asset,)
				if (!parsedAsset) {
					return null
				}
				return parsedAsset
			},)
			.filter((item,): item is T => {
				return item !== null
			},)
		return parsedAssets
	}
}