import {  PrismaService, } from 'nestjs-prisma'

import {
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common'

import {
	ERROR_MESSAGES,
} from '../../shared/constants'
import { IsinTypeIds, } from '../../modules/apis/cbonds-api/cbonds-api.types'

@Injectable()
export class CBondsEquityStocksRepository {
	constructor(
		private readonly prismaService: PrismaService,
	) {}

	/**
	 *  * 2.2.1.4
	 * Retrieves all the ISINs for the equity stocks.
	 * @returns A `Promise` resolving to an array of ISINs.
	 * @throws Will throw an error if there is a problem with the database query.
	 */
	public async getEquityStocksIsins(): Promise<Array<string>> {
		try {
			const equities = await this.prismaService.isins.findMany({
				where: {
					OR: [
						{ typeId: IsinTypeIds.EQUITY, },
						{ typeId: IsinTypeIds.ETF, },
					],
				},
				select: {
					isin: true,
				},
			},)
			return equities.map((equity,) => {
				return equity.isin
			},)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	 * * 3.5.3
	 * Retrieves all the securities for the equity stocks.
	 * @returns A `Promise` resolving to an array of securities.
	 * @throws Will throw an error if there is a problem with the database query.
	 */
	public async getEquityStocksSecurities(): Promise<Array<string>> {
		try {
			const cBonds = await this.prismaService.cBonds.findMany({
				select: {
					stocksTradingGrounds: true,
					etfFunds:             true,
				},
			},)
			const parsedCBonds = cBonds.flatMap((item,) => {
				if (typeof item.stocksTradingGrounds === 'string') {
					return JSON.parse(item.stocksTradingGrounds,)
				}
				return []
			},)
			const parsedEtfFunds = cBonds.flatMap((item,) => {
				if (typeof item.etfFunds === 'string') {
					return JSON.parse(item.etfFunds,)
				}
				return []
			},)
			return [...parsedCBonds, ...parsedEtfFunds,].map((bond,) => {
				return bond.ticker
			},)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	// todo: Remove after testing
	/**
	 * * 2.2.1.4
	 * Retrieves the security for a specific ISIN.
	 * @param isin - The ISIN for which the security should be fetched.
	 * @returns A `Promise` resolving to the security if found, or `null` if no security is associated with the ISIN.
	 * @throws Will throw an error if there is a problem with the database query.
	 */
	// public async getEquitySecurityByIsin(isin: string,): Promise<string | null> {
	// 	const typeId = await this.cBondsIsinsRepository.getIsinTypeId(isin,)
	// 	if (!typeId) {
	// 		return null
	// 	}
	// 	if (typeId === IsinTypeIds.EQUITY) {
	// 		const equities = await this.thirdPartyPrismaService.client.cBonds.findMany({
	// 			select: {
	// 				stocksTradingGrounds: true,
	// 			},
	// 		},)
	// 		const parsedCBonds = equities.flatMap((item,) => {
	// 			if (typeof item.stocksTradingGrounds === 'string') {
	// 				return JSON.parse(item.stocksTradingGrounds,)
	// 			}
	// 			return []
	// 		},)
	// 		const equity =  parsedCBonds.find((item,) => {
	// 			return item.isin === isin
	// 		},)
	// 		if (equity?.ticker) {
	// 			return equity.ticker
	// 		}
	// 		return null
	// 	}
	// 	if (typeId === IsinTypeIds.ETF) {
	// 		const equities = await this.thirdPartyPrismaService.client.cBonds.findMany({
	// 			select: {
	// 				etfFunds: true,
	// 			},
	// 		},)
	// 		const parsedCBonds = equities.flatMap((item,) => {
	// 			if (typeof item.etfFunds === 'string') {
	// 				return JSON.parse(item.etfFunds,)
	// 			}
	// 			return []
	// 		},)
	// 		const equity =  parsedCBonds.find((item,) => {
	// 			return item.isin === isin
	// 		},)
	// 		if (equity?.ticker) {
	// 			return equity.ticker
	// 		}
	// 		return null
	// 	}
	// 	return this.cBondsApiService.getEquityIsinSecurity(isin, typeId,)
	// }
}