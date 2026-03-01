import { PrismaService, } from 'nestjs-prisma'
import { Injectable, } from '@nestjs/common'

import { assetParser, } from '../../../shared/utils'
import { CBondsCurrencyService, } from '../../../modules/apis/cbonds-api/services'

import type { ICryptoAsset, } from '../../../modules/asset/asset.types'
import { AssetNamesType, } from '../../../modules/asset/asset.types'
import type { IValue, ICryptoStatement,} from '../statement.types'

@Injectable()
export class CryptoStatementService {
	constructor(
    private readonly prismaService: PrismaService,
    private readonly cBondsCurrencyService: CBondsCurrencyService,
	) {}

	public async cryptoStatement(): Promise<ICryptoStatement> {
		const [assets,] = await Promise.all([
			this.prismaService.asset.findMany({ where: { assetName: AssetNamesType.CRYPTO, }, },),
		],)

		const cryptoStatement: Array<IValue> = []

		let totalPurchaseValueUSD = 0
		let totalMarketValueUSD = 0

		const cryptoList = await this.prismaService.cryptoData.findMany()

		assets.forEach((asset,) => {
			const parsedPayload = assetParser<ICryptoAsset>(asset,)
			if (!parsedPayload) {
				return
			}
			const { cryptoAmount, purchasePrice, cryptoCurrencyType, } = parsedPayload

			const costValueUsd = purchasePrice && cryptoAmount ?
				purchasePrice * cryptoAmount :
				0
			const marketValueUsd = cryptoCurrencyType && cryptoAmount ?
				this.cBondsCurrencyService.getCryptoValueExchangedToUSD(
					{
						token: cryptoCurrencyType,
						cryptoAmount,
					},
					cryptoList,
				) :
				0

			totalPurchaseValueUSD = totalPurchaseValueUSD + costValueUsd
			totalMarketValueUSD = totalMarketValueUSD + marketValueUsd
		},)

		cryptoStatement.push({ purchaseValue: totalPurchaseValueUSD, },)
		cryptoStatement.push({ marketValue: totalMarketValueUSD, },)

		return { crypto: cryptoStatement, }
	}
}
