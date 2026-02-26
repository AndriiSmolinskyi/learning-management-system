/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable complexity */
import {HttpException, HttpStatus, Inject, Injectable, } from '@nestjs/common'
import { CustomPrismaService, PrismaService,} from 'nestjs-prisma'

import { ERROR_MESSAGES, SUCCESS_MESSAGES, THIRD_PARTY_PRISMA_SERVICE,  } from '../../../../shared/constants'
import type { Message, } from '../../../../shared/types'
import type { IBondCurrencyResponse, IEntityCodeResponse, IEquityCurrencyResponse, IETFCurrencyResponse, IIsinCurrencyIdBody, IPortfolioIsinsFilter,} from '../cbonds-api.types'
import { IsinTypeIds, } from '../cbonds-api.types'
import { CBondsApiService, } from './cbonds-api.service'
import { filterFields, filterOperators, formatGetEmissionsLink, formatGetEntityCodes, formatGetEtfShareClassesQuotes, formatGetTradingsStocksFullNewLink, } from '../cbonds-api.constants'
import axios from 'axios'
import { ConfigService, } from '@nestjs/config'
import type { PrismaClient,} from '@prisma/client'
import { IsinType, } from '@prisma/client'
import type { CreateIsinDto, } from '../dto'
import { assetParser, } from '../../../../shared/utils'
import type { IBondsAsset, } from '../../../asset/asset.types'

@Injectable()
export class CBondsIsinService {
	private readonly apiLogin = this.configService.getOrThrow('CBONDS_API_LOGIN',)

	private readonly apiPassword = this.configService.getOrThrow('CBONDS_API_PASSWORD',)

	constructor(
			@Inject(THIRD_PARTY_PRISMA_SERVICE,)
			private readonly thirdPartyPrismaService: CustomPrismaService<PrismaClient>,
			private readonly cBondsApiService: CBondsApiService,
			private readonly configService: ConfigService,
			private readonly prismaService: PrismaService,
	) {}

