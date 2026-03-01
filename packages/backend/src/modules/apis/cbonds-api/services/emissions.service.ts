import {Injectable, } from '@nestjs/common'
import type { GetSecurityByIsinDto, } from '../dto'
import { CBondsEmissionsRepository, } from '../../../../repositories/cbonds'
import { IsinTypeIds, type IGetEmissionsItem, } from '../cbonds-api.types'
import { CBondsApiService, } from './'
import type { CurrencyDataList, } from '@prisma/client'
import { PrismaService, } from 'nestjs-prisma'

@Injectable()
export class CBondsEmissionsService {
	constructor(
		private readonly cBondsEmissionsRepository: CBondsEmissionsRepository,
		private readonly cBondsApiService: CBondsApiService,
		private readonly prismaService: PrismaService,
	) {}

	/**
 * 2.2.1.4
 * Retrieves a list of ISINs (International Securities Identification Numbers) for emissions.
 * @returns A promise that resolves to an array of strings representing the ISINs of all emissions.
 *
 * This method fetches all ISINs associated with emissions by calling the `getEmissionsIsins` method of the `cBondsEmissionsRepository`.
 * It returns an array of strings containing the ISINs of the emissions.
 *
 * Error Handling:
 * - If any error occurs during the data retrieval, it will be handled by the repository or calling code.
 */
	public async getEmissionsIsins(currency?: CurrencyDataList,): Promise<Array<string>> {
		return this.cBondsEmissionsRepository.getEmissionsIsins(currency,)
	}

	/**
 	* 3.5.3
 * Retrieves a list of securities associated with emissions.
 * @returns A promise that resolves to an array of strings representing the securities of all emissions.
 *
 * This method fetches all securities associated with emissions by calling the `getEmissionsSecurities` method of the `cBondsEmissionsRepository`.
 * It returns an array of strings containing the securities.
 *
 * Error Handling:
 * - If any error occurs during the data retrieval, it will be handled by the repository or calling code.
 */
	public async getEmissionsSecurities(): Promise<Array<string>> {
		return this.cBondsEmissionsRepository.getEmissionsSecurities()
	}

	/**
* 2.2.1.4
 * Retrieves security details based on a provided ISIN (International Securities Identification Number).
 * @param query - The `GetSecurityByIsinDto` object containing the ISIN to search for.
 * @returns A promise that resolves to the security associated with the given ISIN, or `null` if not found.
 *
 * This method fetches security details by querying the `cBondsEmissionsRepository` for a matching ISIN.
 * It returns the security information or `null` if no security matches the provided ISIN.
 *
 * Error Handling:
 * - If any error occurs during the data retrieval, it will be handled by the repository or calling code.
 */
	public async getSecurityByIsin(query: GetSecurityByIsinDto,): Promise<string | number | null> {
		const existedBond = await this.prismaService.bond.findFirst({
			where: {
				isin: query.isin,
			},
		},)
		if (existedBond?.security) {
			return existedBond.security
		}
		return this.cBondsApiService.getBondIsinSecurity(query.isin,)
	}

	/**
 * CR - 030
 * This method checks emissions in the stored CBonds data and finds bonds with a `maturityDate` earlier than today.
 * It then updates those ISINs in the DB to set `isActivated = false`.
 *
 * Error Handling:
 * - Skips operation if `cBonds` data is missing or malformed.
 */
	public async checkBondIsinsUnits(): Promise<void> {
		const today = new Date()
		const cBonds = await this.prismaService.cBonds.findFirst()
		if (!cBonds || typeof cBonds.emissions !== 'string') {
			return
		}
		const emissions: Array<IGetEmissionsItem> = JSON.parse(cBonds.emissions,)
		const updatePromises = emissions
			.filter((emission,) => {
				if (!emission.maturityDate) {
					return false
				}
				return new Date(emission.maturityDate,) < today
			},)
			.map(async(emission,) => {
				return this.prismaService.isins.update({
					where: {
						isin:   emission.isin,
						typeId: IsinTypeIds.BOND,
					},
					data:  { isActivated: false, },
				},)
			},)
		await Promise.all(updatePromises,)
	}
}