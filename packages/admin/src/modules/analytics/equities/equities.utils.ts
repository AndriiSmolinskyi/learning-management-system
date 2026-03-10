import type {
	IAnalyticsEquity,
} from '../../../services/analytics/analytics.types'
import {
	AssetOperationType,
	type TExcelSheetType,
} from '../../../shared/types'
import {
	localeString,
} from '../../../shared/utils'

export const getUnitsValue = (units: number, operation: string,): string => {
	if (units && operation) {
		return operation === AssetOperationType.BUY ?
			localeString(units, '', 0, false,) :
			`-${localeString(units, '', 0, false,)}`
	}
	return 'N/A'
}

export const getEquitySheetData = (tableData: Array<IAnalyticsEquity>,): TExcelSheetType => {
	return [
		[
			'Equity type',
			'Portfolio',
			'Entity',
			'Bank',
			'Account',
			'Issuer',
			'ISIN',
			'Security',
			'Currency',
			'Units',
			'Cost price',
			'Current stock price',
			'Cost value FC',
			'Cost value USD',
			'Market value FC',
			'Market value USD',
			'Profit USD',
			'Profit %',
			'Country',
			'Sector',
			'Value date',
		],
		...tableData.flatMap(
			({
				equityType,
				portfolioName,
				entityName,
				bankName,
				accountName,
				valueDate,
				issuer,
				isin,
				security,
				currency,
				currentStockPrice,
				units,
				costPrice,
				profitUsd,
				profitPercentage,
				costValueFC,
				costValueUsd,
				marketValueFC,
				marketValueUsd,
				country,
				sector,
			},) => {
				const rows: Array<Array<string | number | Date>> = []
				rows.push([
					equityType,
					portfolioName,
					entityName,
					bankName,
					accountName,
					issuer,
					isin,
					security,
					currency,
					Number(units,),
					Number(costPrice,),
					Number(currentStockPrice,),
					Number(costValueFC,),
					Number(costValueUsd,),
					Number(marketValueFC,),
					Number(marketValueUsd,),
					Number(profitUsd,),
					Number(profitPercentage,),
					country,
					sector === 'N/A' ?
						'- -' :
						(sector ?? '- -'),
					valueDate ?
						String(valueDate,) :
						'- -',
				],)
				return rows
			},
		),
	]
}

// Fallback function for grouped assets to show inner assets
// export const getEquitySheetData = (tableData: Array<IAnalyticsEquity>,): TExcelSheetType => {
// 	return [
// 		[
// 			'Equity type',
// 			'Portfolio',
// 			'Entity',
// 			'Bank',
// 			'Account',
// 			'Issuer',
// 			'ISIN',
// 			'Security',
// 			'Currency',
// 			'Units',
// 			'Cost price',
// 			'Current stock price',
// 			'Cost value FC',
// 			'Cost value USD',
// 			'Market value FC',
// 			'Market value USD',
// 			'Profit USD',
// 			'Profit %',
// 			'Country',
// 			'Sector',
// 			'Value date',
// 		],
// 		...tableData.flatMap(
// 			({
// 				equityType,
// 				portfolioName,
// 				entityName,
// 				bankName,
// 				accountName,
// 				valueDate,
// 				issuer,
// 				isin,
// 				security,
// 				currency,
// 				currentStockPrice,
// 				units,
// 				costPrice,
// 				profitUsd,
// 				profitPercentage,
// 				costValueFC,
// 				costValueUsd,
// 				marketValueFC,
// 				marketValueUsd,
// 				country,
// 				sector,
// 				assets,
// 				operation,
// 			},) => {
// 				const rows: Array<Array<string | number | Date>> = []
// 				const finalCurrency = (assets && assets.length > 0 && assets[0]?.currency) ?
// 					assets[0]?.currency :
// 					currency

// 				if (assets && assets.length > 0) {
// 					assets.forEach((asset,) => {
// 						rows.push([
// 							asset.equityType,
// 							asset.portfolioName,
// 							asset.entityName,
// 							asset.bankName,
// 							asset.accountName,
// 							asset.issuer,
// 							asset.isin,
// 							asset.security,
// 							finalCurrency,
// 							asset.operation === AssetOperationType.BUY ?
// 								Number(asset.units,) :
// 								-Number(asset.units,),
// 							Number(asset.costPrice,),
// 							Number(asset.currentStockPrice,),
// 							asset.operation === AssetOperationType.BUY ?
// 								Number(asset.costValueFC,) :
// 								-Number(asset.costValueFC,),
// 							asset.operation === AssetOperationType.BUY ?
// 								Number(asset.costValueUsd,) :
// 								-Number(asset.costValueUsd,),
// 							asset.operation === AssetOperationType.BUY ?
// 								Number(asset.marketValueFC,) :
// 								-Number(asset.marketValueFC,),
// 							asset.operation === AssetOperationType.BUY ?
// 								Number(asset.marketValueUsd,) :
// 								-Number(asset.marketValueUsd,),
// 							Number(asset.profitUsd,),
// 							Number(asset.profitPercentage,),
// 							asset.country,
// 							asset.sector ?? 'N/A',
// 							asset.valueDate ?
// 								String(asset.valueDate,) :
// 								'N/A',
// 						],)
// 					},)
// 				} else {
// 					rows.push([
// 						equityType,
// 						portfolioName,
// 						entityName,
// 						bankName,
// 						accountName,
// 						issuer,
// 						isin,
// 						security,
// 						finalCurrency,
// 						Number(units,),
// 						Number(costPrice,),
// 						Number(currentStockPrice,),
// 						Number(costValueFC,),
// 						Number(costValueUsd,),
// 						Number(marketValueFC,),
// 						Number(marketValueUsd,),
// 						Number(profitUsd,),
// 						Number(profitPercentage,),
// 						country,
// 						sector ?? 'N/A',
// 						valueDate ?
// 							String(valueDate,) :
// 							'N/A',
// 					],)
// 				}
// 				return rows
// 			},
// 		),
// 	]
// }