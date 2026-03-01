import { PrismaService, } from 'nestjs-prisma'
import { Injectable, } from '@nestjs/common'
import { assetParser, } from '../../../shared/utils'
import type { IPrivateAsset, } from '../../../modules/asset/asset.types'
import { AssetNamesType, } from '../../../modules/asset/asset.types'
import { CBondsCurrencyService, } from '../../../modules/apis/cbonds-api/services'
import type { IValue, IPEStatement,} from '../statement.types'

@Injectable()
export class PEStatementService {
	constructor(
    private readonly prismaService: PrismaService,
    private readonly cBondsCurrencyService: CBondsCurrencyService,
	) {}

	public async peStatement(): Promise<IPEStatement> {
		const [assets,] = await Promise.all([
			this.prismaService.asset.findMany({ where: { assetName: AssetNamesType.PRIVATE_EQUITY, }, },),
		],)

		const peStatement: Array<IValue> = []

		let totalMarketValueUSD = 0

		assets.forEach((asset,) => {
			const parsedPayload = assetParser<IPrivateAsset>(asset,)
			if (!parsedPayload) {
				return
			}
			const { currencyValue, } = parsedPayload
			const marketValueUsd = (Number(currencyValue,) * (asset.rate ?? 1))

			totalMarketValueUSD = totalMarketValueUSD + marketValueUsd
		},)

		peStatement.push({ marketValue: totalMarketValueUSD, },)

		return { pe: peStatement, }
	}
}
