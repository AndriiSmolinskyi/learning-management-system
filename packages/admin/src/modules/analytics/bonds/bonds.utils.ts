/* eslint-disable complexity */
import type {
	IAnalyticsBond,
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
	return '- -'
}

export const getBondsSheetData = (tableData: Array<IAnalyticsBond>,): TExcelSheetType => {
	return [
		[
			'Portfolio',
			'Entity',
			'Bank',
			'Account',
			'ISIN',
			'Security',
			'Currency',
			'Units',
			'Cost price',
			'Market price',
			'Cost value FC',
			'Cost value USD',
			'Market value FC',
			'Market value USD',
			'Profit USD',
			'Profit %',
			'Yield',
			'Value date',
			'Next coupon date',
			'Maturity date',
			'Issuer',
			'Sector',
			'Coupon',
			'Country',
		],
		...tableData.flatMap(
			({
				portfolioName,
				entityName,
				bankName,
				accountName,
				isin,
				security,
				currency,
				units,
				costPrice,
				profitUsd,
				profitPercentage,
				costValueFC,
				costValueUsd,
				marketPrice,
				marketValueFC,
				marketValueUsd,
				yield: bondYield,
				nextCouponDate,
				issuer,
				maturity,
				sector,
				coupon,
				country,
				valueDate,
			},) => {
				const rows: Array<Array<string | number | Date>> = []
				rows.push([
					portfolioName,
					entityName,
					bankName,
					accountName,
					isin,
					security,
					currency || '',
					Number(units,),
					Number(costPrice,),
					Number(marketPrice,),
					Number(costValueFC,),
					Number(costValueUsd,),
					Number(marketValueFC,),
					Number(marketValueUsd,),
					Number(profitUsd,),
					Number(profitPercentage,),
					Number(bondYield,),
					valueDate ?
						String(valueDate,) :
						'- -',
					nextCouponDate ?
						String(nextCouponDate,) :
						'- -',
					maturity ?
						String(maturity,) :
						'- -',
					issuer === 'N/A' ?
						'- -' :
						issuer,
					sector === 'N/A' ?
						'- -' :
						sector,
					coupon === 'N/A' ?
						'- -' :
						coupon,
					country === 'N/A' ?
						'- -' :
						country,
				],)
				return rows
			},
		),
	]
}

// Fallback function for grouped assets to show inner assets
// export const getBondsSheetData = (tableData: Array<IAnalyticsBond>,): TExcelSheetType => {
// 	return [
// 		[
// 			'Portfolio',
// 			'Entity',
// 			'Bank',
// 			'Account',
// 			'ISIN',
// 			'Security',
// 			'Currency',
// 			'Units',
// 			'Cost price',
// 			'Market price',
// 			'Cost value FC',
// 			'Cost value USD',
// 			'Market value FC',
// 			'Market value USD',
// 			'Profit USD',
// 			'Profit %',
// 			'Yield',
// 			'Value date',
// 			'Next coupon date',
// 			'Maturity date',
// 			'Issuer',
// 			'Sector',
// 			'Coupon',
// 			'Country',
// 		],
// 		...tableData.flatMap(
// 			({
// 				portfolioName,
// 				entityName,
// 				bankName,
// 				accountName,
// 				isin,
// 				security,
// 				currency,
// 				units,
// 				costPrice,
// 				profitUsd,
// 				profitPercentage,
// 				costValueFC,
// 				costValueUsd,
// 				marketPrice,
// 				marketValueFC,
// 				marketValueUsd,
// 				yield: bondYield,
// 				nextCouponDate,
// 				issuer,
// 				maturity,
// 				sector,
// 				coupon,
// 				country,
// 				assets,
// 				valueDate,
// 				operation,
// 			},) => {
// 				const rows: Array<Array<string | number | Date>> = []
// 				if (assets && assets.length > 0) {
// 					assets.forEach((asset: IBondProperties,) => {
// 						const finalCurrency = asset.currency || currency || ''
// 						rows.push([
// 							asset.portfolioName,
// 							asset.entityName,
// 							asset.bankName,
// 							asset.accountName,
// 							asset.isin,
// 							asset.security,
// 							finalCurrency,
// 							asset.operation === AssetOperationType.BUY ?
// 								Number(asset.units,) :
// 								-Number(asset.units,),
// 							Number(asset.costPrice,),
// 							Number(asset.marketPrice,),
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
// 							Number(asset.yield,),
// 							asset.valueDate ?
// 								String(asset.valueDate,) :
// 								'N/A',
// 							asset.nextCouponDate ?
// 								String(asset.nextCouponDate,) :
// 								'N/A',
// 							asset.maturity ?
// 								String(asset.maturity,) :
// 								'N/A',
// 							asset.issuer,
// 							asset.sector,
// 							asset.coupon,
// 							asset.country,
// 						],)
// 					},)
// 				} else {
// 					rows.push([
// 						portfolioName,
// 						entityName,
// 						bankName,
// 						accountName,
// 						isin,
// 						security,
// 						currency || '',
// 						Number(units,),
// 						Number(costPrice,),
// 						Number(marketPrice,),
// 						Number(costValueFC,),
// 						Number(costValueUsd,),
// 						Number(marketValueFC,),
// 						Number(marketValueUsd,),
// 						Number(profitUsd,),
// 						Number(profitPercentage,),
// 						Number(bondYield,),
// 						valueDate ?
// 							String(valueDate,) :
// 							'N/A',
// 						nextCouponDate ?
// 							String(nextCouponDate,) :
// 							'N/A',
// 						maturity ?
// 							String(maturity,) :
// 							'N/A',
// 						issuer,
// 						sector,
// 						coupon,
// 						country,
// 					],)
// 				}
// 				return rows
// 			},
// 		),
// 	]
// }
