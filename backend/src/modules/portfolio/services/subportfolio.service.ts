import { PrismaService, } from 'nestjs-prisma'
import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'

import {
	ERROR_MESSAGES,
} from '../../../shared/constants'
import {
	CBondsCurrencyService,
} from '../../../modules/apis/cbonds-api/services'
import { PortfolioRepository, } from '../../../repositories/portfolio/portfolio.repository'
import type { IPortfolio, } from '../portfolio.types'
import { CryptoService, } from '../../crypto/crypto.service'

@Injectable()
export class SubportfolioService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly portfolioRepository: PortfolioRepository,
		private readonly cryptoService: CryptoService,
	) {}

	/**
	 * 1.3
	 * Retrieves a list of subportfolios associated with a specific portfolio ID.
	 * @param id - The unique identifier of the portfolio whose subportfolios are to be retrieved.
	 * @returns A Promise that resolves to an array of Portfolio objects. Returns an empty array if no subportfolios are found.
	 * @throws HttpException - If an error occurs while fetching the data.
	 */
	public async getSubportfolioListByPortfolioId(id: string,): Promise<Array<IPortfolio>> {
		try {
			const portfoliosPromise = this.prismaService.portfolio.findMany({
				where: {
					mainPortfolioId: id,
				},
				include: {
					documents:    true,
					banks:           true,
					entities:        true,
					accounts:     true,
					assets:       {
						where: {
							isArchived: false,
						},
						include: {
							portfolio: true,
							entity:    true,
							bank:      {include: { bankList: true, },},
							account:   true,
						},
					},
					transactions: true,
				},
				orderBy: {
					createdAt: 'desc',
				},
			},)
			const currencyListPromise = this.cBondsCurrencyService.getAllCurrencies()
			const metalListPromise = this.prismaService.metalData.findMany()
			const cryptoListPromise = this.prismaService.cryptoData.findMany()
			const [portfolios,currencyList,metalList,cryptoList,bonds, equities, etfs,] = await Promise.all([
				portfoliosPromise,
				currencyListPromise,
				metalListPromise,
				cryptoListPromise,
				this.prismaService.bond.findMany(),
				this.prismaService.equity.findMany(),
				this.prismaService.etf.findMany(),
			],)
			if (portfolios.length === 0) {
				return []
			}
			const portfoliosWithTotalAssets: Array<IPortfolio & { totalAssets: number }> = portfolios.map((portfolio,) => {
				return this.portfolioRepository.getPortfolioTotals(portfolio, {
					currencyList,
					metalList,
					cryptoList,
					bonds,
					equities,
					etfs,
				},)
			},)
			return portfoliosWithTotalAssets.map((portfolio,) => {
				return {
					...portfolio,
					name:        this.cryptoService.decryptString(portfolio.name,),
					...(portfolio.resident ?
						{resident:    this.cryptoService.decryptString(portfolio.resident,),} :
						{}),
					...(portfolio.taxResident ?
						{taxResident:    this.cryptoService.decryptString(portfolio.taxResident,),} :
						{}),
				}
			},)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.PORTFOLIO_NOT_FOUND, HttpStatus.NOT_FOUND,)
		}
	}
}