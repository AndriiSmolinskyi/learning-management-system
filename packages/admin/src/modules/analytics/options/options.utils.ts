import type {
	TOptionsAssetAnalytics,
} from '../../../services/analytics/analytics.types'
import type {
	TExcelSheetType,
} from '../../../shared/types'
import {
	SortOrder,
} from '../../../shared/types'
import type {
	TOptionsTableFilter,
} from './options.types'
import {
	TOptionsSortVariants,
} from './options.types'

export const sortOptionsAssetList = (
	list: Array<TOptionsAssetAnalytics>,
	filter: TOptionsTableFilter,
): Array<TOptionsAssetAnalytics> => {
	const {
		sortBy,
		sortOrder,
	} = filter

	return [...list,].sort((a, b,) => {
		let compareValue = 0

		if (sortBy === TOptionsSortVariants.START_DATE) {
			compareValue = new Date(a.startDate,).getTime() - new Date(b.startDate,).getTime()
		} else if (sortBy === TOptionsSortVariants.MATURITY) {
			compareValue = new Date(a.maturity,).getTime() - new Date(b.maturity,).getTime()
		} else {
			compareValue = a.marketValue - b.marketValue
		}

		return sortOrder === SortOrder.ASC ?
			compareValue :
			-compareValue
	},)
}

export const getOptionsSheetData = (tableData: Array<TOptionsAssetAnalytics>,): TExcelSheetType => {
	return [[
		'Portfolio',
		'Entity',
		'Bank',
		'Account',
		'Currency',
		'Start date',
		'Maturity',
		'Pair',
		'Premium',
		'Strike',
		'Market value USD',
		'Principal value FC',
	], ...tableData.map(({
		bank,
		entity,
		account,
		currency,
		principalValue,
		marketValue,
		maturity,
		pair,
		portfolio,
		startDate,
		strike,
		premium,
	},) => {
		return [
			portfolio,
			entity,
			bank,
			account,
			currency,
			String(startDate,),
			String(maturity,),
			pair,
			Number(premium,),
			Number(strike,),
			Number(marketValue,),
			Number(principalValue,),
		]
	},),]
}