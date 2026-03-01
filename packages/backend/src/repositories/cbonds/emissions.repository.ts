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
import type { CurrencyDataList, } from '@prisma/client'
import { cBondParser, } from '../../shared/utils/cbond-parser.util'

@Injectable()
export class CBondsEmissionsRepository {
	constructor(
		private readonly prismaService: PrismaService,
	) {}

	/**
	 *  * 2.2.1.4
     * Retrieves all the ISINs for the emissions.
     * @returns A `Promise` resolving to an array of ISINs.
     * @throws Will throw an error if there is a problem with the database query.
     */
	public async getEmissionsIsins(currency?: CurrencyDataList,): Promise<Array<string>> {
		try {
			let currencyId: string | undefined
			if (currency) {
				const currencyData = await this.prismaService.currencyData.findFirst({
					where: {
						currency,
					},
				},)

				if (currencyData) {
					const { currencyId: foundCurrencyId, } = currencyData
					currencyId = foundCurrencyId
				}
			}
			const bonds = await this.prismaService.isins.findMany({
				where: {
					typeId:      IsinTypeIds.BOND,
					isActivated: true,
					...(currencyId ?
						{ currencyId, } :
						{}),
				},
				select: {
					isin: true,
				},
			},)
			return bonds.map((bond,) => {
				return bond.isin
			},)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	 * * 3.5.3
     * Retrieves all the securities for the emissions.
     * @returns A `Promise` resolving to an array of securities.
     * @throws Will throw an error if there is a problem with the database query.
     */
	public async getEmissionsSecurities(): Promise<Array<string>> {
		try {
			const bonds = await this.prismaService.cBonds.findFirst({
				orderBy: { createdAt: 'desc', },
				select:  {
					emissions:   true,
					tradingsNew: true,
				},
			},)
			const {bondsEmissions, } = cBondParser(bonds ?
				[bonds,] :
				[],)

			return bondsEmissions.map((bond,) => {
				return bond.security
			},)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.CBONDS_RETRIEVE_DATA_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	 * * 2.2.1.4
     * Retrieves the security for a specific ISIN.
     * @param isin - The ISIN for which the security should be fetched.
     * @returns A `Promise` resolving to the security if found, or `null` if no security is associated with the ISIN.
     * @throws Will throw an error if there is a problem with the database query.
     */
	// public async getSecurityByIsin(isin: string,): Promise<string> {
	// 	const existedBond = await this.thirdPartyPrismaService.client.bondsData.findFirst({
	// 		where: {
	// 			isin,
	// 		},
	// 	},)
	// 	if (existedBond?.security) {
	// 		return existedBond.security
	// 	}
	// 	return this.cBondsApiService.getBondIsinSecurity(isin,)
	// }
}