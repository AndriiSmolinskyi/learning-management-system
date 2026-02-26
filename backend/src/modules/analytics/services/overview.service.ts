/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable max-lines */
/* eslint-disable complexity */
import { PrismaService,} from 'nestjs-prisma'
import {EquityType, type Bank, type CryptoList, type CurrencyDataList, type Equity, type Etf, type MetalDataList, type Prisma, type Transaction,} from '@prisma/client'
import {Injectable, Logger,} from '@nestjs/common'

import {CBondsCurrencyService,} from '../../apis/cbonds-api/services'

import type {OverviewAvailabilityFilterDto, OverviewFilterDto,} from '../dto'
import type {
	IAnalyticsAvailability,
	IFilteredRefactoredAssets,
	IFilteredRefactoredAssetsWithHistory,
	TBankAnalytics,
	TCurrencyAnalytics,
	TEntityAnalytics,
	TOverviewAssetAnalytics,
	TOverviewTransactionWithRelations,
} from '../analytics.types'
import type {UnionAssetType,} from '../../../shared/utils'
import {assetParser,} from '../../../shared/utils'
import type {
	IBondsAsset,
	ICollateralAsset,
	ICryptoAsset,
	IDepositAsset,
	IEquityAsset,
	ILoanAsset,
	IMetalsAsset,
	IOptionAsset,
	IOtherAsset,
	IPrivateAsset,
	IRealEstateAsset,
} from '../../asset/asset.types'
import {AssetNamesType, type ICashAsset, type TAssetExtended,} from '../../asset/asset.types'
import {AssetOperationType, CryptoType, MetalType,} from '../../../shared/types'
import {cBondParser, cEquityParser,} from '../../../shared/utils/cbond-parser.util'
import {endOfDay,} from 'date-fns'
import type {TCurrencyDataWithHistory,} from '../../../modules/apis/cbonds-api/cbonds-api.types'
import { CryptoService, } from '../../crypto/crypto.service'
import type { IInitialThirdPartyList, TOverviewInitials, } from '../../../modules/common/cache-sync/cache-sync.types'

@Injectable()
export class OverviewService {
	private readonly logger = new Logger(OverviewService.name,)

	constructor(
		private readonly prismaService: PrismaService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly cryptoService: CryptoService,
	) { }

	private getTimestampLogger = (): ((functionName: string, label: string) => void) => {
		const start = performance.now()
		return (functionName: string, label: string,): void => {
			const now = performance.now()
			this.logger.warn(`[OverviewAnalytics-${functionName}]: [${label}] ${Math.round(now - start,)} ms`,)
		}
	}

