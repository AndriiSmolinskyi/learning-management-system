import { PrismaService, } from 'nestjs-prisma'
import { Injectable, } from '@nestjs/common'

import { assetParser, } from '../../../shared/utils'

import type { IBondsAsset, } from '../../asset/asset.types'
import { AssetNamesType, } from '../../asset/asset.types'
import type { IValue, IBondsStatement, } from '../statement.types'
import { cBondParser, } from '../../../shared/utils/cbond-parser.util'

@Injectable()
export class BondsService {
	constructor(
		private readonly prismaService: PrismaService,
	) { }

	public async bondsStatement(): Promise<IBondsStatement> {
		const [assets, cBondsDataList, currencyList,] = await Promise.all([
			this.prismaService.asset.findMany({ where: { assetName: AssetNamesType.BONDS, }, },),
			this.prismaService.cBonds.findFirst({
				orderBy: { createdAt: 'desc', },
				select:  {
					emissions:   true,
					tradingsNew: true,
				},
			},),
			this.prismaService.currencyData.findMany(),
		],)

		const bondsStatement: Array<IValue> = []

		let totalPurchaseValueUSD = 0
		let totalMarketValueUSD = 0

		assets.forEach((asset,) => {
			const parsedPayload = assetParser<IBondsAsset>(asset,)
			if (!parsedPayload) {
				return
			}

			const { currency, units, unitPrice, isin, } = parsedPayload
			const {bondsTradings, } = cBondParser(cBondsDataList ?
				[cBondsDataList,] :
				[],)
			const bond = bondsTradings.find((b,) => {
				return b.isin === isin
			},)
			const currencyData = currencyList.find((c,) => {
				return c.currency === currency
			},)

			if (bond && currencyData) {
				const costValueUSD = units * unitPrice * (Number(currencyData.rate,) || 0)
				const marketValueUSD = units * (Number(bond.dirtyPriceCurrency,) || 0)

				totalPurchaseValueUSD = totalPurchaseValueUSD + costValueUSD
				totalMarketValueUSD = totalMarketValueUSD + marketValueUSD
			}
		},)

		bondsStatement.push({ purchaseValue: totalPurchaseValueUSD, },)
		bondsStatement.push({ marketValue: totalMarketValueUSD, },)

		return { bonds: bondsStatement, }
	}
}
