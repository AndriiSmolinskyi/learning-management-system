/* eslint-disable complexity */
import type {
	TRealEstateAssetAnalytics,
} from '../../../services/analytics/analytics.types'
import type {
	TExcelSheetType,
} from '../../../shared/types'
import {
	SortOrder,
} from '../../../shared/types'
import type {
	TRealEstateTableFilter,
} from './real-estate.types'
import {
	TRealEstateSortVariants,
} from './real-estate.types'

export const sortRealEstateAssetList = (list: Array<TRealEstateAssetAnalytics>, filter: TRealEstateTableFilter,): Array<TRealEstateAssetAnalytics> => {
	const {
		sortBy, sortOrder,
	} = filter

	return [...list,].sort((a, b,) => {
		let compareValue = 0

		switch (sortBy) {
		case TRealEstateSortVariants.DATE:
			compareValue = new Date(a.date,).getTime() - new Date(b.date,).getTime()
			break
		case TRealEstateSortVariants.CURRENCY_VALUE:
			compareValue = Number(a.currencyValue,) - Number(b.currencyValue,)
			break
		case TRealEstateSortVariants.COST_VALUE_USD:
			compareValue = Number(a.usdValue,) - Number(b.usdValue,)
			break
		case TRealEstateSortVariants.MARKET_VALUE_USD:
			compareValue = Number(a.marketUsdValue,) - Number(b.marketUsdValue,)
			break
		case TRealEstateSortVariants.PROFIT_USD:
			compareValue = Number(a.profitUsd,) - Number(b.profitUsd,)
			break
		case TRealEstateSortVariants.PROFIT_PER:
			compareValue = Number(a.profitPercentage,) - Number(b.profitPercentage,)
			break
		default:
			compareValue = 0
		}

		return sortOrder === SortOrder.ASC ?
			compareValue :
			-compareValue
	},)
}

export const getRealEstateSheetData = (tableData: Array<TRealEstateAssetAnalytics>,): TExcelSheetType => {
	return [[
		'Portfolio',
		'Entity',
		'Bank',
		'Account',
		'Country',
		'City',
		'Project transaction',
		'Operation',
		'Currency',
		'Value in currency',
		'Cost value USD',
		'Market value in FC',
		'Market value USD',
		'Profit USD',
		'Profit %`',
		'Value date',
	], ...tableData.map(({
		portfolio,
		entity,
		bank,
		account,
		country,
		city,
		projectTransaction,
		operation = '',
		date,
		currency,
		currencyValue,
		usdValue,
		marketUsdValue,
		profitUsd,
		profitPercentage,
		marketValueFC,
	},) => {
		return [
			portfolio,
			entity,
			bank,
			account,
			country,
			city,
			projectTransaction,
			operation,
			currency,
			Number(currencyValue,),
			Number(usdValue,),
			Number(marketValueFC,),
			Number(marketUsdValue,),
			Number(profitUsd,),
			Number(profitPercentage,),
			date ?
				String(date,) :
				'- -',
		]
	},),]
}