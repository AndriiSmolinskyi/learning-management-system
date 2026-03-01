import type { IBondParserResponse, IEquityParserResponse, } from '../../modules/apis/cbonds-api/cbonds-api.types'
import type { CBondsType, CEquityType, } from '../../modules/asset/asset.types'

export const cBondParser = (data: Array<Partial<CBondsType>>,): IBondParserResponse => {
	const parsedEmissions = data.flatMap((item,) => {
		return (typeof item.emissions === 'string' ?
			JSON.parse(item.emissions,) :
			item.emissions)
	},
	)
	const parsedTradings = data.flatMap((item,) => {
		return (typeof item.tradingsNew === 'string' ?
			JSON.parse(item.tradingsNew,) :
			item.tradingsNew)
	},
	)
	return {
		bondsEmissions: parsedEmissions,
		bondsTradings:  parsedTradings,
	}
}

export const cEquityParser = (data: Array<Partial<CEquityType>>,): IEquityParserResponse => {
	const parsedCBonds = data.flatMap((item,) => {
		if (typeof item.tradingsStocksFullNew === 'string') {
			return JSON.parse(item.tradingsStocksFullNew,)
		}
		return item.tradingsStocksFullNew
	},)
	const parsedETFBonds = data.flatMap((item,) => {
		if (typeof item.etfQuotes === 'string') {
			return JSON.parse(item.etfQuotes,)
		}
		return item.etfQuotes
	},)
	const parsedEquityTradingGrounds = data.flatMap((item,) => {
		if (typeof item.stocksTradingGrounds === 'string') {
			return JSON.parse(item.stocksTradingGrounds,)
		}
		return item.stocksTradingGrounds
	},)
	const parsedEtfTradingGrounds = data.flatMap((item,) => {
		if (typeof item.etfTradingGrounds === 'string') {
			return JSON.parse(item.etfTradingGrounds,)
		}
		return item.etfTradingGrounds
	},)
	const parsedEquityStocksFull = data.flatMap((item,) => {
		if (typeof item.stocksFull === 'string') {
			return JSON.parse(item.stocksFull,)
		}
		return item.stocksFull
	},)
	const parsedETtfFunds = data.flatMap((item,) => {
		if (typeof item.etfFunds === 'string') {
			return JSON.parse(item.etfFunds,)
		}
		return item.etfFunds
	},)
	const parsedEmitents = data.flatMap((item,) => {
		if (typeof item.emitents === 'string') {
			return JSON.parse(item.emitents,)
		}
		return item.emitents
	},)
	return {
		parsedCBonds,
		parsedETFBonds,
		parsedEquityTradingGrounds,
		parsedEtfTradingGrounds,
		parsedEquityStocksFull,
		parsedETtfFunds,
		parsedEmitents,
	}
}