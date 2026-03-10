/* eslint-disable no-mixed-operators */
import type {
	TAnalyticsTableData, TExcelSheetType,
} from '../../../shared/types'
import {
	SortOrder,
} from '../../../shared/types'
import type {
	TCashCurrencyTableFilter,
} from './cash.types'
import {
	TCashCurrencyTableSortVariants,
} from './cash.types'

export const sortCurrencyList = (
	list: Array<TAnalyticsTableData>,
	filter: TCashCurrencyTableFilter,
): Array<TAnalyticsTableData> => {
	const {
		sortBy, sortOrder,
	} = filter

	const total = list.reduce<number>((acc, item,) => {
		return item.usdValue + acc
	}, 0,)

	return [...list,].sort((a, b,) => {
		let compareValue = 0

		if (sortBy === TCashCurrencyTableSortVariants.USD_VALUE) {
			compareValue = a.usdValue - b.usdValue
		} else {
			compareValue = a.usdValue / total - b.usdValue / total
		}

		return sortOrder === SortOrder.ASC ?
			compareValue :
			-compareValue
	},)
}

export const getCurrencySheetData = (tableData: Array<TAnalyticsTableData>,): TExcelSheetType => {
	const tableTotal = tableData.reduce<number>((acc, asset,) => {
		return acc + asset.usdValue
	}, 0,)

	return [['Currency', 'FC', 'USD', '%',], ...tableData.map(({
		usdValue, currency, currencyValue,
	},) => {
		const percentage = parseFloat((usdValue / tableTotal * 100).toFixed(3,),)
		return [currency, currencyValue, usdValue, percentage,]
	},),]
}