	/**
 * 3.5.3
 * Retrieves the type ID (e.g., Bond, Equity, ETF) for a given ISIN using the CBonds API.
 * @param isin - The ISIN code to check.
 * @returns A promise resolving to the matching `IsinTypeIds`, or `null` if not found.
 *
 * Error Handling:
 * - Throws `ISIN_NOT_EXISTS` if API request fails or no data is found.
 */
	public async getIsinTypeId(isin: string,): Promise<IsinTypeIds | null> {
		try {
			const response = await axios.post<IEntityCodeResponse>(formatGetEntityCodes(), {
				auth: {
					login:    this.apiLogin,
					password: this.apiPassword,
				},
				quantity: {
					limit:  1,
					offset: 0,
				},
				filters: [
					{
						field:    filterFields.CODE_VALUE,
						operator: filterOperators.EQ,
						value:    isin,
					},
				],
				fields: [
					{
						field: filterFields.ENTITY_TYPE_ID,
					},
				],
			},)
			if (response.data.items.length === 0) {
				return null
			}
			return response.data.items[0].entity_type_id as IsinTypeIds
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.ISIN_NOT_EXISTS, HttpStatus.NOT_FOUND,)
		}
	}

	public async getIsinCurrencyId(data: IIsinCurrencyIdBody,): Promise<string | null> {
		const {isin, typeId, currencyId,} = data
		try {
			if (typeId === IsinTypeIds.BOND) {
				const response = await axios.post<IBondCurrencyResponse>(formatGetEmissionsLink(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit:  1,
						offset: 0,
					},
					filters: [
						{
							field:    filterFields.ISIN_CODE,
							operator: filterOperators.EQ,
							value:    isin,
						},
						{
							field:    filterFields.CURRENCY_ID,
							operator: filterOperators.EQ,
							value:    Number(currencyId,),
						},
					],
					fields: [
						{
							field: filterFields.CURRENCY_ID,
						},
					],
				},)
				if (response.data.items.length === 0) {
					return null
				}
				return response.data.items[0].currency_id
			}
			if (typeId === IsinTypeIds.EQUITY) {
				const response = await axios.post<IEquityCurrencyResponse>(formatGetTradingsStocksFullNewLink(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit:  1,
						offset: 0,
					},
					filters: [
						{
							field:    filterFields.ISIN,
							operator: filterOperators.EQ,
							value:    isin,
						},
						{
							field:    filterFields.CURRENCY_ID,
							operator: filterOperators.EQ,
							value:    Number(currencyId,),
						},
					],
					fields: [
						{
							field: filterFields.CURRENCY_ID,
						},
					],
				},)
				if (response.data.items.length === 0) {
					return null
				}

				return response.data.items[0].currency_id
			}
			if (typeId === IsinTypeIds.ETF) {
				const response = await axios.post<IETFCurrencyResponse>(formatGetEtfShareClassesQuotes(), {
					auth: {
						login:    this.apiLogin,
						password: this.apiPassword,
					},
					quantity: {
						limit:  1,
						offset: 0,
					},
					filters: [
						{
							field:    filterFields.ISIN,
							operator: filterOperators.EQ,
							value:    isin,
						},
						{
							field:    filterFields.CURRENCY_ID,
							operator: filterOperators.EQ,
							value:    Number(currencyId,),
						},
					],
					fields: [
						{
							field: filterFields.CURRENCY_ID,
						},
					],
				},)
				if (response.data.items.length === 0) {
					return null
				}
				return response.data.items[0].currency_id
			}
			return null
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.ISIN_HAS_NO_TRADE_DATA_IN_THIS_CURRENCY, HttpStatus.NOT_FOUND,)
		}
	}

	/**
 * 3.5.3
 * Creates and registers a new ISIN in the local database after validating it via the CBonds API.
 * @param isin - The ISIN to register.
 * @param isinType - Optional expected type to validate against the actual type.
 * @returns A promise resolving to a success or error `Message`.
 *
 * - Validates ISIN type from external CBonds API.
 * - Prevents duplicate entries.
 * - Syncs bond, equity, or ETF-related data depending on ISIN type.
 *
 * Error Handling:
 * - Throws `ISIN_IS_NOT_RELATED_TO_THIS_GROUP` if expected type and actual type do not match.
 * - Returns `ISIN_NOT_EXISTS` if ISIN already exists or type is not found.
 */
	public async createIsin(data: CreateIsinDto,): Promise<Message> {
		const {name: isinValue, currency, isinType,} = data

		const isin = isinValue.trim()
		const typeId = await this.getIsinTypeId(isin,)
		if (!typeId) {
			return {
				message: ERROR_MESSAGES.ISIN_NOT_EXISTS,
			}
		}
		const isIsinExist = await this.prismaService.isins.findUnique({
			where: {
				isin,
			},
		},)
		const currencyData = await this.prismaService.currencyData.findFirst({
			where: {
				currency,
			},
			select: {
				currencyId: true,
			},
		},)
		if (!currencyData) {
			return {
				message: ERROR_MESSAGES.ISIN_HAS_NO_TRADE_DATA_IN_THIS_CURRENCY,
			}
		}
		const isIsinExistInThirdDB = await this.thirdPartyPrismaService.client.isins.findUnique({
			where: {
				isin,
			},
		},)
		if (isinType && isinType === IsinType.Bond && (typeId !== IsinTypeIds.BOND)) {
			throw new HttpException(ERROR_MESSAGES.ISIN_IS_NOT_RELATED_TO_THIS_GROUP, HttpStatus.CONFLICT,)
		}
		if (isinType && (isinType === IsinType.Equity || isinType === IsinType.ETF) && (typeId === IsinTypeIds.BOND)) {
			throw new HttpException(ERROR_MESSAGES.ISIN_IS_NOT_RELATED_TO_THIS_GROUP, HttpStatus.CONFLICT,)
		}
		if (isIsinExist && isIsinExistInThirdDB) {
			return {
				message: ERROR_MESSAGES.ISIN_ALREADY_EXISTS,
			}
		}
		const currencyId = await this.getIsinCurrencyId({isin, typeId, currencyId: currencyData.currencyId,},)
		if (!currencyId) {
			return {
				message: ERROR_MESSAGES.ISIN_HAS_NO_TRADE_DATA_IN_THIS_CURRENCY,
			}
		}
		const existedIsin = await this.prismaService.isins.findUnique({
			where: {
				isin,
			},
			include: {
				currency: true,
			},
		},)
		if (existedIsin) {
			return {
				message: `${ERROR_MESSAGES.ISIN_IS_NOT_RELATED_TO_THIS_CURRENCY}${existedIsin.currency.currency}`,
			}
		}
		const isGBX = currencyId === '247'
		const type = this.getIsinType(typeId,)

		await this.prismaService.isins.create({
			data: {
				isin,
				typeId,
				type,
				isActivated: true,
				currencyId:  isGBX ?
					'12' :
					currencyId,
			},
		},)

		await this.thirdPartyPrismaService.client.isins.create({
			data: {
				isin,
				typeId,
				type,
				isActivated: true,
				currencyId:  isGBX ?
					'12' :
					currencyId,
			},
		},)
		if (typeId === IsinTypeIds.BOND) {
			try {
				await this.cBondsApiService.bondsDataUpdate(isin,)
			} catch (error) {
				return {
					message: ERROR_MESSAGES.ISIN_HAS_NO_DATA,
				}
			}
		}
		if ((typeId === IsinTypeIds.EQUITY)) {
			const equityIsins = await this.thirdPartyPrismaService.client.isins.findMany({
				where: {
					typeId:      '2',
				},
			},)
			try {
				await this.cBondsApiService.equitiesDataUpdate(equityIsins, isin,)
			} catch (error) {
				return {
					message: ERROR_MESSAGES.ISIN_HAS_NO_DATA,
				}
			}
		}
		if ((typeId === IsinTypeIds.ETF)) {
			const etfIsins = await this.thirdPartyPrismaService.client.isins.findMany({
				where: {
					typeId:      '3',
				},
			},)
			try {
				await this.cBondsApiService.etfsDataUpdate(etfIsins, isin,)
			} catch (error) {
				return {
					message: ERROR_MESSAGES.ISIN_HAS_NO_DATA,
				}
			}
		}

		return {
			message: SUCCESS_MESSAGES.ISIN_CREATED,
		}
	}

	/**
	 * CR-042
	 * Retrieves a list of unique ISINs associated with a specific portfolio.
	 * @remarks
	 * - This method fetches all active (non-archived) assets within a given portfolio.
	 * - It parses each asset to extract its ISIN and filters out any null or duplicate values.
	 * - Throws a `PORTFOLIO_NOT_FOUND` exception if the portfolio does not exist.
	 * @param portfolioId - The unique identifier of the portfolio whose ISINs need to be retrieved.
	 * @returns A promise that resolves to an array of unique ISIN strings related to the portfolio.
	 */
	public async getPortfolioIsins(filter: IPortfolioIsinsFilter,): Promise<Array<string>> {
		const portfolio = await this.prismaService.portfolio.findUnique({
			where: {
				id: filter.id,
			},
			select: {
				assets: {
					where: {
						isArchived: false,
						assetName:  filter.assetName,
					},
				},
			},
		},)
		if (!portfolio) {
			throw new HttpException(ERROR_MESSAGES.PORTFOLIO_NOT_FOUND, HttpStatus.NOT_FOUND,)
		}
		const portfolioIsins = portfolio.assets.map((asset,) => {
			const parsedAsset = assetParser<IBondsAsset>(asset,)
			if (!parsedAsset?.isin) {
				return null
			}
			return parsedAsset.isin
		},)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
		return [...new Set(portfolioIsins,),]
	}

	/**
		* 3.5.3
		* Maps an `entityTypeId` (string) from CBonds API to the corresponding enum `IsinType`.
		* @param entityTypeId - The ID to map (e.g. '1', '2', '3').
		* @returns A corresponding `IsinType` enum value.
		* Error Handling:
		* - Throws an error if the ID is not recognized.
	*/
	public getIsinType(entityTypeId: string,): IsinType {
		switch (entityTypeId) {
		case IsinTypeIds.BOND:
			return IsinType.Bond
		case IsinTypeIds.EQUITY:
			return IsinType.Equity
		case IsinTypeIds.ETF:
			return IsinType.ETF
		default:
			throw new Error(`Unknown entityTypeId: ${entityTypeId}`,)
		}
	}

	public async currencyByIsin(isin: string,): Promise<{ value: string; label: string }> {
		const record = await this.prismaService.isins.findUnique({
			where:   { isin, },
			include: {
				currency: {
					select: {
						currency: true,
					},
				},
			},
		},)
		if (!record) {
			throw new HttpException('ISIN_NOT_FOUND', HttpStatus.NOT_FOUND,)
		}

		const currencyName = record.currency.currency

		return {
			value: currencyName,
			label: currencyName,
		}
	}

	public async marketByIsin(isin: string,): Promise<{marketPrice: number}> {
		const record = await this.prismaService.bond.findUnique({
			where:   { isin, },
		},)
		if (!record) {
			throw new HttpException('ISIN_NOT_FOUND', HttpStatus.NOT_FOUND,)
		}

		const marketPrice = record.marketPrice ?
			Number(record.marketPrice.toFixed(2,),) :
			0

		return {
			marketPrice,
		}
	}
}