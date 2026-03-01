import { PrismaService, } from 'nestjs-prisma'
import { Injectable, } from '@nestjs/common'

import {
	assetParser,
} from '../../../shared/utils'
import {
	CBondsCurrencyService,
	CBondsEquityStocksService,
} from '../../../modules/apis/cbonds-api/services'

import type {
	IEquityAsset,
} from '../../../modules/asset/asset.types'
import {
	AssetNamesType,
} from '../../../modules/asset/asset.types'
import type {
	IValue,
	IEquityStatement,
} from '../statement.types'

@Injectable()
export class EquityStatementService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly cBondsEquityStocksService: CBondsEquityStocksService,
	) {}

	public async equityStatement(): Promise<IEquityStatement> {
		const [assets, currencyList,] = await Promise.all([
			this.prismaService.asset.findMany({ where: { assetName: AssetNamesType.EQUITY_ASSET, }, },),
			this.prismaService.currencyData.findMany(),
		],)

		const equityStatement: Array<IValue> = []

		let totalPurchaseValueUSD = 0
		let totalMarketValueUSD = 0

		const cBondsData = await this.prismaService.cBonds.findFirst({
			orderBy: { createdAt: 'desc', },
			select:  {
				tradingsStocksFullNew: true,
				stocksTradingGrounds:  true,
				stocksFull:            true,
				emitents:              true,
			},
		},)
		const cBonds = cBondsData ?
			[cBondsData,] :
			[]
		assets.forEach((asset,) => {
			const parsedPayload = assetParser<IEquityAsset>(asset,)
			if (!parsedPayload) {
				return
			}

			const { currency, units, isin, transactionPrice, } = parsedPayload
			const tradingStock = this.cBondsEquityStocksService.getEquityTradingStock(cBonds, isin,)
			const rate = this.cBondsCurrencyService.getCurrencyRate(currency, currencyList,)

			if (tradingStock) {
				const costValueUSD = Number(units,) * Number(transactionPrice,) * rate
				const marketValueUsd = Number(units,) * Number(tradingStock.last_price,)
				totalPurchaseValueUSD = totalPurchaseValueUSD + costValueUSD
				totalMarketValueUSD = totalMarketValueUSD + marketValueUsd
			}
		},)

		equityStatement.push({ purchaseValue: totalPurchaseValueUSD, },)
		equityStatement.push({ marketValue: totalMarketValueUSD, },)

		return { equity: equityStatement, }
	}
}