	/**
 * 3.5.2
 * Filters assets based on the provided filter criteria.
 * @remarks
 * - Filters assets based on asset names, client, portfolio, entity, bank, and date range.
 * @param filter - The filter criteria for retrieving assets.
 * @param clientId - The optional client ID to further filter the results.
 * @returns A Promise resolving to an array of filtered assets.
 */
	private async getFilteredRefactoredAssets(filter: OverviewFilterDto, clientId?: string,): Promise<IFilteredRefactoredAssets> {
		const fiatCurrencies = filter.currencies ?
			filter.currencies.filter((c,): c is CurrencyDataList => {
				return typeof c === 'string' && !['XAU', 'XAG', 'XPD', 'XPT', 'BTC', 'ETH',].includes(c,)
			},
			) :
			[]
		const currencies = fiatCurrencies.length === 0 ?
			Boolean(filter.currencies?.length,) ?
				[] :
				undefined :
			fiatCurrencies
		const now = new Date()
		const targetDate = filter.date ?
			new Date(filter.date,) :
			new Date()

		const bondAssetsPromise = this.prismaService.assetBondGroup.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    {in: filter.clientIds,},
				portfolioId:  { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds,},
				bankId:      {in: filter.bankIds,},
				...(clientId ?
					{
						client: {
							id: clientId,
						},
					} :
					{}),
				bank: {
					is: {
						bankListId: {in: filter.bankListIds,},
					},
				},
				portfolio: {
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
					{ maturityDate: { gte: targetDate, }, },
				],
				currency: {
					in: currencies,
				},
				transferDate: null,
			},
			select: {
				bonds: {
					where: {
						...(filter.date && {
							valueDate: {
								lte: endOfDay(new Date(filter.date,),),
							},
						}),
					},
					select: {
						marketValueUSD:      true,
						assetName:          true,
						marketValueFC:      true,
						currency:           true,
						units:          true,
						marketPrice:    true,
						isin:           true,
						operation:      true,
					},
				},
				marketValueUSD:      true,
				assetName:          true,
				marketValueFC:      true,
				currency:           true,
				totalUnits:         true,
				marketPrice:    true,
				isin:           true,
				bank:               {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
			},
		},)
		const cryptoAssetsPromise = this.prismaService.assetCryptoGroup.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    { in: clientId ?
					[clientId,] :
					filter.clientIds, },
				portfolioId: { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds, },
				bankId:      {in: filter.bankIds,},
				bank:        {
					is: {
						bankListId: { in: filter.bankListIds, },
					},
				},
				portfolio: {
					isActivated: true,
				},
				transferDate: null,
			},
			select: {
				cryptos: {
					select: {
						marketValueUSD:      true,
						assetName:          true,
						marketValueFC:      true,
						currency:           true,
						cryptoCurrencyType:      true,
						units:              true,
						productType:        true,
						cryptoAmount:       true,
						type:               true,
						isin:               true,
						operation:          true,
						id:                 true,
					},
				},
				marketValueUSD:      true,
				assetName:          true,
				marketValueFC:      true,
				currency:           true,
				cryptoCurrencyType:      true,
				totalUnits:         true,
				productType:        true,
				cryptoAmount:       true,
				type:               true,
				isin:               true,
				bank:               {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
			},
		},)
		const equityAssetsPromise = this.prismaService.assetEquityGroup.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    {in: filter.clientIds,},
				portfolioId:  { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds,},
				bankId:      {in: filter.bankIds,},
				...(clientId ?
					{
						client: {
							id: clientId,
						},
					} :
					{}),
				bank: {
					is: {
						bankListId: {in: filter.bankListIds,},
					},
				},
				portfolio: {
					isActivated: true,
				},
				totalUnits: {
					gt: 0,
				},
				currentStockPrice: {
					not: 0,
				},
				currency: {
					in: currencies,
				},
				transferDate: null,
			},
			select: {
				equities: {
					where: {
						...(filter.date && {
							transactionDate: {
								lte: endOfDay(new Date(filter.date,),),
							},
						}),
					},
					select: {
						marketValueUSD:      true,
						assetName:          true,
						marketValueFC:      true,
						currency:           true,
						units:          true,
						type:           true,
						isin:           true,
						operation:      true,
					},
				},
				marketValueUSD:      true,
				assetName:          true,
				marketValueFC:      true,
				currency:           true,
				totalUnits:         true,
				type:           true,
				isin:           true,
				bank:               {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
			},
		},)
		const metalAssetsPromise = this.prismaService.assetMetalGroup.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    { in: clientId ?
					[clientId,] :
					filter.clientIds, },
				portfolioId: { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds, },
				bankId:      {in: filter.bankIds,},
				bank:        {
					is: {
						bankListId: { in: filter.bankListIds, },
					},
				},
				portfolio: {
					isActivated: true,
				},
				totalUnits: {
					gt: 0,
				},
				transferDate: null,
			},
			select: {
				metals: {
					where: {
						...(filter.date && {
							transactionDate: {
								lte: endOfDay(new Date(filter.date,),),
							},
						}),
					},
					select: {
						marketValueUSD:      true,
						assetName:      true,
						marketValueFC:  true,
						currency:       true,
						metalType:      true,
						units:          true,
						productType:    true,
						type:               true,
						isin:               true,
						operation:      true,

					},
				},
				marketValueUSD:      true,
				assetName:      true,
				marketValueFC:  true,
				currency:       true,
				metalType:      true,
				totalUnits:          true,
				productType:    true,
				type:               true,
				isin:               true,
				bank:           {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
			},
		},)
		const depositAssetsPromise = this.prismaService.assetDeposit.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    {in: filter.clientIds,},
				portfolioId:  { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds,},
				bankId:      {in: filter.bankIds,},
				...(clientId ?
					{
						client: {
							id: clientId,
						},
					} :
					{}),
				bank: {
					is: {
						bankListId: {in: filter.bankListIds,},
					},
				},
				portfolio: {
					isActivated: true,
				},
				currency: {
					in: currencies,
				},
				usdValue: {
					not: 0,
				},
				AND: [
					filter.date ?
						{ OR: [
							{ maturityDate: { gt: new Date(filter.date,), }, },
							{ maturityDate: null, },
						], } :
						{},
					filter.date ?
						{} :
						{OR: [
							{ maturityDate: { gt: now, }, },
							{ maturityDate: null, },
						], },
					filter.date ?
						{ startDate: { lte: endOfDay(new Date(filter.date,),), }, } :
						{},
				],
				transferDate: null,

			},
			select: {
				usdValue:      true,
				assetName:      true,
				currencyValue:  true,
				currency:       true,
				bank:           {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
			},
		},)
		const loanAssetsPromise = this.prismaService.assetLoan.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    {in: filter.clientIds,},
				portfolioId:  { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds,},
				bankId:      {in: filter.bankIds,},
				...(clientId ?
					{
						client: {
							id: clientId,
						},
					} :
					{}),
				bank: {
					is: {
						bankListId: {in: filter.bankListIds,},
					},
				},
				portfolio: {
					isActivated: true,
				},
				currency: {
					in: currencies,
				},
				usdValue: {
					not: 0,
				},
				AND: [
					{ maturityDate: { gt: now, }, },
					filter.date ?
						{ startDate: { lte: endOfDay(new Date(filter.date,),), }, } :
						{},
					filter.date ?
						{ maturityDate: { gt: new Date(filter.date,), }, } :
						{},
				],
				transferDate: null,

			},
			select: {
				marketValueUSD: true,
				assetName:      true,
				currencyValue:  true,
				currency:       true,
				usdValue:       true,
				bank:           {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
			},
		},)
		const optionAssetsPromise = this.prismaService.assetOption.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    {in: filter.clientIds,},
				portfolioId:  { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds,},
				bankId:      {in: filter.bankIds,},
				...(clientId ?
					{
						client: {
							id: clientId,
						},
					} :
					{}),
				bank: {
					is: {
						bankListId: {in: filter.bankListIds,},
					},
				},
				portfolio: {
					isActivated: true,
				},
				marketValueUSD: {
					not: 0,
				},
				currency: {
					in: currencies,
				},
				AND:      [
					{ maturityDate: { gt: new Date(), }, },
					filter.date ?
						{ startDate: { lte: endOfDay(new Date(filter.date,),), }, } :
						{},
					filter.date ?
						{ maturityDate: { gt: new Date(filter.date,), }, } :
						{},
				],
				transferDate: null,

			},
			select: {
				marketValueUSD:     true,
				assetName:          true,
				currentMarketValue:  true,
				currency:           true,
				bank:               {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
			},
		},)
		const otherAssetsPromise = this.prismaService.assetOtherInvestment.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    {in: filter.clientIds,},
				portfolioId:  { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds,},
				bankId:      {in: filter.bankIds,},
				...(clientId ?
					{
						client: {
							id: clientId,
						},
					} :
					{}),
				bank: {
					is: {
						bankListId: {in: filter.bankListIds,},
					},
				},
				portfolio: {
					isActivated: true,
				},
				currency: {
					in: currencies,
				},
				usdValue: {
					not: 0,
				},
				AND: [
					filter.date ?
						{
							investmentDate: {
								lte: endOfDay(new Date(filter.date,),),
							},
						} :
						{},
				],
				transferDate: null,

			},
			select: {
				marketValueUSD: true,
				assetName:      true,
				currencyValue:  true,
				currency:       true,
				bank:           {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
			},
		},)
		const peAssetsPromise = this.prismaService.assetPrivateEquity.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    {in: filter.clientIds,},
				portfolioId:  { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds,},
				bankId:      {in: filter.bankIds,},
				...(clientId ?
					{
						client: {
							id: clientId,
						},
					} :
					{}),
				bank: {
					is: {
						bankListId: {in: filter.bankListIds,},
					},
				},
				portfolio: {
					isActivated: true,
				},
				currency: {
					in: currencies,
				},
				marketValueUSD: {
					not: 0,
				},
				AND: [
					filter.date ?
						{
							entryDate: {
								lte: endOfDay(new Date(filter.date,),),
							},
						} :
						{},
				],
				transferDate: null,

			},
			select: {
				marketValueUSD: true,
				assetName:      true,
				currencyValue:  true,
				currency:       true,
				bank:           {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
			},
		},)
		const reAssetsPromise = this.prismaService.assetRealEstate.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    {in: filter.clientIds,},
				portfolioId:  { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds,},
				bankId:      {in: filter.bankIds,},
				...(clientId ?
					{
						client: {
							id: clientId,
						},
					} :
					{}),
				bank: {
					is: {
						bankListId: {in: filter.bankListIds,},
					},
				},
				portfolio: {
					isActivated: true,
				},
				currency: {
					in: currencies,
				},
				usdValue: {
					not: 0,
				},
				AND: [
					filter.date ?
						{
							investmentDate: {
								lte: endOfDay(new Date(filter.date,),),
							},
						} :
						{},
				],
				transferDate: null,

			},
			select: {
				marketValueUSD: true,
				assetName:      true,
				currencyValue:  true,
				currency:       true,
				bank:           {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
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
		],)
		const filteredCryptoAssets = cryptoAssets.map((crypto,) => {
			if (filter.currencies && crypto.productType === CryptoType.DIRECT_HOLD && crypto.cryptoCurrencyType && !filter.currencies.includes(crypto.cryptoCurrencyType as CryptoList,)) {
				return null
			}
			if (filter.currencies && crypto.productType === CryptoType.ETF && crypto.currency && !filter.currencies.includes(crypto.currency as CurrencyDataList,)) {
				return null
			}
			return crypto
		},)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
		const filteredMetalAssets = metalAssets.map((metal,) => {
			if (filter.currencies && metal.productType === MetalType.DIRECT_HOLD && metal.metalType && !filter.currencies.includes(metal.metalType as MetalDataList,)) {
				return null
			}
			if (filter.currencies && metal.productType === MetalType.ETF && metal.currency && !filter.currencies.includes(metal.currency as CurrencyDataList,)) {
				return null
			}
			return metal
		},)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
		return {
			bondAssets,
			cryptoAssets: filteredCryptoAssets,
			equityAssets,
			metalAssets:  filteredMetalAssets,
			depositAssets,
			loanAssets,
			optionAssets,
			otherAssets,
			peAssets,
			reAssets,
		}
	}

	private async getFilteredRefactoredAssetsWithHistoryDate(filter: OverviewFilterDto, clientId?: string,): Promise<IFilteredRefactoredAssetsWithHistory> {
		const fiatCurrencies = filter.currencies ?
			filter.currencies.filter((c,): c is CurrencyDataList => {
				return typeof c === 'string' && !['XAU', 'XAG', 'XPD', 'XPT', 'BTC', 'ETH',].includes(c,)
			},
			) :
			[]
		const currencies = fiatCurrencies.length === 0 ?
			Boolean(filter.currencies?.length,) ?
				[] :
				undefined :
			fiatCurrencies
		const now = new Date()
		const targetDate = filter.date ?
			endOfDay(new Date(filter.date,),) :
			endOfDay(new Date(),)

		const bondAssetsPromise = this.prismaService.assetBondGroup.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    {in: filter.clientIds,},
				portfolioId:  { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds,},
				bankId:      {in: filter.bankIds,},
				...(clientId ?
					{
						client: {
							id: clientId,
						},
					} :
					{}),
				bank: {
					is: {
						bankListId: {in: filter.bankListIds,},
					},
				},
				portfolio: {
					isActivated: true,
				},
				totalUnits: {
					gt: 0,
				},
				marketPrice: {
					not: 0,
				},
				OR: [
					{ transferDate: null, },
					{ transferDate: { gte: targetDate, }, },
				],
				currency: {
					in: currencies,
				},
			},
			select: {
				bonds: {
					where: {
						OR:        [
							{
								assetBondVersions: {
									none: {},
								},
								units:       { gt: 0, },
								marketPrice: { not: 0, },
								AND:         [
									{
										valueDate: {
											lte: targetDate,
										},
									},
									{
										OR: [
											{ maturityDate: null, },
											{ maturityDate: { gte: endOfDay(targetDate,), }, },
										],
									},
								],
							},
							{
								assetBondVersions: {
									some: {
										units:       { gt: 0, },
										marketPrice: { not: 0, },
										AND:         [
											{
												valueDate: {
													lte: targetDate,
												},
											},
											{
												OR: [
													{ maturityDate: null, },
													{ maturityDate: { gte: endOfDay(targetDate,), }, },
												],
											},
										],
									},
								},
							},
						],
					},
					select: {
						marketValueUSD:      true,
						assetName:          true,
						marketValueFC:      true,
						currency:           true,
						units:             true,
						marketPrice:       true,
						isin:              true,
						operation:         true,
						assetBondVersions: {
							where: {
								createdAt: {
									lte: targetDate,
								},
							},
							orderBy: {
								createdAt: 'desc',
							},
							take:   1,
							select: {
								marketValueUSD:      true,
								assetName:          true,
								marketValueFC:      true,
								currency:           true,
								units:          true,
								marketPrice:    true,
								isin:           true,
								operation:      true,
							},
						},
					},

				},
				bank:               {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
			},
		},)
		const cryptoAssetsPromise = this.prismaService.assetCryptoGroup.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    { in: clientId ?
					[clientId,] :
					filter.clientIds, },
				portfolioId: { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds, },
				bankId:      {in: filter.bankIds,},
				bank:        {
					is: {
						bankListId: { in: filter.bankListIds, },
					},
				},
				portfolio: {
					isActivated: true,
				},
				totalUnits: {
					gt: 0,
				},
				OR: [
					{ transferDate: { gte: targetDate, }, },
					{ transferDate: null, },
				],
			},
			include: {
				cryptos:            {
					where: {
						OR:        [
							{
								assetCryptoVersions: {
									none: {},
								},
								AND:       [
									{
										OR: [
											{ purchaseDate: null, },
											{ purchaseDate: { lte: targetDate, }, },
										],
									},
									{
										OR: [
											{ transactionDate: null, },
											{ transactionDate: { lte: targetDate, }, },
										],
									},
								],
							},
							{
								assetCryptoVersions: {
									some: {
										AND:       [
											{
												OR: [
													{ purchaseDate: null, },
													{ purchaseDate: { lte: targetDate, }, },
												],
											},
											{
												OR: [
													{ transactionDate: null, },
													{ transactionDate: { lte: targetDate, }, },
												],
											},
										],
									},
								},
							},
						],
					},
					select: {
						marketValueUSD:      true,
						assetName:           true,
						marketValueFC:       true,
						currency:            true,
						cryptoCurrencyType:      true,
						units:               true,
						productType:         true,
						cryptoAmount:        true,
						type:                true,
						isin:                true,
						operation:           true,
						id:                  true,
						assetCryptoVersions: {
							where: {
								createdAt: {
									lte: targetDate,
								},
							},
							orderBy: {
								createdAt: 'desc',
							},
							take:   1,
							select: {
								marketValueUSD:      true,
								assetName:          true,
								marketValueFC:      true,
								currency:           true,
								cryptoCurrencyType:      true,
								units:              true,
								productType:        true,
								cryptoAmount:       true,
								type:               true,
								isin:               true,
								operation:          true,
								id:                 true,
							},
						},
					},
				},
				bank:               {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
			},
		},)
		const equityAssetsPromise = this.prismaService.assetEquityGroup.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    {in: filter.clientIds,},
				portfolioId:  { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds,},
				bankId:      {in: filter.bankIds,},
				...(clientId ?
					{
						client: {
							id: clientId,
						},
					} :
					{}),
				bank: {
					is: {
						bankListId: {in: filter.bankListIds,},
					},
				},
				portfolio: {
					isActivated: true,
				},
				totalUnits: {
					gt: 0,
				},
				currentStockPrice: {
					not: 0,
				},
				OR: [
					{ transferDate: { gte: targetDate, }, },
					{ transferDate: null, },
				],
			},
			select: {
				equities: {
					where: {
						transactionDate: {
							lte: targetDate,
						},
					},
					select: {
						marketValueUSD:      true,
						assetName:           true,
						marketValueFC:       true,
						currency:            true,
						units:               true,
						type:                true,
						isin:                true,
						operation:           true,
						assetEquityVersions: {
							where: {
								createdAt: {
									lte: targetDate,
								},
							},
							orderBy: {
								createdAt: 'desc',
							},
							take:   1,
							select: {
								marketValueUSD:      true,
								assetName:          true,
								marketValueFC:      true,
								currency:           true,
								units:          true,
								type:           true,
								isin:           true,
								operation:      true,
							},
						},
					},
				},
				bank:               {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
				type:     true,
				currency: true,
				isin:     true,
			},
		},)
		const metalAssetsPromise = this.prismaService.assetMetalGroup.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    { in: clientId ?
					[clientId,] :
					filter.clientIds, },
				portfolioId: { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds, },
				bankId:      {in: filter.bankIds,},
				bank:        {
					is: {
						bankListId: { in: filter.bankListIds, },
					},
				},
				portfolio: {
					isActivated: true,
				},
				totalUnits: {
					gt: 0,
				},
				OR: [
					{ transferDate: null, },
					{ transferDate: { gte: targetDate, }, },
				],
			},
			select: {
				metals: {
					where: {
						OR:        [
							{
								assetMetalVersions: {
									none: {},
								},
								transactionDate: {
									lte: targetDate,
								},
							},
							{
								assetMetalVersions: {
									some: {
										transactionDate: {
											lte: targetDate,
										},
									},
								},
							},
						],
					},
					select: {
						marketValueUSD:      true,
						assetName:          true,
						marketValueFC:      true,
						currency:           true,
						metalType:          true,
						units:              true,
						productType:        true,
						type:               true,
						isin:               true,
						operation:          true,
						assetMetalVersions: {
							where: {
								createdAt: {
									lte: targetDate,
								},
							},
							orderBy: {
								createdAt: 'desc',
							},
							take:   1,
							select: {
								marketValueUSD:      true,
								assetName:      true,
								marketValueFC:  true,
								currency:       true,
								metalType:      true,
								units:          true,
								productType:    true,
								type:               true,
								isin:               true,
								operation:      true,
							},
						},

					},
				},
				marketValueUSD: true,
				assetName:      true,
				marketValueFC:  true,
				currency:       true,
				metalType:      true,
				totalUnits:     true,
				productType:    true,
				type:           true,
				isin:           true,
				bank:           {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
			},
		},)
		const depositAssetsPromise = this.prismaService.assetDeposit.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    {in: filter.clientIds,},
				portfolioId:  { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds,},
				bankId:      {in: filter.bankIds,},
				...(clientId ?
					{
						client: {
							id: clientId,
						},
					} :
					{}),
				bank: {
					is: {
						bankListId: {in: filter.bankListIds,},
					},
				},
				portfolio: {
					isActivated: true,
				},

				OR: [
					{
						usdValue: {
							not: 0,
						},
						AND: [
							{
								OR: [
									{ maturityDate: { gt: targetDate, }, },
									{ maturityDate: null, },
								],
							},
							{ startDate: { lte: targetDate, }, },
							{
								OR: [
									{ transferDate: { gte: targetDate, }, },
									{ transferDate: null, },
								],
							},
						],
						assetDepositVersions: {
							none: {},
						},
					},
					{
						OR: [
							{ transferDate: { gte: targetDate, }, },
							{ transferDate: null, },
						],
						assetDepositVersions: {
							some: {
								usdValue:  { not: 0, },
								startDate: { lte: targetDate, },
								OR:        [
									{ maturityDate: { gt: targetDate, }, },
									{
										AND: [
											{ maturityDate: null, },
											{ startDate: { lte: targetDate, }, },
										],
									},
								],
							},
						},
					},
				],
			},
			select: {
				usdValue:      true,
				assetName:      true,
				currencyValue:  true,
				currency:       true,
				bank:           {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
				assetDepositVersions: {
					where: {
						createdAt: { lte: targetDate, },
					},
					select: {
						usdValue:      true,
						assetName:      true,
						currencyValue:  true,
						currency:       true,
					},
					orderBy: { createdAt: 'desc', },
					take:    1,
				},
			},
		},)
		const loanAssetsPromise = this.prismaService.assetLoan.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    {in: filter.clientIds,},
				portfolioId:  { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds,},
				bankId:      {in: filter.bankIds,},
				...(clientId ?
					{
						client: {
							id: clientId,
						},
					} :
					{}),
				bank: {
					is: {
						bankListId: {in: filter.bankListIds,},
					},
				},
				portfolio: {
					isActivated: true,
				},
				OR: [
					{
						AND: [
							{ startDate: { lte: targetDate, }, },
							{ maturityDate: { gt: targetDate, }, },
							{
								OR: [
									{ transferDate: { gte: targetDate, }, },
									{ transferDate: null, },
								],
							},
						],
						versions: {
							none: {},
						},
						usdValue: {
							not: 0,
						},
					},
					{
						versions: {
							some: {
								startDate:    { lte: targetDate, },
								maturityDate: { gt: targetDate, },
							},
						},
						AND: [
							{
								OR: [
									{ transferDate: { gte: targetDate, }, },
									{ transferDate: null, },
								],
							},
						],
					},
				],
			},
			select: {
				marketValueUSD: true,
				assetName:      true,
				currencyValue:  true,
				currency:       true,
				usdValue:       true,
				bank:           {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
				versions: {
					where: {
						createdAt: { lte: targetDate, },
					},
					orderBy: { createdAt: 'desc', },
					take:    1,
					select:  {
						marketValueUSD: true,
						assetName:      true,
						currencyValue:  true,
						currency:       true,
						usdValue:       true,
					},
				},
			},

		},)
		const optionAssetsPromise = this.prismaService.assetOption.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    {in: filter.clientIds,},
				portfolioId:  { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds,},
				bankId:      {in: filter.bankIds,},
				...(clientId ?
					{
						client: {
							id: clientId,
						},
					} :
					{}),
				bank: {
					is: {
						bankListId: {in: filter.bankListIds,},
					},
				},
				portfolio: {
					isActivated: true,
				},
				OR: [
					{
						marketValueUSD: { not: 0, },

						AND: [
							{ startDate: { lte: targetDate, }, },
							{ maturityDate: { gt: targetDate, }, },
							{
								OR: [
									{ transferDate: { gte: targetDate, }, },
									{ transferDate: null, },
								],
							},
						],

						versions: { none: {}, },
					},
					{
						OR: [
							{ transferDate: { gte: targetDate, }, },
							{ transferDate: null, },
						],
						marketValueUSD: { not: 0, },
						versions:       {
							some: {
								AND: [
									{ startDate: { lte: targetDate, }, },
									{ maturityDate: { gt: targetDate, }, },
								],
							},
						},

					},
				],
			},
			select: {
				marketValueUSD:     true,
				assetName:          true,
				currentMarketValue:  true,
				currency:           true,
				bank:               {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
				versions: {
					where: {
						createdAt: { lte: targetDate, },
					},
					select: {
						marketValueUSD:     true,
						assetName:          true,
						currentMarketValue:  true,
						currency:           true,
					},
					orderBy: { createdAt: 'desc', },
					take:    1,
				},
			},
		},)
		const otherAssetsPromise = this.prismaService.assetOtherInvestment.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    {in: filter.clientIds,},
				portfolioId:  { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds,},
				bankId:      {in: filter.bankIds,},
				...(clientId ?
					{
						client: {
							id: clientId,
						},
					} :
					{}),
				bank: {
					is: {
						bankListId: {in: filter.bankListIds,},
					},
				},
				portfolio: {
					isActivated: true,
				},
				currency: {
					in: currencies,
				},

				OR: [
					{
						marketValueUSD: { not: 0, },
						usdValue:       {
							not: 0,
						},
						AND: [
							{
								investmentDate: {
									lte: targetDate,
								},
							},
							{
								OR: [
									{ transferDate: { gte: targetDate, }, },
									{ transferDate: null, },
								],
							},
						],
						versions: { none: {}, },
					},
					{
						OR: [
							{ transferDate: { gte: targetDate, }, },
							{ transferDate: null, },
						],
						versions:       {
							some: {
								marketValueUSD: { not: 0, },
								usdValue:       {
									not: 0,
								},
								AND: [
									{
										investmentDate: {
											lte: targetDate,
										},
									},
								],
							},
						},

					},
				],
			},
			select: {
				marketValueUSD: true,
				assetName:      true,
				currencyValue:  true,
				currency:       true,
				bank:           {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
				versions: {
					where: {
						createdAt: { lte: targetDate, },
					},
					select: {
						marketValueUSD: true,
						assetName:      true,
						currencyValue:  true,
						currency:       true,
					},
					orderBy: {
						createdAt: 'desc',
					},
					take: 1,
				},
			},
		},)
		const peAssetsPromise = this.prismaService.assetPrivateEquity.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    {in: filter.clientIds,},
				portfolioId:  { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds,},
				bankId:      {in: filter.bankIds,},
				...(clientId ?
					{
						client: {
							id: clientId,
						},
					} :
					{}),
				bank: {
					is: {
						bankListId: {in: filter.bankListIds,},
					},
				},
				portfolio: {
					isActivated: true,
				},
				OR: [
					{
						marketValueUSD: {
							not: 0,
						},
						AND: [
							{
								entryDate: {
									lte: targetDate,
								},
							},
							{
								OR: [
									{ transferDate: { gte: targetDate, }, },
									{ transferDate: null, },
								],
							},
						],
						versions: { none: {}, },
					},
					{
						OR: [
							{ transferDate: { gte: targetDate, }, },
							{ transferDate: null, },
						],
						versions:       {
							some: {
								marketValueUSD: { not: 0, },
								AND:            [
									{
										entryDate: {
											lte: targetDate,
										},
									},
								],
							},
						},

					},
				],
			},
			select: {
				marketValueUSD: true,
				assetName:      true,
				currencyValue:  true,
				currency:       true,
				bank:           {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
				versions:  {
					where: {
						createdAt: {
							lte: targetDate,
						},
					},
					select: {
						marketValueUSD: true,
						assetName:      true,
						currencyValue:  true,
						currency:       true,
					},
					orderBy: { createdAt: 'desc', },
					take:    1,
				},
			},
		},)
		const reAssetsPromise = this.prismaService.assetRealEstate.findMany({
			where: {
				assetName:   {in: filter.assetNames,},
				clientId:    {in: filter.clientIds,},
				portfolioId:  { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				accountId:   { in: filter.accountIds,},
				bankId:      {in: filter.bankIds,},
				...(clientId ?
					{
						client: {
							id: clientId,
						},
					} :
					{}),
				bank: {
					is: {
						bankListId: {in: filter.bankListIds,},
					},
				},
				portfolio: {
					isActivated: true,
				},
				currency: {
					in: currencies,
				},
				usdValue: {
					not: 0,
				},
				OR: [
					{
						usdValue: {
							not: 0,
						},
						AND: [
							{
								investmentDate: {
									lte: targetDate,
								},
							},
							{
								OR: [
									{ transferDate: { gte: targetDate, }, },
									{ transferDate: null, },
								],
							},
						],
						versions: { none: {}, },
					},
					{
						OR: [
							{ transferDate: { gte: targetDate, }, },
							{ transferDate: null, },
						],
						versions: {
							some: {
								investmentDate: {
									lte: targetDate,
								},
								usdValue: {
									not: 0,
								},
							},

						},

					},
				],
			},
			select: {
				marketValueUSD: true,
				assetName:      true,
				currencyValue:  true,
				currency:       true,
				bank:           {
					include: {
						bankList: true,
					},
				},
				account: {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity: {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
				versions: {
					where: {
						createdAt: {
							lte: targetDate,
						},
					},
					select: {
						marketValueUSD: true,
						assetName:      true,
						currencyValue:  true,
						currency:       true,
					},
					orderBy: {
						createdAt: 'desc',
					},
					take: 1,
				},
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
		],)
		const filteredCryptoAssets = cryptoAssets.map((crypto,) => {
			if (filter.currencies && crypto.productType === CryptoType.DIRECT_HOLD && crypto.cryptoCurrencyType && !filter.currencies.includes(crypto.cryptoCurrencyType as CryptoList,)) {
				return null
			}
			if (filter.currencies && crypto.productType === CryptoType.ETF && crypto.currency && !filter.currencies.includes(crypto.currency as CurrencyDataList,)) {
				return null
			}
			return crypto
		},)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
		const filteredMetalAssets = metalAssets.map((metal,) => {
			if (filter.currencies && metal.productType === MetalType.DIRECT_HOLD && metal.metalType && !filter.currencies.includes(metal.metalType as MetalDataList,)) {
				return null
			}
			if (filter.currencies && metal.productType === MetalType.ETF && metal.currency && !filter.currencies.includes(metal.currency as CurrencyDataList,)) {
				return null
			}
			return metal
		},)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
		return {
			bondAssets,
			cryptoAssets: filteredCryptoAssets,
			equityAssets,
			metalAssets:  filteredMetalAssets,
			depositAssets,
			loanAssets,
			optionAssets,
			otherAssets,
			peAssets,
			reAssets,
		}
	}

	private async getFilteredAssets(filter: OverviewFilterDto, clientId?: string,): Promise<Array<TAssetExtended>> {
		if (
			filter.assetNames?.length === 0 ||
			filter.clientIds?.length === 0 ||
			filter.portfolioIds?.length === 0 ||
			filter.entityIds?.length === 0 ||
			filter.bankIds?.length === 0 ||
			filter.bankListIds?.length === 0 ||
			filter.currencies?.length === 0
		) {
			return []
		}
		const date = filter.date ?
			new Date(filter.date,) :
			new Date()
		date.setUTCHours(23, 59, 59, 0,)
		const where: Prisma.AssetWhereInput = {
			isArchived: false,
			AND:        [
				{
					assetName: {
						in: filter.assetNames,
					},
				},
			],
			clientId: {
				in: clientId ?
					[clientId,] :
					filter.clientIds,
			},
			portfolioId: {
				in: filter.portfolioIds,
			},
			entityId: {
				in: filter.entityIds,
			},
			bankId: {
				in: filter.bankIds,
			},
			bank: {
				is: {
					bankListId: { in: filter.bankListIds, },
				},
			},
			accountId: {
				in: filter.accountIds,
			},
			portfolio: {
				is: {
					isActivated: true,
				},
			},
		}
		return this.prismaService.asset.findMany({
			where,
			include: {
				portfolio: true,
				entity:    true,
				bank:      { include: { bankList: true, }, },
				account:   true,
			},
		},)
	}

	/**
 * 3.5.2
 * Retrieves filtered transactions based on the provided filter criteria.
 * @remarks
 * - Filters transactions based on client, portfolio, entity, bank, and date range.
 * @param filter - The filter criteria for retrieving transactions.
 * @param clientId - The optional client ID to further filter the results.
 * @returns A Promise resolving to an array of filtered transactions.
 */
	private async getFilteredTransactions(filter: OverviewFilterDto, clientId?: string,): Promise<Array<TOverviewTransactionWithRelations>> {
		const date = filter.date ?
			new Date(filter.date,) :
			undefined
		date?.setUTCHours(0, 0, 59, 0,)
		const dateResult = date?.toISOString()
		if (filter.assetNames && !filter.assetNames.includes(AssetNamesType.CASH,)) {
			return []
		}
		return this.prismaService.transaction.findMany({
			where: {
				clientId: {
					in: clientId ?
						[clientId,] :
						filter.clientIds,
				},
				portfolioId: {
					in: filter.portfolioIds,
				},
				entityId: {
					in: filter.entityIds,
				},
				bankId: {
					in: filter.bankIds,
				},
				bank: {
					is: {
						bankListId: { in: filter.bankListIds, },
					},
				},
				portfolio: {
					isActivated: true,
				},
				accountId: {
					in: filter.accountIds,
				},
				currency: {
					in: filter.currencies,
				},
				transactionDate: filter.date &&
					{
						lte: dateResult,
					},
			},
			select: {
				amount:   true,
				currency: true,
				bank:      { include: { bankList: true, }, },
				account:  {
					select: {
						id:          true,
						accountName: true,
					},
				},
				entity:   {
					select: {
						id:   true,
						name: true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
			},
		},)
	}

	/**
 * 3.5.2
 * Parses and filters assets based on the provided filter criteria.
 * @remarks
 * - Filters assets based on various criteria, including asset currencies, metal type, crypto type, etc.
 * @param filter - The filter criteria for retrieving assets.
 * @param clientId - The optional client ID to further filter the results.
 * @returns A Promise resolving to an array of filtered and parsed assets.
 */
	private async parseAndFilterAssets<T extends UnionAssetType = UnionAssetType>(filter: OverviewFilterDto, clientId?: string,): Promise<Array<T>> {
		const assets = await this.getFilteredAssets(filter, clientId,)
		const parsedAssets = assets
			.map((asset,) => {
				const parsedAsset = assetParser<T>(asset,)

				if (!parsedAsset) {
					return null
				}

				if (filter.currencies &&
					'metalType' in parsedAsset &&
					parsedAsset.metalType &&
					!filter.currencies.includes(parsedAsset.metalType,)) {
					return null
				}

				if (
					filter.currencies &&
					'cryptoCurrencyType' in parsedAsset &&
					parsedAsset.cryptoCurrencyType &&
					!filter.currencies.includes(parsedAsset.cryptoCurrencyType,)) {
					return null
				}

				if (
					filter.currencies &&
					'currency' in parsedAsset &&
					!('metalType' in parsedAsset) &&
					parsedAsset.currency &&
					!filter.currencies.includes(parsedAsset.currency,)) {
					return null
				}

				return parsedAsset
			},)
			.filter((item,): item is T => {
				return item !== null
			},)

		return parsedAssets
	}

	/**
 * 3.5.2
 * Retrieves bank analytics based on the provided filter criteria.
 * @remarks
 * - Uses `getFilteredAssets` to fetch assets matching the filter.
 * - Loads necessary lists for currency, metal, crypto, bond, and cBonds data.
 * - Calculates the USD value for various types of assets and aggregates data by bank.
 * @param filter - The filter criteria for retrieving bank analytics.
 * @param clientId - The optional client ID to further filter the results.
 * @returns A Promise resolving to an array of bank analytics data.
 */
	// New Version
	public async getBankAnalytics(filter: OverviewFilterDto, clientId?: string,): Promise<Array<TBankAnalytics>> {
		if (filter.date) {
			const [{
				bondAssets,
				equityAssets,
				metalAssets,
				cryptoAssets,
				depositAssets,
				loanAssets,
				optionAssets,
				otherAssets,
				peAssets,
				reAssets,
			}, transactions, currencyList, bonds,equities, etfs, metalList,] = await Promise.all([
				this.getFilteredRefactoredAssetsWithHistoryDate(filter,clientId,),
				this.getFilteredTransactions(filter, clientId,),
				this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
				this.cBondsCurrencyService.getAllBondsWithHistory(filter.date,),
				this.cBondsCurrencyService.getAllEquitiesWithHistory(filter.date,),
				this.cBondsCurrencyService.getAllEtfsWithHistory(filter.date,),
				this.cBondsCurrencyService.getAllMetalsWithHistory(filter.date,),
			],)
			const totalCurrencyValuesByCurrency = transactions.reduce<Record<string, number>>(
				(acc, transaction,) => {
					const curr = transaction.currency
					acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
					return acc
				},
				{},
			)
			const filteredTransactions = transactions.filter((transaction,) => {
				return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
			},)
			const cashBankData = filteredTransactions
				.map((transaction,) => {
					const { currency, bank, account, amount, } = transaction

					if (!bank || !account) {
						return null
					}

					const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
						currency:      currency as CurrencyDataList,
						currencyValue: Number(amount,),
						currencyList,
						historyDate:   filter.date,
					},)

					return {
						id:          bank.bankListId,
						bankName:    bank.bankList?.name ?? bank.bankName,
						accountName: account.accountName,
						accountId:   account.id,
						usdValue,
					} as TBankAnalytics
				},)
				.filter((item,): item is TBankAnalytics => {
					return item !== null
				},)
			const bondsBankData = bondAssets
				.map((group,) => {
					return {
						...group,
						bonds: group.bonds.map((b,) => {
							if (b.assetBondVersions.length > 0) {
								return b.assetBondVersions[0]
							}
							return b
						},),
					}
				},)
				.filter((group,) => {
					return Boolean(group.bonds.length > 0,)
				},)
				.flatMap((groupAsset,) => {
					return groupAsset.bonds.map((asset,) => {
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === asset.currency
						},)
						const bondData = bonds.find((item,) => {
							return item.isin === asset.isin
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const dirtyPriceCurrency = bondData && bondData.bondHistory[0] ?
							bondData.bondHistory[0].dirtyPriceCurrency ?
								bondData.bondHistory[0].dirtyPriceCurrency :
								null :
							bondData?.dirtyPriceCurrency ?
								bondData.dirtyPriceCurrency :
								null

						const nominalPrice = bondData && bondData.bondHistory[0] ?
							bondData.bondHistory[0].nominalPrice ?
								bondData.bondHistory[0].nominalPrice :
								null :
							bondData?.nominalPrice ?
								bondData.nominalPrice :
								null

						const marketPrice = bondData && bondData.bondHistory[0] ?
							bondData.bondHistory[0].marketPrice :
							bondData?.marketPrice ?? asset.marketPrice

						const marketValueUsd = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
							isin:  asset.isin,
							units:              Number(asset.units,),
							dirtyPriceCurrency,
							nominalPrice,
							rate,
							marketPrice,
						},)
						return {
							id:          groupAsset.bank.bankListId,
							bankName:    groupAsset.bank.bankName,
							accountName: groupAsset.account.accountName,
							accountId:   groupAsset.account.id,
							usdValue:    asset.operation === AssetOperationType.BUY ?
								marketValueUsd :
								-marketValueUsd,
						} as TBankAnalytics
					},)
				},)
			const depositsBankData = depositAssets
				.map((asset,) => {
					if (asset.assetDepositVersions.length > 0) {
						const [assetVersion,] = asset.assetDepositVersions
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const { currencyValue,} = assetVersion
						const usdValue = parseFloat((currencyValue * (rate)).toFixed(2,),)
						return {
							id:          asset.bank.bankListId,
							bankName:    asset.bank.bankName,
							accountName: asset.account?.accountName,
							accountId:   asset.account?.id,
							usdValue,
						} as TBankAnalytics
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const { currencyValue,} = asset
					const usdValue = parseFloat((currencyValue * (rate)).toFixed(2,),)
					return {
						id:          asset.bank.bankListId,
						bankName:    asset.bank.bankName,
						accountName: asset.account?.accountName,
						accountId:   asset.account?.id,
						usdValue,
					} as TBankAnalytics
				},)

			const cryptoETFData = cryptoAssets
				.map((group,) => {
					return {
						...group,
						cryptos: group.cryptos.map((crypto,) => {
							if (crypto.assetCryptoVersions.length > 0) {
								return {
									...crypto.assetCryptoVersions[0],
									mainAssetId: crypto.id,
								}
							}
							return {
								...crypto,
								mainAssetId: undefined,
							}
						},),
					}
				},)
				.filter((group,) => {
					return Boolean(group.cryptos.length > 0,)
				},)
				.flatMap((group,) => {
					return group.cryptos.map((asset,) => {
						if (asset.productType === CryptoType.ETF) {
							const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
								return item.currency === asset.currency
							},)
							const rate = currencyData ?
								filter.date ?
									currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
									currencyData.rate :
								1
							let cBondsData: Equity | Etf | undefined
							let lastPrice: number = 0

							if (asset.type === EquityType.Equity) {
								const equity = equities.find((e,) => {
									return e.isin === asset.isin
								},)
								if (equity) {
									lastPrice = equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
								}
								cBondsData = equity
							} else {
								const etf = etfs.find((e,) => {
									return e.isin === asset.isin
								},)
								if (etf) {
									lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
								}
								cBondsData = etf
							}
							const marketPrice = cBondsData?.currencyName ===  'GBX' ?
								lastPrice / 100 :
								lastPrice
							const marketValueUsd = parseFloat(((asset.units ?? 0) * Number(marketPrice,) * rate).toFixed(2,),)
							return {
								id:          group.bank.bankListId,
								bankName:    group.bank.bankName,
								accountName: group.account.accountName,
								accountId:   group.account.id,
								usdValue:    asset.operation === AssetOperationType.BUY  ?
									marketValueUsd :
									-marketValueUsd,
							} as TBankAnalytics
						}
						return {
							id:          group.bank.bankListId,
							bankName:    group.bank.bankName,
							accountName: group.account.accountName,
							accountId:   group.account.id,
							usdValue:    asset.marketValueUSD,
						} as TBankAnalytics
					},)
				},)
			const equityBankData = equityAssets
				.map((group,) => {
					return {
						...group,
						equities: group.equities.map((equity,) => {
							if (equity.assetEquityVersions.length > 0) {
								return equity.assetEquityVersions[0]
							}
							return equity
						},),
					}
				},)
				.filter((group,) => {
					return Boolean(group.equities.length > 0,)
				},)
				.flatMap((group,) => {
					return group.equities.map((asset,) => {
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === asset.currency
						},)
						const rate = currencyData ?
							filter.date ?
								currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
								currencyData.rate :
							1
						let cBondsData: Equity | Etf | undefined
						let lastPrice: number = 0

						if (asset.type === EquityType.Equity) {
							const equity = equities.find((e,) => {
								return e.isin === asset.isin
							},)
							if (equity) {
								lastPrice = equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
							}
							cBondsData = equity
						} else {
							const etf = etfs.find((e,) => {
								return e.isin === asset.isin
							},)
							if (etf) {
								lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
							}
							cBondsData = etf
						}
						const marketPrice = cBondsData?.currencyName ===  'GBX' ?
							lastPrice / 100 :
							lastPrice
						const marketValueUsd = parseFloat(((asset.units ?? 0) * Number(marketPrice,) * rate).toFixed(2,),)
						return {
							id:          group.bank.bankListId,
							bankName:    group.bank.bankName,
							accountName: group.account.accountName,
							accountId:   group.account.id,
							usdValue:    asset.operation === AssetOperationType.BUY ?
								marketValueUsd :
								-marketValueUsd,
						} as TBankAnalytics
					},)
				},)
			const loanBankData = loanAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions

						return {
							id:          asset.bank.bankListId,
							bankName:    asset.bank.bankName,
							accountName: asset.account?.accountName,
							accountId:   asset.account?.id,
							usdValue:    assetVersion.usdValue,
						} as TBankAnalytics
					}
					const { usdValue,} = asset
					return {
						id:          asset.bank.bankListId,
						bankName:    asset.bank.bankName,
						accountName: asset.account?.accountName,
						accountId:   asset.account?.id,
						usdValue,
					} as TBankAnalytics
				},)
			const metalETFData = metalAssets
				.map((group,) => {
					return {
						...group,
						metals: group.metals.map((metal,) => {
							if (metal.assetMetalVersions.length > 0) {
								return metal.assetMetalVersions[0]
							}
							return metal
						},),
					}
				},)
				.filter((group,) => {
					return Boolean(group.metals.length > 0,)
				},)
				.flatMap((group,) => {
					return group.metals.map((asset,) => {
						if (asset.productType === MetalType.ETF) {
							const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
								return item.currency === asset.currency
							},)
							const rate = currencyData ?
								filter.date ?
									currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
									currencyData.rate :
								1
							let cBondsData: Equity | Etf | undefined
							let lastPrice: number = 0

							if (asset.type === EquityType.Equity) {
								const equity = equities.find((e,) => {
									return e.isin === asset.isin
								},)
								if (equity) {
									lastPrice = equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
								}
								cBondsData = equity
							} else {
								const etf = etfs.find((e,) => {
									return e.isin === asset.isin
								},)
								if (etf) {
									lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
								}
								cBondsData = etf
							}
							const marketPrice = cBondsData?.currencyName ===  'GBX' ?
								lastPrice / 100 :
								lastPrice
							const marketValueUsd = parseFloat(((asset.units ?? 0) * Number(marketPrice,) * rate).toFixed(2,),)
							return {
								id:          group.bank.bankListId,
								bankName:    group.bank.bankName,
								accountName: group.account.accountName,
								accountId:   group.account.id,
								usdValue:    asset.operation === AssetOperationType.BUY  ?
									marketValueUsd :
									-marketValueUsd,
							} as TBankAnalytics
						}
						const marketValueUsd = asset.metalType ?
							this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
								metalList,
								metalType:   asset.metalType,
								units:       asset.units,
								historyDate: filter.date,
							},) :
							0
						return {
							id:          group.bank.bankListId,
							bankName:    group.bank.bankName,
							accountName: group.account.accountName,
							accountId:   group.account.id,
							usdValue:    asset.operation === AssetOperationType.BUY    ?
								marketValueUsd :
								-marketValueUsd,
						} as TBankAnalytics
					},)
				},)
			const optionsBankData = optionAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((assetVersion.currentMarketValue * (rate)).toFixed(2,),)
						return {
							id:          asset.bank.bankListId,
							bankName:    asset.bank.bankName,
							accountName: asset.account?.accountName,
							accountId:   asset.account?.id,
							usdValue,
						} as TBankAnalytics
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const usdValue = parseFloat((asset.currentMarketValue * (rate)).toFixed(2,),)
					return {
						id:          asset.bank.bankListId,
						bankName:    asset.bank.bankName,
						accountName: asset.account?.accountName,
						accountId:   asset.account?.id,
						usdValue,
					} as TBankAnalytics
				},)
			const otherBankData = otherAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((assetVersion.currencyValue * (rate)).toFixed(2,),)
						return {
							id:          asset.bank.bankListId,
							bankName:    asset.bank.bankName,
							accountName: asset.account?.accountName,
							accountId:   asset.account?.id,
							usdValue,
						} as TBankAnalytics
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const usdValue = parseFloat((asset.currencyValue * rate).toFixed(2,),)
					return {
						id:          asset.bank.bankListId,
						bankName:    asset.bank.bankName,
						accountName: asset.account?.accountName,
						accountId:   asset.account?.id,
						usdValue,
					} as TBankAnalytics
				},)
			const privateEquityBankData = peAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((assetVersion.currencyValue * (rate)).toFixed(2,),)
						return {
							id:          asset.bank.bankListId,
							bankName:    asset.bank.bankName,
							accountName: asset.account?.accountName,
							accountId:   asset.account?.id,
							usdValue,
						} as TBankAnalytics
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const usdValue = parseFloat((asset.currencyValue * rate).toFixed(2,),)
					return {
						id:          asset.bank.bankListId,
						bankName:    asset.bank.bankName,
						accountName: asset.account?.accountName,
						accountId:   asset.account?.id,
						usdValue,
					} as TBankAnalytics
				},)
			const realEstateBankData = reAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((assetVersion.currencyValue * (rate)).toFixed(2,),)
						return {
							id:          asset.bank.bankListId,
							bankName:    asset.bank.bankName,
							accountName: asset.account.accountName,
							accountId:   asset.account.id,
							usdValue,
						} as TBankAnalytics
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const usdValue = parseFloat((asset.currencyValue * (rate)).toFixed(2,),)
					return {
						id:          asset.bank.bankListId,
						bankName:    asset.bank.bankName,
						accountName: asset.account.accountName,
						accountId:   asset.account.id,
						usdValue,
					} as TBankAnalytics
				},)
			const result = [
				...cashBankData,
				...bondsBankData,
				...depositsBankData,
				...cryptoETFData,
				...equityBankData,
				...loanBankData,
				...metalETFData,
				...optionsBankData,
				...otherBankData,
				...privateEquityBankData,
				...realEstateBankData,
			].reduce<Array<TBankAnalytics>>((acc, asset,) => {
				const {
					bankName,
					id,
					usdValue,
					accountName,
					accountId,
				} = asset
				const existing = acc.find((item,) => {
					return item.accountId === accountId
				},)
				if (existing) {
					existing.usdValue = existing.usdValue + usdValue
				} else {
					acc.push({
						id,
						bankName,
						usdValue,
						accountName: accountName ?
							this.cryptoService.decryptString(accountName,) :
							undefined,
						accountId,
					},)
				}
				return acc
			}, [],)
				.filter((item,) => {
					return Math.abs(item.usdValue,) >= 1
				},)
			return result
		}

		const [{
			bondAssets,
			equityAssets,
			metalAssets,
			cryptoAssets,
			depositAssets,
			loanAssets,
			optionAssets,
			otherAssets,
			peAssets,
			reAssets,
		}, transactions, currencyList,] = await Promise.all([
			this.getFilteredRefactoredAssets(filter,clientId,),
			this.getFilteredTransactions(filter, clientId,),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
		],)
		const totalCurrencyValuesByCurrency = transactions.reduce<Record<string, number>>(
			(acc, transaction,) => {
				const curr = transaction.currency
				acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
				return acc
			},
			{},
		)
		const filteredTransactions = transactions.filter((transaction,) => {
			return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
		},)
		const cashBankData = filteredTransactions
			.map((transaction,) => {
				const { currency, bank, account, amount, } = transaction

				if (!bank || !account) {
					return null
				}

				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency:      currency as CurrencyDataList,
					currencyValue: Number(amount,),
					currencyList,
					historyDate:   filter.date,
				},)

				return {
					id:          bank.bankListId,
					bankName:    bank.bankList?.name ?? bank.bankName,
					accountName: account.accountName,
					accountId:   account.id,
					usdValue:    parseFloat(usdValue.toFixed(2,),),
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)
		const bondsBankData = bondAssets
			.map((asset,) => {
				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankName,
					accountName: asset.account.accountName,
					accountId:   asset.account.id,
					usdValue:    parseFloat(asset.marketValueUSD.toFixed(2,),),
				} as TBankAnalytics
			},)
		const depositsBankData = depositAssets
			.map((asset,) => {
				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue:    parseFloat(asset.usdValue.toFixed(2,),),
				} as TBankAnalytics
			},)

		const cryptoETFData = cryptoAssets
			.map((asset,) => {
				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankName,
					accountName: asset.account.accountName,
					accountId:   asset.account.id,
					usdValue:    asset.marketValueUSD,
				} as TBankAnalytics
			},)
		const equityBankData = equityAssets
			.map((asset,) => {
				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankName,
					accountName: asset.account.accountName,
					accountId:   asset.account.id,
					usdValue:    parseFloat(asset.marketValueUSD.toFixed(2,),),
				} as TBankAnalytics
			},)
		const loanBankData = loanAssets
			.map((asset,) => {
				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue:    parseFloat(asset.usdValue.toFixed(2,),),

				} as TBankAnalytics
			},)
		const metalETFData = metalAssets
			.map((asset,) => {
				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankName,
					accountName: asset.account.accountName,
					accountId:   asset.account.id,
					usdValue:    parseFloat(asset.marketValueUSD.toFixed(2,),),
				} as TBankAnalytics
			},)
		const optionsBankData = optionAssets
			.map((asset,) => {
				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue:    parseFloat(asset.marketValueUSD.toFixed(2,),),
				} as TBankAnalytics
			},)
		const otherBankData = otherAssets
			.map((asset,) => {
				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue:    parseFloat(asset.marketValueUSD.toFixed(2,),),
				} as TBankAnalytics
			},)
		const privateEquityBankData = peAssets
			.map((asset,) => {
				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue:    parseFloat(asset.marketValueUSD.toFixed(2,),),
				} as TBankAnalytics
			},)
		const realEstateBankData = reAssets
			.map((asset,) => {
				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankName,
					accountName: asset.account.accountName,
					accountId:   asset.account.id,
					usdValue:    parseFloat(asset.marketValueUSD.toFixed(2,),),
				} as TBankAnalytics
			},)
		const result = [
			...cashBankData,
			...bondsBankData,
			...depositsBankData,
			...cryptoETFData,
			...equityBankData,
			...loanBankData,
			...metalETFData,
			...optionsBankData,
			...otherBankData,
			...privateEquityBankData,
			...realEstateBankData,
		].reduce<Array<TBankAnalytics>>((acc, asset,) => {
			const {
				bankName,
				id,
				usdValue,
				accountName,
				accountId,
			} = asset
			const existing = acc.find((item,) => {
				return item.accountId === accountId
			},)
			if (existing) {
				existing.usdValue = parseFloat((existing.usdValue + usdValue).toFixed(2,),)
			} else {
				acc.push({
					id,
					bankName,
					usdValue:    parseFloat(usdValue.toFixed(2,),),
					accountName: accountName ?
						this.cryptoService.decryptString(accountName,) :
						undefined,
					accountId,
				},)
			}
			return acc
		}, [],)
			.filter((item,) => {
				return Math.abs(item.usdValue,) >= 1
			},)
		return result
	}

	// public async getBankAnalytics(filter: OverviewFilterDto, clientId?: string,): Promise<Array<TBankAnalytics>> {
	// 	const log = this.getTimestampLogger()
	// 	log('getBankAnalytics','Start',)
	// 	const [assets, transactions, currencyList, cryptoList, bonds, equities, etfs, metalList,] = await Promise.all([
	// 		this.parseAndFilterAssets(filter, clientId,),
	// 		this.getFilteredTransactions(filter, clientId,),
	// 		this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 		this.prismaService.cryptoData.findMany(),
	// 		this.cBondsCurrencyService.getAllBondsWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllEquitiesWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllEtfsWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllMetalsWithHistory(filter.date,),
	// 	],)
	// 	log('getBankAnalytics','After DB query',)

	// 	const totalCurrencyValuesByCurrency = transactions.reduce<Record<string, number>>(
	// 		(acc, transaction,) => {
	// 			const curr = transaction.currency
	// 			acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
	// 			return acc
	// 		},
	// 		{},
	// 	)
	// 	const filteredTransactions = transactions.filter((transaction,) => {
	// 		return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
	// 	},)
	// 	const cashAssets = assets.filter((asset,): asset is ICashAsset => {
	// 		return asset.assetName === AssetNamesType.CASH
	// 	},)
	// 	const cashBankData = cashAssets
	// 		.map((asset,) => {
	// 			if (!asset.bank || !asset.account) {
	// 				return null
	// 			}
	// 			const { currency, bank, account,} = asset
	// 			const transactionSumByCurrency = filteredTransactions.reduce((acc, transaction,) => {
	// 				if (transaction.currency === currency && transaction.bankId === bank.id && transaction.accountId === account.id) {
	// 					return acc + Number(transaction.amount,)
	// 				}
	// 				return acc
	// 			}, 0,)
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue: transactionSumByCurrency,
	// 				currencyList,
	// 				historyDate:   filter.date,
	// 			},)
	// 			return {
	// 				id:          bank.bankListId,
	// 				bankName:    bank.bankList?.name ?? bank.bankName,
	// 				accountName: account.accountName,
	// 				accountId:   account.id,
	// 				usdValue,

	// 			} as TBankAnalytics
	// 		},)
	// 		.filter((item,): item is TBankAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const bondsAssets = assets.filter((asset,): asset is IBondsAsset => {
	// 		return asset.assetName === AssetNamesType.BONDS
	// 	},)
	// 	const aggregatedBondsAssets = bondsAssets.reduce<Record<
	// 		string,
	// 		{ totalUnits: number; assets: Array<IBondsAsset> }>>((acc, asset,) => {
	// 			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency,} = asset

	// 			if (!entityId || !bankId || !accountId || !isin) {
	// 				return acc
	// 			}
	// 			const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
	// 			if (!acc[key]) {
	// 				acc[key] = { totalUnits: 0, assets: [], }
	// 			}
	// 			if (operation === AssetOperationType.BUY) {
	// 				acc[key].totalUnits = acc[key].totalUnits + units
	// 			} else if (operation === AssetOperationType.SELL) {
	// 				acc[key].totalUnits = acc[key].totalUnits - units
	// 			}
	// 			acc[key].assets.push(asset,)
	// 			return acc
	// 		}, {},)
	// 	const filteredBondsAssets = Object.values(aggregatedBondsAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const bondsBankData = filteredBondsAssets
	// 		.map((asset,) => {
	// 			if (!asset.bank) {
	// 				return null
	// 			}
	// 			const { isin, units, operation, valueDate, currency,} = asset
	// 			const bond = bonds.find((bond,) => {
	// 				return bond.isin === isin
	// 			},)
	// 			if (!bond) {
	// 				return null
	// 			}
	// 			if (bond.maturityDate && (new Date(bond.maturityDate,) < new Date())) {
	// 				return null
	// 			}
	// 			if (valueDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(valueDate,)) {
	// 				return null
	// 			}
	// 			const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 				return item.currency === currency
	// 			},)

	// 			const rate = currencyData ?
	// 				filter.date ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					currencyData.rate :
	// 				asset.rate ?? 1
	// 			const dirtyPriceCurrency = filter.date && bond.bondHistory[0] ?
	// 				bond.bondHistory[0].dirtyPriceCurrency ?
	// 					bond.bondHistory[0].dirtyPriceCurrency :
	// 					null :
	// 				bond.dirtyPriceCurrency ?
	// 					bond.dirtyPriceCurrency :
	// 					null

	// 			const nominalPrice = filter.date && bond.bondHistory[0] ?
	// 				bond.bondHistory[0].nominalPrice ?
	// 					bond.bondHistory[0].nominalPrice :
	// 					null :
	// 				bond.nominalPrice ?
	// 					bond.nominalPrice :
	// 					null

	// 			const marketPrice = filter.date && bond.bondHistory[0] ?
	// 				bond.bondHistory[0].marketPrice :
	// 				bond.marketPrice
	// 			const usdValue = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
	// 				isin,
	// 				units:              Number(units,),
	// 				dirtyPriceCurrency,
	// 				nominalPrice,
	// 				rate,
	// 				marketPrice,
	// 			},)
	// 			return {
	// 				id:          asset.bank.bankListId,
	// 				bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
	// 				accountName: asset.account?.accountName,
	// 				accountId:   asset.account?.id,
	// 				usdValue:    operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 			} as TBankAnalytics
	// 		},)
	// 		.filter((item,): item is TBankAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const depositsAssets = assets.filter((asset,): asset is IDepositAsset => {
	// 		return asset.assetName === AssetNamesType.CASH_DEPOSIT
	// 	},)
	// 	const depositsBankData = depositsAssets
	// 		.map((asset,) => {
	// 			if (!asset.bank) {
	// 				return null
	// 			}
	// 			const { currencyValue, startDate, currency, maturityDate,} = asset
	// 			if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
	// 				return null
	// 			}
	// 			// if (maturityDate && new Date(maturityDate,) < new Date()) {
	// 			// 	return null
	// 			// }
	// 			if (!filter.date && maturityDate && new Date(maturityDate,) < new Date()) {
	// 				return null
	// 			}
	// 			if (filter.date && maturityDate && new Date(filter.date,) >= new Date(maturityDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)
	// 			return {
	// 				id:          asset.bank.bankListId,
	// 				bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
	// 				accountName: asset.account?.accountName,
	// 				accountId:   asset.account?.id,
	// 				usdValue,
	// 			} as TBankAnalytics
	// 		},)
	// 		.filter((item,): item is TBankAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const collateralAssets = assets.filter((asset,): asset is ICollateralAsset => {
	// 		return asset.assetName === AssetNamesType.COLLATERAL
	// 	},)
	// 	const collateralBankData = collateralAssets
	// 		.map((asset,) => {
	// 			if (!asset.bank) {
	// 				return null
	// 			}
	// 			const { currencyValue, currency, } = asset
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)
	// 			return {
	// 				id:          asset.bank.bankListId,
	// 				bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
	// 				accountName: asset.account?.accountName,
	// 				accountId:   asset.account?.id,
	// 				usdValue,
	// 			} as TBankAnalytics
	// 		},)
	// 		.filter((item,): item is TBankAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const cryptoAssets = assets.filter((asset,): asset is ICryptoAsset => {
	// 		return asset.assetName === AssetNamesType.CRYPTO
	// 	},)
	// 	const cryptoETFAssets = cryptoAssets.filter(
	// 		(item,): item is NonNullable<typeof item> => {
	// 			return item.productType === CryptoType.ETF
	// 		},
	// 	)
	// 	const cryptoDirectAssets = cryptoAssets.filter(
	// 		(item,): item is NonNullable<typeof item> => {
	// 			return item.productType === CryptoType.DIRECT_HOLD
	// 		},
	// 	)
	// 	const aggregatedCryptoETFAssets = cryptoETFAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<ICryptoAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

	// 		if (!entityId || !bankId || !accountId || !isin || !units) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredCryptoEtfAssets = Object.values(aggregatedCryptoETFAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const cryptoETFData = filteredCryptoEtfAssets
	// 		.map((asset,) => {
	// 			const { isin, units, operation, currency, transactionDate, } = asset
	// 			if (!asset.bank || !currency || !isin || !units) {
	// 				return null
	// 			}
	// 			if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 				return null
	// 			}
	// 			const equityAsset = equities.find((equity,) => {
	// 				return equity.isin === isin
	// 			},) ?? etfs.find((etf,) => {
	// 				return etf.isin === isin
	// 			},) ?? null
	// 			if (!equityAsset) {
	// 				return null
	// 			}
	// 			const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 				return item.currency === currency
	// 			},)

	// 			const rate = currencyData ?
	// 				filter.date ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					currencyData.rate :
	// 				asset.rate ?? 1
	// 			const price = 'lastPrice' in equityAsset ?
	// 				filter.date && equityAsset.equityHistory[0] ?
	// 					Number(equityAsset.equityHistory[0].lastPrice,) :
	// 					Number(equityAsset.lastPrice,) :
	// 				filter.date && equityAsset.etfHistory[0] ?
	// 					Number(equityAsset.etfHistory[0].close,) :
	// 					Number(equityAsset.close,)
	// 			const usdValue = equityAsset.currencyName === 'GBX' ?
	// 				parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
	// 				parseFloat((units * price * rate).toFixed(2,),)

	// 			return {
	// 				id:          asset.bank.bankListId,
	// 				bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
	// 				accountName: asset.account?.accountName,
	// 				accountId:   asset.account?.id,
	// 				usdValue:    operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 			} as TBankAnalytics
	// 		},)
	// 		.filter((item,): item is TBankAnalytics => {
	// 			return item !== null
	// 		},)
	// 	const cryptoDirectData = cryptoDirectAssets
	// 		.map((asset,) => {
	// 			if (!asset.bank) {
	// 				return null
	// 			}
	// 			const { cryptoCurrencyType, cryptoAmount, purchaseDate, productType,}  = asset
	// 			if (productType === CryptoType.DIRECT_HOLD) {
	// 				if (purchaseDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(purchaseDate,)) {
	// 					return null
	// 				}
	// 				const usdValue = cryptoCurrencyType && cryptoAmount ?
	// 					this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
	// 						token: cryptoCurrencyType,
	// 						cryptoAmount,
	// 					}, cryptoList,) :
	// 					0

	// 				return {
	// 					id:          asset.bank.bankListId,
	// 					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
	// 					accountName: asset.account?.accountName,
	// 					accountId:   asset.account?.id,
	// 					usdValue,
	// 				} as TBankAnalytics
	// 			}
	// 			return null
	// 		},)
	// 		.filter((item,): item is TBankAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const equityAssets = assets.filter((asset,): asset is IEquityAsset => {
	// 		return asset.assetName === AssetNamesType.EQUITY_ASSET
	// 	},)
	// 	const aggregatedEquityAssets = equityAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<IEquityAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

	// 		if (!entityId || !bankId || !accountId || !isin) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredEquityAssets = Object.values(aggregatedEquityAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const equityBankData = filteredEquityAssets
	// 		.map((asset,) => {
	// 			if (!asset.bank) {
	// 				return null
	// 			}
	// 			const { isin, units, operation, currency, transactionDate, } = asset
	// 			const equityAsset = equities.find((equity,) => {
	// 				return equity.isin === isin
	// 			},) ?? etfs.find((etf,) => {
	// 				return etf.isin === isin
	// 			},) ?? null
	// 			if (!equityAsset) {
	// 				return null
	// 			}
	// 			if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 				return null
	// 			}
	// 			const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 				return item.currency === currency
	// 			},)

	// 			const rate = currencyData ?
	// 				filter.date ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					currencyData.rate :
	// 				asset.rate ?? 1
	// 			const price = 'lastPrice' in equityAsset ?
	// 				filter.date && equityAsset.equityHistory[0] ?
	// 					Number(equityAsset.equityHistory[0].lastPrice,) :
	// 					Number(equityAsset.lastPrice,) :
	// 				filter.date && equityAsset.etfHistory[0] ?
	// 					Number(equityAsset.etfHistory[0].close,) :
	// 					Number(equityAsset.close,)
	// 			const usdValue = equityAsset.currencyName === 'GBX' ?
	// 				parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
	// 				parseFloat((units * price * rate).toFixed(2,),)

	// 			return {
	// 				id:          asset.bank.bankListId,
	// 				bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
	// 				accountName: asset.account?.accountName,
	// 				accountId:   asset.account?.id,
	// 				usdValue:    operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 			} as TBankAnalytics
	// 		},)
	// 		.filter((item,): item is TBankAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const loanAssets = assets.filter((asset,): asset is ILoanAsset => {
	// 		return asset.assetName === AssetNamesType.LOAN
	// 	},)
	// 	const loanBankData = loanAssets
	// 		.map((asset,) => {
	// 			if (!asset.bank) {
	// 				return null
	// 			}
	// 			const { currencyValue, maturityDate, startDate, currency, } = asset
	// 			if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
	// 				return null
	// 			}
	// 			const maturity = new Date(maturityDate,)
	// 			if (maturity < new Date()) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				id:          asset.bank.bankListId,
	// 				bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
	// 				accountName: asset.account?.accountName,
	// 				accountId:   asset.account?.id,
	// 				usdValue,
	// 			} as TBankAnalytics
	// 		},)
	// 		.filter((item,): item is TBankAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const metalAssets = assets.filter((asset,): asset is IMetalsAsset => {
	// 		return asset.assetName === AssetNamesType.METALS
	// 	},)
	// 	const metalETFAssets = metalAssets.filter(
	// 		(item,): item is NonNullable<typeof item> => {
	// 			return item.productType === MetalType.ETF
	// 		},
	// 	)
	// 	const metalDirectAssets = metalAssets.filter(
	// 		(item,): item is NonNullable<typeof item> => {
	// 			return item.productType === MetalType.DIRECT_HOLD
	// 		},
	// 	)
	// 	const aggregatedMetalETFAssets = metalETFAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

	// 		if (!entityId || !bankId || !accountId || !isin || !units) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredMetalEtfAssets = Object.values(aggregatedMetalETFAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const metalETFData = filteredMetalEtfAssets
	// 		.map((asset,) => {
	// 			const { isin, units, operation, currency, transactionDate, } = asset
	// 			if (!asset.bank || !currency || !isin || !units) {
	// 				return null
	// 			}
	// 			if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 				return null
	// 			}
	// 			const equityAsset = equities.find((equity,) => {
	// 				return equity.isin === isin
	// 			},) ?? etfs.find((etf,) => {
	// 				return etf.isin === isin
	// 			},) ?? null
	// 			if (!equityAsset) {
	// 				return null
	// 			}
	// 			const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 				return item.currency === currency
	// 			},)

	// 			const rate = currencyData ?
	// 				filter.date ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					currencyData.rate :
	// 				asset.rate ?? 1
	// 			const price = 'lastPrice' in equityAsset ?
	// 				filter.date && equityAsset.equityHistory[0] ?
	// 					Number(equityAsset.equityHistory[0].lastPrice,) :
	// 					Number(equityAsset.lastPrice,) :
	// 				filter.date && equityAsset.etfHistory[0] ?
	// 					Number(equityAsset.etfHistory[0].close,) :
	// 					Number(equityAsset.close,)
	// 			const usdValue = equityAsset.currencyName === 'GBX' ?
	// 				parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
	// 				parseFloat((units * price * rate).toFixed(2,),)

	// 			return {
	// 				id:          asset.bank.bankListId,
	// 				bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
	// 				accountName: asset.account?.accountName,
	// 				accountId:   asset.account?.id,
	// 				usdValue:    operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 			} as TBankAnalytics
	// 		},)
	// 		.filter((item,): item is TBankAnalytics => {
	// 			return item !== null
	// 		},)
	// 	const aggregatedMetalAssets = metalDirectAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, units, operation, portfolioId, metalType, } = asset

	// 		if (!entityId || !bankId || !accountId || !metalType) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${metalType}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredMetalAssets = Object.values(aggregatedMetalAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const metalsBankData = filteredMetalAssets
	// 		.map((asset,) => {
	// 			if (!asset.bank) {
	// 				return null
	// 			}
	// 			const { units, operation, transactionDate, metalType, } = asset
	// 			if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = metalType  ?
	// 				this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
	// 					metalList,
	// 					metalType,
	// 					units,
	// 					historyDate: filter.date,
	// 				},) :
	// 				0
	// 			return {
	// 				id:          asset.bank.bankListId,
	// 				bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
	// 				accountName: asset.account?.accountName,
	// 				accountId:   asset.account?.id,
	// 				usdValue:    operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 			} as TBankAnalytics
	// 		},)
	// 		.filter((item,): item is TBankAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const optionsAssets = assets.filter((asset,): asset is IOptionAsset => {
	// 		return asset.assetName === AssetNamesType.OPTIONS
	// 	},)
	// 	const optionsBankData = optionsAssets
	// 		.map((asset,) => {
	// 			if (!asset.bank) {
	// 				return null
	// 			}
	// 			const { maturityDate, startDate, currency, currentMarketValue, } = asset
	// 			if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
	// 				return null
	// 			}
	// 			const maturity = new Date(maturityDate,)
	// 			if (maturity < new Date()) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue: currentMarketValue,
	// 				currencyList,
	// 				historyDate:   filter.date,
	// 			},)

	// 			return {
	// 				id:          asset.bank.bankListId,
	// 				bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
	// 				accountName: asset.account?.accountName,
	// 				accountId:   asset.account?.id,
	// 				usdValue,
	// 			} as TBankAnalytics
	// 		},)
	// 		.filter((item,): item is TBankAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const otherAssets = assets.filter((asset,): asset is IOtherAsset => {
	// 		return asset.assetName === AssetNamesType.OTHER
	// 	},)
	// 	const otherBankData = otherAssets
	// 		.map((asset,) => {
	// 			if (!asset.bank) {
	// 				return null
	// 			}
	// 			const { currencyValue, investmentDate, currency, } = asset
	// 			if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				id:          asset.bank.bankListId,
	// 				bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
	// 				accountName: asset.account?.accountName,
	// 				accountId:   asset.account?.id,
	// 				usdValue,
	// 			} as TBankAnalytics
	// 		},)
	// 		.filter((item,): item is TBankAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const privateEquityAssets = assets.filter((asset,): asset is IPrivateAsset => {
	// 		return asset.assetName === AssetNamesType.PRIVATE_EQUITY
	// 	},)
	// 	const privateEquityBankData = privateEquityAssets
	// 		.map((asset,) => {
	// 			if (!asset.bank) {
	// 				return null
	// 			}
	// 			const { currencyValue, entryDate, currency, } = asset
	// 			if (entryDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(entryDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				id:          asset.bank.bankListId,
	// 				bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
	// 				accountName: asset.account?.accountName,
	// 				accountId:   asset.account?.id,
	// 				usdValue,
	// 			} as TBankAnalytics
	// 		},)
	// 		.filter((item,): item is TBankAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const realEstateAssets = assets.filter((asset,): asset is IRealEstateAsset => {
	// 		return asset.assetName === AssetNamesType.REAL_ESTATE
	// 	},)
	// 	const realEstateBankData = realEstateAssets
	// 		.map((asset,) => {
	// 			if (!asset.bank) {
	// 				return null
	// 			}
	// 			const { currencyValue, investmentDate, currency, } = asset
	// 			if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				id:          asset.bank.bankListId,
	// 				bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
	// 				accountName: asset.account?.accountName,
	// 				accountId:   asset.account?.id,
	// 				usdValue,
	// 			} as TBankAnalytics
	// 		},)
	// 		.filter((item,): item is TBankAnalytics => {
	// 			return item !== null
	// 		},)
	// 	const result = [
	// 		...cashBankData,
	// 		...bondsBankData,
	// 		...depositsBankData,
	// 		...collateralBankData,
	// 		...cryptoETFData,
	// 		...cryptoDirectData,
	// 		...equityBankData,
	// 		...loanBankData,
	// 		...metalsBankData,
	// 		...metalETFData,
	// 		...optionsBankData,
	// 		...otherBankData,
	// 		...privateEquityBankData,
	// 		...realEstateBankData,
	// 	].reduce<Array<TBankAnalytics>>((acc, asset,) => {
	// 		const {
	// 			bankName,
	// 			id,
	// 			usdValue,
	// 			accountName,
	// 			accountId,
	// 		} = asset
	// 		const existing = acc.find((item,) => {
	// 			return item.accountId === accountId
	// 		},)
	// 		if (existing) {
	// 			existing.usdValue = existing.usdValue + usdValue
	// 		} else {
	// 			acc.push({
	// 				id,
	// 				bankName,
	// 				usdValue,
	// 				accountName: accountName ?
	// 					this.cryptoService.decryptString(accountName,) :
	// 					undefined,
	// 				accountId,
	// 			},)
	// 		}
	// 		return acc
	// 	}, [],)
	// 	log('getBankAnalytics','After computing (map)',)
	// 	return result
	// }

	/**
 * 3.5.2
 * Retrieves asset analytics based on the provided filter criteria.
 * @remarks
 * - Uses `parseAndFilterAssets` to fetch and filter assets.
 * - Aggregates asset data by asset name and computes the USD value.
 * @param filter - The filter criteria for retrieving asset analytics.
 * @param clientId - The optional client ID to further filter the results.
 * @returns A Promise resolving to an array of asset analytics data.
 */
	// New Version
	public async getAssetAnalytics(filter: OverviewFilterDto, clientId?: string,): Promise<Array<TOverviewAssetAnalytics>> {
		if (filter.date) {
			const [{
				bondAssets,
				equityAssets,
				metalAssets,
				cryptoAssets,
				depositAssets,
				loanAssets,
				optionAssets,
				otherAssets,
				peAssets,
				reAssets,
			}, transactions, currencyList, bonds,equities, etfs, metalList,] = await Promise.all([
				this.getFilteredRefactoredAssetsWithHistoryDate(filter,clientId,),
				this.getFilteredTransactions(filter, clientId,),
				this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
				this.cBondsCurrencyService.getAllBondsWithHistory(filter.date,),
				this.cBondsCurrencyService.getAllEquitiesWithHistory(filter.date,),
				this.cBondsCurrencyService.getAllEtfsWithHistory(filter.date,),
				this.cBondsCurrencyService.getAllMetalsWithHistory(filter.date,),
			],)
			const totalCurrencyValuesByCurrency = transactions.reduce<Record<string, number>>(
				(acc, transaction,) => {
					const curr = transaction.currency
					acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
					return acc
				},
				{},
			)
			const filteredTransactions = transactions.filter((transaction,) => {
				return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
			},)
			const cashBankData = filteredTransactions
				.map((transaction,) => {
					const { currency, bank, account, amount, } = transaction

					if (!bank || !account) {
						return null
					}

					const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
						currency:      currency as CurrencyDataList,
						currencyValue: Number(amount,),
						currencyList,
						historyDate:   filter.date,
					},)

					return {
						assetName:     AssetNamesType.CASH,
						usdValue,
						currencyValue: Number(transaction.amount,),
					}
				},)
			const bondsBankData = bondAssets
				.map((group,) => {
					return {
						...group,
						bonds: group.bonds.map((b,) => {
							if (b.assetBondVersions.length > 0) {
								return b.assetBondVersions[0]
							}
							return b
						},),
					}
				},)
				.filter((group,) => {
					return Boolean(group.bonds.length > 0,)
				},)
				.flatMap((groupAsset,) => {
					return groupAsset.bonds.map((asset,) => {
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === asset.currency
						},)
						const bondData = bonds.find((item,) => {
							return item.isin === asset.isin
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const dirtyPriceCurrency = bondData?.bondHistory[0] ?
							bondData.bondHistory[0].dirtyPriceCurrency ?
								bondData.bondHistory[0].dirtyPriceCurrency :
								null :
							bondData?.dirtyPriceCurrency ?
								bondData.dirtyPriceCurrency :
								null

						const nominalPrice = bondData?.bondHistory[0] ?
							bondData.bondHistory[0].nominalPrice ?
								bondData.bondHistory[0].nominalPrice :
								null :
							bondData?.nominalPrice ?
								bondData.nominalPrice :
								null

						const marketPrice = bondData?.bondHistory[0] ?
							bondData.bondHistory[0].marketPrice :
							bondData?.marketPrice ?? asset.marketPrice
						const marketValueUsd = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
							isin:  asset.isin,
							units:              Number(asset.units,),
							dirtyPriceCurrency,
							nominalPrice,
							rate,
							marketPrice,
						},)
						const marketValueFC = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
							isin:  asset.isin,
							units:              Number(asset.units,),
							dirtyPriceCurrency,
							nominalPrice,
							rate:               1,
							marketPrice,
						},)
						return {
							assetName:          asset.assetName,
							usdValue:      asset.operation === AssetOperationType.BUY  ?
								marketValueUsd :
								-marketValueUsd,
							currencyValue: asset.operation === AssetOperationType.BUY  ?
								marketValueFC :
								-marketValueFC,
						}
					},)
				},)
			const depositsBankData = depositAssets
				.map((asset,) => {
					if (asset.assetDepositVersions.length > 0) {
						const [assetVersion,] = asset.assetDepositVersions
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const { currencyValue, assetName,} = assetVersion
						const usdValue = parseFloat((currencyValue * (rate)).toFixed(2,),)
						return {
							assetName,
							usdValue,
							currencyValue,
						}
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const { currencyValue,} = asset
					const usdValue = parseFloat((currencyValue * (rate)).toFixed(2,),)
					return {
						assetName:          asset.assetName,
						usdValue,
						currencyValue: asset.currencyValue,
					}
				},)
			const cryptoData = cryptoAssets
				.map((group,) => {
					return {
						...group,
						cryptos: group.cryptos.map((crypto,) => {
							if (crypto.assetCryptoVersions.length > 0) {
								return {
									...crypto.assetCryptoVersions[0],
									mainAssetId: crypto.id,
								}
							}
							return {
								...crypto,
								mainAssetId: undefined,
							}
						},),
					}
				},)
				.filter((group,) => {
					return group.cryptos?.length
				},)
				.flatMap((group,) => {
					return group.cryptos.map((asset,) => {
						if (asset.productType === CryptoType.ETF) {
							const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
								return item.currency === asset.currency
							},)
							const rate = currencyData ?
								filter.date ?
									currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
									currencyData.rate :
								1
							let cBondsData: Equity | Etf | undefined
							let lastPrice: number = 0

							if (asset.type === EquityType.Equity) {
								const equity = equities.find((e,) => {
									return e.isin === asset.isin
								},)
								if (equity) {
									lastPrice = equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
								}
								cBondsData = equity
							} else {
								const etf = etfs.find((e,) => {
									return e.isin === asset.isin
								},)
								if (etf) {
									lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
								}
								cBondsData = etf
							}
							const marketPrice = cBondsData?.currencyName ===  'GBX' ?
								lastPrice / 100 :
								lastPrice
							const currencyValue = parseFloat(((asset.units ?? 0) * Number(marketPrice,)).toFixed(2,),)
							const usdValue = parseFloat(((asset.units ?? 0) * Number(marketPrice,) * rate).toFixed(2,),)
							return {
								assetName:         asset.assetName,
								usdValue:      asset.operation === AssetOperationType.BUY ?
									usdValue :
									-usdValue,
								currencyValue: asset.operation === AssetOperationType.BUY ?
									currencyValue :
									-currencyValue,
							}
						}
						return {
							assetName:         asset.assetName,
							usdValue:      asset.marketValueUSD,
							currencyValue: asset.cryptoAmount,
						}
					},)
				},)

			const equityBankData = equityAssets
				.map((group,) => {
					return {
						...group,
						equities: group.equities.map((equity,) => {
							if (equity.assetEquityVersions.length > 0) {
								return equity.assetEquityVersions[0]
							}
							return equity
						},),
					}
				},)
				.filter((group,) => {
					return Boolean(group.equities.length > 0,)
				},)
				.flatMap((group,) => {
					return group.equities.map((asset,) => {
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === asset.currency
						},)
						const rate = currencyData ?
							filter.date ?
								currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
								currencyData.rate :
							1
						let cBondsData: Equity | Etf | undefined
						let lastPrice: number = 0

						if (asset.type === EquityType.Equity) {
							const equity = equities.find((e,) => {
								return e.isin === asset.isin
							},)
							if (equity) {
								lastPrice = equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
							}
							cBondsData = equity
						} else {
							const etf = etfs.find((e,) => {
								return e.isin === asset.isin
							},)
							if (etf) {
								lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
							}
							cBondsData = etf
						}
						const marketPrice = cBondsData?.currencyName ===  'GBX' ?
							lastPrice / 100 :
							lastPrice

						const currencyValue = parseFloat(((asset.units ?? 0) * Number(marketPrice,)).toFixed(2,),)
						const usdValue = parseFloat(((asset.units ?? 0) * Number(marketPrice,) * rate).toFixed(2,),)
						return {
							assetName:          asset.assetName,
							usdValue:      asset.operation === AssetOperationType.BUY ?
								usdValue :
								-usdValue,
							currencyValue: asset.operation === AssetOperationType.BUY ?
								currencyValue :
								-currencyValue,
						}
					},)
				},)
			const loanBankData = loanAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const { currencyValue, assetName, usdValue,} = assetVersion
						return {
							assetName,
							usdValue,
							currencyValue,
						}
					}
					const { currencyValue, assetName, usdValue,} = asset
					return {
						assetName,
						usdValue,
						currencyValue,
					}
				},)
			const metalsData = metalAssets
				.map((group,) => {
					return {
						...group,
						metals: group.metals.map((metal,) => {
							if (metal.assetMetalVersions.length > 0) {
								return metal.assetMetalVersions[0]
							}
							return metal
						},),
					}
				},)
				.filter((group,) => {
					return Boolean(group.metals.length > 0,)
				},)
				.flatMap((asset,) => {
					return asset.metals.map((metal,) => {
						if (metal.productType === MetalType.ETF) {
							const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find(
								(item,) => {
									return item.currency === metal.currency
								},
							)
							const rate = currencyData ?
								filter.date ?
									currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
									currencyData.rate :
								1
							let cBondsData: Equity | Etf | undefined
							let lastPrice = 0
							if (metal.type === EquityType.Equity) {
								const equity = equities.find((e,) => {
									return e.isin === metal.isin
								},)
								if (equity) {
									lastPrice = equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
								}
								cBondsData = equity
							} else {
								const etf = etfs.find((e,) => {
									return e.isin === metal.isin
								},)
								if (etf) {
									lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
								}
								cBondsData = etf
							}
							const marketPrice = cBondsData?.currencyName === 'GBX' ?
								lastPrice / 100 :
								lastPrice
							const currencyValue = parseFloat(((metal.units ?? 0) * Number(marketPrice,)).toFixed(2,),)
							const usdValue = parseFloat(((metal.units ?? 0) * Number(marketPrice,) * rate).toFixed(2,),)
							return {
								assetName: metal.assetName,
								usdValue:      metal.operation === AssetOperationType.BUY ?
									usdValue :
									-usdValue,
								currencyValue: metal.operation === AssetOperationType.BUY ?
									currencyValue :
									-currencyValue,
							}
						}
						const usdValue = metal.metalType ?
							this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
								metalList,
								metalType:   metal.metalType,
								units:       metal.units,
								historyDate: filter.date,
							},) :
							0
						return {
							assetName: metal.assetName,
							usdValue:      metal.operation === AssetOperationType.BUY ?
								usdValue :
								-usdValue,
							currencyValue: metal.operation === AssetOperationType.BUY ?
								metal.units :
								-metal.units,
						}
					},)
				},
				)
			const optionsBankData = optionAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((assetVersion.currentMarketValue * (rate)).toFixed(2,),)
						return {
							assetName:          assetVersion.assetName,
							usdValue,
							currencyValue: assetVersion.currentMarketValue,
						}
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const usdValue = parseFloat((asset.currentMarketValue * (rate)).toFixed(2,),)
					return {
						assetName:          asset.assetName,
						usdValue,
						currencyValue: asset.currentMarketValue,
					}
				},)
			const otherBankData = otherAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((assetVersion.currencyValue * (rate)).toFixed(2,),)
						return {
							assetName:          assetVersion.assetName,
							usdValue,
							currencyValue: assetVersion.currencyValue,
						}
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const usdValue = parseFloat((asset.currencyValue * rate).toFixed(2,),)
					return {
						assetName:          asset.assetName,
						usdValue,
						currencyValue: asset.currencyValue,
					}
				},)
			const privateEquityBankData = peAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((assetVersion.currencyValue * (rate)).toFixed(2,),)
						return {
							assetName:          assetVersion.assetName,
							usdValue,
							currencyValue: assetVersion.currencyValue,
						}
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const usdValue = parseFloat((asset.currencyValue * rate).toFixed(2,),)
					return {
						assetName:          asset.assetName,
						usdValue,
						currencyValue: asset.currencyValue,
					}
				},)
			const realEstateBankData = reAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((assetVersion.currencyValue * (rate)).toFixed(2,),)
						return {
							assetName:          assetVersion.assetName,
							usdValue,
							currencyValue: assetVersion.currencyValue,
						}
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const usdValue = parseFloat((asset.currencyValue * (rate)).toFixed(2,),)
					return {
						assetName:          asset.assetName,
						usdValue,
						currencyValue: asset.currencyValue,
					}
				},)
			const result = ([
				...cashBankData,
				...bondsBankData,
				...depositsBankData,
				...cryptoData,
				...equityBankData,
				...loanBankData,
				...metalsData,
				...optionsBankData,
				...otherBankData,
				...privateEquityBankData,
				...realEstateBankData,
			] as Array<TOverviewAssetAnalytics>).reduce<Array<TOverviewAssetAnalytics>>((acc, asset,) => {
				if (!asset) {
					return acc
				}
				const {
					assetName,
					usdValue,
					currencyValue,
				} = asset
				const existing = acc.find((item,) => {
					return item.assetName === assetName
				},)
				if (existing) {
					existing.usdValue = existing.usdValue + usdValue
					existing.currencyValue = existing.currencyValue + currencyValue
				} else {
					acc.push({
						assetName: assetName as AssetNamesType,
						usdValue,
						currencyValue,
					},)
				}
				return acc
			}, [],)
			return result
		}

		const [{
			bondAssets,
			equityAssets,
			metalAssets,
			cryptoAssets,
			depositAssets,
			loanAssets,
			optionAssets,
			otherAssets,
			peAssets,
			reAssets,
		}, transactions, currencyList,] = await Promise.all([
			this.getFilteredRefactoredAssets(filter,clientId,),
			this.getFilteredTransactions(filter, clientId,),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
		],)
		const totalCurrencyValuesByCurrency = transactions.reduce<Record<string, number>>(
			(acc, transaction,) => {
				const curr = transaction.currency
				acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
				return acc
			},
			{},
		)
		const filteredTransactions = transactions.filter((transaction,) => {
			return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
		},)
		const cashBankData = filteredTransactions
			.map((transaction,) => {
				const { currency, bank, account, amount, } = transaction

				if (!bank || !account) {
					return null
				}

				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency:      currency as CurrencyDataList,
					currencyValue: Number(amount,),
					currencyList,
					historyDate:   filter.date,
				},)

				return {
					assetName:     AssetNamesType.CASH,
					usdValue,
					currencyValue: Number(transaction.amount,),
				}
			},)

		const bondsBankData = bondAssets
			.map((asset,) => {
				return {
					assetName:          asset.assetName,
					usdValue:      asset.marketValueUSD,
					currencyValue: asset.marketValueFC,
				}
			},)
		const depositsBankData = depositAssets
			.map((asset,) => {
				return {
					assetName:          asset.assetName,
					usdValue:      asset.usdValue,
					currencyValue: asset.currencyValue,
				}
			},)
		const cryptoData = cryptoAssets
			.map((asset,) => {
				return {
					assetName:         asset.assetName,
					usdValue:      asset.marketValueUSD,
					currencyValue: asset.productType === CryptoType.DIRECT_HOLD ?
						asset.cryptoAmount :
						asset.marketValueFC,
				}
			},)

		const equityBankData = equityAssets
			.map((asset,) => {
				return {
					assetName:          asset.assetName,
					usdValue:      asset.marketValueUSD,
					currencyValue: asset.marketValueFC,
				}
			},)
		const loanBankData = loanAssets
			.map((asset,) => {
				return {
					assetName:          asset.assetName,
					usdValue:      asset.usdValue,
					currencyValue: asset.currencyValue,
				}
			},)
		const metalsData = metalAssets
			.map((asset,) => {
				return {
					assetName:          asset.assetName,
					usdValue:      asset.marketValueUSD,
					currencyValue: asset.productType === MetalType.DIRECT_HOLD ?
						asset.totalUnits :
						asset.marketValueFC,
				}
			},)
		const optionsBankData = optionAssets
			.map((asset,) => {
				return {
					assetName:          asset.assetName,
					usdValue:      asset.marketValueUSD,
					currencyValue: asset.currentMarketValue,
				}
			},)
		const otherBankData = otherAssets
			.map((asset,) => {
				return {
					assetName:          asset.assetName,
					usdValue:      asset.marketValueUSD,
					currencyValue: asset.currencyValue,
				}
			},)
		const privateEquityBankData = peAssets
			.map((asset,) => {
				return {
					assetName:          asset.assetName,
					usdValue:      asset.marketValueUSD,
					currencyValue: asset.currencyValue,
				}
			},)
		const realEstateBankData = reAssets
			.map((asset,) => {
				return {
					assetName:          asset.assetName,
					usdValue:      asset.marketValueUSD,
					currencyValue: asset.currencyValue,
				}
			},)
		const result = ([
			...cashBankData,
			...bondsBankData,
			...depositsBankData,
			...cryptoData,
			...equityBankData,
			...loanBankData,
			...metalsData,
			...optionsBankData,
			...otherBankData,
			...privateEquityBankData,
			...realEstateBankData,
		] as Array<TOverviewAssetAnalytics>).reduce<Array<TOverviewAssetAnalytics>>((acc, asset,) => {
			if (!asset) {
				return acc
			}
			const {
				assetName,
				usdValue,
				currencyValue,
			} = asset
			const existing = acc.find((item,) => {
				return item.assetName === assetName
			},)
			if (existing) {
				existing.usdValue = existing.usdValue + usdValue
				existing.currencyValue = existing.currencyValue + currencyValue
			} else {
				acc.push({
					assetName: assetName as AssetNamesType,
					usdValue,
					currencyValue,
				},)
			}
			return acc
		}, [],)
		return result
	}

	// public async getAssetAnalytics(filter: OverviewFilterDto, clientId?: string,): Promise<Array<TOverviewAssetAnalytics>> {
	// 	const log = this.getTimestampLogger()
	// 	log('getAssetAnalytics','Start',)
	// 	const [assets, transactions, currencyList, cryptoList, bonds, equities, etfs, metalList,] = await Promise.all([
	// 		this.parseAndFilterAssets(filter, clientId,),
	// 		this.getFilteredTransactions(filter, clientId,),
	// 		this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 		this.prismaService.cryptoData.findMany(),
	// 		this.cBondsCurrencyService.getAllBondsWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllEquitiesWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllEtfsWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllMetalsWithHistory(filter.date,),
	// 	],)
	// 	log('getAssetAnalytics','After DB query',)
	// 	const cashAssets = assets.filter((asset,): asset is ICashAsset => {
	// 		return asset.assetName === AssetNamesType.CASH
	// 	},)
	// 	const totalCurrencyValuesByCurrency = transactions.reduce<Record<string, number>>(
	// 		(acc, transaction,) => {
	// 			const curr = transaction.currency
	// 			acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
	// 			return acc
	// 		},
	// 		{},
	// 	)
	// 	const filteredTransactions = transactions.filter((transaction,) => {
	// 		return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
	// 	},)
	// 	const cashBankData = cashAssets
	// 		.map((asset,) => {
	// 			const { currency, assetName, accountId, } = asset

	// 			const transactionValues = transactions.reduce<{currencyValue: number, usdValue: number}>((acc, transaction,) => {
	// 				if (transaction.currency === currency && accountId === transaction.accountId) {
	// 					acc.currencyValue = Number(acc.currencyValue,) + Number(transaction.amount,)
	// 					acc.usdValue = Number(acc.usdValue,) + (Number(transaction.amount,) * (transaction.rate ?? 1))
	// 				}
	// 				return acc
	// 			}, {
	// 				currencyValue: 0,
	// 				usdValue:      0,
	// 			},)
	// 			const transactionSumByCurrency = transactions.reduce((acc, transaction,) => {
	// 				if (transaction.currency === currency && accountId === transaction.accountId) {
	// 					return acc + Number(transaction.amount,)
	// 				}
	// 				return acc
	// 			}, 0,)
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue: transactionSumByCurrency,
	// 				currencyList,
	// 				historyDate:   filter.date,
	// 			},)
	// 			return {
	// 				assetName,
	// 				usdValue,
	// 				currencyValue: transactionValues.currencyValue,
	// 			}
	// 		},)

	// 	const bondsAssets = assets.filter((asset,): asset is IBondsAsset => {
	// 		return asset.assetName === AssetNamesType.BONDS
	// 	},)
	// 	const aggregatedBondsAssets = bondsAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<IBondsAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

	// 		if (!entityId || !bankId || !accountId || !isin) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredBondsAssets = Object.values(aggregatedBondsAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const bondsBankData = filteredBondsAssets
	// 		.map((asset,) => {
	// 			const { isin, units, assetName, operation, valueDate, currency, } = asset
	// 			const bond = bonds.find((bond,) => {
	// 				return bond.isin === isin
	// 			},)
	// 			if (valueDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(valueDate,)) {
	// 				return null
	// 			}
	// 			if (!bond || !asset.rate) {
	// 				return null
	// 			}
	// 			if (bond.maturityDate && (new Date(bond.maturityDate,) < new Date())) {
	// 				return null
	// 			}
	// 			const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 				return item.currency === currency
	// 			},)
	// 			const rate = currencyData ?
	// 				filter.date ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					currencyData.rate :
	// 				asset.rate ?? 1
	// 			const dirtyPriceCurrency = filter.date && bond.bondHistory[0] ?
	// 				bond.bondHistory[0].dirtyPriceCurrency ?
	// 					bond.bondHistory[0].dirtyPriceCurrency :
	// 					null :
	// 				bond.dirtyPriceCurrency ?
	// 					bond.dirtyPriceCurrency :
	// 					null

	// 			const nominalPrice = filter.date && bond.bondHistory[0] ?
	// 				bond.bondHistory[0].nominalPrice ?
	// 					bond.bondHistory[0].nominalPrice :
	// 					null :
	// 				bond.nominalPrice ?
	// 					bond.nominalPrice :
	// 					null

	// 			const marketPrice = filter.date && bond.bondHistory[0] ?
	// 				bond.bondHistory[0].marketPrice :
	// 				bond.marketPrice
	// 			const usdValue = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
	// 				isin,
	// 				units:              Number(units,),
	// 				dirtyPriceCurrency,
	// 				nominalPrice,
	// 				rate,
	// 				marketPrice,
	// 			},)
	// 			const fcValue = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
	// 				isin,
	// 				units:              Number(units,),
	// 				dirtyPriceCurrency,
	// 				nominalPrice,
	// 				rate:               1,
	// 				marketPrice,
	// 			},)
	// 			return {
	// 				assetName,
	// 				usdValue: operation === AssetOperationType.BUY ?
	// 					Math.abs(usdValue,) :
	// 					-Math.abs(usdValue,),
	// 				currencyValue: operation === AssetOperationType.BUY ?
	// 					Math.abs(fcValue,) :
	// 					-Math.abs(fcValue,),
	// 			}
	// 		},)
	// 		.filter((item,) => {
	// 			return item !== null
	// 		},)
	// 	const depositsAssets = assets.filter((asset,): asset is IDepositAsset => {
	// 		return asset.assetName === AssetNamesType.CASH_DEPOSIT
	// 	},)
	// 	const depositsBankData = depositsAssets
	// 		.map((asset,) => {
	// 			const { currencyValue, assetName, maturityDate, startDate, currency, } = asset
	// 			if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
	// 				return null
	// 			}
	// 			// if (maturityDate && new Date(maturityDate,) < new Date()) {
	// 			// 	return null
	// 			// }
	// 			if (!filter.date && maturityDate && new Date(maturityDate,) < new Date()) {
	// 				return null
	// 			}
	// 			if (filter.date && maturityDate && new Date(filter.date,) >= new Date(maturityDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)
	// 			return {
	// 				assetName,
	// 				usdValue,
	// 				currencyValue,
	// 			}
	// 		},)
	// 		.filter((asset,) => {
	// 			return asset !== null
	// 		},)

	// 	const collateralAssets = assets.filter((asset,): asset is ICollateralAsset => {
	// 		return asset.assetName === AssetNamesType.COLLATERAL
	// 	},)
	// 	const collateralBankData = collateralAssets
	// 		.map((asset,) => {
	// 			const { currencyValue, assetName, currency, } = asset
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				assetName,
	// 				usdValue,
	// 				currencyValue,
	// 			}
	// 		},)

	// 	const cryptoAssets = assets.filter((asset,): asset is ICryptoAsset => {
	// 		return asset.assetName === AssetNamesType.CRYPTO
	// 	},)
	// 	const cryptoETFAssets = cryptoAssets.filter(
	// 		(item,): item is NonNullable<typeof item> => {
	// 			return item.productType === CryptoType.ETF
	// 		},
	// 	)
	// 	const cryptoDirectAssets = cryptoAssets.filter(
	// 		(item,): item is NonNullable<typeof item> => {
	// 			return item.productType === CryptoType.DIRECT_HOLD
	// 		},
	// 	)
	// 	const aggregatedCryptoETFAssets = cryptoETFAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<ICryptoAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

	// 		if (!entityId || !bankId || !accountId || !isin || !units) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredCryptoEtfAssets = Object.values(aggregatedCryptoETFAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const cryptoETFData = filteredCryptoEtfAssets
	// 		.map((asset,) => {
	// 			const { isin, units, operation, currency, transactionDate, assetName, } = asset
	// 			if (!asset.bank || !currency || !isin || !units) {
	// 				return null
	// 			}
	// 			if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 				return null
	// 			}
	// 			const equityAsset = equities.find((equity,) => {
	// 				return equity.isin === isin
	// 			},) ?? etfs.find((etf,) => {
	// 				return etf.isin === isin
	// 			},) ?? null
	// 			if (!equityAsset) {
	// 				return null
	// 			}
	// 			const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 				return item.currency === currency
	// 			},)

	// 			const rate = currencyData ?
	// 				filter.date ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					currencyData.rate :
	// 				asset.rate ?? 1
	// 			const price = 'lastPrice' in equityAsset ?
	// 				filter.date && equityAsset.equityHistory[0] ?
	// 					Number(equityAsset.equityHistory[0].lastPrice,) :
	// 					Number(equityAsset.lastPrice,) :
	// 				filter.date && equityAsset.etfHistory[0] ?
	// 					Number(equityAsset.etfHistory[0].close,) :
	// 					Number(equityAsset.close,)
	// 			const usdValue = equityAsset.currencyName === 'GBX' ?
	// 				parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
	// 				parseFloat((units * price * rate).toFixed(2,),)
	// 			const fcValue = equityAsset.currencyName === 'GBX' ?
	// 				parseFloat((units * price / 100).toFixed(2,) ,) :
	// 				parseFloat((units * price).toFixed(2,),)
	// 			return {
	// 				assetName,
	// 				currencyValue: operation === AssetOperationType.BUY ?
	// 					fcValue :
	// 					-fcValue,
	// 				usdValue:    operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 			}
	// 		},)
	// 		.filter((item,) => {
	// 			return item !== null
	// 		},)
	// 	const cryptoDirectData = cryptoDirectAssets
	// 		.map((asset,) => {
	// 			const { cryptoCurrencyType, cryptoAmount, assetName, purchaseDate,} = asset
	// 			if (purchaseDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(purchaseDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = cryptoCurrencyType && cryptoAmount ?
	// 				this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
	// 					token: cryptoCurrencyType,
	// 					cryptoAmount,
	// 				}, cryptoList,) :
	// 				0

	// 			return {
	// 				assetName,
	// 				usdValue,
	// 				currencyValue: asset.cryptoAmount,
	// 			}
	// 		},)
	// 	const equityAssets = assets.filter((asset,): asset is IEquityAsset => {
	// 		return asset.assetName === AssetNamesType.EQUITY_ASSET
	// 	},)
	// 	const aggregatedEquityAssets = equityAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<IEquityAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

	// 		if (!entityId || !bankId || !accountId || !isin) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredEquityAssets = Object.values(aggregatedEquityAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const equityBankData = filteredEquityAssets
	// 		.map((asset,) => {
	// 			const { isin, units, assetName, operation, currency, transactionDate, } = asset
	// 			if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 				return null
	// 			}
	// 			const equityAsset = equities.find((equity,) => {
	// 				return equity.isin === isin
	// 			},) ?? etfs.find((etf,) => {
	// 				return etf.isin === isin
	// 			},) ?? null
	// 			if (!equityAsset) {
	// 				return null
	// 			}
	// 			const currencyId = this.cBondsCurrencyService.getCurrencyId(currency, currencyList,)
	// 			const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 				return item.currency === currency
	// 			},)
	// 			const rate = currencyData ?
	// 				filter.date ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					currencyData.rate :
	// 				asset.rate ?? 1

	// 			const price = 'lastPrice' in equityAsset ?
	// 				filter.date && equityAsset.equityHistory[0] ?
	// 					Number(equityAsset.equityHistory[0].lastPrice,) :
	// 					Number(equityAsset.lastPrice,) :
	// 				filter.date && equityAsset.etfHistory[0] ?
	// 					Number(equityAsset.etfHistory[0].close,) :
	// 					Number(equityAsset.close,)
	// 			const usdValue = equityAsset.currencyName === 'GBX' ?
	// 				parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
	// 				parseFloat((units * price * rate).toFixed(2,),)

	// 			const fcValue = equityAsset.currencyName === 'GBX' ?
	// 				parseFloat((units * price / 100).toFixed(2,) ,) :
	// 				parseFloat((units * price).toFixed(2,),)

	// 			return {
	// 				assetName,
	// 				usdValue: operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 				currencyValue: operation === AssetOperationType.BUY ?
	// 					fcValue :
	// 					-fcValue,
	// 			}
	// 		},)
	// 		.filter((item,) => {
	// 			return item !== null
	// 		},)
	// 	const loanAssets = assets.filter((asset,): asset is ILoanAsset => {
	// 		return asset.assetName === AssetNamesType.LOAN
	// 	},)
	// 	const loanBankData = loanAssets
	// 		.map((asset,) => {
	// 			const { currencyValue, assetName, maturityDate, startDate, currency, } = asset
	// 			if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
	// 				return null
	// 			}
	// 			const maturity = new Date(maturityDate,)
	// 			if (maturity < new Date()) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				assetName,
	// 				usdValue,
	// 				currencyValue,
	// 			}
	// 		},)
	// 		.filter((asset,) => {
	// 			return asset !== null
	// 		},)

	// 	const metalAssets = assets.filter((asset,): asset is IMetalsAsset => {
	// 		return asset.assetName === AssetNamesType.METALS
	// 	},)
	// 	const metalETFAssets = metalAssets.filter(
	// 		(item,): item is NonNullable<typeof item> => {
	// 			return item.productType === MetalType.ETF
	// 		},
	// 	)
	// 	const metalDirectAssets = metalAssets.filter(
	// 		(item,): item is NonNullable<typeof item> => {
	// 			return item.productType === MetalType.DIRECT_HOLD
	// 		},
	// 	)
	// 	const aggregatedMetalAssets = metalDirectAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, units, operation, portfolioId, metalType, } = asset

	// 		if (!entityId || !bankId || !accountId || !metalType) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${metalType}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredMetalAssets = Object.values(aggregatedMetalAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const aggregatedMetalETFAssets = metalETFAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

	// 		if (!entityId || !bankId || !accountId || !isin || !units) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredMetalEtfAssets = Object.values(aggregatedMetalETFAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const metalETFData = filteredMetalEtfAssets
	// 		.map((asset,) => {
	// 			const { isin, units, operation, currency, transactionDate, assetName, } = asset
	// 			if (!asset.bank || !currency || !isin || !units) {
	// 				return null
	// 			}
	// 			if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 				return null
	// 			}
	// 			const equityAsset = equities.find((equity,) => {
	// 				return equity.isin === isin
	// 			},) ?? etfs.find((etf,) => {
	// 				return etf.isin === isin
	// 			},) ?? null
	// 			if (!equityAsset) {
	// 				return null
	// 			}
	// 			const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 				return item.currency === currency
	// 			},)

	// 			const rate = currencyData ?
	// 				filter.date ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					currencyData.rate :
	// 				asset.rate ?? 1
	// 			const price = 'lastPrice' in equityAsset ?
	// 				filter.date && equityAsset.equityHistory[0] ?
	// 					Number(equityAsset.equityHistory[0].lastPrice,) :
	// 					Number(equityAsset.lastPrice,) :
	// 				filter.date && equityAsset.etfHistory[0] ?
	// 					Number(equityAsset.etfHistory[0].close,) :
	// 					Number(equityAsset.close,)
	// 			const usdValue = equityAsset.currencyName === 'GBX' ?
	// 				parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
	// 				parseFloat((units * price * rate).toFixed(2,),)
	// 			const fcValue = equityAsset.currencyName === 'GBX' ?
	// 				parseFloat((units * price / 100).toFixed(2,) ,) :
	// 				parseFloat((units * price).toFixed(2,),)
	// 			return {
	// 				assetName,
	// 				currencyValue: operation === AssetOperationType.BUY ?
	// 					fcValue :
	// 					-fcValue,
	// 				usdValue:    operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 			}
	// 		},)
	// 		.filter((item,) => {
	// 			return item !== null
	// 		},)
	// 	const metalsBankData = filteredMetalAssets
	// 		.map((asset,) => {
	// 			const { units, assetName, operation, transactionDate, metalType, } = asset
	// 			if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 				return null
	// 			}
	// 			if (!metalType) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
	// 				metalList,
	// 				metalType,
	// 				units,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				assetName,
	// 				usdValue: operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 				currencyValue: operation === AssetOperationType.BUY ?
	// 					units :
	// 					-units,
	// 			}
	// 		},)
	// 		.filter((item,) => {
	// 			return item !== null
	// 		},)

	// 	const optionsAssets = assets.filter((asset,): asset is IOptionAsset => {
	// 		return asset.assetName === AssetNamesType.OPTIONS
	// 	},)
	// 	const optionsBankData = optionsAssets
	// 		.map((asset,) => {
	// 			const { currentMarketValue, assetName, maturityDate, startDate, currency, } = asset
	// 			if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
	// 				return null
	// 			}
	// 			const maturity = new Date(maturityDate,)
	// 			if (maturity < new Date()) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue: currentMarketValue,
	// 				currencyList,
	// 				historyDate:   filter.date,
	// 			},)

	// 			return {
	// 				assetName,
	// 				usdValue,
	// 				currencyValue: currentMarketValue,
	// 			}
	// 		},)
	// 		.filter((asset,) => {
	// 			return asset !== null
	// 		},)

	// 	const otherAssets = assets.filter((asset,): asset is IOtherAsset => {
	// 		return asset.assetName === AssetNamesType.OTHER
	// 	},)
	// 	const otherBankData = otherAssets
	// 		.map((asset,) => {
	// 			const { currencyValue, assetName, investmentDate, currency, } = asset
	// 			if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				assetName,
	// 				usdValue,
	// 				currencyValue,
	// 			}
	// 		},)

	// 	const privateEquityAssets = assets.filter((asset,): asset is IPrivateAsset => {
	// 		return asset.assetName === AssetNamesType.PRIVATE_EQUITY
	// 	},)
	// 	const privateEquityBankData = privateEquityAssets
	// 		.map((asset,) => {
	// 			const { currencyValue, assetName, entryDate, currency, } = asset
	// 			if (entryDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(entryDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				assetName,
	// 				usdValue,
	// 				currencyValue,
	// 			}
	// 		},)

	// 	const realEstateAssets = assets.filter((asset,): asset is IRealEstateAsset => {
	// 		return asset.assetName === AssetNamesType.REAL_ESTATE
	// 	},)
	// 	const realEstateBankData = realEstateAssets
	// 		.map((asset,) => {
	// 			const { currencyValue, assetName, investmentDate, currency, } = asset
	// 			if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				assetName,
	// 				usdValue,
	// 				currencyValue,
	// 			}
	// 		},)
	// 	const result = ([
	// 		...cashBankData,
	// 		...bondsBankData,
	// 		...depositsBankData,
	// 		...collateralBankData,
	// 		...cryptoDirectData,
	// 		...cryptoETFData,
	// 		...equityBankData,
	// 		...loanBankData,
	// 		...metalsBankData,
	// 		...metalETFData,
	// 		...optionsBankData,
	// 		...otherBankData,
	// 		...privateEquityBankData,
	// 		...realEstateBankData,
	// 	] as Array<TOverviewAssetAnalytics>).reduce<Array<TOverviewAssetAnalytics>>((acc, asset,) => {
	// 		if (!asset) {
	// 			return acc
	// 		}
	// 		const {
	// 			assetName,
	// 			usdValue,
	// 			currencyValue,
	// 		} = asset
	// 		const existing = acc.find((item,) => {
	// 			return item.assetName === assetName
	// 		},)
	// 		if (existing) {
	// 			existing.usdValue = existing.usdValue + usdValue
	// 			existing.currencyValue = existing.currencyValue + currencyValue
	// 		} else {
	// 			acc.push({
	// 				assetName: assetName as AssetNamesType,
	// 				usdValue,
	// 				currencyValue,
	// 			},)
	// 		}
	// 		return acc
	// 	}, [],)
	// 	log('getAssetAnalytics','After computing (map)',)
	// 	return result
	// }

	/**
 * 3.5.2
 * Retrieves entity analytics based on the provided filter criteria.
 * @remarks
 * - Uses `parseAndFilterAssets` to fetch and filter assets.
 * - Aggregates asset data by entity and computes the USD value.
 * @param filter - The filter criteria for retrieving entity analytics.
 * @param clientId - The optional client ID to further filter the results.
 * @returns A Promise resolving to an array of entity analytics data.
 */
	// New Version
	public async getEntityAnalytics(filter: OverviewFilterDto, clientId?: string,): Promise<Array<TEntityAnalytics>> {
		if (filter.date) {
			const [{
				bondAssets,
				equityAssets,
				metalAssets,
				cryptoAssets,
				depositAssets,
				loanAssets,
				optionAssets,
				otherAssets,
				peAssets,
				reAssets,
			}, transactions, currencyList, bonds, equities, etfs, metalList,] = await Promise.all([
				this.getFilteredRefactoredAssetsWithHistoryDate(filter,clientId,),
				this.getFilteredTransactions(filter, clientId,),
				this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
				this.cBondsCurrencyService.getAllBondsWithHistory(filter.date,),
				this.cBondsCurrencyService.getAllEquitiesWithHistory(filter.date,),
				this.cBondsCurrencyService.getAllEtfsWithHistory(filter.date,),
				this.cBondsCurrencyService.getAllMetalsWithHistory(filter.date,),
			],)
			const totalCurrencyValuesByCurrency = transactions.reduce<Record<string, number>>(
				(acc, transaction,) => {
					const curr = transaction.currency
					acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
					return acc
				},
				{},
			)
			const filteredTransactions = transactions.filter((transaction,) => {
				return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
			},)
			const cashBankData = filteredTransactions
				.map((transaction,) => {
					const { currency, amount, entity,} = transaction
					if (!entity) {
						return null
					}
					const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
						currency:      currency as CurrencyDataList,
						currencyValue: Number(amount,),
						currencyList,
						historyDate:   filter.date,
					},)
					return {
						id:            entity.id,
						entityName:    entity.name,
						portfolioName: transaction.portfolio?.name,
						usdValue,
					} as TEntityAnalytics
				},)
				.filter((item,): item is TEntityAnalytics => {
					return item !== null
				},)
			const bondsBankData = bondAssets
				.map((group,) => {
					return {
						...group,
						bonds: group.bonds.map((b,) => {
							if (b.assetBondVersions.length > 0) {
								return b.assetBondVersions[0]
							}
							return b
						},),
					}
				},)
				.filter((group,) => {
					return Boolean(group.bonds.length > 0,)
				},)
				.flatMap((groupAsset,) => {
					return groupAsset.bonds.map((asset,) => {
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === asset.currency
						},)
						const bondData = bonds.find((item,) => {
							return item.isin === asset.isin
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const dirtyPriceCurrency = bondData && bondData.bondHistory[0] ?
							bondData.bondHistory[0].dirtyPriceCurrency ?
								bondData.bondHistory[0].dirtyPriceCurrency :
								null :
							bondData?.dirtyPriceCurrency ?
								bondData.dirtyPriceCurrency :
								null

						const nominalPrice = bondData && bondData.bondHistory[0] ?
							bondData.bondHistory[0].nominalPrice ?
								bondData.bondHistory[0].nominalPrice :
								null :
							bondData?.nominalPrice ?
								bondData.nominalPrice :
								null

						const marketPrice = bondData && bondData.bondHistory[0] ?
							bondData.bondHistory[0].marketPrice :
							bondData?.marketPrice ?? asset.marketPrice

						const marketValueUsd = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
							isin:  asset.isin,
							units:              Number(asset.units,),
							dirtyPriceCurrency,
							nominalPrice,
							rate,
							marketPrice,
						},)
						return {
							id:             groupAsset.entity.id,
							entityName:     groupAsset.entity.name,
							portfolioName: groupAsset.portfolio.name,
							usdValue:      asset.operation === AssetOperationType.BUY ?
								marketValueUsd :
								-marketValueUsd,
						}
					},)
				},)
			const depositsBankData = depositAssets
				.map((asset,) => {
					if (asset.assetDepositVersions.length > 0) {
						const [assetVersion,] = asset.assetDepositVersions
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const { currencyValue,} = assetVersion
						const usdValue = parseFloat((currencyValue * (rate)).toFixed(2,),)
						return {
							id:             asset.entity.id,
							entityName:     asset.entity.name,
							portfolioName: asset.portfolio.name,
							usdValue,
						}
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const { currencyValue,} = asset
					const usdValue = parseFloat((currencyValue * (rate)).toFixed(2,),)
					return {
						id:             asset.entity.id,
						entityName:     asset.entity.name,
						portfolioName: asset.portfolio.name,
						usdValue,
					}
				},)

			const cryptoData = cryptoAssets
				.map((group,) => {
					return {
						...group,
						cryptos: group.cryptos.map((crypto,) => {
							if (crypto.assetCryptoVersions.length > 0) {
								return {
									...crypto.assetCryptoVersions[0],
									mainAssetId: crypto.id,
								}
							}
							return {
								...crypto,
								mainAssetId: undefined,
							}
						},),
					}
				},)
				.filter((group,) => {
					return Boolean(group.cryptos.length > 0,)
				},)
				.flatMap((group,) => {
					return group.cryptos.map((asset,) => {
						if (asset.productType === CryptoType.ETF) {
							const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
								return item.currency === asset.currency
							},)
							const rate = currencyData ?
								filter.date ?
									currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
									currencyData.rate :
								1
							let cBondsData: Equity | Etf | undefined
							let lastPrice: number = 0

							if (asset.type === EquityType.Equity) {
								const equity = equities.find((e,) => {
									return e.isin === asset.isin
								},)
								if (equity) {
									lastPrice = equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
								}
								cBondsData = equity
							} else {
								const etf = etfs.find((e,) => {
									return e.isin === asset.isin
								},)
								if (etf) {
									lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
								}
								cBondsData = etf
							}
							const marketPrice = cBondsData?.currencyName ===  'GBX' ?
								lastPrice / 100 :
								lastPrice
							const marketValueUsd = parseFloat(((asset.units ?? 0) * Number(marketPrice,) * rate).toFixed(2,),)
							return {id:             group.entity.id,
								entityName:     group.entity.name,
								portfolioName: group.portfolio.name,
								usdValue:      asset.operation === AssetOperationType.BUY  ?
									marketValueUsd :
									-marketValueUsd,
							}
						}
						return {
							id:             group.entity.id,
							entityName:     group.entity.name,
							portfolioName: group.portfolio.name,
							usdValue:      asset.marketValueUSD,
						}
					},)
				},)
			const equityBankData = equityAssets
				.map((group,) => {
					return {
						...group,
						equities: group.equities.map((equity,) => {
							if (equity.assetEquityVersions.length > 0) {
								return equity.assetEquityVersions[0]
							}
							return equity
						},),
					}
				},)
				.filter((group,) => {
					return Boolean(group.equities.length > 0,)
				},)
				.flatMap((group,) => {
					return group.equities.map((asset,) => {
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === asset.currency
						},)
						const rate = currencyData ?
							filter.date ?
								currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
								currencyData.rate :
							1
						let cBondsData: Equity | Etf | undefined
						let lastPrice: number = 0

						if (asset.type === EquityType.Equity) {
							const equity = equities.find((e,) => {
								return e.isin === asset.isin
							},)
							if (equity) {
								lastPrice = equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
							}
							cBondsData = equity
						} else {
							const etf = etfs.find((e,) => {
								return e.isin === asset.isin
							},)
							if (etf) {
								lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
							}
							cBondsData = etf
						}
						const marketPrice = cBondsData?.currencyName ===  'GBX' ?
							lastPrice / 100 :
							lastPrice
						const marketValueUsd = parseFloat(((asset.units ?? 0) * Number(marketPrice,) * rate).toFixed(2,),)
						return {
							id:             group.entity.id,
							entityName:     group.entity.name,
							portfolioName: group.portfolio.name,
							usdValue:      asset.operation === AssetOperationType.BUY ?
								marketValueUsd :
								-marketValueUsd,
						}
					},)
				},)
			const loanBankData = loanAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const { currencyValue, usdValue,} = assetVersion
						return {
							id:             asset.entity.id,
							entityName:     asset.entity.name,
							portfolioName: asset.portfolio.name,
							usdValue,
						}
					}
					const { usdValue,} = asset
					return {
						id:             asset.entity.id,
						entityName:     asset.entity.name,
						portfolioName: asset.portfolio.name,
						usdValue,
					}
				},)
			const metalData = metalAssets
				.map((group,) => {
					return {
						...group,
						metals: group.metals.map((metal,) => {
							if (metal.assetMetalVersions.length > 0) {
								return metal.assetMetalVersions[0]
							}
							return metal
						},),
					}
				},)
				.filter((group,) => {
					return Boolean(group.metals.length > 0,)
				},)
				.flatMap((group,) => {
					return group.metals.map((asset,) => {
						if (asset.productType === MetalType.ETF) {
							const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
								return item.currency === asset.currency
							},)
							const rate = currencyData ?
								filter.date ?
									currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
									currencyData.rate :
								1
							let cBondsData: Equity | Etf | undefined
							let lastPrice: number = 0

							if (asset.type === EquityType.Equity) {
								const equity = equities.find((e,) => {
									return e.isin === asset.isin
								},)
								if (equity) {
									lastPrice = equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
								}
								cBondsData = equity
							} else {
								const etf = etfs.find((e,) => {
									return e.isin === asset.isin
								},)
								if (etf) {
									lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
								}
								cBondsData = etf
							}
							const marketPrice = cBondsData?.currencyName ===  'GBX' ?
								lastPrice / 100 :
								lastPrice
							const marketValueUsd = parseFloat(((asset.units ?? 0) * Number(marketPrice,) * rate).toFixed(2,),)
							return {
								id:             group.entity.id,
								entityName:     group.entity.name,
								portfolioName: group.portfolio.name,
								usdValue:      asset.operation === AssetOperationType.BUY  ?
									marketValueUsd :
									-marketValueUsd,
							}
						}
						const marketValueUsd = asset.metalType ?
							this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
								metalList,
								metalType:   asset.metalType,
								units:       asset.units,
								historyDate: filter.date,
							},) :
							0
						return {
							id:             group.entity.id,
							entityName:     group.entity.name,
							portfolioName: group.portfolio.name,
							usdValue:      asset.operation === AssetOperationType.BUY  ?
								marketValueUsd :
								-marketValueUsd,
						}
					},)
				},)
			const optionsBankData = optionAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((assetVersion.currentMarketValue * (rate)).toFixed(2,),)
						return {
							id:             asset.entity.id,
							entityName:     asset.entity.name,
							portfolioName: asset.portfolio.name,
							usdValue,
						}
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const usdValue = parseFloat((asset.currentMarketValue * (rate)).toFixed(2,),)
					return {
						id:             asset.entity.id,
						entityName:     asset.entity.name,
						portfolioName: asset.portfolio.name,
						usdValue,
					}
				},)
			const otherBankData = otherAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((assetVersion.currencyValue * (rate)).toFixed(2,),)
						return {
							id:             asset.entity.id,
							entityName:     asset.entity.name,
							portfolioName: asset.portfolio.name,
							usdValue,
						}
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const usdValue = parseFloat((asset.currencyValue * rate).toFixed(2,),)
					return {
						id:             asset.entity.id,
						entityName:     asset.entity.name,
						portfolioName: asset.portfolio.name,
						usdValue,
					}
				},)
			const privateEquityBankData = peAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((assetVersion.currencyValue * (rate)).toFixed(2,),)
						return {
							id:             asset.entity.id,
							entityName:     asset.entity.name,
							portfolioName: asset.portfolio.name,
							usdValue,
						}
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const usdValue = parseFloat((asset.currencyValue * rate).toFixed(2,),)
					return {
						id:             asset.entity.id,
						entityName:     asset.entity.name,
						portfolioName: asset.portfolio.name,
						usdValue,
					}
				},)
			const realEstateBankData = reAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((assetVersion.currencyValue * (rate)).toFixed(2,),)
						return {
							id:             asset.entity.id,
							entityName:     asset.entity.name,
							portfolioName: asset.portfolio.name,
							usdValue,
						}
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const usdValue = parseFloat((asset.currencyValue * (rate)).toFixed(2,),)
					return {
						id:             asset.entity.id,
						entityName:     asset.entity.name,
						portfolioName: asset.portfolio.name,
						usdValue,
					}
				},)
			const result = [
				...cashBankData,
				...bondsBankData,
				...depositsBankData,
				...cryptoData,
				...equityBankData,
				...loanBankData,
				...metalData,
				...optionsBankData,
				...otherBankData,
				...privateEquityBankData,
				...realEstateBankData,
			].reduce<Array<TEntityAnalytics>>((acc, asset,) => {
				const {
					id,
					usdValue,
					entityName,
					portfolioName,
				} = asset
				const existing = acc.find((item,) => {
					return item.id === id
				},)
				if (existing) {
					existing.usdValue = existing.usdValue + usdValue
				} else {
					acc.push({
						id,
						entityName:    this.cryptoService.decryptString(entityName,),
						usdValue,
						portfolioName: portfolioName && this.cryptoService.decryptString(portfolioName,),
					},)
				}
				return acc
			}, [],)
			return result
		}

		const [{
			bondAssets,
			equityAssets,
			metalAssets,
			cryptoAssets,
			depositAssets,
			loanAssets,
			optionAssets,
			otherAssets,
			peAssets,
			reAssets,
		}, transactions, currencyList,] = await Promise.all([
			this.getFilteredRefactoredAssets(filter,clientId,),
			this.getFilteredTransactions(filter, clientId,),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
		],)
		const totalCurrencyValuesByCurrency = transactions.reduce<Record<string, number>>(
			(acc, transaction,) => {
				const curr = transaction.currency
				acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
				return acc
			},
			{},
		)
		const filteredTransactions = transactions.filter((transaction,) => {
			return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
		},)
		const cashBankData = filteredTransactions
			.map((transaction,) => {
				const { currency, amount, entity,} = transaction
				if (!entity) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency:      currency as CurrencyDataList,
					currencyValue: Number(amount,),
					currencyList,
					historyDate:   filter.date,
				},)
				return {
					id:            entity.id,
					entityName:    entity.name,
					portfolioName: transaction.portfolio?.name,
					usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)
		const bondsBankData = bondAssets
			.map((asset,) => {
				return {
					id:             asset.entity.id,
					entityName:     asset.entity.name,
					portfolioName: asset.portfolio.name,
					usdValue:       asset.marketValueUSD,
				}
			},)
		const depositsBankData = depositAssets
			.map((asset,) => {
				return {
					id:             asset.entity.id,
					entityName:     asset.entity.name,
					portfolioName: asset.portfolio.name,
					usdValue:       asset.usdValue,
				}
			},)
		const cryptoData = cryptoAssets
			.map((asset,) => {
				return {
					id:             asset.entity.id,
					entityName:     asset.entity.name,
					portfolioName: asset.portfolio.name,
					usdValue:       asset.marketValueUSD,
				}
			},)
		const equityBankData = equityAssets
			.map((asset,) => {
				return {
					id:             asset.entity.id,
					entityName:     asset.entity.name,
					portfolioName: asset.portfolio.name,
					usdValue:       asset.marketValueUSD,
				}
			},)
		const loanBankData = loanAssets
			.map((asset,) => {
				return {
					id:             asset.entity.id,
					entityName:     asset.entity.name,
					portfolioName: asset.portfolio.name,
					usdValue:       asset.usdValue,
				}
			},)
		const metalData = metalAssets
			.map((asset,) => {
				return {
					id:             asset.entity.id,
					entityName:     asset.entity.name,
					portfolioName: asset.portfolio.name,
					usdValue:       asset.marketValueUSD,
				}
			},)
		const optionsBankData = optionAssets
			.map((asset,) => {
				return {
					id:             asset.entity.id,
					entityName:     asset.entity.name,
					portfolioName: asset.portfolio.name,
					usdValue:       asset.marketValueUSD,
				}
			},)
		const otherBankData = otherAssets
			.map((asset,) => {
				return {
					id:             asset.entity.id,
					entityName:     asset.entity.name,
					portfolioName: asset.portfolio.name,
					usdValue:       asset.marketValueUSD,
				}
			},)
		const privateEquityBankData = peAssets
			.map((asset,) => {
				return {
					id:             asset.entity.id,
					entityName:     asset.entity.name,
					portfolioName: asset.portfolio.name,
					usdValue:       asset.marketValueUSD,
				}
			},)
		const realEstateBankData = reAssets
			.map((asset,) => {
				return {
					id:             asset.entity.id,
					entityName:     asset.entity.name,
					portfolioName: asset.portfolio.name,
					usdValue:       asset.marketValueUSD,
				}
			},)
		const result = [
			...cashBankData,
			...bondsBankData,
			...depositsBankData,
			...cryptoData,
			...equityBankData,
			...loanBankData,
			...metalData,
			...optionsBankData,
			...otherBankData,
			...privateEquityBankData,
			...realEstateBankData,
		].reduce<Array<TEntityAnalytics>>((acc, asset,) => {
			const {
				id,
				usdValue,
				entityName,
				portfolioName,
			} = asset
			const existing = acc.find((item,) => {
				return item.id === id
			},)
			if (existing) {
				existing.usdValue = existing.usdValue + usdValue
			} else {
				acc.push({
					id,
					entityName:    this.cryptoService.decryptString(entityName,),
					usdValue,
					portfolioName: portfolioName && this.cryptoService.decryptString(portfolioName,),
				},)
			}
			return acc
		}, [],)
		return result
	}

	// public async getEntityAnalytics(filter: OverviewFilterDto, clientId?: string,): Promise<Array<TEntityAnalytics>> {
	// 	const [assets, transactions, currencyList, cryptoList, bonds, equities, etfs, metalList,] = await Promise.all([
	// 		this.parseAndFilterAssets(filter, clientId,),
	// 		this.getFilteredTransactions(filter, clientId,),
	// 		this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 		this.prismaService.cryptoData.findMany(),
	// 		this.cBondsCurrencyService.getAllBondsWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllEquitiesWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllEtfsWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllMetalsWithHistory(filter.date,),
	// 	],)
	// 	const cashAssets = assets.filter((asset,): asset is ICashAsset => {
	// 		return asset.assetName === AssetNamesType.CASH
	// 	},)
	// 	const totalCurrencyValuesByCurrency = transactions.reduce<Record<string, number>>(
	// 		(acc, transaction,) => {
	// 			const curr = transaction.currency
	// 			acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
	// 			return acc
	// 		},
	// 		{},
	// 	)
	// 	const filteredTransactions = transactions.filter((transaction,) => {
	// 		return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
	// 	},)
	// 	const cashBankData = cashAssets
	// 		.map((asset,) => {
	// 			if (!asset.entity || !asset.account) {
	// 				return null
	// 			}
	// 			const { currency, account, } = asset
	// 			const transactionSumByCurrency = filteredTransactions.reduce((acc, transaction,) => {
	// 				if (transaction.currency === currency && transaction.accountId === account.id) {
	// 					return acc + Number(transaction.amount,)
	// 				}
	// 				return acc
	// 			}, 0,)
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue: transactionSumByCurrency,
	// 				currencyList,
	// 				historyDate:   filter.date,
	// 			},)
	// 			return {
	// 				id:            asset.entity.id,
	// 				entityName:    asset.entity.name,
	// 				portfolioName: asset.portfolio?.name,
	// 				usdValue,
	// 			} as TEntityAnalytics
	// 		},)
	// 		.filter((item,): item is TEntityAnalytics => {
	// 			return item !== null
	// 		},)
	// 	const bondsAssets = assets.filter((asset,): asset is IBondsAsset => {
	// 		return asset.assetName === AssetNamesType.BONDS
	// 	},)
	// 	const aggregatedBondsAssets = bondsAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<IBondsAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

	// 		if (!entityId || !bankId || !accountId || !isin) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredBondsAssets = Object.values(aggregatedBondsAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const bondsBankData = filteredBondsAssets
	// 		.map((asset,) => {
	// 			if (!asset.entity) {
	// 				return null
	// 			}
	// 			const { isin, units, operation, valueDate, currency, } = asset
	// 			const bond = bonds.find((bond,) => {
	// 				return bond.isin === isin
	// 			},)
	// 			if (valueDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(valueDate,)) {
	// 				return null
	// 			}
	// 			if (!bond) {
	// 				return null
	// 			}
	// 			if (bond.maturityDate && (new Date(bond.maturityDate,) < new Date())) {
	// 				return null
	// 			}
	// 			const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 				return item.currency === currency
	// 			},)

	// 			const rate = currencyData ?
	// 				filter.date ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					currencyData.rate :
	// 				asset.rate ?? 1

	// 			const dirtyPriceCurrency = filter.date && bond.bondHistory[0] ?
	// 				bond.bondHistory[0].dirtyPriceCurrency ?
	// 					bond.bondHistory[0].dirtyPriceCurrency :
	// 					null :
	// 				bond.dirtyPriceCurrency ?
	// 					bond.dirtyPriceCurrency :
	// 					null

	// 			const nominalPrice = filter.date && bond.bondHistory[0] ?
	// 				bond.bondHistory[0].nominalPrice ?
	// 					bond.bondHistory[0].nominalPrice :
	// 					null :
	// 				bond.nominalPrice ?
	// 					bond.nominalPrice :
	// 					null

	// 			const marketPrice = filter.date && bond.bondHistory[0] ?
	// 				bond.bondHistory[0].marketPrice :
	// 				bond.marketPrice
	// 			const usdValue = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
	// 				isin,
	// 				units:              Number(units,),
	// 				dirtyPriceCurrency,
	// 				nominalPrice,
	// 				rate,
	// 				marketPrice,
	// 			},)

	// 			return {
	// 				id:            asset.entity.id,
	// 				entityName:    asset.entity.name,
	// 				portfolioName: asset.portfolio?.name,
	// 				usdValue:      operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 			} as TEntityAnalytics
	// 		},)
	// 		.filter((item,): item is TEntityAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const depositsAssets = assets.filter((asset,): asset is IDepositAsset => {
	// 		return asset.assetName === AssetNamesType.CASH_DEPOSIT
	// 	},)
	// 	const depositsBankData = depositsAssets
	// 		.map((asset,) => {
	// 			if (!asset.entity) {
	// 				return null
	// 			}

	// 			const { currencyValue, maturityDate, startDate, currency, } = asset
	// 			if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
	// 				return null
	// 			}
	// 			if (!filter.date && maturityDate && new Date(maturityDate,) < new Date()) {
	// 				return null
	// 			}
	// 			if (filter.date && maturityDate && new Date(filter.date,) >= new Date(maturityDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				id:            asset.entity.id,
	// 				entityName:    asset.entity.name,
	// 				portfolioName: asset.portfolio?.name,
	// 				usdValue,
	// 			} as TEntityAnalytics
	// 		},)
	// 		.filter((item,): item is TEntityAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const collateralAssets = assets.filter((asset,): asset is ICollateralAsset => {
	// 		return asset.assetName === AssetNamesType.COLLATERAL
	// 	},)
	// 	const collateralBankData = collateralAssets
	// 		.map((asset,) => {
	// 			if (!asset.entity) {
	// 				return null
	// 			}
	// 			const { currencyValue, currency, } = asset
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				id:            asset.entity.id,
	// 				entityName:    asset.entity.name,
	// 				portfolioName: asset.portfolio?.name,
	// 				usdValue,
	// 			} as TEntityAnalytics
	// 		},)
	// 		.filter((item,): item is TEntityAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const cryptoAssets = assets.filter((asset,): asset is ICryptoAsset => {
	// 		return asset.assetName === AssetNamesType.CRYPTO
	// 	},)
	// 	const cryptoETFAssets = cryptoAssets.filter(
	// 		(item,): item is NonNullable<typeof item> => {
	// 			return item.productType === CryptoType.ETF
	// 		},
	// 	)
	// 	const cryptoDirectAssets = cryptoAssets.filter(
	// 		(item,): item is NonNullable<typeof item> => {
	// 			return item.productType === CryptoType.DIRECT_HOLD
	// 		},
	// 	)
	// 	const aggregatedCryptoETFAssets = cryptoETFAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<ICryptoAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

	// 		if (!entityId || !bankId || !accountId || !isin || !units) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredCryptoEtfAssets = Object.values(aggregatedCryptoETFAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const cryptoETFData = filteredCryptoEtfAssets
	// 		.map((asset,) => {
	// 			const { isin, units, operation, currency, transactionDate, } = asset
	// 			if (!asset.entity || !currency || !isin || !units) {
	// 				return null
	// 			}
	// 			if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 				return null
	// 			}
	// 			const equityAsset = equities.find((equity,) => {
	// 				return equity.isin === isin
	// 			},) ?? etfs.find((etf,) => {
	// 				return etf.isin === isin
	// 			},) ?? null
	// 			if (!equityAsset) {
	// 				return null
	// 			}
	// 			const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 				return item.currency === currency
	// 			},)

	// 			const rate = currencyData ?
	// 				filter.date ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					currencyData.rate :
	// 				asset.rate ?? 1
	// 			const price = 'lastPrice' in equityAsset ?
	// 				filter.date && equityAsset.equityHistory[0] ?
	// 					Number(equityAsset.equityHistory[0].lastPrice,) :
	// 					Number(equityAsset.lastPrice,) :
	// 				filter.date && equityAsset.etfHistory[0] ?
	// 					Number(equityAsset.etfHistory[0].close,) :
	// 					Number(equityAsset.close,)
	// 			const usdValue = equityAsset.currencyName === 'GBX' ?
	// 				parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
	// 				parseFloat((units * price * rate).toFixed(2,),)

	// 			return {
	// 				id:            asset.entity.id,
	// 				entityName:    asset.entity.name,
	// 				portfolioName: asset.portfolio?.name,
	// 				usdValue:      operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 			} as TEntityAnalytics
	// 		},)
	// 		.filter((item,): item is TEntityAnalytics => {
	// 			return item !== null
	// 		},)
	// 	const cryptoBankData = cryptoDirectAssets
	// 		.map((asset,) => {
	// 			if (!asset.entity) {
	// 				return null
	// 			}
	// 			const { cryptoCurrencyType, cryptoAmount, purchaseDate,} = asset
	// 			if (purchaseDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(purchaseDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = cryptoCurrencyType && cryptoAmount ?
	// 				this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
	// 					token: cryptoCurrencyType,
	// 					cryptoAmount,
	// 				}, cryptoList,) :
	// 				0

	// 			return {
	// 				id:            asset.entity.id,
	// 				entityName:    asset.entity.name,
	// 				portfolioName: asset.portfolio?.name,
	// 				usdValue,
	// 				currencyValue: asset.cryptoAmount,
	// 			} as TEntityAnalytics
	// 		},)
	// 		.filter((item,): item is TEntityAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const equityAssets = assets.filter((asset,): asset is IEquityAsset => {
	// 		return asset.assetName === AssetNamesType.EQUITY_ASSET
	// 	},)
	// 	const aggregatedEquityAssets = equityAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<IEquityAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

	// 		if (!entityId || !bankId || !accountId || !isin) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredEquityAssets = Object.values(aggregatedEquityAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const equityBankData = filteredEquityAssets
	// 		.map((asset,) => {
	// 			if (!asset.entity) {
	// 				return null
	// 			}
	// 			const { isin, units, operation, currency, transactionDate, } = asset
	// 			if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 				return null
	// 			}
	// 			const equityAsset = equities.find((equity,) => {
	// 				return equity.isin === isin
	// 			},) ?? etfs.find((etf,) => {
	// 				return etf.isin === isin
	// 			},) ?? null
	// 			if (!equityAsset) {
	// 				return null
	// 			}
	// 			const currencyId = this.cBondsCurrencyService.getCurrencyId(currency, currencyList,)
	// 			const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 				return item.currency === currency
	// 			},)

	// 			const rate = currencyData ?
	// 				filter.date ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					currencyData.rate :
	// 				asset.rate ?? 1
	// 			const price = 'lastPrice' in equityAsset ?
	// 				filter.date && equityAsset.equityHistory[0] ?
	// 					Number(equityAsset.equityHistory[0].lastPrice,) :
	// 					Number(equityAsset.lastPrice,) :
	// 				filter.date && equityAsset.etfHistory[0] ?
	// 					Number(equityAsset.etfHistory[0].close,) :
	// 					Number(equityAsset.close,)
	// 			const usdValue = equityAsset.currencyName === 'GBX' ?
	// 				parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
	// 				parseFloat((units * price * rate).toFixed(2,),)

	// 			return {
	// 				id:            asset.entity.id,
	// 				entityName:    asset.entity.name,
	// 				portfolioName: asset.portfolio?.name,
	// 				usdValue:      operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 			} as TEntityAnalytics
	// 		},)
	// 		.filter((item,): item is TEntityAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const loanAssets = assets.filter((asset,): asset is ILoanAsset => {
	// 		return asset.assetName === AssetNamesType.LOAN
	// 	},)
	// 	const loanBankData = loanAssets
	// 		.map((asset,) => {
	// 			if (!asset.entity) {
	// 				return null
	// 			}
	// 			const { currencyValue, maturityDate, startDate, currency, } = asset
	// 			if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
	// 				return null
	// 			}
	// 			const maturity = new Date(maturityDate,)
	// 			if (maturity < new Date()) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				id:            asset.entity.id,
	// 				entityName:    asset.entity.name,
	// 				portfolioName: asset.portfolio?.name,
	// 				usdValue,
	// 			} as TEntityAnalytics
	// 		},)
	// 		.filter((item,): item is TEntityAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const metalAssets = assets.filter((asset,): asset is IMetalsAsset => {
	// 		return asset.assetName === AssetNamesType.METALS
	// 	},)
	// 	const metalETFAssets = metalAssets.filter(
	// 		(item,): item is NonNullable<typeof item> => {
	// 			return item.productType === MetalType.ETF
	// 		},
	// 	)
	// 	const metalDirectAssets = metalAssets.filter(
	// 		(item,): item is NonNullable<typeof item> => {
	// 			return item.productType === MetalType.DIRECT_HOLD
	// 		},
	// 	)
	// 	const aggregatedMetalAssets = metalDirectAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, units, operation, portfolioId, metalType, } = asset

	// 		if (!entityId || !bankId || !accountId || !metalType) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${metalType}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredMetalAssets = Object.values(aggregatedMetalAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const aggregatedMetalETFAssets = metalETFAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

	// 		if (!entityId || !bankId || !accountId || !isin || !units) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredMetalEtfAssets = Object.values(aggregatedMetalETFAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const metalETFData = filteredMetalEtfAssets
	// 		.map((asset,) => {
	// 			const { isin, units, operation, currency, transactionDate, assetName, } = asset
	// 			if (!asset.entity || !currency || !isin || !units) {
	// 				return null
	// 			}
	// 			if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 				return null
	// 			}
	// 			const equityAsset = equities.find((equity,) => {
	// 				return equity.isin === isin
	// 			},) ?? etfs.find((etf,) => {
	// 				return etf.isin === isin
	// 			},) ?? null
	// 			if (!equityAsset) {
	// 				return null
	// 			}
	// 			const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 				return item.currency === currency
	// 			},)

	// 			const rate = currencyData ?
	// 				filter.date ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					currencyData.rate :
	// 				asset.rate ?? 1
	// 			const price = 'lastPrice' in equityAsset ?
	// 				filter.date && equityAsset.equityHistory[0] ?
	// 					Number(equityAsset.equityHistory[0].lastPrice,) :
	// 					Number(equityAsset.lastPrice,) :
	// 				filter.date && equityAsset.etfHistory[0] ?
	// 					Number(equityAsset.etfHistory[0].close,) :
	// 					Number(equityAsset.close,)
	// 			const usdValue = equityAsset.currencyName === 'GBX' ?
	// 				parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
	// 				parseFloat((units * price * rate).toFixed(2,),)

	// 			return {
	// 				id:            asset.entity.id,
	// 				entityName:    asset.entity.name,
	// 				portfolioName: asset.portfolio?.name,
	// 				usdValue:      operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 			} as TEntityAnalytics
	// 		},)
	// 		.filter((item,): item is TEntityAnalytics => {
	// 			return item !== null
	// 		},)
	// 	const metalsBankData = filteredMetalAssets
	// 		.map((asset,) => {
	// 			if (!asset.entity) {
	// 				return null
	// 			}
	// 			const { units, operation, transactionDate, metalType, } = asset
	// 			if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = metalType  ?
	// 				this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
	// 					metalList,
	// 					metalType,
	// 					units,
	// 					historyDate: filter.date,
	// 				},) :
	// 				0

	// 			return {
	// 				id:            asset.entity.id,
	// 				entityName:    asset.entity.name,
	// 				portfolioName: asset.portfolio?.name,
	// 				usdValue:      operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 			} as TEntityAnalytics
	// 		},)
	// 		.filter((item,): item is TEntityAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const optionsAssets = assets.filter((asset,): asset is IOptionAsset => {
	// 		return asset.assetName === AssetNamesType.OPTIONS
	// 	},)
	// 	const optionsBankData = optionsAssets
	// 		.map((asset,) => {
	// 			if (!asset.entity) {
	// 				return null
	// 			}
	// 			const { maturityDate, startDate, currency, currentMarketValue, } = asset
	// 			const maturity = new Date(maturityDate,)
	// 			if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
	// 				return null
	// 			}
	// 			if (maturity < new Date()) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue: currentMarketValue,
	// 				currencyList,
	// 				historyDate:   filter.date,
	// 			},)

	// 			return {
	// 				id:            asset.entity.id,
	// 				entityName:    asset.entity.name,
	// 				portfolioName: asset.portfolio?.name,
	// 				usdValue,
	// 			} as TEntityAnalytics
	// 		},)
	// 		.filter((item,): item is TEntityAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const otherAssets = assets.filter((asset,): asset is IOtherAsset => {
	// 		return asset.assetName === AssetNamesType.OTHER
	// 	},)
	// 	const otherBankData = otherAssets
	// 		.map((asset,) => {
	// 			if (!asset.entity) {
	// 				return null
	// 			}
	// 			const { currencyValue, investmentDate, currency, } = asset
	// 			if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				id:            asset.entity.id,
	// 				entityName:    asset.entity.name,
	// 				portfolioName: asset.portfolio?.name,
	// 				usdValue,
	// 			} as TEntityAnalytics
	// 		},)
	// 		.filter((item,): item is TEntityAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const privateEquityAssets = assets.filter((asset,): asset is IPrivateAsset => {
	// 		return asset.assetName === AssetNamesType.PRIVATE_EQUITY
	// 	},)
	// 	const privateEquityBankData = privateEquityAssets
	// 		.map((asset,) => {
	// 			if (!asset.entity) {
	// 				return null
	// 			}
	// 			const { currencyValue, entryDate, currency, } = asset
	// 			if (entryDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(entryDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				id:            asset.entity.id,
	// 				entityName:    asset.entity.name,
	// 				portfolioName: asset.portfolio?.name,
	// 				usdValue,
	// 			} as TEntityAnalytics
	// 		},)
	// 		.filter((item,): item is TEntityAnalytics => {
	// 			return item !== null
	// 		},)

	// 	const realEstateAssets = assets.filter((asset,): asset is IRealEstateAsset => {
	// 		return asset.assetName === AssetNamesType.REAL_ESTATE
	// 	},)
	// 	const realEstateBankData = realEstateAssets
	// 		.map((asset,) => {
	// 			if (!asset.entity) {
	// 				return null
	// 			}
	// 			const { currencyValue, investmentDate, currency, } = asset
	// 			if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				id:            asset.entity.id,
	// 				entityName:    asset.entity.name,
	// 				portfolioName: asset.portfolio?.name,
	// 				usdValue,
	// 			} as TEntityAnalytics
	// 		},)
	// 		.filter((item,): item is TEntityAnalytics => {
	// 			return item !== null
	// 		},)
	// 	const result = [
	// 		...cashBankData,
	// 		...bondsBankData,
	// 		...depositsBankData,
	// 		...collateralBankData,
	// 		...cryptoBankData,
	// 		...cryptoETFData,
	// 		...equityBankData,
	// 		...loanBankData,
	// 		...metalsBankData,
	// 		...metalETFData,
	// 		...optionsBankData,
	// 		...otherBankData,
	// 		...privateEquityBankData,
	// 		...realEstateBankData,
	// 	].reduce<Array<TEntityAnalytics>>((acc, asset,) => {
	// 		const {
	// 			id,
	// 			usdValue,
	// 			entityName,
	// 			portfolioName,
	// 		} = asset
	// 		const existing = acc.find((item,) => {
	// 			return item.id === id
	// 		},)
	// 		if (existing) {
	// 			existing.usdValue = existing.usdValue + usdValue
	// 		} else {
	// 			acc.push({
	// 				id,
	// 				entityName:    this.cryptoService.decryptString(entityName,),
	// 				usdValue,
	// 				portfolioName: portfolioName && this.cryptoService.decryptString(portfolioName,),
	// 			},)
	// 		}
	// 		return acc
	// 	}, [],)
	// 	return result
	// }

	/**
 * 3.5.2
 * Retrieves currency analytics based on the provided filter criteria.
 * @remarks
 * - Uses `parseAndFilterAssets` to fetch and filter assets.
 * - Aggregates currency data by currency and computes the USD value.
 * @param filter - The filter criteria for retrieving currency analytics.
 * @param clientId - The optional client ID to further filter the results.
 * @returns A Promise resolving to an array of currency analytics data.
 */
	// New Version
	public async getCurrencyAnalytics(filter: OverviewFilterDto, clientId?: string,): Promise<Array<TCurrencyAnalytics>> {
		if (filter.date) {
			const [{
				bondAssets,
				equityAssets,
				metalAssets,
				cryptoAssets,
				depositAssets,
				loanAssets,
				optionAssets,
				otherAssets,
				peAssets,
				reAssets,
			}, transactions, currencyList,bonds,equities, etfs, metalList,] = await Promise.all([
				this.getFilteredRefactoredAssetsWithHistoryDate(filter,clientId,),
				this.getFilteredTransactions(filter, clientId,),
				this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
				this.cBondsCurrencyService.getAllBondsWithHistory(filter.date,),
				this.cBondsCurrencyService.getAllEquitiesWithHistory(filter.date,),
				this.cBondsCurrencyService.getAllEtfsWithHistory(filter.date,),
				this.cBondsCurrencyService.getAllMetalsWithHistory(filter.date,),
			],)
			const cashBankData = transactions
				.map((transaction,) => {
					const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
						currency:      transaction.currency as CurrencyDataList,
						currencyValue: Number(transaction.amount,),
						currencyList,
						historyDate:   filter.date,
					},)
					return {
						currency:      transaction.currency as CurrencyDataList,
						currencyValue: Number(transaction.amount,),
						usdValue,
					}
				},)
			const bondsBankData = bondAssets
				.map((group,) => {
					return {
						...group,
						bonds: group.bonds.map((b,) => {
							if (b.assetBondVersions.length > 0) {
								return b.assetBondVersions[0]
							}
							return b
						},),
					}
				},)
				.filter((group,) => {
					return Boolean(group.bonds.length > 0,)
				},)
				.flatMap((groupAsset,) => {
					return groupAsset.bonds.map((asset,) => {
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === asset.currency
						},)
						const bondData = bonds.find((item,) => {
							return item.isin === asset.isin
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const dirtyPriceCurrency = bondData?.bondHistory[0] ?
							bondData.bondHistory[0].dirtyPriceCurrency ?
								bondData.bondHistory[0].dirtyPriceCurrency :
								null :
							bondData?.dirtyPriceCurrency ?
								bondData.dirtyPriceCurrency :
								null

						const nominalPrice = bondData?.bondHistory[0] ?
							bondData.bondHistory[0].nominalPrice ?
								bondData.bondHistory[0].nominalPrice :
								null :
							bondData?.nominalPrice ?
								bondData.nominalPrice :
								null

						const marketPrice = bondData?.bondHistory[0] ?
							bondData.bondHistory[0].marketPrice :
							bondData?.marketPrice ?? asset.marketPrice

						const marketValueUsd = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
							isin:  asset.isin,
							units:              Number(asset.units,),
							dirtyPriceCurrency,
							nominalPrice,
							rate,
							marketPrice,
						},)
						const marketValueFC = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
							isin:  asset.isin,
							units:              Number(asset.units,),
							dirtyPriceCurrency,
							nominalPrice,
							rate:               1,
							marketPrice,
						},)
						return {
							currency:      asset.currency ,
							currencyValue: asset.operation === AssetOperationType.BUY  ?
								marketValueFC :
								-marketValueFC,
							usdValue:      asset.operation === AssetOperationType.BUY  ?
								marketValueUsd :
								-marketValueUsd,
						}
					},)
				},)
			const depositsBankData = depositAssets
				.map((asset,) => {
					if (asset.assetDepositVersions.length > 0) {
						const [assetVersion,] = asset.assetDepositVersions
						const { currencyValue, currency,} = assetVersion
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((currencyValue * (rate)).toFixed(2,),)
						return {
							currency,
							currencyValue,
							usdValue,
						}
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const { currencyValue,} = asset
					const usdValue = parseFloat((currencyValue * (rate)).toFixed(2,),)
					return {
						currency:      asset.currency ,
						currencyValue: asset.currencyValue,
						usdValue,
					}
				},)

			const cryptoData = cryptoAssets
				.map((group,) => {
					return {
						...group,
						cryptos: group.cryptos.map((crypto,) => {
							if (crypto.assetCryptoVersions.length > 0) {
								return {
									...crypto.assetCryptoVersions[0],
									mainAssetId: crypto.id,
								}
							}
							return {
								...crypto,
								mainAssetId: undefined,
							}
						},),
					}
				},)
				.filter((group,) => {
					return Boolean(group.cryptos.length > 0,)
				},)
				.flatMap((group,) => {
					return group.cryptos.map((asset,) => {
						if (asset.productType === CryptoType.ETF) {
							const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
								return item.currency === asset.currency
							},)
							const rate = currencyData ?
								filter.date ?
									currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
									currencyData.rate :
								1
							let cBondsData: Equity | Etf | undefined
							let lastPrice: number = 0

							if (asset.type === EquityType.Equity) {
								const equity = equities.find((e,) => {
									return e.isin === asset.isin
								},)
								if (equity) {
									lastPrice = equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
								}
								cBondsData = equity
							} else {
								const etf = etfs.find((e,) => {
									return e.isin === asset.isin
								},)
								if (etf) {
									lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
								}
								cBondsData = etf
							}
							const marketPrice = cBondsData?.currencyName ===  'GBX' ?
								lastPrice / 100 :
								lastPrice
							const marketValueFC = parseFloat(((asset.units ?? 0) * Number(marketPrice,)).toFixed(2,),)
							const marketValueUsd = parseFloat(((asset.units ?? 0) * Number(marketPrice,) * rate).toFixed(2,),)
							return {
								currency:      asset.currency ,
								currencyValue: asset.operation === AssetOperationType.BUY  ?
									marketValueFC :
									-marketValueFC,
								usdValue:      asset.operation === AssetOperationType.BUY  ?
									marketValueUsd :
									-marketValueUsd,
							}
						}
						return {
							usdValue:      asset.marketValueUSD,
							currency:      asset.cryptoCurrencyType ,
							currencyValue: asset.cryptoAmount,
						}
					},)
				},)
			const equityBankData = equityAssets
				.map((group,) => {
					return {
						...group,
						equities: group.equities.map((equity,) => {
							if (equity.assetEquityVersions.length > 0) {
								return equity.assetEquityVersions[0]
							}
							return equity
						},),
					}
				},)
				.filter((group,) => {
					return Boolean(group.equities.length > 0,)
				},)
				.flatMap((group,) => {
					return group.equities.map((asset,) => {
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === asset.currency
						},)
						const rate = currencyData ?
							filter.date ?
								currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
								currencyData.rate :
							1
						let cBondsData: Equity | Etf | undefined
						let lastPrice: number = 0

						if (asset.type === EquityType.Equity) {
							const equity = equities.find((e,) => {
								return e.isin === asset.isin
							},)
							if (equity) {
								lastPrice = equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
							}
							cBondsData = equity
						} else {
							const etf = etfs.find((e,) => {
								return e.isin === asset.isin
							},)
							if (etf) {
								lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
							}
							cBondsData = etf
						}
						const marketPrice = cBondsData?.currencyName ===  'GBX' ?
							lastPrice / 100 :
							lastPrice
						const marketValueFC = parseFloat(((asset.units ?? 0) * Number(marketPrice,)).toFixed(2,),)
						const marketValueUsd = parseFloat(((asset.units ?? 0) * Number(marketPrice,) * rate).toFixed(2,),)
						return {
							currency:      asset.currency,
							currencyValue: asset.operation === AssetOperationType.BUY  ?
								marketValueFC :
								-marketValueFC,
							usdValue:    asset.operation === AssetOperationType.BUY  ?
								marketValueUsd :
								-marketValueUsd,
						}
					},)
				},)
			const loanBankData = loanAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const { currencyValue, currency,usdValue,} = assetVersion
						return {
							currency,
							currencyValue,
							usdValue,
						}
					}
					const { currencyValue, currency, usdValue,} = asset
					return {
						currency,
						currencyValue,
						usdValue,
					}
				},)
			const metalData = metalAssets
				.map((group,) => {
					return {
						...group,
						metals: group.metals.map((metal,) => {
							if (metal.assetMetalVersions.length > 0) {
								return metal.assetMetalVersions[0]
							}
							return metal
						},),
					}
				},)
				.filter((group,) => {
					return Boolean(group.metals.length > 0,)
				},)
				.flatMap((group,) => {
					return group.metals.map((asset,) => {
						if (asset.productType === MetalType.ETF) {
							const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
								return item.currency === asset.currency
							},)
							const rate = currencyData ?
								filter.date ?
									currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
									currencyData.rate :
								1
							let cBondsData: Equity | Etf | undefined
							let lastPrice: number = 0

							if (asset.type === EquityType.Equity) {
								const equity = equities.find((e,) => {
									return e.isin === asset.isin
								},)
								if (equity) {
									lastPrice = equity.equityHistory[0]?.lastPrice ?? equity.lastPrice ?? 0
								}
								cBondsData = equity
							} else {
								const etf = etfs.find((e,) => {
									return e.isin === asset.isin
								},)
								if (etf) {
									lastPrice = etf.etfHistory[0]?.close ?? etf.close ?? 0
								}
								cBondsData = etf
							}
							const marketPrice = cBondsData?.currencyName ===  'GBX' ?
								lastPrice / 100 :
								lastPrice
							const marketValueFC = parseFloat(((asset.units ?? 0) * Number(marketPrice,)).toFixed(2,),)
							const marketValueUsd = parseFloat(((asset.units ?? 0) * Number(marketPrice,) * rate).toFixed(2,),)
							return {
								currency:      asset.currency,
								currencyValue: asset.operation === AssetOperationType.BUY  ?
									marketValueFC :
									-marketValueFC,
								usdValue:    asset.operation === AssetOperationType.BUY  ?
									marketValueUsd :
									-marketValueUsd,
							}
						}
						const marketValueUsd = asset.metalType ?
							this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
								metalList,
								metalType:   asset.metalType,
								units:       asset.units,
								historyDate: filter.date,
							},) :
							0
						return {
							currency:      asset.metalType,
							currencyValue: asset.operation === AssetOperationType.BUY    ?
								asset.units :
								-asset.units,
							usdValue:      asset.operation === AssetOperationType.BUY    ?
								marketValueUsd :
								-marketValueUsd,
						}
					},)
				},)
			const optionsBankData = optionAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const { currentMarketValue, currency,} = assetVersion

						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((currentMarketValue * (rate)).toFixed(2,),)
						return {
							currency,
							currencyValue: currentMarketValue,
							usdValue,
						}
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const usdValue = parseFloat((asset.currentMarketValue * (rate)).toFixed(2,),)
					return {
						currency:      asset.currency,
						currencyValue: asset.currentMarketValue,
						usdValue,
					}
				},)
			const otherBankData = otherAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((assetVersion.currencyValue * (rate)).toFixed(2,),)
						return {
							currency:      assetVersion.currency,
							currencyValue: assetVersion.currencyValue,
							usdValue,
						}
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const usdValue = parseFloat((asset.currencyValue * rate).toFixed(2,),)
					return {
						currency:      asset.currency,
						currencyValue: asset.currencyValue,
						usdValue,
					}
				},)
			const privateEquityBankData = peAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((assetVersion.currencyValue * (rate)).toFixed(2,),)
						return {
							currency:      assetVersion.currency,
							currencyValue: assetVersion.currencyValue,
							usdValue,
						}
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const usdValue = parseFloat((asset.currencyValue * rate).toFixed(2,),)
					return {
						currency:      asset.currency,
						currencyValue: asset.currencyValue,
						usdValue,
					}
				},)
			const realEstateBankData = reAssets
				.map((asset,) => {
					if (asset.versions.length > 0) {
						const [assetVersion,] = asset.versions
						const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
							return item.currency === assetVersion.currency
						},)
						const rate = currencyData ?
							currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
							1
						const usdValue = parseFloat((assetVersion.currencyValue * (rate)).toFixed(2,),)
						return {
							currency:      assetVersion.currency,
							currencyValue: assetVersion.currencyValue,
							usdValue,
						}
					}
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === asset.currency
					},)
					const rate = currencyData ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						1
					const usdValue = parseFloat((asset.currencyValue * (rate)).toFixed(2,),)
					return {
						currency:      asset.currency,
						currencyValue: asset.currencyValue,
						usdValue,
					}
				},)
			const result = [
				...cashBankData,
				...bondsBankData,
				...depositsBankData,
				...cryptoData,
				...equityBankData,
				...loanBankData,
				...metalData,
				...optionsBankData,
				...otherBankData,
				...privateEquityBankData,
				...realEstateBankData,
			].reduce<Array<TCurrencyAnalytics>>((acc, asset,) => {
				if (!asset?.currency) {
					return acc
				}
				const {
					currency,
					currencyValue,
					usdValue,
				} = asset
				const existing = acc.find((item,) => {
					return item.currency === currency
				},)
				if (existing) {
					existing.usdValue = parseFloat((existing.usdValue + usdValue).toFixed(2,),)
					existing.currencyValue = parseFloat((existing.currencyValue + (currencyValue ?? 0)).toFixed(2,),)
				} else {
					acc.push({
						usdValue:      parseFloat(usdValue.toFixed(2,),),
						currencyValue: parseFloat((currencyValue ?? 0).toFixed(2,),),
						currency:      currency as CurrencyDataList | CryptoList | MetalDataList,
					},)
				}
				return acc
			}, [],)
				.filter((asset,) => {
					return asset.currencyValue !== 0
				},)
			return result
		}

		const [{
			bondAssets,
			equityAssets,
			metalAssets,
			cryptoAssets,
			depositAssets,
			loanAssets,
			optionAssets,
			otherAssets,
			peAssets,
			reAssets,
		}, transactions, currencyList,] = await Promise.all([
			this.getFilteredRefactoredAssets(filter,clientId,),
			this.getFilteredTransactions(filter, clientId,),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
		],)
		const cashBankData = transactions
			.map((transaction,) => {
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency:      transaction.currency as CurrencyDataList,
					currencyValue: Number(transaction.amount,),
					currencyList,
					historyDate:   filter.date,
				},)
				return {
					currency:      transaction.currency as CurrencyDataList,
					currencyValue: Number(transaction.amount,),
					usdValue,
				}
			},)
		const bondsBankData = bondAssets
			.map((asset,) => {
				return {
					currency:      asset.currency,
					currencyValue: asset.marketValueFC,
					usdValue:      asset.marketValueUSD,
				}
			},)
		const depositsBankData = depositAssets
			.map((asset,) => {
				return {
					currency:      asset.currency,
					currencyValue: asset.currencyValue,
					usdValue:      asset.usdValue,
				}
			},)
		const cryptoData = cryptoAssets
			.map((asset,) => {
				return {
					currency:      asset.productType === CryptoType.DIRECT_HOLD ?
						asset.cryptoCurrencyType :
						asset.currency,
					currencyValue: asset.productType === CryptoType.DIRECT_HOLD ?
						asset.cryptoAmount :
						asset.marketValueFC,
					usdValue:      asset.marketValueUSD,
				}
			},)
		const equityBankData = equityAssets
			.map((asset,) => {
				return {
					currency:      asset.currency,
					currencyValue: asset.marketValueFC,
					usdValue:      asset.marketValueUSD,
				}
			},)
		const loanBankData = loanAssets
			.map((asset,) => {
				return {
					currency:      asset.currency,
					currencyValue: asset.currencyValue,
					usdValue:      asset.usdValue,
				}
			},)
		const metalData = metalAssets
			.map((asset,) => {
				return {
					currency:      asset.productType === MetalType.DIRECT_HOLD ?
						asset.metalType :
						asset.currency,
					currencyValue:      asset.productType === MetalType.DIRECT_HOLD ?
						asset.totalUnits :
						asset.marketValueFC,
					usdValue:      asset.marketValueUSD,
				}
			},)
		const optionsBankData = optionAssets
			.map((asset,) => {
				return {
					currency:      asset.currency,
					currencyValue: asset.currentMarketValue,
					usdValue:      asset.marketValueUSD,
				}
			},)
		const otherBankData = otherAssets
			.map((asset,) => {
				return {
					currency:      asset.currency,
					currencyValue: asset.currencyValue,
					usdValue:      asset.marketValueUSD,
				}
			},)
		const privateEquityBankData = peAssets
			.map((asset,) => {
				return {
					currency:      asset.currency,
					currencyValue: asset.currencyValue,
					usdValue:      asset.marketValueUSD,
				}
			},)
		const realEstateBankData = reAssets
			.map((asset,) => {
				return {
					currency:      asset.currency,
					currencyValue: asset.currencyValue,
					usdValue:      asset.marketValueUSD,
				}
			},)
		const result = [
			...cashBankData,
			...bondsBankData,
			...depositsBankData,
			...cryptoData,
			...equityBankData,
			...loanBankData,
			...metalData,
			...optionsBankData,
			...otherBankData,
			...privateEquityBankData,
			...realEstateBankData,
		].reduce<Array<TCurrencyAnalytics>>((acc, asset,) => {
			if (!asset?.currency) {
				return acc
			}
			const {
				currency,
				currencyValue,
				usdValue,
			} = asset
			const existing = acc.find((item,) => {
				return item.currency === currency
			},)
			if (existing) {
				existing.usdValue = parseFloat((existing.usdValue + usdValue).toFixed(2,),)
				existing.currencyValue = parseFloat((existing.currencyValue + (currencyValue ?? 0)).toFixed(2,),)
			} else {
				acc.push({
					usdValue:      parseFloat(usdValue.toFixed(2,),),
					currencyValue: parseFloat((currencyValue ?? 0).toFixed(2,),),
					currency:      currency as CurrencyDataList | CryptoList | MetalDataList,
				},)
			}
			return acc
		}, [],)
			.filter((asset,) => {
				return asset.currencyValue !== 0
			},)
		return result
	}

	// public async getCurrencyAnalytics(filter: OverviewFilterDto, clientId?: string,): Promise<Array<TCurrencyAnalytics>> {
	// 	const [assets, transactions, currencyList, cryptoList, bonds, equities, etfs, metalList,] = await Promise.all([
	// 		this.parseAndFilterAssets(filter, clientId,),
	// 		this.getFilteredTransactions(filter, clientId,),
	// 		this.cBondsCurrencyService.getAllCurrenciesWithHistory(filter.date,),
	// 		this.prismaService.cryptoData.findMany(),
	// 		this.cBondsCurrencyService.getAllBondsWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllEquitiesWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllEtfsWithHistory(filter.date,),
	// 		this.cBondsCurrencyService.getAllMetalsWithHistory(filter.date,),
	// 	],)
	// 	const cashAssets = assets.filter((asset,): asset is ICashAsset => {
	// 		return asset.assetName === AssetNamesType.CASH
	// 	},)
	// 	const cashBankData = cashAssets
	// 		.map((asset,) => {
	// 			const { currency, accountId, } = asset
	// 			const transactionSumByCurrency = transactions.reduce((acc, transaction,) => {
	// 				if (transaction.currency === currency && transaction.accountId === accountId) {
	// 					return acc + Number(transaction.amount,)
	// 				}
	// 				return acc
	// 			}, 0,)
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue: transactionSumByCurrency,
	// 				currencyList,
	// 				historyDate:   filter.date,
	// 			},)
	// 			return {
	// 				currency,
	// 				currencyValue: transactionSumByCurrency,
	// 				usdValue,
	// 			}
	// 		},)

	// 	const bondsAssets = assets.filter((asset,): asset is IBondsAsset => {
	// 		return asset.assetName === AssetNamesType.BONDS
	// 	},)
	// 	const aggregatedBondsAssets = bondsAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<IBondsAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

	// 		if (!entityId || !bankId || !accountId || !isin) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredBondsAssets = Object.values(aggregatedBondsAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const bondsBankData = filteredBondsAssets
	// 		.map((asset,) => {
	// 			const { isin, units, currency, operation, valueDate, } = asset
	// 			const bond = bonds.find((bond,) => {
	// 				return bond.isin === isin
	// 			},)
	// 			if (valueDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(valueDate,)) {
	// 				return null
	// 			}
	// 			if (!bond) {
	// 				return null
	// 			}
	// 			if (bond.maturityDate && (new Date(bond.maturityDate,) < new Date())) {
	// 				return null
	// 			}
	// 			const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 				return item.currency === currency
	// 			},)

	// 			const rate = currencyData ?
	// 				filter.date ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					currencyData.rate :
	// 				asset.rate ?? 1
	// 			const dirtyPriceCurrency = filter.date && bond.bondHistory[0] ?
	// 				bond.bondHistory[0].dirtyPriceCurrency ?
	// 					bond.bondHistory[0].dirtyPriceCurrency :
	// 					null :
	// 				bond.dirtyPriceCurrency ?
	// 					bond.dirtyPriceCurrency :
	// 					null

	// 			const nominalPrice = filter.date && bond.bondHistory[0] ?
	// 				bond.bondHistory[0].nominalPrice ?
	// 					bond.bondHistory[0].nominalPrice :
	// 					null :
	// 				bond.nominalPrice ?
	// 					bond.nominalPrice :
	// 					null

	// 			const marketPrice = filter.date && bond.bondHistory[0] ?
	// 				bond.bondHistory[0].marketPrice :
	// 				bond.marketPrice
	// 			const usdValue = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
	// 				isin,
	// 				units:              Number(units,),
	// 				dirtyPriceCurrency,
	// 				nominalPrice,
	// 				rate,
	// 				marketPrice,
	// 			},)
	// 			const currencyValue = this.cBondsCurrencyService.getCurrencyAmount({
	// 				currency,
	// 				usdValue,
	// 			}, currencyList,)

	// 			return {
	// 				currency,
	// 				currencyValue: operation === AssetOperationType.BUY ?
	// 					currencyValue :
	// 					-currencyValue,
	// 				usdValue: operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 			}
	// 		},)
	// 		.filter((asset,) => {
	// 			return asset !== null
	// 		},)

	// 	const depositsAssets = assets.filter((asset,): asset is IDepositAsset => {
	// 		return asset.assetName === AssetNamesType.CASH_DEPOSIT
	// 	},)
	// 	const depositsBankData = depositsAssets
	// 		.map((asset,) => {
	// 			const { currency, currencyValue, maturityDate, startDate, } = asset
	// 			if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
	// 				return null
	// 			}
	// 			if (!filter.date && maturityDate && new Date(maturityDate,) < new Date()) {
	// 				return null
	// 			}
	// 			if (filter.date && maturityDate && new Date(filter.date,) >= new Date(maturityDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				currency,
	// 				currencyValue: parseFloat(String(currencyValue,),),
	// 				usdValue:      parseFloat(String(usdValue,),),
	// 			}
	// 		},)
	// 		.filter((asset,) => {
	// 			return asset !== null
	// 		},)

	// 	const collateralAssets = assets.filter((asset,): asset is ICollateralAsset => {
	// 		return asset.assetName === AssetNamesType.COLLATERAL
	// 	},)
	// 	const collateralBankData = collateralAssets
	// 		.map((asset,) => {
	// 			const { currency, currencyValue, } = asset
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				currency,
	// 				currencyValue,
	// 				usdValue,
	// 			}
	// 		},)

	// 	const cryptoAssets = assets.filter((asset,): asset is ICryptoAsset => {
	// 		return asset.assetName === AssetNamesType.CRYPTO
	// 	},)
	// 	const cryptoETFAssets = cryptoAssets.filter(
	// 		(item,): item is NonNullable<typeof item> => {
	// 			return item.productType === CryptoType.ETF
	// 		},
	// 	)
	// 	const cryptoDirectAssets = cryptoAssets.filter(
	// 		(item,): item is NonNullable<typeof item> => {
	// 			return item.productType === CryptoType.DIRECT_HOLD
	// 		},
	// 	)
	// 	const aggregatedCryptoETFAssets = cryptoETFAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<ICryptoAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

	// 		if (!entityId || !bankId || !accountId || !isin || !units) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredCryptoEtfAssets = Object.values(aggregatedCryptoETFAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const cryptoETFData = filteredCryptoEtfAssets
	// 		.map((asset,) => {
	// 			const { isin, units, operation, currency, transactionDate, } = asset
	// 			if (!asset.bank || !currency || !isin || !units) {
	// 				return null
	// 			}
	// 			if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 				return null
	// 			}
	// 			const equityAsset = equities.find((equity,) => {
	// 				return equity.isin === isin
	// 			},) ?? etfs.find((etf,) => {
	// 				return etf.isin === isin
	// 			},) ?? null
	// 			if (!equityAsset) {
	// 				return null
	// 			}
	// 			const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 				return item.currency === currency
	// 			},)

	// 			const rate = currencyData ?
	// 				filter.date ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					currencyData.rate :
	// 				asset.rate ?? 1
	// 			const price = 'lastPrice' in equityAsset ?
	// 				filter.date && equityAsset.equityHistory[0] ?
	// 					Number(equityAsset.equityHistory[0].lastPrice,) :
	// 					Number(equityAsset.lastPrice,) :
	// 				filter.date && equityAsset.etfHistory[0] ?
	// 					Number(equityAsset.etfHistory[0].close,) :
	// 					Number(equityAsset.close,)
	// 			const usdValue = equityAsset.currencyName === 'GBX' ?
	// 				parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
	// 				parseFloat((units * price * rate).toFixed(2,),)
	// 			const currencyValue = this.cBondsCurrencyService.getCurrencyAmount({
	// 				currency,
	// 				usdValue,
	// 			}, currencyList,)
	// 			return {
	// 				currency,
	// 				currencyValue: operation === AssetOperationType.BUY ?
	// 					currencyValue :
	// 					-currencyValue,
	// 				usdValue: operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 			}
	// 		},)
	// 		.filter((item,) => {
	// 			return item !== null
	// 		},)
	// 	const cryptoBankData = cryptoDirectAssets
	// 		.map((asset,) => {
	// 			const { cryptoCurrencyType, cryptoAmount, purchaseDate, currency,} = asset
	// 			if (purchaseDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(purchaseDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = cryptoAmount && cryptoCurrencyType ?
	// 				this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
	// 					token: cryptoCurrencyType,
	// 					cryptoAmount,
	// 				}, cryptoList,) :
	// 				0
	// 			const cryptoCurrency: CryptoList | CurrencyDataList | undefined = cryptoCurrencyType ?? currency
	// 			if (!cryptoCurrency) {
	// 				return null
	// 			}
	// 			return {
	// 				currency:      cryptoCurrency,
	// 				currencyValue: cryptoAmount ?
	// 					cryptoAmount :
	// 					0,
	// 				usdValue,
	// 			}
	// 		},)

	// 	const equityAssets = assets.filter((asset,): asset is IEquityAsset => {
	// 		return asset.assetName === AssetNamesType.EQUITY_ASSET
	// 	},)
	// 	const aggregatedEquityAssets = equityAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<IEquityAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

	// 		if (!entityId || !bankId || !accountId || !isin) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredEquityAssets = Object.values(aggregatedEquityAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const equityBankData = filteredEquityAssets
	// 		.map((asset,) => {
	// 			const { isin, units, currency, operation, transactionDate, } = asset
	// 			if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 				return null
	// 			}
	// 			const equityAsset = equities.find((equity,) => {
	// 				return equity.isin === isin
	// 			},) ?? etfs.find((etf,) => {
	// 				return etf.isin === isin
	// 			},) ?? null
	// 			if (!equityAsset) {
	// 				return null
	// 			}
	// 			const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 				return item.currency === currency
	// 			},)

	// 			const rate = currencyData ?
	// 				filter.date ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					currencyData.rate :
	// 				asset.rate ?? 1
	// 			const price = 'lastPrice' in equityAsset ?
	// 				filter.date && equityAsset.equityHistory[0] ?
	// 					Number(equityAsset.equityHistory[0].lastPrice,) :
	// 					Number(equityAsset.lastPrice,) :
	// 				filter.date && equityAsset.etfHistory[0] ?
	// 					Number(equityAsset.etfHistory[0].close,) :
	// 					Number(equityAsset.close,)
	// 			const usdValue = equityAsset.currencyName === 'GBX' ?
	// 				parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
	// 				parseFloat((units * price * rate).toFixed(2,),)
	// 			const currencyValue = this.cBondsCurrencyService.getCurrencyAmount({
	// 				currency,
	// 				usdValue,
	// 			}, currencyList,)

	// 			return {
	// 				currency,
	// 				currencyValue: operation === AssetOperationType.BUY ?
	// 					currencyValue :
	// 					-currencyValue,
	// 				usdValue: operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 			}
	// 		},)

	// 	const loanAssets = assets.filter((asset,): asset is ILoanAsset => {
	// 		return asset.assetName === AssetNamesType.LOAN
	// 	},)
	// 	const loanBankData = loanAssets
	// 		.map((asset,) => {
	// 			const { currency, currencyValue, maturityDate, startDate, } = asset
	// 			if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
	// 				return null
	// 			}
	// 			const maturity = new Date(maturityDate,)
	// 			if (maturity < new Date()) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				currency,
	// 				currencyValue,
	// 				usdValue,
	// 			}
	// 		},)
	// 		.filter((asset,) => {
	// 			return asset !== null
	// 		},)
	// 	const metalAssets = assets.filter((asset,): asset is IMetalsAsset => {
	// 		return asset.assetName === AssetNamesType.METALS
	// 	},)
	// 	const metalETFAssets = metalAssets.filter(
	// 		(item,): item is NonNullable<typeof item> => {
	// 			return item.productType === MetalType.ETF
	// 		},
	// 	)
	// 	const metalDirectAssets = metalAssets.filter(
	// 		(item,): item is NonNullable<typeof item> => {
	// 			return item.productType === MetalType.DIRECT_HOLD
	// 		},
	// 	)
	// 	const aggregatedMetalAssets = metalDirectAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, units, operation, portfolioId, metalType, } = asset

	// 		if (!entityId || !bankId || !accountId || !metalType) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${metalType}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredMetalAssets = Object.values(aggregatedMetalAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const aggregatedMetalETFAssets = metalETFAssets.reduce<
	// 		Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>
	// 	>((acc, asset,) => {
	// 		const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

	// 		if (!entityId || !bankId || !accountId || !isin || !units) {
	// 			return acc
	// 		}
	// 		const key = `${portfolioId}_${entityId}_${bankId}_${accountId}_${isin}_${currency}`
	// 		if (!acc[key]) {
	// 			acc[key] = { totalUnits: 0, assets: [], }
	// 		}
	// 		if (operation === AssetOperationType.BUY) {
	// 			acc[key].totalUnits = acc[key].totalUnits + units
	// 		} else if (operation === AssetOperationType.SELL) {
	// 			acc[key].totalUnits = acc[key].totalUnits - units
	// 		}
	// 		acc[key].assets.push(asset,)
	// 		return acc
	// 	}, {},)
	// 	const filteredMetalEtfAssets = Object.values(aggregatedMetalETFAssets,)
	// 		.filter(({ totalUnits, },) => {
	// 			return totalUnits > 0
	// 		},)
	// 		.flatMap(({ assets, },) => {
	// 			return assets
	// 		},)
	// 	const metalETFData = filteredMetalEtfAssets
	// 		.map((asset,) => {
	// 			const { isin, units, operation, currency, transactionDate, assetName, } = asset
	// 			if (!asset.entity || !currency || !isin || !units) {
	// 				return null
	// 			}
	// 			if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 				return null
	// 			}
	// 			const equityAsset = equities.find((equity,) => {
	// 				return equity.isin === isin
	// 			},) ?? etfs.find((etf,) => {
	// 				return etf.isin === isin
	// 			},) ?? null
	// 			if (!equityAsset) {
	// 				return null
	// 			}
	// 			const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
	// 				return item.currency === currency
	// 			},)

	// 			const rate = currencyData ?
	// 				filter.date ?
	// 					currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
	// 					currencyData.rate :
	// 				asset.rate ?? 1
	// 			const price = 'lastPrice' in equityAsset ?
	// 				filter.date && equityAsset.equityHistory[0] ?
	// 					Number(equityAsset.equityHistory[0].lastPrice,) :
	// 					Number(equityAsset.lastPrice,) :
	// 				filter.date && equityAsset.etfHistory[0] ?
	// 					Number(equityAsset.etfHistory[0].close,) :
	// 					Number(equityAsset.close,)
	// 			const usdValue = equityAsset.currencyName === 'GBX' ?
	// 				parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
	// 				parseFloat((units * price * rate).toFixed(2,),)
	// 			const currencyValue = this.cBondsCurrencyService.getCurrencyAmount({
	// 				currency,
	// 				usdValue,
	// 			}, currencyList,)
	// 			return {
	// 				currency,
	// 				currencyValue: operation === AssetOperationType.BUY ?
	// 					currencyValue :
	// 					-currencyValue,
	// 				usdValue: operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 			}
	// 		},)
	// 		.filter((item,) => {
	// 			return item !== null
	// 		},)
	// 	const metalsBankData = filteredMetalAssets
	// 		.map((asset,) => {
	// 			const { metalType, units, operation, transactionDate, } = asset
	// 			if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
	// 				return null
	// 			}
	// 			if (!metalType) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
	// 				metalList,
	// 				metalType,
	// 				units,
	// 				historyDate: filter.date,
	// 			},)
	// 			return {
	// 				currency:      metalType,
	// 				currencyValue: operation === AssetOperationType.BUY ?
	// 					units :
	// 					-units,
	// 				usdValue: operation === AssetOperationType.BUY ?
	// 					usdValue :
	// 					-usdValue,
	// 			}
	// 		},)

	// 	const optionsAssets = assets.filter((asset,): asset is IOptionAsset => {
	// 		return asset.assetName === AssetNamesType.OPTIONS
	// 	},)
	// 	const optionsBankData = optionsAssets
	// 		.map((asset,) => {
	// 			const { currency, currentMarketValue, maturityDate, startDate, } = asset
	// 			if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
	// 				return null
	// 			}
	// 			const maturity = new Date(maturityDate,)
	// 			if (maturity < new Date()) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue: currentMarketValue,
	// 				currencyList,
	// 				historyDate:   filter.date,
	// 			},)

	// 			return {
	// 				currency,
	// 				currencyValue: currentMarketValue,
	// 				usdValue,
	// 			}
	// 		},)
	// 		.filter((asset,) => {
	// 			return asset !== null
	// 		},)

	// 	const otherAssets = assets.filter((asset,): asset is IOtherAsset => {
	// 		return asset.assetName === AssetNamesType.OTHER
	// 	},)
	// 	const otherBankData = otherAssets
	// 		.map((asset,) => {
	// 			const { currency, currencyValue, investmentDate, } = asset
	// 			if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				currency,
	// 				currencyValue,
	// 				usdValue,
	// 			}
	// 		},)

	// 	const privateEquityAssets = assets.filter((asset,): asset is IPrivateAsset => {
	// 		return asset.assetName === AssetNamesType.PRIVATE_EQUITY
	// 	},)
	// 	const privateEquityBankData = privateEquityAssets
	// 		.map((asset,) => {
	// 			const { currency, currencyValue, entryDate, } = asset
	// 			if (entryDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(entryDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				currency,
	// 				currencyValue,
	// 				usdValue,
	// 			}
	// 		},)

	// 	const realEstateAssets = assets.filter((asset,): asset is IRealEstateAsset => {
	// 		return asset.assetName === AssetNamesType.REAL_ESTATE
	// 	},)
	// 	const realEstateBankData = realEstateAssets
	// 		.map((asset,) => {
	// 			const { currency, currencyValue, investmentDate, } = asset
	// 			if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
	// 				return null
	// 			}
	// 			const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
	// 				currency,
	// 				currencyValue,
	// 				currencyList,
	// 				historyDate: filter.date,
	// 			},)

	// 			return {
	// 				currency,
	// 				currencyValue,
	// 				usdValue,
	// 			}
	// 		},)
	// 	const result = [
	// 		...cashBankData,
	// 		...bondsBankData,
	// 		...depositsBankData,
	// 		...collateralBankData,
	// 		...cryptoBankData,
	// 		...cryptoETFData,
	// 		...equityBankData,
	// 		...loanBankData,
	// 		...metalsBankData,
	// 		...metalETFData,
	// 		...optionsBankData,
	// 		...otherBankData,
	// 		...privateEquityBankData,
	// 		...realEstateBankData,
	// 	].reduce<Array<TCurrencyAnalytics>>((acc, asset,) => {
	// 		if (!asset) {
	// 			return acc
	// 		}
	// 		const {
	// 			currency,
	// 			currencyValue,
	// 			usdValue,
	// 		} = asset
	// 		const existing = acc.find((item,) => {
	// 			return item.currency === currency
	// 		},)
	// 		if (existing) {
	// 			existing.usdValue = parseFloat((existing.usdValue + usdValue).toFixed(2,),)
	// 			existing.currencyValue = parseFloat((existing.currencyValue + currencyValue).toFixed(2,),)
	// 		} else {
	// 			acc.push({
	// 				usdValue:      parseFloat(usdValue.toFixed(2,),),
	// 				currencyValue: parseFloat(currencyValue?.toFixed(2,),),
	// 				currency,
	// 			},)
	// 		}
	// 		return acc
	// 	}, [],)
	// 		.filter((asset,) => {
	// 			return asset.currencyValue !== 0
	// 		},)
	// 	return result
	// }

	/**
	 * CR-125
	 * Checks the availability of various analytics sections for the given filter and client.
	 * @remarks
	 * This method determines which analytics sections are available based on the assets and transactions filtered by the provided criteria.
	 * It checks for the presence of different asset types and transactions to determine the availability of sections like overview, cash, deposit, bonds, options, loan, equities, metals, private equity, crypto, real estate, other investments, and transactions.
	 * @param clientId - Optional client ID to filter assets and transactions.
	 * @returns A promise resolving to an object indicating which analytics sections are available.
	 */
	public async availabilityCheck(filter: OverviewFilterDto, clientId?: string,): Promise<IAnalyticsAvailability> {
		const now = new Date()
		const targetDate = filter.date ?
			new Date(filter.date,) :
			new Date()
		targetDate?.setUTCHours(0, 0, 59, 0,)
		const dateResult = targetDate?.toISOString()
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
			transactions,
		] = await Promise.all([
			this.prismaService.assetBondGroup.findFirst({
				where: {
					assetName:   {in: filter.assetNames,},
					clientId:    {in: filter.clientIds,},
					portfolioId:  { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds,},
					bankId:      {in: filter.bankIds,},
					...(clientId ?
						{
							client: {
								id: clientId,
							},
						} :
						{}),
					bank: {
						is: {
							bankListId: {in: filter.bankListIds,},
						},
					},
					portfolio: {
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
						{ maturityDate: { gte: targetDate, }, },
					],
					transferDate: null,
				},
				select: {
					bonds: {
						where: {
							...(filter.date && {
								valueDate: {
									lte: endOfDay(new Date(filter.date,),),
								},
							}),
						},
						select: {
							marketValueUSD:      true,
							assetName:          true,
							marketValueFC:      true,
							currency:           true,
							units:          true,
							marketPrice:    true,
							isin:           true,
							operation:      true,
						},
					},
					marketValueUSD:      true,
					assetName:          true,
					marketValueFC:      true,
					currency:           true,
					totalUnits:         true,
					marketPrice:    true,
					isin:           true,
					bank:               {
						include: {
							bankList: true,
						},
					},
					account: {
						select: {
							id:          true,
							accountName: true,
						},
					},
					entity: {
						select: {
							id:   true,
							name: true,
						},
					},
					portfolio: {
						select: {
							id:   true,
							name: true,
						},
					},
				},
			},),
			this.prismaService.assetCryptoGroup.findFirst({
				where: {
					assetName:   {in: filter.assetNames,},
					clientId:    { in: clientId ?
						[clientId,] :
						filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds, },
					bankId:      {in: filter.bankIds,},
					bank:        {
						is: {
							bankListId: { in: filter.bankListIds, },
						},
					},
					portfolio: {
						isActivated: true,
					},
					transferDate: null,
				},
				select: {
					cryptos: {
						select: {
							marketValueUSD:      true,
							assetName:          true,
							marketValueFC:      true,
							currency:           true,
							cryptoCurrencyType:      true,
							units:              true,
							productType:        true,
							cryptoAmount:       true,
							type:               true,
							isin:               true,
							operation:          true,
							id:                 true,
						},
					},
					marketValueUSD:      true,
					assetName:          true,
					marketValueFC:      true,
					currency:           true,
					cryptoCurrencyType:      true,
					totalUnits:         true,
					productType:        true,
					cryptoAmount:       true,
					type:               true,
					isin:               true,
					bank:               {
						include: {
							bankList: true,
						},
					},
					account: {
						select: {
							id:          true,
							accountName: true,
						},
					},
					entity: {
						select: {
							id:   true,
							name: true,
						},
					},
					portfolio: {
						select: {
							id:   true,
							name: true,
						},
					},
				},
			},),
			this.prismaService.assetEquityGroup.findFirst({
				where: {
					assetName:   {in: filter.assetNames,},
					clientId:    {in: filter.clientIds,},
					portfolioId:  { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds,},
					bankId:      {in: filter.bankIds,},
					...(clientId ?
						{
							client: {
								id: clientId,
							},
						} :
						{}),
					bank: {
						is: {
							bankListId: {in: filter.bankListIds,},
						},
					},
					portfolio: {
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
					equities: {
						where: {
							...(filter.date && {
								transactionDate: {
									lte: endOfDay(new Date(filter.date,),),
								},
							}),
						},
						select: {
							marketValueUSD:      true,
							assetName:          true,
							marketValueFC:      true,
							currency:           true,
							units:          true,
							type:           true,
							isin:           true,
							operation:      true,
						},
					},
					marketValueUSD:      true,
					assetName:          true,
					marketValueFC:      true,
					currency:           true,
					totalUnits:         true,
					type:           true,
					isin:           true,
					bank:               {
						include: {
							bankList: true,
						},
					},
					account: {
						select: {
							id:          true,
							accountName: true,
						},
					},
					entity: {
						select: {
							id:   true,
							name: true,
						},
					},
					portfolio: {
						select: {
							id:   true,
							name: true,
						},
					},
				},
			},),
			this.prismaService.assetMetalGroup.findFirst({
				where: {
					assetName:   {in: filter.assetNames,},
					clientId:    { in: clientId ?
						[clientId,] :
						filter.clientIds, },
					portfolioId: { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds, },
					bankId:      {in: filter.bankIds,},
					bank:        {
						is: {
							bankListId: { in: filter.bankListIds, },
						},
					},
					portfolio: {
						isActivated: true,
					},
					totalUnits: {
						gt: 0,
					},
					transferDate: null,
				},
				select: {
					metals: {
						where: {
							...(filter.date && {
								transactionDate: {
									lte: endOfDay(new Date(filter.date,),),
								},
							}),
						},
						select: {
							marketValueUSD:      true,
							assetName:      true,
							marketValueFC:  true,
							currency:       true,
							metalType:      true,
							units:          true,
							productType:    true,
							type:               true,
							isin:               true,
							operation:      true,

						},
					},
					marketValueUSD:      true,
					assetName:      true,
					marketValueFC:  true,
					currency:       true,
					metalType:      true,
					totalUnits:          true,
					productType:    true,
					type:               true,
					isin:               true,
					bank:           {
						include: {
							bankList: true,
						},
					},
					account: {
						select: {
							id:          true,
							accountName: true,
						},
					},
					entity: {
						select: {
							id:   true,
							name: true,
						},
					},
					portfolio: {
						select: {
							id:   true,
							name: true,
						},
					},
				},
			},),
			this.prismaService.assetDeposit.findFirst({
				where: {
					assetName:   {in: filter.assetNames,},
					clientId:    {in: filter.clientIds,},
					portfolioId:  { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds,},
					bankId:      {in: filter.bankIds,},
					...(clientId ?
						{
							client: {
								id: clientId,
							},
						} :
						{}),
					bank: {
						is: {
							bankListId: {in: filter.bankListIds,},
						},
					},
					portfolio: {
						isActivated: true,
					},
					usdValue: {
						not: 0,
					},
					AND: [
						filter.date ?
							{ OR: [
								{ maturityDate: { gt: new Date(filter.date,), }, },
								{ maturityDate: null, },
							], } :
							{},
						filter.date ?
							{} :
							{OR: [
								{ maturityDate: { gt: now, }, },
								{ maturityDate: null, },
							], },
						filter.date ?
							{ startDate: { lte: endOfDay(new Date(filter.date,),), }, } :
							{},
					],
					transferDate: null,

				},
				select: {
					usdValue:      true,
					assetName:      true,
					currencyValue:  true,
					currency:       true,
					bank:           {
						include: {
							bankList: true,
						},
					},
					account: {
						select: {
							id:          true,
							accountName: true,
						},
					},
					entity: {
						select: {
							id:   true,
							name: true,
						},
					},
					portfolio: {
						select: {
							id:   true,
							name: true,
						},
					},
				},
			},),
			this.prismaService.assetLoan.findFirst({
				where: {
					assetName:   {in: filter.assetNames,},
					clientId:    {in: filter.clientIds,},
					portfolioId:  { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds,},
					bankId:      {in: filter.bankIds,},
					...(clientId ?
						{
							client: {
								id: clientId,
							},
						} :
						{}),
					bank: {
						is: {
							bankListId: {in: filter.bankListIds,},
						},
					},
					portfolio: {
						isActivated: true,
					},
					usdValue: {
						not: 0,
					},
					AND: [
						{ maturityDate: { gt: now, }, },
						filter.date ?
							{ startDate: { lte: endOfDay(new Date(filter.date,),), }, } :
							{},
						filter.date ?
							{ maturityDate: { gt: new Date(filter.date,), }, } :
							{},
					],
					transferDate: null,

				},
				select: {
					marketValueUSD: true,
					assetName:      true,
					currencyValue:  true,
					currency:       true,
					usdValue:       true,
					bank:           {
						include: {
							bankList: true,
						},
					},
					account: {
						select: {
							id:          true,
							accountName: true,
						},
					},
					entity: {
						select: {
							id:   true,
							name: true,
						},
					},
					portfolio: {
						select: {
							id:   true,
							name: true,
						},
					},
				},
			},),
			this.prismaService.assetOption.findFirst({
				where: {
					assetName:   {in: filter.assetNames,},
					clientId:    {in: filter.clientIds,},
					portfolioId:  { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds,},
					bankId:      {in: filter.bankIds,},
					...(clientId ?
						{
							client: {
								id: clientId,
							},
						} :
						{}),
					bank: {
						is: {
							bankListId: {in: filter.bankListIds,},
						},
					},
					portfolio: {
						isActivated: true,
					},
					marketValueUSD: {
						not: 0,
					},
					AND:      [
						{ maturityDate: { gt: new Date(), }, },
						filter.date ?
							{ startDate: { lte: endOfDay(new Date(filter.date,),), }, } :
							{},
						filter.date ?
							{ maturityDate: { gt: new Date(filter.date,), }, } :
							{},
					],
					transferDate: null,

				},
				select: {
					marketValueUSD:     true,
					assetName:          true,
					currentMarketValue:  true,
					currency:           true,
					bank:               {
						include: {
							bankList: true,
						},
					},
					account: {
						select: {
							id:          true,
							accountName: true,
						},
					},
					entity: {
						select: {
							id:   true,
							name: true,
						},
					},
					portfolio: {
						select: {
							id:   true,
							name: true,
						},
					},
				},
			},),
			this.prismaService.assetOtherInvestment.findFirst({
				where: {
					assetName:   {in: filter.assetNames,},
					clientId:    {in: filter.clientIds,},
					portfolioId:  { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds,},
					bankId:      {in: filter.bankIds,},
					...(clientId ?
						{
							client: {
								id: clientId,
							},
						} :
						{}),
					bank: {
						is: {
							bankListId: {in: filter.bankListIds,},
						},
					},
					portfolio: {
						isActivated: true,
					},
					usdValue: {
						not: 0,
					},
					AND: [
						filter.date ?
							{
								investmentDate: {
									lte: endOfDay(new Date(filter.date,),),
								},
							} :
							{},
					],
					transferDate: null,

				},
				select: {
					marketValueUSD: true,
					assetName:      true,
					currencyValue:  true,
					currency:       true,
					bank:           {
						include: {
							bankList: true,
						},
					},
					account: {
						select: {
							id:          true,
							accountName: true,
						},
					},
					entity: {
						select: {
							id:   true,
							name: true,
						},
					},
					portfolio: {
						select: {
							id:   true,
							name: true,
						},
					},
				},
			},),
			this.prismaService.assetPrivateEquity.findFirst({
				where: {
					assetName:   {in: filter.assetNames,},
					clientId:    {in: filter.clientIds,},
					portfolioId:  { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds,},
					bankId:      {in: filter.bankIds,},
					...(clientId ?
						{
							client: {
								id: clientId,
							},
						} :
						{}),
					bank: {
						is: {
							bankListId: {in: filter.bankListIds,},
						},
					},
					portfolio: {
						isActivated: true,
					},
					marketValueUSD: {
						not: 0,
					},
					AND: [
						filter.date ?
							{
								entryDate: {
									lte: endOfDay(new Date(filter.date,),),
								},
							} :
							{},
					],
					transferDate: null,

				},
				select: {
					marketValueUSD: true,
					assetName:      true,
					currencyValue:  true,
					currency:       true,
					bank:           {
						include: {
							bankList: true,
						},
					},
					account: {
						select: {
							id:          true,
							accountName: true,
						},
					},
					entity: {
						select: {
							id:   true,
							name: true,
						},
					},
					portfolio: {
						select: {
							id:   true,
							name: true,
						},
					},
				},
			},),
			this.prismaService.assetRealEstate.findFirst({
				where: {
					assetName:   {in: filter.assetNames,},
					clientId:    {in: filter.clientIds,},
					portfolioId:  { in: filter.portfolioIds, },
					entityId:    { in: filter.entityIds, },
					accountId:   { in: filter.accountIds,},
					bankId:      {in: filter.bankIds,},
					...(clientId ?
						{
							client: {
								id: clientId,
							},
						} :
						{}),
					bank: {
						is: {
							bankListId: {in: filter.bankListIds,},
						},
					},
					portfolio: {
						isActivated: true,
					},
					usdValue: {
						not: 0,
					},
					AND: [
						filter.date ?
							{
								investmentDate: {
									lte: endOfDay(new Date(filter.date,),),
								},
							} :
							{},
					],
					transferDate: null,

				},
				select: {
					marketValueUSD: true,
					assetName:      true,
					currencyValue:  true,
					currency:       true,
					bank:           {
						include: {
							bankList: true,
						},
					},
					account: {
						select: {
							id:          true,
							accountName: true,
						},
					},
					entity: {
						select: {
							id:   true,
							name: true,
						},
					},
					portfolio: {
						select: {
							id:   true,
							name: true,
						},
					},
				},
			},),
			this.prismaService.transaction.findFirst({
				where: {
					clientId: {
						in: clientId ?
							[clientId,] :
							filter.clientIds,
					},
					portfolioId: {
						in: filter.portfolioIds,
					},
					entityId: {
						in: filter.entityIds,
					},
					bankId: {
						in: filter.bankIds,
					},
					bank: {
						is: {
							bankListId: { in: filter.bankListIds, },
						},
					},
					portfolio: {
						isActivated: true,
					},
					accountId: {
						in: filter.accountIds,
					},
					currency: {
						in: filter.currencies,
					},
					transactionDate: filter.date &&
					{
						lte: dateResult,
					},
				},
				select: {
					amount:   true,
					currency: true,
					bank:      { include: { bankList: true, }, },
					account:  {
						select: {
							id:          true,
							accountName: true,
						},
					},
					entity:   {
						select: {
							id:   true,
							name: true,
						},
					},
					portfolio: {
						select: {
							id:   true,
							name: true,
						},
					},
				},
			},),
		],)
		return {
			hasCash:    Boolean(transactions,),
			hasEquity:  Boolean(equityAssets,),
			hasMetal:   Boolean(metalAssets,),
			hasCrypto:  Boolean(cryptoAssets,),
			hasDeposit: Boolean(depositAssets,),
			hasLoan:    Boolean(loanAssets,),
			hasBond:    Boolean(bondAssets,),
			hasOption:  Boolean(optionAssets,),
			hasOther:   Boolean(otherAssets,),
			hasPE:      Boolean(peAssets,),
			hasRE:      Boolean(reAssets,),
		}
		// const log = this.getTimestampLogger()
		// log('availabilityCheck', 'Start')
		// const [{
		// 	bondAssets,
		// 	equityAssets,
		// 	metalAssets,
		// 	cryptoAssets,
		// 	depositAssets,
		// 	loanAssets,
		// 	optionAssets,
		// 	otherAssets,
		// 	peAssets,
		// 	reAssets,
		// },	transactions,] = await Promise.all([
		// 	this.getFilteredRefactoredAssets(filter, clientId,),
		// 	this.getFilteredTransactions(filter, clientId,),
		// ],)
		// log('availabilityCheck', 'End')
		// return {
		// 	hasCash:    Boolean(transactions.length,),
		// 	hasEquity:  Boolean(equityAssets.length,),
		// 	hasMetal:   Boolean(metalAssets.length,),
		// 	hasCrypto:  Boolean(cryptoAssets.length,),
		// 	hasDeposit: Boolean(depositAssets.length,),
		// 	hasLoan:    Boolean(loanAssets.length,),
		// 	hasBond:    Boolean(bondAssets.length,),
		// 	hasOption:  Boolean(optionAssets.length,),
		// 	hasOther:   Boolean(otherAssets.length,),
		// 	hasPE:      Boolean(peAssets.length,),
		// 	hasRE:      Boolean(reAssets.length,),
		// }
	}

	/**
 		* Parses and filters client assets by availability filter.
 		*
 		* @remarks
 		* Used inside `availabilityCheck` to apply all filters from `OverviewAvailabilityFilterDto`
 		* and return only the assets that match all conditions.
 		* Skips assets that do not match currencies, types, locations, operations, or metadata fields.
 		*
 		* @param filter - Filter DTO with optional criteria like currency, isin, city, operation, etc.
 		* @param clientId - Optional client ID to fetch client-specific assets.
 		* @returns Filtered array of parsed assets.
 	*/
	private async parseAndFilterAvailabilityAssets<T extends UnionAssetType = UnionAssetType>(filter: OverviewAvailabilityFilterDto, clientId?: string,): Promise<Array<T>> {
		const assets = await this.getFilteredAssets(filter, clientId,)

		const parsedAssets = assets
			.map((asset,) => {
				const parsedAsset = assetParser<T>(asset,)

				if (!parsedAsset) {
					return null
				}

				if (
					filter.currencies &&
					'cryptoCurrencyType' in parsedAsset &&
					parsedAsset.cryptoCurrencyType &&
					!filter.currencies.includes(parsedAsset.cryptoCurrencyType,
					)) {
					return null
				}

				if (
					filter.currencies &&
					'currency' in parsedAsset &&
					parsedAsset.currency &&
					!filter.currencies.includes(parsedAsset.currency,
					)) {
					return null
				}

				if (
					(filter.isins &&
					'isin' in parsedAsset &&
					parsedAsset.isin &&
					!filter.isins.includes(parsedAsset.isin,)) ||
					(filter.isins && !('isin' in parsedAsset))) {
					return null
				}

				if (
					(filter.wallets &&
					'exchangeWallet' in parsedAsset &&
					parsedAsset.exchangeWallet &&
					!filter.wallets.includes(parsedAsset.exchangeWallet,)) ||
					(filter.wallets && !('exchangeWallet' in parsedAsset))) {
					return null
				}

				if (
					(filter.tradeOperation &&
					'operation' in parsedAsset &&
					!(filter.tradeOperation === parsedAsset.operation)) ||
					(filter.tradeOperation && !('operation' in parsedAsset))) {
					return null
				}

				if (
					(filter.serviceProviders &&
					'serviceProvider' in parsedAsset &&
					!filter.serviceProviders.includes(parsedAsset.serviceProvider,)) ||
					(filter.serviceProviders && !('serviceProvider' in parsedAsset))) {
					return null
				}

				if (
					(filter.securities &&
					'security' in parsedAsset &&
					parsedAsset.security &&
					!filter.securities.includes(parsedAsset.security,)) ||
					(filter.securities && !('security' in parsedAsset))) {
					return null
				}

				if (
					(filter.pairs &&
					'pairAssetCurrency' in parsedAsset &&
					!filter.pairs.includes(parsedAsset.pairAssetCurrency,)) ||
					(filter.pairs && !('pairAssetCurrency' in parsedAsset))) {
					return null
				}

				if (
					(filter.operations &&
					'operation' in parsedAsset &&
					parsedAsset.operation &&
					!filter.operations.includes(parsedAsset.operation,)) ||
					(filter.operations && !('operation' in parsedAsset))) {
					return null
				}
				if (
					(filter.metals &&
					'metalType' in parsedAsset &&
					parsedAsset.metalType !== undefined &&
					!filter.metals.includes(parsedAsset.metalType,)) ||
					(filter.metals && !('metalType' in parsedAsset))) {
					return null
				}

				if (
					(filter.loanNames &&
					'loanName' in parsedAsset &&
					!filter.loanNames.includes(parsedAsset.loanName,)) ||
					(filter.loanNames && !('loanName' in parsedAsset))) {
					return null
				}

				if (
					(filter.investmentAssetNames &&
					'investmentAssetName' in parsedAsset &&
					!filter.investmentAssetNames.includes(parsedAsset.investmentAssetName,)) ||
					(filter.investmentAssetNames && !('investmentAssetName' in parsedAsset))) {
					return null
				}

				if (
					(filter.fundTypes &&
					'fundType' in parsedAsset &&
					!filter.fundTypes.includes(parsedAsset.fundType,)) ||
					(filter.fundTypes && !('fundType' in parsedAsset))) {
					return null
				}

				if (
					(filter.fundNames &&
					'fundName' in parsedAsset &&
					!filter.fundNames.includes(parsedAsset.fundName,)) ||
					(filter.fundNames && !('fundName' in parsedAsset))) {
					return null
				}

				if (
					(filter.equityTypes &&
					'equityType' in parsedAsset &&
					parsedAsset.equityType &&
					!filter.equityTypes.includes(parsedAsset.equityType,)) ||
					(filter.equityTypes && !('equityType' in parsedAsset))) {
					return null
				}
				if (
					((filter.cryptoTypes &&
					'cryptoCurrencyType' in parsedAsset &&
					parsedAsset.cryptoCurrencyType &&
					!filter.cryptoTypes.includes(parsedAsset.cryptoCurrencyType,))) ||
					(filter.cryptoTypes && !('cryptoCurrencyType' in parsedAsset))) {
					return null
				}
				if (
					((filter.productTypes &&
					'productType' in parsedAsset &&
					parsedAsset.productType &&
					!filter.productTypes.includes(parsedAsset.productType as string,))) ||
					(filter.productTypes && !('productType' in parsedAsset))) {
					return null
				}

				if (
					(filter.cities &&
					'city' in parsedAsset &&
					!filter.cities.includes(parsedAsset.city,)) ||
					(filter.cities && !('city' in parsedAsset))) {
					return null
				}

				if (
					(filter.countries &&
					'country' in parsedAsset &&
					!filter.countries.includes(parsedAsset.country,)) ||
					(filter.countries && !('country' in parsedAsset))) {
					return null
				}

				if (
					(filter.projectTransactions &&
					'projectTransaction' in parsedAsset &&
					!filter.projectTransactions.includes(parsedAsset.projectTransaction,)) ||
					(filter.projectTransactions && !('projectTransaction' in parsedAsset))) {
					return null
				}
				return parsedAsset
			},)
			.filter((item,): item is T => {
				return item !== null
			},)

		return parsedAssets
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	// Old Version
	public syncGetBankAnalytics2(data: Partial<IInitialThirdPartyList>, filter: OverviewFilterDto, clientId?: string,): Array<TBankAnalytics> {
		const {assets = [], transactions = [], currencyList = [], cryptoList = [], cBonds = [], metalList = [],} = data
		const totalCurrencyValuesByCurrency = transactions
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.reduce<Record<string, number>>(
				(acc, transaction,) => {
					const curr = transaction.currency
					acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
					return acc
				},
				{},
			)
		const filteredTransactions = transactions.filter((transaction,) => {
			return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
		},)
		const filteredAssets = assets.filter((asset,) => {
			return clientId ?
				asset.clientId === clientId :
				true
		},)
		const cashAssets = filteredAssets.filter((asset,): asset is ICashAsset => {
			return asset.assetName === AssetNamesType.CASH
		},)
		const cashBankData = cashAssets
			.map((asset,) => {
				if (!asset.bank || !asset.account) {
					return null
				}
				const { currency, bank, account,} = asset
				const transactionSumByCurrency = filteredTransactions.reduce((acc, transaction,) => {
					if (transaction.currency === currency && transaction.bankId === bank.id && transaction.accountId === account.id) {
						return acc + Number(transaction.amount,)
					}
					return acc
				}, 0,)
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: transactionSumByCurrency,
					currencyList,
					historyDate:   filter.date,
				},)
				return {
					id:          bank.bankListId,
					bankName:    bank.bankList?.name ?? bank.bankName,
					accountName: account.accountName,
					accountId:   account.id,
					usdValue,

				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const bondsAssets = filteredAssets.filter((asset,): asset is IBondsAsset => {
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
				const { isin, units, operation, valueDate, currency,} = asset
				const {bondsEmissions, bondsTradings,} = cBondParser(cBonds,)
				const bondEmissions = bondsEmissions.find((bond,) => {
					return bond.isin === isin
				},)
				const bondTradings = bondsTradings.find((bond,) => {
					return bond.isin === isin
				},)
				if (!bondEmissions || !bondTradings) {
					return null
				}
				if (bondEmissions.maturityDate && (new Date(bondEmissions.maturityDate,) < new Date())) {
					return null
				}
				if (valueDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(valueDate,)) {
					return null
				}
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const usdValue = this.cBondsCurrencyService.getBondsMarketValueUSD({
					isin,
					units:              Number(units,),
					dirtyPriceCurrency: bondTradings.dirtyPriceCurrency,
					nominalPrice:       bondEmissions.nominalPrice,
					rate,
					marketPrice:        bondTradings.marketPrice,
				},)
				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue:    operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const depositsAssets = filteredAssets.filter((asset,): asset is IDepositAsset => {
			return asset.assetName === AssetNamesType.CASH_DEPOSIT
		},)
		const depositsBankData = depositsAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, maturityDate, startDate, currency,} = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				if (maturityDate && new Date(maturityDate,) < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)
				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const collateralAssets = filteredAssets.filter((asset,): asset is ICollateralAsset => {
			return asset.assetName === AssetNamesType.COLLATERAL
		},)
		const collateralBankData = collateralAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, currency, } = asset
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)
				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const cryptoAssets = filteredAssets.filter((asset,): asset is ICryptoAsset => {
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
		const cryptoETFData = filteredCryptoEtfAssets
			.map((asset,) => {
				const { isin, units, operation, currency, transactionDate, } = asset
				if (!asset.bank || !currency || !isin) {
					return null
				}
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				const { parsedCBonds, parsedETFBonds, parsedEquityTradingGrounds, parsedEtfTradingGrounds, } = cEquityParser(cBonds,)
				const currencyId = this.cBondsCurrencyService.getCurrencyId(currency, currencyList,)
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const usdValue = this.cBondsCurrencyService.getEquitiesMarketValueInCurrency({
					isin,
					units:             Number(units,),
					stockGrounds:      parsedEquityTradingGrounds,
					etfTradingGrounds: parsedEtfTradingGrounds,
					cbondList:         [...parsedCBonds, ...parsedETFBonds,],
					rate,
					currencyId,
				},)

				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue:    operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)
		const cryptoDirectData = cryptoDirectAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { cryptoCurrencyType, cryptoAmount, purchaseDate, productType,}  = asset
				if (productType === CryptoType.DIRECT_HOLD) {
					if (purchaseDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(purchaseDate,)) {
						return null
					}
					const usdValue = cryptoCurrencyType && cryptoAmount ?
						this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
							token: cryptoCurrencyType,
							cryptoAmount,
						}, cryptoList,) :
						0

					return {
						id:          asset.bank.bankListId,
						bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
						accountName: asset.account?.accountName,
						accountId:   asset.account?.id,
						usdValue,
					} as TBankAnalytics
				}
				return null
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const equityAssets = filteredAssets.filter((asset,): asset is IEquityAsset => {
			return asset.assetName === AssetNamesType.EQUITY_ASSET
		},)
		const aggregatedEquityAssets = equityAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IEquityAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

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
				if (!asset.bank) {
					return null
				}
				const { isin, units, operation, currency, transactionDate, } = asset
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				const { parsedCBonds, parsedETFBonds, parsedEquityTradingGrounds, parsedEtfTradingGrounds, } = cEquityParser(cBonds,)
				const currencyId = this.cBondsCurrencyService.getCurrencyId(currency, currencyList,)
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const usdValue = this.cBondsCurrencyService.getEquitiesMarketValueInCurrency({
					isin,
					units:             Number(units,),
					stockGrounds:      parsedEquityTradingGrounds,
					etfTradingGrounds: parsedEtfTradingGrounds,
					cbondList:         [...parsedCBonds, ...parsedETFBonds,],
					rate,
					currencyId,
				},)

				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue:    operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const loanAssets = filteredAssets.filter((asset,): asset is ILoanAsset => {
			return asset.assetName === AssetNamesType.LOAN
		},)
		const loanBankData = loanAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, maturityDate, startDate, currency, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const metalAssets = filteredAssets.filter((asset,): asset is IMetalsAsset => {
			return asset.assetName === AssetNamesType.METALS
		},)
		const aggregatedMetalAssets = metalAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, units, operation, portfolioId, metalType, } = asset

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
				const { units, operation, transactionDate, metalType, } = asset
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				if (!metalType) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
					metalList,
					metalType,
					units,
					historyDate: filter.date,
				},)
				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue:    operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const optionsAssets = filteredAssets.filter((asset,): asset is IOptionAsset => {
			return asset.assetName === AssetNamesType.OPTIONS
		},)
		const optionsBankData = optionsAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { maturityDate, startDate, currency, currentMarketValue, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: currentMarketValue,
					currencyList,
					historyDate:   filter.date,
				},)

				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const otherAssets = filteredAssets.filter((asset,): asset is IOtherAsset => {
			return asset.assetName === AssetNamesType.OTHER
		},)
		const otherBankData = otherAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, investmentDate, currency, } = asset
				if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const privateEquityAssets = filteredAssets.filter((asset,): asset is IPrivateAsset => {
			return asset.assetName === AssetNamesType.PRIVATE_EQUITY
		},)
		const privateEquityBankData = privateEquityAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, entryDate, currency, } = asset
				if (entryDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(entryDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const realEstateAssets = filteredAssets.filter((asset,): asset is IRealEstateAsset => {
			return asset.assetName === AssetNamesType.REAL_ESTATE
		},)
		const realEstateBankData = realEstateAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, investmentDate, currency, } = asset
				if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)
		return [
			...cashBankData,
			...bondsBankData,
			...depositsBankData,
			...collateralBankData,
			...cryptoETFData,
			...cryptoDirectData,
			...equityBankData,
			...loanBankData,
			...metalsBankData,
			...optionsBankData,
			...otherBankData,
			...privateEquityBankData,
			...realEstateBankData,
		].reduce<Array<TBankAnalytics>>((acc, asset,) => {
			const {
				bankName,
				id,
				usdValue,
				accountName,
				accountId,
			} = asset
			const existing = acc.find((item,) => {
				return item.accountId === accountId
			},)
			if (existing) {
				existing.usdValue = existing.usdValue + usdValue
			} else {
				acc.push({
					id,
					bankName,
					usdValue,
					accountName: accountName ?
						this.cryptoService.decryptString(accountName,) :
						undefined,
					accountId,
				},)
			}
			return acc
		}, [],)
	}

	// New Version
	public syncGetBankAnalytics(data: TOverviewInitials, filter: OverviewFilterDto, clientId?: string,): Array<TBankAnalytics> {
		const {assets, transactions, currencyList, cryptoList, bonds, equities, etfs, metalList,} = data
		const totalCurrencyValuesByCurrency = transactions
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.reduce<Record<string, number>>(
				(acc, transaction,) => {
					const curr = transaction.currency
					acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
					return acc
				},
				{},
			)
		const filteredTransactions = transactions.filter((transaction,) => {
			return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
		},)
		const filteredAssets = assets.filter((asset,) => {
			return clientId ?
				asset.clientId === clientId :
				true
		},)
		const cashAssets = filteredAssets.filter((asset,): asset is ICashAsset => {
			return asset.assetName === AssetNamesType.CASH
		},)
		const cashBankData = cashAssets
			.map((asset,) => {
				if (!asset.bank || !asset.account) {
					return null
				}
				const { currency, bank, account,} = asset
				const transactionSumByCurrency = filteredTransactions.reduce((acc, transaction,) => {
					if (transaction.currency === currency && transaction.bankId === bank.id && transaction.accountId === account.id) {
						return acc + Number(transaction.amount,)
					}
					return acc
				}, 0,)
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: transactionSumByCurrency,
					currencyList,
					historyDate:   filter.date,
				},)
				return {
					id:          bank.bankListId,
					bankName:    bank.bankList?.name ?? bank.bankName,
					accountName: account.accountName,
					accountId:   account.id,
					usdValue,

				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const bondsAssets = filteredAssets.filter((asset,): asset is IBondsAsset => {
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
				const { isin, units, operation, valueDate, currency,} = asset
				const bond = bonds.find((bond,) => {
					return bond.isin === isin
				},)
				if (!bond) {
					return null
				}
				if (bond.maturityDate && (new Date(bond.maturityDate,) < new Date())) {
					return null
				}
				if (valueDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(valueDate,)) {
					return null
				}
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const usdValue = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
					isin,
					units:              Number(units,),
					dirtyPriceCurrency: bond.dirtyPriceCurrency,
					nominalPrice:       bond.nominalPrice,
					rate,
					marketPrice:        bond.marketPrice,
				},)
				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue:    operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const depositsAssets = filteredAssets.filter((asset,): asset is IDepositAsset => {
			return asset.assetName === AssetNamesType.CASH_DEPOSIT
		},)
		const depositsBankData = depositsAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, maturityDate, startDate, currency,} = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				if (maturityDate && new Date(maturityDate,) < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)
				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const collateralAssets = filteredAssets.filter((asset,): asset is ICollateralAsset => {
			return asset.assetName === AssetNamesType.COLLATERAL
		},)
		const collateralBankData = collateralAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, currency, } = asset
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)
				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const cryptoAssets = filteredAssets.filter((asset,): asset is ICryptoAsset => {
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
		const cryptoETFData = filteredCryptoEtfAssets
			.map((asset,) => {
				const { isin, units, operation, currency, transactionDate, } = asset
				if (!asset.bank || !currency || !isin) {
					return null
				}
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				const equityAsset = equities.find((equity,) => {
					return equity.isin === isin
				},) ?? etfs.find((etf,) => {
					return etf.isin === isin
				},) ?? null
				if (!equityAsset || !units) {
					return null
				}
				const currencyId = this.cBondsCurrencyService.getCurrencyId(currency, currencyList,)
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				const usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)

				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue:    operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)
		const cryptoDirectData = cryptoDirectAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { cryptoCurrencyType, cryptoAmount, purchaseDate, productType,}  = asset
				if (productType === CryptoType.DIRECT_HOLD) {
					if (purchaseDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(purchaseDate,)) {
						return null
					}
					const usdValue = cryptoCurrencyType && cryptoAmount ?
						this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
							token: cryptoCurrencyType,
							cryptoAmount,
						}, cryptoList,) :
						0

					return {
						id:          asset.bank.bankListId,
						bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
						accountName: asset.account?.accountName,
						accountId:   asset.account?.id,
						usdValue,
					} as TBankAnalytics
				}
				return null
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const equityAssets = filteredAssets.filter((asset,): asset is IEquityAsset => {
			return asset.assetName === AssetNamesType.EQUITY_ASSET
		},)
		const aggregatedEquityAssets = equityAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IEquityAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

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
				if (!asset.bank) {
					return null
				}
				const { isin, units, operation, currency, transactionDate, } = asset
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
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
				const currencyId = this.cBondsCurrencyService.getCurrencyId(currency, currencyList,)
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				const usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)

				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue:    operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const loanAssets = filteredAssets.filter((asset,): asset is ILoanAsset => {
			return asset.assetName === AssetNamesType.LOAN
		},)
		const loanBankData = loanAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, maturityDate, startDate, currency, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const metalAssets = filteredAssets.filter((asset,): asset is IMetalsAsset => {
			return asset.assetName === AssetNamesType.METALS
		},)
		const metalETFAssets = metalAssets.filter(
			(item,): item is NonNullable<typeof item> => {
				return item.productType === MetalType.ETF
			},
		)
		const metalDirectAssets = metalAssets.filter(
			(item,): item is NonNullable<typeof item> => {
				return item.productType === MetalType.DIRECT_HOLD
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
				const { isin, units, operation, currency, transactionDate, } = asset
				if (!asset.bank || !currency || !isin || !units) {
					return null
				}
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
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

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				const usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)

				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue:    operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)
		const aggregatedMetalAssets = metalDirectAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, units, operation, portfolioId, metalType, } = asset

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
				const { units, operation, transactionDate, metalType, } = asset
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				if (!metalType) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
					metalList,
					metalType,
					units,
					historyDate: filter.date,
				},)
				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue:    operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const optionsAssets = filteredAssets.filter((asset,): asset is IOptionAsset => {
			return asset.assetName === AssetNamesType.OPTIONS
		},)
		const optionsBankData = optionsAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { maturityDate, startDate, currency, currentMarketValue, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: currentMarketValue,
					currencyList,
					historyDate:   filter.date,
				},)

				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const otherAssets = filteredAssets.filter((asset,): asset is IOtherAsset => {
			return asset.assetName === AssetNamesType.OTHER
		},)
		const otherBankData = otherAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, investmentDate, currency, } = asset
				if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const privateEquityAssets = filteredAssets.filter((asset,): asset is IPrivateAsset => {
			return asset.assetName === AssetNamesType.PRIVATE_EQUITY
		},)
		const privateEquityBankData = privateEquityAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, entryDate, currency, } = asset
				if (entryDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(entryDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)

		const realEstateAssets = filteredAssets.filter((asset,): asset is IRealEstateAsset => {
			return asset.assetName === AssetNamesType.REAL_ESTATE
		},)
		const realEstateBankData = realEstateAssets
			.map((asset,) => {
				if (!asset.bank) {
					return null
				}
				const { currencyValue, investmentDate, currency, } = asset
				if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:          asset.bank.bankListId,
					bankName:    asset.bank.bankList?.name ?? asset.bank.bankName,
					accountName: asset.account?.accountName,
					accountId:   asset.account?.id,
					usdValue,
				} as TBankAnalytics
			},)
			.filter((item,): item is TBankAnalytics => {
				return item !== null
			},)
		return [
			...cashBankData,
			...bondsBankData,
			...depositsBankData,
			...collateralBankData,
			...cryptoETFData,
			...cryptoDirectData,
			...equityBankData,
			...loanBankData,
			...metalsBankData,
			...metalETFData,
			...optionsBankData,
			...otherBankData,
			...privateEquityBankData,
			...realEstateBankData,
		].reduce<Array<TBankAnalytics>>((acc, asset,) => {
			const {
				bankName,
				id,
				usdValue,
				accountName,
				accountId,
			} = asset
			const existing = acc.find((item,) => {
				return item.accountId === accountId
			},)
			if (existing) {
				existing.usdValue = existing.usdValue + usdValue
			} else {
				acc.push({
					id,
					bankName,
					usdValue,
					accountName: accountName ?
						this.cryptoService.decryptString(accountName,) :
						undefined,
					accountId,
				},)
			}
			return acc
		}, [],)
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	// Old Version
	public syncGetAssetAnalytics2(data: IInitialThirdPartyList, filter: OverviewFilterDto, clientId?: string,): Array<TOverviewAssetAnalytics> {
		const {assets, transactions, currencyList, cryptoList, cBonds, metalList,} = data
		const totalCurrencyValuesByCurrency = transactions
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.reduce<Record<string, number>>(
				(acc, transaction,) => {
					const curr = transaction.currency
					acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
					return acc
				},
				{},
			)
		const filteredTransactions = transactions.filter((transaction,) => {
			return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
		},)

		const filteredAssets = assets.filter((asset,) => {
			return clientId ?
				asset.clientId === clientId :
				true
		},)

		const cashAssets = filteredAssets.filter((asset,): asset is ICashAsset => {
			return asset.assetName === AssetNamesType.CASH
		},)
		const cashBankData = cashAssets
			.map((asset,) => {
				const { currency, assetName, accountId, } = asset
				const transactionSumByCurrency = transactions.reduce((acc, transaction,) => {
					if (transaction.currency === currency && accountId === transaction.accountId) {
						return acc + Number(transaction.amount,)
					}
					return acc
				}, 0,)
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: transactionSumByCurrency,
					currencyList,
					historyDate:   filter.date,
				},)
				return {
					assetName,
					usdValue,
					currencyValue: transactionSumByCurrency,
				}
			},)

		const bondsAssets = filteredAssets.filter((asset,): asset is IBondsAsset => {
			return asset.assetName === AssetNamesType.BONDS
		},)
		const aggregatedBondsAssets = bondsAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IBondsAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

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
				const { isin, units, assetName, operation, valueDate, currency, } = asset
				const { bondsEmissions, bondsTradings, } = cBondParser(cBonds,)
				const bondEmissions = bondsEmissions.find((bond,) => {
					return bond.isin === isin
				},)
				const bondTradings = bondsTradings.find((bond,) => {
					return bond.isin === isin
				},)
				if (valueDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(valueDate,)) {
					return null
				}
				if (!bondEmissions || !bondTradings || !asset.rate) {
					return null
				}
				if (bondEmissions.maturityDate && (new Date(bondEmissions.maturityDate,) < new Date())) {
					return null
				}
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)
				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const usdValue = this.cBondsCurrencyService.getBondsMarketValueUSD({
					isin,
					units:              Number(units,),
					dirtyPriceCurrency: bondTradings.dirtyPriceCurrency,
					nominalPrice:       bondEmissions.nominalPrice,
					rate,
					marketPrice:        bondTradings.marketPrice,
				},)
				const fcValue = this.cBondsCurrencyService.getBondsMarketValueUSD({
					isin,
					units:              Number(units,),
					dirtyPriceCurrency: bondTradings.dirtyPriceCurrency,
					nominalPrice:       bondEmissions.nominalPrice,
					rate:               1,
					marketPrice:        bondTradings.marketPrice,
				},)
				return {
					assetName,
					usdValue: operation === AssetOperationType.BUY ?
						Math.abs(usdValue,) :
						-Math.abs(usdValue,),
					currencyValue: operation === AssetOperationType.BUY ?
						Math.abs(fcValue,) :
						-Math.abs(fcValue,),
				}
			},)
			.filter((item,) => {
				return item !== null
			},)

		const depositsAssets = filteredAssets.filter((asset,): asset is IDepositAsset => {
			return asset.assetName === AssetNamesType.CASH_DEPOSIT
		},)
		const depositsBankData = depositsAssets
			.map((asset,) => {
				const { currencyValue, assetName, maturityDate, startDate, currency, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				if (maturityDate && new Date(maturityDate,) < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)
				return {
					assetName,
					usdValue,
					currencyValue,
				}
			},)
			.filter((asset,) => {
				return asset !== null
			},)

		const collateralAssets = filteredAssets.filter((asset,): asset is ICollateralAsset => {
			return asset.assetName === AssetNamesType.COLLATERAL
		},)
		const collateralBankData = collateralAssets
			.map((asset,) => {
				const { currencyValue, assetName, currency, } = asset
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					assetName,
					usdValue,
					currencyValue,
				}
			},)

		const cryptoAssets = filteredAssets.filter((asset,): asset is ICryptoAsset => {
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
		const cryptoETFData = filteredCryptoEtfAssets
			.map((asset,) => {
				const { isin, units, operation, currency, transactionDate, assetName, } = asset
				if (!asset.bank || !currency || !isin) {
					return null
				}
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				const { parsedCBonds, parsedETFBonds, parsedEquityTradingGrounds, parsedEtfTradingGrounds, } = cEquityParser(cBonds,)
				const currencyId = this.cBondsCurrencyService.getCurrencyId(currency, currencyList,)
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const usdValue = this.cBondsCurrencyService.getEquitiesMarketValueInCurrency({
					isin,
					units:             Number(units,),
					stockGrounds:      parsedEquityTradingGrounds,
					etfTradingGrounds: parsedEtfTradingGrounds,
					cbondList:         [...parsedCBonds, ...parsedETFBonds,],
					rate,
					currencyId,
				},)
				const fcValue = this.cBondsCurrencyService.getEquitiesMarketValueInCurrency({
					isin,
					units:             Number(units,),
					cbondList:         [...parsedCBonds, ...parsedETFBonds,],
					etfTradingGrounds: parsedEtfTradingGrounds,
					stockGrounds:      parsedEquityTradingGrounds,
					rate:              1,
					currencyId,
				},)
				return {
					assetName,
					currencyValue: operation === AssetOperationType.BUY ?
						fcValue :
						-fcValue,
					usdValue:    operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				}
			},)
			.filter((item,) => {
				return item !== null
			},)
		const cryptoDirectData = cryptoDirectAssets
			.map((asset,) => {
				const { cryptoCurrencyType, cryptoAmount, assetName, purchaseDate,} = asset
				if (purchaseDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(purchaseDate,)) {
					return null
				}
				const usdValue = cryptoCurrencyType && cryptoAmount ?
					this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
						token: cryptoCurrencyType,
						cryptoAmount,
					}, cryptoList,) :
					0

				return {
					assetName,
					usdValue,
					currencyValue: asset.cryptoAmount,
				}
			},)

		const equityAssets = filteredAssets.filter((asset,): asset is IEquityAsset => {
			return asset.assetName === AssetNamesType.EQUITY_ASSET
		},)
		const aggregatedEquityAssets = equityAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IEquityAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

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
				const { isin, units, assetName, operation, currency, transactionDate, } = asset
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				const { parsedCBonds, parsedETFBonds, parsedEquityTradingGrounds, parsedEtfTradingGrounds, } = cEquityParser(cBonds,)
				const currencyId = this.cBondsCurrencyService.getCurrencyId(currency, currencyList,)
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)
				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1

				const usdValue = this.cBondsCurrencyService.getEquitiesMarketValueInCurrency({
					isin,
					units:             Number(units,),
					cbondList:         [...parsedCBonds, ...parsedETFBonds,],
					etfTradingGrounds: parsedEtfTradingGrounds,
					stockGrounds:      parsedEquityTradingGrounds,
					rate,
					currencyId,
				},)

				const fcValue = this.cBondsCurrencyService.getEquitiesMarketValueInCurrency({
					isin,
					units:             Number(units,),
					cbondList:         [...parsedCBonds, ...parsedETFBonds,],
					etfTradingGrounds: parsedEtfTradingGrounds,
					stockGrounds:      parsedEquityTradingGrounds,
					rate:              1,
					currencyId,
				},)

				return {
					assetName,
					usdValue: operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
					currencyValue: operation === AssetOperationType.BUY ?
						fcValue :
						-fcValue,
				}
			},)
			.filter((item,) => {
				return item !== null
			},)

		const loanAssets = filteredAssets.filter((asset,): asset is ILoanAsset => {
			return asset.assetName === AssetNamesType.LOAN
		},)
		const loanBankData = loanAssets
			.map((asset,) => {
				const { currencyValue, assetName, maturityDate, startDate, currency, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					assetName,
					usdValue,
					currencyValue,
				}
			},)
			.filter((asset,) => {
				return asset !== null
			},)

		const metalAssets = filteredAssets.filter((asset,): asset is IMetalsAsset => {
			return asset.assetName === AssetNamesType.METALS
		},)
		const aggregatedMetalAssets = metalAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, units, operation, portfolioId, metalType, } = asset

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
				const { units, assetName, operation, transactionDate, metalType, } = asset
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				if (!metalType) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
					metalList,
					metalType,
					units,
					historyDate: filter.date,
				},)

				return {
					assetName,
					usdValue: operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
					currencyValue: operation === AssetOperationType.BUY ?
						units :
						-units,
				}
			},)
			.filter((item,) => {
				return item !== null
			},)

		const optionsAssets = filteredAssets.filter((asset,): asset is IOptionAsset => {
			return asset.assetName === AssetNamesType.OPTIONS
		},)
		const optionsBankData = optionsAssets
			.map((asset,) => {
				const { currentMarketValue, assetName, maturityDate, startDate, currency, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: currentMarketValue,
					currencyList,
					historyDate:   filter.date,
				},)

				return {
					assetName,
					usdValue,
					currencyValue: currentMarketValue,
				}
			},)
			.filter((asset,) => {
				return asset !== null
			},)

		const otherAssets = filteredAssets.filter((asset,): asset is IOtherAsset => {
			return asset.assetName === AssetNamesType.OTHER
		},)
		const otherBankData = otherAssets
			.map((asset,) => {
				const { currencyValue, assetName, investmentDate, currency, } = asset
				if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					assetName,
					usdValue,
					currencyValue,
				}
			},)

		const privateEquityAssets = filteredAssets.filter((asset,): asset is IPrivateAsset => {
			return asset.assetName === AssetNamesType.PRIVATE_EQUITY
		},)
		const privateEquityBankData = privateEquityAssets
			.map((asset,) => {
				const { currencyValue, assetName, entryDate, currency, } = asset
				if (entryDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(entryDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					assetName,
					usdValue,
					currencyValue,
				}
			},)

		const realEstateAssets = filteredAssets.filter((asset,): asset is IRealEstateAsset => {
			return asset.assetName === AssetNamesType.REAL_ESTATE
		},)
		const realEstateBankData = realEstateAssets
			.map((asset,) => {
				const { currencyValue, assetName, investmentDate, currency, } = asset
				if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					assetName,
					usdValue,
					currencyValue,
				}
			},)
		return ([
			...cashBankData,
			...bondsBankData,
			...depositsBankData,
			...collateralBankData,
			...cryptoDirectData,
			...cryptoETFData,
			...equityBankData,
			...loanBankData,
			...metalsBankData,
			...optionsBankData,
			...otherBankData,
			...privateEquityBankData,
			...realEstateBankData,
		] as Array<TOverviewAssetAnalytics>).reduce<Array<TOverviewAssetAnalytics>>((acc, asset,) => {
			if (!asset) {
				return acc
			}
			const {
				assetName,
				usdValue,
				currencyValue,
			} = asset
			const existing = acc.find((item,) => {
				return item.assetName === assetName
			},)
			if (existing) {
				existing.usdValue = existing.usdValue + usdValue
				existing.currencyValue = existing.currencyValue + currencyValue
			} else {
				acc.push({
					assetName: assetName as AssetNamesType,
					usdValue,
					currencyValue,
				},)
			}
			return acc
		}, [],)
	}

	// New Version
	public syncGetAssetAnalytics(data: TOverviewInitials, filter: OverviewFilterDto, clientId?: string,): Array<TOverviewAssetAnalytics> {
		const {assets, transactions, currencyList, cryptoList, bonds, equities, etfs, metalList,} = data
		const totalCurrencyValuesByCurrency = transactions
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},)
			.reduce<Record<string, number>>(
				(acc, transaction,) => {
					const curr = transaction.currency
					acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
					return acc
				},
				{},
			)
		const filteredTransactions = transactions.filter((transaction,) => {
			return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
		},)

		const filteredAssets = assets.filter((asset,) => {
			return clientId ?
				asset.clientId === clientId :
				true
		},)

		const cashAssets = filteredAssets.filter((asset,): asset is ICashAsset => {
			return asset.assetName === AssetNamesType.CASH
		},)
		const cashBankData = cashAssets
			.map((asset,) => {
				const { currency, assetName, accountId, } = asset
				const transactionSumByCurrency = transactions.reduce((acc, transaction,) => {
					if (transaction.currency === currency && accountId === transaction.accountId) {
						return acc + Number(transaction.amount,)
					}
					return acc
				}, 0,)
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: transactionSumByCurrency,
					currencyList,
					historyDate:   filter.date,
				},)
				return {
					assetName,
					usdValue,
					currencyValue: transactionSumByCurrency,
				}
			},)

		const bondsAssets = filteredAssets.filter((asset,): asset is IBondsAsset => {
			return asset.assetName === AssetNamesType.BONDS
		},)
		const aggregatedBondsAssets = bondsAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IBondsAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

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
				const { isin, units, assetName, operation, valueDate, currency, } = asset
				const bond = bonds.find((bond,) => {
					return bond.isin === isin
				},)
				if (valueDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(valueDate,)) {
					return null
				}
				if (!bond || !asset.rate) {
					return null
				}
				if (bond.maturityDate && (new Date(bond.maturityDate,) < new Date())) {
					return null
				}
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)
				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const usdValue = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
					isin,
					units:              Number(units,),
					dirtyPriceCurrency: bond.dirtyPriceCurrency,
					nominalPrice:       bond.nominalPrice,
					rate,
					marketPrice:        bond.marketPrice,
				},)
				const fcValue = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
					isin,
					units:              Number(units,),
					dirtyPriceCurrency: bond.dirtyPriceCurrency,
					nominalPrice:       bond.nominalPrice,
					rate:               1,
					marketPrice:        bond.marketPrice,
				},)
				return {
					assetName,
					usdValue: operation === AssetOperationType.BUY ?
						Math.abs(usdValue,) :
						-Math.abs(usdValue,),
					currencyValue: operation === AssetOperationType.BUY ?
						Math.abs(fcValue,) :
						-Math.abs(fcValue,),
				}
			},)
			.filter((item,) => {
				return item !== null
			},)

		const depositsAssets = filteredAssets.filter((asset,): asset is IDepositAsset => {
			return asset.assetName === AssetNamesType.CASH_DEPOSIT
		},)
		const depositsBankData = depositsAssets
			.map((asset,) => {
				const { currencyValue, assetName, maturityDate, startDate, currency, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				if (maturityDate && new Date(maturityDate,) < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)
				return {
					assetName,
					usdValue,
					currencyValue,
				}
			},)
			.filter((asset,) => {
				return asset !== null
			},)

		const collateralAssets = filteredAssets.filter((asset,): asset is ICollateralAsset => {
			return asset.assetName === AssetNamesType.COLLATERAL
		},)
		const collateralBankData = collateralAssets
			.map((asset,) => {
				const { currencyValue, assetName, currency, } = asset
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					assetName,
					usdValue,
					currencyValue,
				}
			},)

		const cryptoAssets = filteredAssets.filter((asset,): asset is ICryptoAsset => {
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
		const cryptoETFData = filteredCryptoEtfAssets
			.map((asset,) => {
				const { isin, units, operation, currency, transactionDate, assetName, } = asset
				if (!asset.bank || !currency || !isin) {
					return null
				}
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				const equityAsset = equities.find((equity,) => {
					return equity.isin === isin
				},) ?? etfs.find((etf,) => {
					return etf.isin === isin
				},) ?? null
				if (!equityAsset || !units) {
					return null
				}
				const currencyId = this.cBondsCurrencyService.getCurrencyId(currency, currencyList,)
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				const usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)
				const fcValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price / 100).toFixed(2,) ,) :
					parseFloat((units * price).toFixed(2,),)
				return {
					assetName,
					currencyValue: operation === AssetOperationType.BUY ?
						fcValue :
						-fcValue,
					usdValue:    operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				}
			},)
			.filter((item,) => {
				return item !== null
			},)
		const cryptoDirectData = cryptoDirectAssets
			.map((asset,) => {
				const { cryptoCurrencyType, cryptoAmount, assetName, purchaseDate,} = asset
				if (purchaseDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(purchaseDate,)) {
					return null
				}
				const usdValue = cryptoCurrencyType && cryptoAmount ?
					this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
						token: cryptoCurrencyType,
						cryptoAmount,
					}, cryptoList,) :
					0

				return {
					assetName,
					usdValue,
					currencyValue: asset.cryptoAmount,
				}
			},)

		const equityAssets = filteredAssets.filter((asset,): asset is IEquityAsset => {
			return asset.assetName === AssetNamesType.EQUITY_ASSET
		},)
		const aggregatedEquityAssets = equityAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IEquityAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

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
				const { isin, units, assetName, operation, currency, transactionDate, } = asset
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
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
				const currencyId = this.cBondsCurrencyService.getCurrencyId(currency, currencyList,)
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)
				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1

				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				const usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)

				const fcValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price / 100).toFixed(2,) ,) :
					parseFloat((units * price).toFixed(2,),)

				return {
					assetName,
					usdValue: operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
					currencyValue: operation === AssetOperationType.BUY ?
						fcValue :
						-fcValue,
				}
			},)
			.filter((item,) => {
				return item !== null
			},)

		const loanAssets = filteredAssets.filter((asset,): asset is ILoanAsset => {
			return asset.assetName === AssetNamesType.LOAN
		},)
		const loanBankData = loanAssets
			.map((asset,) => {
				const { currencyValue, assetName, maturityDate, startDate, currency, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					assetName,
					usdValue,
					currencyValue,
				}
			},)
			.filter((asset,) => {
				return asset !== null
			},)

		const metalAssets = filteredAssets.filter((asset,): asset is IMetalsAsset => {
			return asset.assetName === AssetNamesType.METALS
		},)
		const metalETFAssets = metalAssets.filter(
			(item,): item is NonNullable<typeof item> => {
				return item.productType === MetalType.ETF
			},
		)
		const metalDirectAssets = metalAssets.filter(
			(item,): item is NonNullable<typeof item> => {
				return item.productType === MetalType.DIRECT_HOLD
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
				const { isin, units, operation, currency, transactionDate, assetName, } = asset
				if (!asset.bank || !currency || !isin || !units) {
					return null
				}
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
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

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				const usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)
				const fcValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price / 100).toFixed(2,) ,) :
					parseFloat((units * price).toFixed(2,),)
				return {
					assetName,
					currencyValue: operation === AssetOperationType.BUY ?
						fcValue :
						-fcValue,
					usdValue:    operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				}
			},)
			.filter((item,) => {
				return item !== null
			},)
		const aggregatedMetalAssets = metalDirectAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, units, operation, portfolioId, metalType, } = asset

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
				const { units, assetName, operation, transactionDate, metalType, } = asset
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				if (!metalType) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
					metalList,
					metalType,
					units,
					historyDate: filter.date,
				},)

				return {
					assetName,
					usdValue: operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
					currencyValue: operation === AssetOperationType.BUY ?
						units :
						-units,
				}
			},)
			.filter((item,) => {
				return item !== null
			},)

		const optionsAssets = filteredAssets.filter((asset,): asset is IOptionAsset => {
			return asset.assetName === AssetNamesType.OPTIONS
		},)
		const optionsBankData = optionsAssets
			.map((asset,) => {
				const { currentMarketValue, assetName, maturityDate, startDate, currency, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: currentMarketValue,
					currencyList,
					historyDate:   filter.date,
				},)

				return {
					assetName,
					usdValue,
					currencyValue: currentMarketValue,
				}
			},)
			.filter((asset,) => {
				return asset !== null
			},)

		const otherAssets = filteredAssets.filter((asset,): asset is IOtherAsset => {
			return asset.assetName === AssetNamesType.OTHER
		},)
		const otherBankData = otherAssets
			.map((asset,) => {
				const { currencyValue, assetName, investmentDate, currency, } = asset
				if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					assetName,
					usdValue,
					currencyValue,
				}
			},)

		const privateEquityAssets = filteredAssets.filter((asset,): asset is IPrivateAsset => {
			return asset.assetName === AssetNamesType.PRIVATE_EQUITY
		},)
		const privateEquityBankData = privateEquityAssets
			.map((asset,) => {
				const { currencyValue, assetName, entryDate, currency, } = asset
				if (entryDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(entryDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					assetName,
					usdValue,
					currencyValue,
				}
			},)

		const realEstateAssets = filteredAssets.filter((asset,): asset is IRealEstateAsset => {
			return asset.assetName === AssetNamesType.REAL_ESTATE
		},)
		const realEstateBankData = realEstateAssets
			.map((asset,) => {
				const { currencyValue, assetName, investmentDate, currency, } = asset
				if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					assetName,
					usdValue,
					currencyValue,
				}
			},)
		return ([
			...cashBankData,
			...bondsBankData,
			...depositsBankData,
			...collateralBankData,
			...cryptoDirectData,
			...cryptoETFData,
			...equityBankData,
			...loanBankData,
			...metalsBankData,
			...metalETFData,
			...optionsBankData,
			...otherBankData,
			...privateEquityBankData,
			...realEstateBankData,
		] as Array<TOverviewAssetAnalytics>).reduce<Array<TOverviewAssetAnalytics>>((acc, asset,) => {
			if (!asset) {
				return acc
			}
			const {
				assetName,
				usdValue,
				currencyValue,
			} = asset
			const existing = acc.find((item,) => {
				return item.assetName === assetName
			},)
			if (existing) {
				existing.usdValue = existing.usdValue + usdValue
				existing.currencyValue = existing.currencyValue + currencyValue
			} else {
				acc.push({
					assetName: assetName as AssetNamesType,
					usdValue,
					currencyValue,
				},)
			}
			return acc
		}, [],)
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	// Old Version
	public syncGetEntityAnalytics2(data: IInitialThirdPartyList, filter: OverviewFilterDto, clientId?: string,): Array<TEntityAnalytics> {
		const {assets, transactions, currencyList, cryptoList, cBonds, metalList,} = data
		const totalCurrencyValuesByCurrency = transactions
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},).reduce<Record<string, number>>(

				(acc, transaction,) => {
					const curr = transaction.currency
					acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
					return acc
				},
				{},
			)
		const filteredTransactions = transactions.filter((transaction,) => {
			return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
		},)

		const filteredAssets = assets.filter((asset,) => {
			return clientId ?
				asset.clientId === clientId :
				true
		},)

		const cashAssets = filteredAssets.filter((asset,): asset is ICashAsset => {
			return asset.assetName === AssetNamesType.CASH
		},)
		const cashBankData = cashAssets
			.map((asset,) => {
				if (!asset.entity || !asset.account) {
					return null
				}
				const { currency, account, } = asset
				const transactionSumByCurrency = filteredTransactions.reduce((acc, transaction,) => {
					if (transaction.currency === currency && transaction.accountId === account.id) {
						return acc + Number(transaction.amount,)
					}
					return acc
				}, 0,)
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: transactionSumByCurrency,
					currencyList,
					historyDate:   filter.date,
				},)
				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const bondsAssets = filteredAssets.filter((asset,): asset is IBondsAsset => {
			return asset.assetName === AssetNamesType.BONDS
		},)
		const aggregatedBondsAssets = bondsAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IBondsAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

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
				if (!asset.entity) {
					return null
				}
				const { isin, units, operation, valueDate, currency, } = asset
				const { bondsEmissions, bondsTradings, } = cBondParser(cBonds,)
				const bondEmissions = bondsEmissions.find((bond,) => {
					return bond.isin === isin
				},)
				const bondTradings = bondsTradings.find((bond,) => {
					return bond.isin === isin
				},)
				if (valueDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(valueDate,)) {
					return null
				}
				if (!bondEmissions || !bondTradings) {
					return null
				}
				if (bondEmissions.maturityDate && (new Date(bondEmissions.maturityDate,) < new Date())) {
					return null
				}
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const usdValue = this.cBondsCurrencyService.getBondsMarketValueUSD({
					isin,
					units:              Number(units,),
					dirtyPriceCurrency: bondTradings.dirtyPriceCurrency,
					nominalPrice:       bondEmissions.nominalPrice,
					rate,
					marketPrice:        bondTradings.marketPrice,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const depositsAssets = filteredAssets.filter((asset,): asset is IDepositAsset => {
			return asset.assetName === AssetNamesType.CASH_DEPOSIT
		},)
		const depositsBankData = depositsAssets
			.map((asset,) => {
				if (!asset.entity) {
					return null
				}

				const { currencyValue, maturityDate, startDate, currency, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				if (maturityDate && new Date(maturityDate,) < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const collateralAssets = filteredAssets.filter((asset,): asset is ICollateralAsset => {
			return asset.assetName === AssetNamesType.COLLATERAL
		},)
		const collateralBankData = collateralAssets
			.map((asset,) => {
				if (!asset.entity) {
					return null
				}
				const { currencyValue, currency, } = asset
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const cryptoAssets = filteredAssets.filter((asset,): asset is ICryptoAsset => {
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
		const cryptoETFData = filteredCryptoEtfAssets
			.map((asset,) => {
				const { isin, units, operation, currency, transactionDate, } = asset
				if (!asset.entity || !currency || !isin) {
					return null
				}
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				const { parsedCBonds, parsedETFBonds, parsedEquityTradingGrounds, parsedEtfTradingGrounds, } = cEquityParser(cBonds,)
				const currencyId = this.cBondsCurrencyService.getCurrencyId(currency, currencyList,)
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const usdValue = this.cBondsCurrencyService.getEquitiesMarketValueInCurrency({
					isin,
					units:             Number(units,),
					stockGrounds:      parsedEquityTradingGrounds,
					etfTradingGrounds: parsedEtfTradingGrounds,
					cbondList:         [...parsedCBonds, ...parsedETFBonds,],
					rate,
					currencyId,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)
		const cryptoBankData = cryptoDirectAssets
			.map((asset,) => {
				if (!asset.entity) {
					return null
				}
				const { cryptoCurrencyType, cryptoAmount, purchaseDate,} = asset
				if (purchaseDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(purchaseDate,)) {
					return null
				}
				const usdValue = cryptoCurrencyType && cryptoAmount ?
					this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
						token: cryptoCurrencyType,
						cryptoAmount,
					}, cryptoList,) :
					0

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue,
					currencyValue: asset.cryptoAmount,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const equityAssets = filteredAssets.filter((asset,): asset is IEquityAsset => {
			return asset.assetName === AssetNamesType.EQUITY_ASSET
		},)
		const aggregatedEquityAssets = equityAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IEquityAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

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
				if (!asset.entity) {
					return null
				}
				const { isin, units, operation, currency, transactionDate, } = asset
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				const { parsedCBonds, parsedETFBonds, parsedEquityTradingGrounds, parsedEtfTradingGrounds, } = cEquityParser(cBonds,)
				const currencyId = this.cBondsCurrencyService.getCurrencyId(currency, currencyList,)
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const usdValue = this.cBondsCurrencyService.getEquitiesMarketValueInCurrency({
					isin,
					units:             Number(units,),
					stockGrounds:      parsedEquityTradingGrounds,
					etfTradingGrounds: parsedEtfTradingGrounds,
					cbondList:         [...parsedCBonds, ...parsedETFBonds,],
					rate,
					currencyId,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const loanAssets = filteredAssets.filter((asset,): asset is ILoanAsset => {
			return asset.assetName === AssetNamesType.LOAN
		},)
		const loanBankData = loanAssets
			.map((asset,) => {
				if (!asset.entity) {
					return null
				}
				const { currencyValue, maturityDate, startDate, currency, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const metalAssets = filteredAssets.filter((asset,): asset is IMetalsAsset => {
			return asset.assetName === AssetNamesType.METALS
		},)
		const aggregatedMetalAssets = metalAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, units, operation, portfolioId, metalType, } = asset

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
				if (!asset.entity) {
					return null
				}
				const { units, operation, transactionDate, metalType, } = asset
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				if (!metalType) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
					metalList,
					metalType,
					units,
					historyDate: filter.date,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const optionsAssets = filteredAssets.filter((asset,): asset is IOptionAsset => {
			return asset.assetName === AssetNamesType.OPTIONS
		},)
		const optionsBankData = optionsAssets
			.map((asset,) => {
				if (!asset.entity) {
					return null
				}
				const { maturityDate, startDate, currency, currentMarketValue, } = asset
				const maturity = new Date(maturityDate,)
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: currentMarketValue,
					currencyList,
					historyDate:   filter.date,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const otherAssets = filteredAssets.filter((asset,): asset is IOtherAsset => {
			return asset.assetName === AssetNamesType.OTHER
		},)
		const otherBankData = otherAssets
			.map((asset,) => {
				if (!asset.entity) {
					return null
				}
				const { currencyValue, investmentDate, currency, } = asset
				if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const privateEquityAssets = filteredAssets.filter((asset,): asset is IPrivateAsset => {
			return asset.assetName === AssetNamesType.PRIVATE_EQUITY
		},)
		const privateEquityBankData = privateEquityAssets
			.map((asset,) => {
				if (!asset.entity) {
					return null
				}
				const { currencyValue, entryDate, currency, } = asset
				if (entryDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(entryDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const realEstateAssets = filteredAssets.filter((asset,): asset is IRealEstateAsset => {
			return asset.assetName === AssetNamesType.REAL_ESTATE
		},)
		const realEstateBankData = realEstateAssets
			.map((asset,) => {
				if (!asset.entity) {
					return null
				}
				const { currencyValue, investmentDate, currency, } = asset
				if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)
		return [
			...cashBankData,
			...bondsBankData,
			...depositsBankData,
			...collateralBankData,
			...cryptoBankData,
			...cryptoETFData,
			...equityBankData,
			...loanBankData,
			...metalsBankData,
			...optionsBankData,
			...otherBankData,
			...privateEquityBankData,
			...realEstateBankData,
		].reduce<Array<TEntityAnalytics>>((acc, asset,) => {
			const {
				id,
				usdValue,
				entityName,
				portfolioName,
			} = asset
			const existing = acc.find((item,) => {
				return item.id === id
			},)
			if (existing) {
				existing.usdValue = existing.usdValue + usdValue
			} else {
				acc.push({
					id,
					entityName:    this.cryptoService.decryptString(entityName,),
					usdValue,
					portfolioName: portfolioName && this.cryptoService.decryptString(portfolioName,),
				},)
			}
			return acc
		}, [],)
	}

	// New Version
	public syncGetEntityAnalytics(data: TOverviewInitials, filter: OverviewFilterDto, clientId?: string,): Array<TEntityAnalytics> {
		const {assets, transactions, currencyList, cryptoList, bonds, equities, etfs, metalList,} = data
		const totalCurrencyValuesByCurrency = transactions
			.filter((asset,) => {
				return clientId ?
					asset.clientId === clientId :
					true
			},).reduce<Record<string, number>>(

				(acc, transaction,) => {
					const curr = transaction.currency
					acc[curr] = parseFloat(((acc[curr] ?? 0) + Number(transaction.amount,)).toFixed(2,),)
					return acc
				},
				{},
			)
		const filteredTransactions = transactions.filter((transaction,) => {
			return (totalCurrencyValuesByCurrency[transaction.currency] ?? 0) !== 0
		},)

		const filteredAssets = assets.filter((asset,) => {
			return clientId ?
				asset.clientId === clientId :
				true
		},)

		const cashAssets = filteredAssets.filter((asset,): asset is ICashAsset => {
			return asset.assetName === AssetNamesType.CASH
		},)
		const cashBankData = cashAssets
			.map((asset,) => {
				if (!asset.entity || !asset.account) {
					return null
				}
				const { currency, account, } = asset
				const transactionSumByCurrency = filteredTransactions.reduce((acc, transaction,) => {
					if (transaction.currency === currency && transaction.accountId === account.id) {
						return acc + Number(transaction.amount,)
					}
					return acc
				}, 0,)
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: transactionSumByCurrency,
					currencyList,
					historyDate:   filter.date,
				},)
				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const bondsAssets = filteredAssets.filter((asset,): asset is IBondsAsset => {
			return asset.assetName === AssetNamesType.BONDS
		},)
		const aggregatedBondsAssets = bondsAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IBondsAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

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
				if (!asset.entity) {
					return null
				}
				const { isin, units, operation, valueDate, currency, } = asset
				const bond = bonds.find((bond,) => {
					return bond.isin === isin
				},)
				if (valueDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(valueDate,)) {
					return null
				}
				if (!bond) {
					return null
				}
				if (bond.maturityDate && (new Date(bond.maturityDate,) < new Date())) {
					return null
				}
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const usdValue = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
					isin,
					units:              Number(units,),
					dirtyPriceCurrency: bond.dirtyPriceCurrency,
					nominalPrice:       bond.nominalPrice,
					rate,
					marketPrice:        bond.marketPrice,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const depositsAssets = filteredAssets.filter((asset,): asset is IDepositAsset => {
			return asset.assetName === AssetNamesType.CASH_DEPOSIT
		},)
		const depositsBankData = depositsAssets
			.map((asset,) => {
				if (!asset.entity) {
					return null
				}
				const { currencyValue, maturityDate, startDate, currency, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				if (maturityDate && new Date(maturityDate,) < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const collateralAssets = filteredAssets.filter((asset,): asset is ICollateralAsset => {
			return asset.assetName === AssetNamesType.COLLATERAL
		},)
		const collateralBankData = collateralAssets
			.map((asset,) => {
				if (!asset.entity) {
					return null
				}
				const { currencyValue, currency, } = asset
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const cryptoAssets = filteredAssets.filter((asset,): asset is ICryptoAsset => {
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
		const cryptoETFData = filteredCryptoEtfAssets
			.map((asset,) => {
				const { isin, units, operation, currency, transactionDate, } = asset
				if (!asset.entity || !currency || !isin) {
					return null
				}
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				const equityAsset = equities.find((equity,) => {
					return equity.isin === isin
				},) ?? etfs.find((etf,) => {
					return etf.isin === isin
				},) ?? null
				if (!equityAsset || !units) {
					return null
				}
				const currencyId = this.cBondsCurrencyService.getCurrencyId(currency, currencyList,)
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				const usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)
		const cryptoBankData = cryptoDirectAssets
			.map((asset,) => {
				if (!asset.entity) {
					return null
				}
				const { cryptoCurrencyType, cryptoAmount, purchaseDate,} = asset
				if (purchaseDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(purchaseDate,)) {
					return null
				}
				const usdValue = cryptoCurrencyType && cryptoAmount ?
					this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
						token: cryptoCurrencyType,
						cryptoAmount,
					}, cryptoList,) :
					0

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue,
					currencyValue: asset.cryptoAmount,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const equityAssets = filteredAssets.filter((asset,): asset is IEquityAsset => {
			return asset.assetName === AssetNamesType.EQUITY_ASSET
		},)
		const aggregatedEquityAssets = equityAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IEquityAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

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
				if (!asset.entity) {
					return null
				}
				const { isin, units, operation, currency, transactionDate, } = asset
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
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
				const currencyId = this.cBondsCurrencyService.getCurrencyId(currency, currencyList,)
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				const usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const loanAssets = filteredAssets.filter((asset,): asset is ILoanAsset => {
			return asset.assetName === AssetNamesType.LOAN
		},)
		const loanBankData = loanAssets
			.map((asset,) => {
				if (!asset.entity) {
					return null
				}
				const { currencyValue, maturityDate, startDate, currency, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const metalAssets = filteredAssets.filter((asset,): asset is IMetalsAsset => {
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
				const { isin, units, operation, currency, transactionDate, assetName, } = asset
				if (!asset.entity || !currency || !isin || !units) {
					return null
				}
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
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

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				const usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)
		const metalDirectAssets = metalAssets.filter(
			(item,): item is NonNullable<typeof item> => {
				return item.productType === MetalType.DIRECT_HOLD
			},
		)
		const aggregatedMetalAssets = metalDirectAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, units, operation, portfolioId, metalType, } = asset

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
				if (!asset.entity) {
					return null
				}
				const { units, operation, transactionDate, metalType, } = asset
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				if (!metalType) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
					metalList,
					metalType,
					units,
					historyDate: filter.date,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue:      operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const optionsAssets = filteredAssets.filter((asset,): asset is IOptionAsset => {
			return asset.assetName === AssetNamesType.OPTIONS
		},)
		const optionsBankData = optionsAssets
			.map((asset,) => {
				if (!asset.entity) {
					return null
				}
				const { maturityDate, startDate, currency, currentMarketValue, } = asset
				const maturity = new Date(maturityDate,)
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: currentMarketValue,
					currencyList,
					historyDate:   filter.date,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const otherAssets = filteredAssets.filter((asset,): asset is IOtherAsset => {
			return asset.assetName === AssetNamesType.OTHER
		},)
		const otherBankData = otherAssets
			.map((asset,) => {
				if (!asset.entity) {
					return null
				}
				const { currencyValue, investmentDate, currency, } = asset
				if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const privateEquityAssets = filteredAssets.filter((asset,): asset is IPrivateAsset => {
			return asset.assetName === AssetNamesType.PRIVATE_EQUITY
		},)
		const privateEquityBankData = privateEquityAssets
			.map((asset,) => {
				if (!asset.entity) {
					return null
				}
				const { currencyValue, entryDate, currency, } = asset
				if (entryDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(entryDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)

		const realEstateAssets = filteredAssets.filter((asset,): asset is IRealEstateAsset => {
			return asset.assetName === AssetNamesType.REAL_ESTATE
		},)
		const realEstateBankData = realEstateAssets
			.map((asset,) => {
				if (!asset.entity) {
					return null
				}
				const { currencyValue, investmentDate, currency, } = asset
				if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					id:            asset.entity.id,
					entityName:    asset.entity.name,
					portfolioName: asset.portfolio?.name,
					usdValue,
				} as TEntityAnalytics
			},)
			.filter((item,): item is TEntityAnalytics => {
				return item !== null
			},)
		return [
			...cashBankData,
			...bondsBankData,
			...depositsBankData,
			...collateralBankData,
			...cryptoBankData,
			...cryptoETFData,
			...equityBankData,
			...loanBankData,
			...metalsBankData,
			...metalETFData,
			...optionsBankData,
			...otherBankData,
			...privateEquityBankData,
			...realEstateBankData,
		].reduce<Array<TEntityAnalytics>>((acc, asset,) => {
			const {
				id,
				usdValue,
				entityName,
				portfolioName,
			} = asset
			const existing = acc.find((item,) => {
				return item.id === id
			},)
			if (existing) {
				existing.usdValue = existing.usdValue + usdValue
			} else {
				acc.push({
					id,
					entityName:    this.cryptoService.decryptString(entityName,),
					usdValue,
					portfolioName: portfolioName && this.cryptoService.decryptString(portfolioName,),
				},)
			}
			return acc
		}, [],)
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	// Old Version
	public syncGetCurrencyAnalytics2(data: IInitialThirdPartyList, filter: OverviewFilterDto, clientId?: string,): Array<TCurrencyAnalytics> {
		const {assets, transactions, currencyList, cryptoList, cBonds, metalList,} = data

		const filteredTransactions = transactions.filter((transaction,) => {
			return clientId ?
				transaction.clientId === clientId :
				true
		},)

		const filteredAssets = assets.filter((asset,) => {
			return clientId ?
				asset.clientId === clientId :
				true
		},)

		const cashAssets = filteredAssets.filter((asset,): asset is ICashAsset => {
			return asset.assetName === AssetNamesType.CASH
		},)

		const cashBankData = cashAssets
			.map((asset,) => {
				const { currency, accountId, } = asset
				const transactionSumByCurrency = filteredTransactions.reduce((acc, transaction,) => {
					if (transaction.currency === currency && transaction.accountId === accountId) {
						return acc + Number(transaction.amount,)
					}
					return acc
				}, 0,)
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: transactionSumByCurrency,
					currencyList,
					historyDate:   filter.date,
				},)
				return {
					currency,
					currencyValue: transactionSumByCurrency,
					usdValue,
				}
			},)

		const bondsAssets = filteredAssets.filter((asset,): asset is IBondsAsset => {
			return asset.assetName === AssetNamesType.BONDS
		},)
		const aggregatedBondsAssets = bondsAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IBondsAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

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
				const { isin, units, currency, operation, valueDate, } = asset
				const { bondsEmissions, bondsTradings, } = cBondParser(cBonds,)
				const bondEmissions = bondsEmissions.find((bond,) => {
					return bond.isin === isin
				},)
				const bondTradings = bondsTradings.find((bond,) => {
					return bond.isin === isin
				},)
				if (valueDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(valueDate,)) {
					return null
				}
				if (!bondEmissions || !bondTradings) {
					return null
				}
				if (bondEmissions.maturityDate && (new Date(bondEmissions.maturityDate,) < new Date())) {
					return null
				}
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const usdValue = this.cBondsCurrencyService.getBondsMarketValueUSD({
					isin,
					units:              Number(units,),
					dirtyPriceCurrency: bondTradings.dirtyPriceCurrency,
					nominalPrice:       bondEmissions.nominalPrice,
					rate,
					marketPrice:        bondTradings.marketPrice,
				},)
				const currencyValue = this.cBondsCurrencyService.getCurrencyAmount({
					currency,
					usdValue,
				}, currencyList,)

				return {
					currency,
					currencyValue: operation === AssetOperationType.BUY ?
						currencyValue :
						-currencyValue,
					usdValue: operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				}
			},)
			.filter((asset,) => {
				return asset !== null
			},)

		const depositsAssets = filteredAssets.filter((asset,): asset is IDepositAsset => {
			return asset.assetName === AssetNamesType.CASH_DEPOSIT
		},)
		const depositsBankData = depositsAssets
			.map((asset,) => {
				const { currency, currencyValue, maturityDate, startDate, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				if (maturityDate && new Date(maturityDate,) < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					currency,
					currencyValue: parseFloat(String(currencyValue,),),
					usdValue:      parseFloat(String(usdValue,),),
				}
			},)
			.filter((asset,) => {
				return asset !== null
			},)

		const collateralAssets = filteredAssets.filter((asset,): asset is ICollateralAsset => {
			return asset.assetName === AssetNamesType.COLLATERAL
		},)
		const collateralBankData = collateralAssets
			.map((asset,) => {
				const { currency, currencyValue, } = asset
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					currency,
					currencyValue,
					usdValue,
				}
			},)

		const cryptoAssets = filteredAssets.filter((asset,): asset is ICryptoAsset => {
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
		const cryptoETFData = filteredCryptoEtfAssets
			.map((asset,) => {
				const { isin, units, operation, currency, transactionDate, } = asset
				if (!asset.bank || !currency || !isin) {
					return null
				}
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				const { parsedCBonds, parsedETFBonds, parsedEquityTradingGrounds, parsedEtfTradingGrounds, } = cEquityParser(cBonds,)
				const currencyId = this.cBondsCurrencyService.getCurrencyId(currency, currencyList,)
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const usdValue = this.cBondsCurrencyService.getEquitiesMarketValueInCurrency({
					isin,
					units:             Number(units,),
					stockGrounds:      parsedEquityTradingGrounds,
					etfTradingGrounds: parsedEtfTradingGrounds,
					cbondList:         [...parsedCBonds, ...parsedETFBonds,],
					rate,
					currencyId,
				},)
				const currencyValue = this.cBondsCurrencyService.getCurrencyAmount({
					currency,
					usdValue,
				}, currencyList,)
				return {
					currency,
					currencyValue: operation === AssetOperationType.BUY ?
						currencyValue :
						-currencyValue,
					usdValue: operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				}
			},)
			.filter((item,) => {
				return item !== null
			},)
		const cryptoBankData = cryptoDirectAssets
			.map((asset,) => {
				const { cryptoCurrencyType, cryptoAmount, purchaseDate, currency,} = asset
				if (purchaseDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(purchaseDate,)) {
					return null
				}
				const usdValue = cryptoAmount && cryptoCurrencyType ?
					this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
						token: cryptoCurrencyType,
						cryptoAmount,
					}, cryptoList,) :
					0
				const cryptoCurrency: CryptoList | CurrencyDataList | undefined = cryptoCurrencyType ?? currency
				if (!cryptoCurrency) {
					return null
				}
				return {
					currency:      cryptoCurrency,
					currencyValue: cryptoAmount ?
						cryptoAmount :
						0,
					usdValue,
				}
			},)

		const equityAssets = filteredAssets.filter((asset,): asset is IEquityAsset => {
			return asset.assetName === AssetNamesType.EQUITY_ASSET
		},)
		const aggregatedEquityAssets = equityAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IEquityAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

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
				const { isin, units, currency, operation, transactionDate, } = asset
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				const { parsedCBonds, parsedETFBonds, parsedEquityTradingGrounds, parsedEtfTradingGrounds, } = cEquityParser(cBonds,)
				const currencyId = this.cBondsCurrencyService.getCurrencyId(currency, currencyList,)
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const usdValue = this.cBondsCurrencyService.getEquitiesMarketValueInCurrency({
					isin,
					units:             Number(units,),
					etfTradingGrounds: parsedEtfTradingGrounds,
					stockGrounds:      parsedEquityTradingGrounds,
					cbondList:         [...parsedCBonds, ...parsedETFBonds,],
					rate,
					currencyId,
				},)
				const currencyValue = this.cBondsCurrencyService.getCurrencyAmount({
					currency,
					usdValue,
				}, currencyList,)

				return {
					currency,
					currencyValue: operation === AssetOperationType.BUY ?
						currencyValue :
						-currencyValue,
					usdValue: operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				}
			},)

		const loanAssets = filteredAssets.filter((asset,): asset is ILoanAsset => {
			return asset.assetName === AssetNamesType.LOAN
		},)
		const loanBankData = loanAssets
			.map((asset,) => {
				const { currency, currencyValue, maturityDate, startDate, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					currency,
					currencyValue,
					usdValue,
				}
			},)
			.filter((asset,) => {
				return asset !== null
			},)
		const metalAssets = filteredAssets.filter((asset,): asset is IMetalsAsset => {
			return asset.assetName === AssetNamesType.METALS
		},)
		const aggregatedMetalAssets = metalAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, units, operation, portfolioId, metalType, } = asset

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
				const { metalType, units, operation, transactionDate, } = asset
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				if (!metalType) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
					metalList,
					metalType,
					units,
					historyDate: filter.date,
				},)

				return {
					currency:      metalType,
					currencyValue: operation === AssetOperationType.BUY ?
						units :
						-units,
					usdValue: operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				}
			},)

		const optionsAssets = filteredAssets.filter((asset,): asset is IOptionAsset => {
			return asset.assetName === AssetNamesType.OPTIONS
		},)
		const optionsBankData = optionsAssets
			.map((asset,) => {
				const { currency, currentMarketValue, maturityDate, startDate, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: currentMarketValue,
					currencyList,
					historyDate:   filter.date,
				},)

				return {
					currency,
					currencyValue: currentMarketValue,
					usdValue,
				}
			},)
			.filter((asset,) => {
				return asset !== null
			},)

		const otherAssets = filteredAssets.filter((asset,): asset is IOtherAsset => {
			return asset.assetName === AssetNamesType.OTHER
		},)
		const otherBankData = otherAssets
			.map((asset,) => {
				const { currency, currencyValue, investmentDate, } = asset
				if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					currency,
					currencyValue,
					usdValue,
				}
			},)

		const privateEquityAssets = filteredAssets.filter((asset,): asset is IPrivateAsset => {
			return asset.assetName === AssetNamesType.PRIVATE_EQUITY
		},)
		const privateEquityBankData = privateEquityAssets
			.map((asset,) => {
				const { currency, currencyValue, entryDate, } = asset
				if (entryDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(entryDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					currency,
					currencyValue,
					usdValue,
				}
			},)

		const realEstateAssets = filteredAssets.filter((asset,): asset is IRealEstateAsset => {
			return asset.assetName === AssetNamesType.REAL_ESTATE
		},)
		const realEstateBankData = realEstateAssets
			.map((asset,) => {
				const { currency, currencyValue, investmentDate, } = asset
				if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					currency,
					currencyValue,
					usdValue,
				}
			},)
		return [
			...cashBankData,
			...bondsBankData,
			...depositsBankData,
			...collateralBankData,
			...cryptoBankData,
			...cryptoETFData,
			...equityBankData,
			...loanBankData,
			...metalsBankData,
			...optionsBankData,
			...otherBankData,
			...privateEquityBankData,
			...realEstateBankData,
		].reduce<Array<TCurrencyAnalytics>>((acc, asset,) => {
			if (!asset) {
				return acc
			}
			const {
				currency,
				currencyValue,
				usdValue,
			} = asset
			const existing = acc.find((item,) => {
				return item.currency === currency
			},)
			if (existing) {
				existing.usdValue = parseFloat((existing.usdValue + usdValue).toFixed(2,),)
				existing.currencyValue = parseFloat((existing.currencyValue + currencyValue).toFixed(2,),)
			} else {
				acc.push({
					usdValue:      parseFloat(usdValue.toFixed(2,),),
					currencyValue: parseFloat(currencyValue?.toFixed(2,),),
					currency,
				},)
			}
			return acc
		}, [],)
			.filter((asset,) => {
				return asset.currencyValue !== 0
			},)
	}

	// New Version
	public syncGetCurrencyAnalytics(data: TOverviewInitials, filter: OverviewFilterDto, clientId?: string,): Array<TCurrencyAnalytics> {
		const {assets, transactions, currencyList, cryptoList, bonds, equities, etfs, metalList,} = data

		const filteredTransactions = transactions.filter((transaction,) => {
			return clientId ?
				transaction.clientId === clientId :
				true
		},)

		const filteredAssets = assets.filter((asset,) => {
			return clientId ?
				asset.clientId === clientId :
				true
		},)

		const cashAssets = filteredAssets.filter((asset,): asset is ICashAsset => {
			return asset.assetName === AssetNamesType.CASH
		},)

		const cashBankData = cashAssets
			.map((asset,) => {
				const { currency, accountId, } = asset
				const transactionSumByCurrency = filteredTransactions.reduce((acc, transaction,) => {
					if (transaction.currency === currency && transaction.accountId === accountId) {
						return acc + Number(transaction.amount,)
					}
					return acc
				}, 0,)
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: transactionSumByCurrency,
					currencyList,
					historyDate:   filter.date,
				},)
				return {
					currency,
					currencyValue: transactionSumByCurrency,
					usdValue,
				}
			},)

		const bondsAssets = filteredAssets.filter((asset,): asset is IBondsAsset => {
			return asset.assetName === AssetNamesType.BONDS
		},)
		const aggregatedBondsAssets = bondsAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IBondsAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

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
				const { isin, units, currency, operation, valueDate, } = asset
				const bond = bonds.find((bond,) => {
					return bond.isin === isin
				},)
				if (valueDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(valueDate,)) {
					return null
				}
				if (!bond) {
					return null
				}
				if (bond.maturityDate && (new Date(bond.maturityDate,) < new Date())) {
					return null
				}
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const usdValue = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
					isin,
					units:              Number(units,),
					dirtyPriceCurrency: bond.dirtyPriceCurrency,
					nominalPrice:       bond.nominalPrice,
					rate,
					marketPrice:        bond.marketPrice,
				},)
				const currencyValue = this.cBondsCurrencyService.getCurrencyAmount({
					currency,
					usdValue,
				}, currencyList,)

				return {
					currency,
					currencyValue: operation === AssetOperationType.BUY ?
						currencyValue :
						-currencyValue,
					usdValue: operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				}
			},)
			.filter((asset,) => {
				return asset !== null
			},)

		const depositsAssets = filteredAssets.filter((asset,): asset is IDepositAsset => {
			return asset.assetName === AssetNamesType.CASH_DEPOSIT
		},)
		const depositsBankData = depositsAssets
			.map((asset,) => {
				const { currency, currencyValue, maturityDate, startDate, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				if (maturityDate && new Date(maturityDate,) < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					currency,
					currencyValue: parseFloat(String(currencyValue,),),
					usdValue:      parseFloat(String(usdValue,),),
				}
			},)
			.filter((asset,) => {
				return asset !== null
			},)

		const collateralAssets = filteredAssets.filter((asset,): asset is ICollateralAsset => {
			return asset.assetName === AssetNamesType.COLLATERAL
		},)
		const collateralBankData = collateralAssets
			.map((asset,) => {
				const { currency, currencyValue, } = asset
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					currency,
					currencyValue,
					usdValue,
				}
			},)

		const cryptoAssets = filteredAssets.filter((asset,): asset is ICryptoAsset => {
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
		const cryptoETFData = filteredCryptoEtfAssets
			.map((asset,) => {
				const { isin, units, operation, currency, transactionDate, } = asset
				if (!asset.bank || !currency || !isin) {
					return null
				}
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				const equityAsset = equities.find((equity,) => {
					return equity.isin === isin
				},) ?? etfs.find((etf,) => {
					return etf.isin === isin
				},) ?? null
				if (!equityAsset || !units) {
					return null
				}
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				const usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)
				const currencyValue = this.cBondsCurrencyService.getCurrencyAmount({
					currency,
					usdValue,
				}, currencyList,)
				return {
					currency,
					currencyValue: operation === AssetOperationType.BUY ?
						currencyValue :
						-currencyValue,
					usdValue: operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				}
			},)
			.filter((item,) => {
				return item !== null
			},)
		const cryptoBankData = cryptoDirectAssets
			.map((asset,) => {
				const { cryptoCurrencyType, cryptoAmount, purchaseDate, currency,} = asset
				if (purchaseDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(purchaseDate,)) {
					return null
				}
				const usdValue = cryptoAmount && cryptoCurrencyType ?
					this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
						token: cryptoCurrencyType,
						cryptoAmount,
					}, cryptoList,) :
					0
				const cryptoCurrency: CryptoList | CurrencyDataList | undefined = cryptoCurrencyType ?? currency
				if (!cryptoCurrency) {
					return null
				}
				return {
					currency:      cryptoCurrency,
					currencyValue: cryptoAmount ?
						cryptoAmount :
						0,
					usdValue,
				}
			},)

		const equityAssets = filteredAssets.filter((asset,): asset is IEquityAsset => {
			return asset.assetName === AssetNamesType.EQUITY_ASSET
		},)
		const aggregatedEquityAssets = equityAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IEquityAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, isin, units, operation, portfolioId, currency, } = asset

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
				const { isin, units, currency, operation, transactionDate, } = asset
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
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
				const currencyId = this.cBondsCurrencyService.getCurrencyId(currency, currencyList,)
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				const usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)
				const currencyValue = this.cBondsCurrencyService.getCurrencyAmount({
					currency,
					usdValue,
				}, currencyList,)

				return {
					currency,
					currencyValue: operation === AssetOperationType.BUY ?
						currencyValue :
						-currencyValue,
					usdValue: operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				}
			},)

		const loanAssets = filteredAssets.filter((asset,): asset is ILoanAsset => {
			return asset.assetName === AssetNamesType.LOAN
		},)
		const loanBankData = loanAssets
			.map((asset,) => {
				const { currency, currencyValue, maturityDate, startDate, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					currency,
					currencyValue,
					usdValue,
				}
			},)
			.filter((asset,) => {
				return asset !== null
			},)
		const metalAssets = filteredAssets.filter((asset,): asset is IMetalsAsset => {
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
				const { isin, units, operation, currency, transactionDate, assetName, } = asset
				if (!asset.entity || !currency || !isin || !units) {
					return null
				}
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
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

				const rate = currencyData ?
					filter.date ?
						currencyData.currencyHistory?.[0]?.rate ?? currencyData.rate :
						currencyData.rate :
					asset.rate ?? 1
				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				const usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)
				const currencyValue = this.cBondsCurrencyService.getCurrencyAmount({
					currency,
					usdValue,
				}, currencyList,)
				return {
					currency,
					currencyValue: operation === AssetOperationType.BUY ?
						currencyValue :
						-currencyValue,
					usdValue: operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				}
			},)
			.filter((item,) => {
				return item !== null
			},)
		const metalDirectAssets = metalAssets.filter(
			(item,): item is NonNullable<typeof item> => {
				return item.productType === MetalType.DIRECT_HOLD
			},
		)
		const aggregatedMetalAssets = metalDirectAssets.reduce<
			Record<string, { totalUnits: number; assets: Array<IMetalsAsset> }>
		>((acc, asset,) => {
			const { entityId, bankId, accountId, units, operation, portfolioId, metalType, } = asset

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
				const { metalType, units, operation, transactionDate, } = asset
				if (transactionDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(transactionDate,)) {
					return null
				}
				if (!metalType) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
					metalList,
					metalType,
					units,
					historyDate: filter.date,
				},)

				return {
					currency:      metalType,
					currencyValue: operation === AssetOperationType.BUY ?
						units :
						-units,
					usdValue: operation === AssetOperationType.BUY ?
						usdValue :
						-usdValue,
				}
			},)

		const optionsAssets = filteredAssets.filter((asset,): asset is IOptionAsset => {
			return asset.assetName === AssetNamesType.OPTIONS
		},)
		const optionsBankData = optionsAssets
			.map((asset,) => {
				const { currency, currentMarketValue, maturityDate, startDate, } = asset
				if (startDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(startDate,)) {
					return null
				}
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: currentMarketValue,
					currencyList,
					historyDate:   filter.date,
				},)

				return {
					currency,
					currencyValue: currentMarketValue,
					usdValue,
				}
			},)
			.filter((asset,) => {
				return asset !== null
			},)

		const otherAssets = filteredAssets.filter((asset,): asset is IOtherAsset => {
			return asset.assetName === AssetNamesType.OTHER
		},)
		const otherBankData = otherAssets
			.map((asset,) => {
				const { currency, currencyValue, investmentDate, } = asset
				if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					currency,
					currencyValue,
					usdValue,
				}
			},)

		const privateEquityAssets = filteredAssets.filter((asset,): asset is IPrivateAsset => {
			return asset.assetName === AssetNamesType.PRIVATE_EQUITY
		},)
		const privateEquityBankData = privateEquityAssets
			.map((asset,) => {
				const { currency, currencyValue, entryDate, } = asset
				if (entryDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(entryDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					currency,
					currencyValue,
					usdValue,
				}
			},)

		const realEstateAssets = filteredAssets.filter((asset,): asset is IRealEstateAsset => {
			return asset.assetName === AssetNamesType.REAL_ESTATE
		},)
		const realEstateBankData = realEstateAssets
			.map((asset,) => {
				const { currency, currencyValue, investmentDate, } = asset
				if (investmentDate && filter.date && endOfDay(new Date(filter.date,),) < new Date(investmentDate,)) {
					return null
				}
				const usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
					historyDate: filter.date,
				},)

				return {
					currency,
					currencyValue,
					usdValue,
				}
			},)
		return [
			...cashBankData,
			...bondsBankData,
			...depositsBankData,
			...collateralBankData,
			...cryptoBankData,
			...cryptoETFData,
			...equityBankData,
			...loanBankData,
			...metalsBankData,
			...metalETFData,
			...optionsBankData,
			...otherBankData,
			...privateEquityBankData,
			...realEstateBankData,
		].reduce<Array<TCurrencyAnalytics>>((acc, asset,) => {
			if (!asset) {
				return acc
			}
			const {
				currency,
				currencyValue,
				usdValue,
			} = asset
			const existing = acc.find((item,) => {
				return item.currency === currency
			},)
			if (existing) {
				existing.usdValue = parseFloat((existing.usdValue + usdValue).toFixed(2,),)
				existing.currencyValue = parseFloat((existing.currencyValue + currencyValue).toFixed(2,),)
			} else {
				acc.push({
					usdValue:      parseFloat(usdValue.toFixed(2,),),
					currencyValue: parseFloat(currencyValue?.toFixed(2,),),
					currency,
				},)
			}
			return acc
		}, [],)
			.filter((asset,) => {
				return asset.currencyValue !== 0
			},)
	}
}