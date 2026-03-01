import { PrismaService, } from 'nestjs-prisma'
import { Injectable, } from '@nestjs/common'

import { assetParser, } from '../../../shared/utils'
import { CBondsCurrencyService, } from '../../../modules/apis/cbonds-api/services'

import type { IMetalsAsset, } from '../../../modules/asset/asset.types'
import { AssetNamesType, } from '../../../modules/asset/asset.types'
import type { IValue, IMetalsStatement,} from '../statement.types'

@Injectable()
export class MetalsStatementService {
	constructor(
    private readonly prismaService: PrismaService,
    private readonly cBondsCurrencyService: CBondsCurrencyService,
	) {}

	public async metalsStatement(): Promise<IMetalsStatement> {
		const [assets,] = await Promise.all([
			this.prismaService.asset.findMany({ where: { assetName: AssetNamesType.METALS, }, },),
		],)

		const metalsStatement: Array<IValue> = []

		let totalPurchaseValueUSD = 0
		let totalMarketValueUSD = 0

		const metalList = await this.prismaService.metalData.findMany()

		assets.forEach((asset,) => {
			const parsedPayload = assetParser<IMetalsAsset>(asset,)
			if (!parsedPayload) {
				return
			}
			const { metalType, purchasePrice, units, } = parsedPayload
			if (!metalType) {
				return
			}
			const costValueUSD = units * Number(purchasePrice,)

			const marketValueUsd = this.cBondsCurrencyService.getMetalValueExchangedToUSD(
				{
					metalType,
					units,
				},
				metalList,
			)

			totalPurchaseValueUSD = totalPurchaseValueUSD + costValueUSD
			totalMarketValueUSD = totalMarketValueUSD + marketValueUsd
		},)

		metalsStatement.push({ purchaseValue: totalPurchaseValueUSD, },)
		metalsStatement.push({ marketValue: totalMarketValueUSD, },)

		return { metals: metalsStatement, }
	}
}
