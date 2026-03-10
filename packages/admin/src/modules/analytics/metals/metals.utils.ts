/* eslint-disable complexity */
import type {
	IMetalAssetExtended,
} from '../../../services/analytics/analytics.types'
import {
	AssetOperationType,
	MetalType,
	type TExcelSheetType,
} from '../../../shared/types'
import {
	localeString,
} from '../../../shared/utils'

export const getUnitsValue = (productType: MetalType, units: number, operation?: string,): string => {
	if (productType === MetalType.ETF) {
		if (units && operation) {
			return operation === AssetOperationType.BUY ?
				localeString(units, '', 0, false,) :
				`-${localeString(units, '', 0, false,)}`
		}
		return 'N/A'
	}
	return 'N/A'
}

export const getMetalsSheetData = (tableData: Array<IMetalAssetExtended>,): TExcelSheetType => {
	return [
		[
			'Product type',
			'Portfolio',
			'Entity',
			'Bank',
			'Account',
			'Issuer',
			'ISIN',
			'Security',
			'Currency',
			'Units',
			'Metal type',
			'Metal name',
			'Cost price',
			'Market price',
			'Cost value FC',
			'Cost value USD',
			'Market value FC',
			'Market value USD',
			'Profit USD',
			'Profit %',
			'Country',
			'Value Date',
		],
		...tableData.flatMap(
			({
				productType,
				portfolioName = '',
				entityName = '',
				bankName = '',
				accountName = '',
				valueDate,
				issuer,
				isin,
				security,
				currency,
				units,
				metalType,
				metalName,
				costPrice,
				currentStockPrice,
				costValueFC,
				costValueUsd,
				marketValueFC,
				marketValueUsd,
				profitUsd,
				profitPercentage,
				country,
			},) => {
				const rows: Array<Array<string | number | Date>> = []
				rows.push([
					productType,
					portfolioName,
					entityName,
					bankName,
					accountName,
					issuer ?? '- -',
					isin ?? '- -',
					security ?? '- -',
					currency,
					Number(units,),
					metalType ?? '- -',
					metalName ?? '- -',
					costPrice ?
						Number(costPrice,) :
						0,
					Number(currentStockPrice,),
					Number(costValueFC,),
					Number(costValueUsd,),
					Number(marketValueFC,),
					Number(marketValueUsd,),
					Number(profitUsd,),
					Number(profitPercentage,),
					country ?
						country :
						'Global',
					String(valueDate,),
				],)
				return rows
			},
		),
	]
}

// Fallback function for grouped assets to show inner assets
// export const getMetalsSheetData = (tableData: Array<IMetalAssetExtended>,): TExcelSheetType => {
// 	return [
// 		[
// 			'Product type',
// 			'Portfolio',
// 			'Entity',
// 			'Bank',
// 			'Account',
// 			'Issuer',
// 			'ISIN',
// 			'Security',
// 			'Currency',
// 			'Units',
// 			'Metal type',
// 			'Metal name',
// 			'Cost price',
// 			'Market price',
// 			'Cost value FC',
// 			'Cost value USD',
// 			'Market value FC',
// 			'Market value USD',
// 			'Profit USD',
// 			'Profit %',
// 			'Country',
// 			'Value Date',
// 		],
// 		...tableData.flatMap(
// 			({
// 				productType,
// 				portfolioName = '',
// 				entityName = '',
// 				bankName = '',
// 				accountName = '',
// 				valueDate,
// 				issuer,
// 				isin,
// 				security,
// 				currency,
// 				units,
// 				metalType,
// 				metalName,
// 				costPrice,
// 				currentStockPrice,
// 				costValueFC,
// 				costValueUsd,
// 				marketValueFC,
// 				marketValueUsd,
// 				profitUsd,
// 				profitPercentage,
// 				assets,
// 				country,
// 			},) => {
// 				const rows: Array<Array<string | number | Date>> = []

// 				if (assets && assets.length > 0) {
// 					assets.forEach((asset: IMetalAssetExtended,) => {
// 						rows.push([
// 							asset.productType,
// 							asset.portfolioName ?? '',
// 							asset.entityName ?? '',
// 							asset.bankName ?? '',
// 							asset.accountName ?? '',
// 							asset.issuer ?? 'N/A',
// 							asset.isin ?? 'N/A',
// 							asset.security ?? 'N/A',
// 							asset.currency,
// 							asset.operation === AssetOperationType.BUY ?
// 								Number(asset.units,) :
// 								-Number(asset.units,),
// 							asset.metalType ?? 'N/A',
// 							asset.metalName ?? 'N/A',
// 							asset.costPrice ?
// 								Number(asset.costPrice,) :
// 								0,
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
// 							asset.country ?
// 								asset.country :
// 								'Global',
// 							String(asset.valueDate,),
// 						],)
// 					},)
// 				} else {
// 					rows.push([
// 						productType,
// 						portfolioName,
// 						entityName,
// 						bankName,
// 						accountName,
// 						issuer ?? 'N/A',
// 						isin ?? 'N/A',
// 						security ?? 'N/A',
// 						currency,
// 						Number(units,),
// 						metalType ?? 'N/A',
// 						metalName ?? 'N/A',
// 						costPrice ?
// 							Number(costPrice,) :
// 							0,
// 						Number(currentStockPrice,),
// 						Number(costValueFC,),
// 						Number(costValueUsd,),
// 						Number(marketValueFC,),
// 						Number(marketValueUsd,),
// 						Number(profitUsd,),
// 						Number(profitPercentage,),
// 						country ?
// 							country :
// 							'Global',
// 						String(valueDate,),
// 					],)
// 				}
// 				return rows
// 			},
// 		),
// 	]
// }