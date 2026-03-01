import { PrismaService, } from 'nestjs-prisma'
import { Injectable, } from '@nestjs/common'
import { assetParser, } from '../../../shared/utils'
import type { IDepositAsset, } from '../../../modules/asset/asset.types'
import { AssetNamesType, } from '../../../modules/asset/asset.types'
import { CBondsCurrencyService, } from '../../../modules/apis/cbonds-api/services'
import type { IValue, IDepositStatement,} from '../statement.types'

@Injectable()
export class DepositStatementService {
	constructor(
    private readonly prismaService: PrismaService,
    private readonly cBondsCurrencyService: CBondsCurrencyService,
	) {}

	public async depositStatement(): Promise<IDepositStatement> {
		const [assets,] = await Promise.all([
			this.prismaService.asset.findMany({ where: { assetName: AssetNamesType.CASH_DEPOSIT, }, },),
		],)

		const depositStatement: Array<IValue> = []

		let totalMarketValueUSD = 0

		assets.forEach((asset,) => {
			const parsedPayload = assetParser<IDepositAsset>(asset,)
			if (!parsedPayload) {
				return
			}
			const { currencyValue, } = parsedPayload
			const marketValueUsd = (Number(currencyValue,) * (asset.rate ?? 1))

			totalMarketValueUSD = totalMarketValueUSD + marketValueUsd
		},)

		depositStatement.push({ marketValue: totalMarketValueUSD, },)

		return { deposit: depositStatement, }
	}
}
