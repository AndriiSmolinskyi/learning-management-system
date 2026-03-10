import type {
	TBankAnalytics,
	TCurrencyAnalytics,
	TEntityAnalytics, TOverviewAssetAnalytics,
} from '../../../services/analytics/analytics.types'
import type {
	AssetNamesType,
	CryptoList,
	CurrencyList,
	MetalList,
	TAnalyticsChartData,
	TExcelSheetType,
} from '../../../shared/types'
import {
	SortOrder,
} from '../../../shared/types'
import type {
	TOverviewFilter,
	TOverviewTableFilter,
} from './overview.types'

export const sortOverviewList = <T extends {usdValue: number}>(
	list: Array<T>,
	filter: TOverviewTableFilter,
): Array<T> => {
	const {
		sortOrder,
	} = filter

	return [...list,].sort((a, b,) => {
		const compareValue = a.usdValue - b.usdValue

		return sortOrder === SortOrder.ASC ?
			compareValue :
			-compareValue
	},)
}

export const getEntitySheetData = (tableData: Array<TEntityAnalytics>,): TExcelSheetType => {
	const tableTotal = tableData.reduce<number>((acc, asset,) => {
		return acc + asset.usdValue
	}, 0,)

	return [['Portfolio', 'Entity types', 'USD', '%',], ...tableData.map(({
		entityName, usdValue, portfolioName,
	},) => {
		const percentage = parseFloat((usdValue / tableTotal * 100).toFixed(3,),)
		return [portfolioName ?? '', entityName, usdValue, percentage,]
	},),]
}

export const getAssetSheetData = (tableData: Array<TOverviewAssetAnalytics>,): TExcelSheetType => {
	const tableTotal = tableData.reduce<number>((acc, asset,) => {
		return acc + asset.usdValue
	}, 0,)

	return [['Asset type', 'USD', '%',], ...tableData.map(({
		usdValue, assetName,
	},) => {
		const percentage = parseFloat((usdValue / tableTotal * 100).toFixed(3,),)
		return [assetName, usdValue, percentage,]
	},),]
}

export const getBankSheetData = (tableData: Array<TBankAnalytics>,): TExcelSheetType => {
	const tableTotal = tableData.reduce<number>((acc, asset,) => {
		return acc + asset.usdValue
	}, 0,)

	return [['Bank account', 'Bank', 'USD', '%',], ...tableData.map(({
		usdValue, bankName, accountName,
	},) => {
		const percentage = parseFloat((usdValue / tableTotal * 100).toFixed(3,),)
		return [accountName ?? '', bankName, usdValue, percentage,]
	},),]
}

export const getCurrencySheetData = (tableData: Array<TCurrencyAnalytics>,): TExcelSheetType => {
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

export const getEntityPieChartData = ({
	data,
	filter,
}: { data?: Array<TEntityAnalytics>, filter: TOverviewFilter, },):
	Array<TAnalyticsChartData> | undefined => {
	return data
		?.filter((asset,) => {
			return filter.tableEntityIds ?
				filter.tableEntityIds.includes(asset.id,) :
				true
		},)
		.reduce<Array<TAnalyticsChartData>>(
			(acc, asset,) => {
				const {
					id,
					entityName,
					usdValue,
				} = asset
				const existing = acc.find((item,) => {
					return item.id === id
				},)
				if (existing) {
					existing.value = existing.value + usdValue
				} else {
					acc.push({
						id,
						name:  entityName,
						value: usdValue,
					},)
				}
				return acc
			}, [],)
		.sort((a, b,) => {
			return b.value - a.value
		},)
}

export const getBankPieChartData = ({
	data,
	filter,
}: { data?: Array<TBankAnalytics>, filter: TOverviewFilter, },):
	Array<TAnalyticsChartData> | undefined => {
	return data
		?.filter((asset,) => {
			return filter.tableBankIds ?
				filter.tableBankIds.includes(asset.id,) :
				true
		},)
		.reduce<Array<TAnalyticsChartData>>(
			(acc, asset,) => {
				const {
					id,
					bankName,
					usdValue,
				} = asset
				const existing = acc.find((item,) => {
					return item.id === id
				},)
				if (existing) {
					existing.value = existing.value + usdValue
				} else {
					acc.push({
						id,
						name:  bankName,
						value: usdValue,
					},)
				}
				return acc
			}, [],)
		.sort((a, b,) => {
			return b.value - a.value
		},)
}

export const getAssetPieChartData = ({
	data,
	filter,
}: { data?: Array<TOverviewAssetAnalytics>, filter: TOverviewFilter, },):
	Array<TAnalyticsChartData> | undefined => {
	return data
		?.filter((asset,) => {
			return filter.tableAssetNames ?
				filter.tableAssetNames.includes(asset.assetName,) :
				true
		},)
		.reduce<Array<TAnalyticsChartData<AssetNamesType>>>(
			(acc, asset,) => {
				const {
					assetName,
					usdValue,
				} = asset
				const existing = acc.find((item,) => {
					return item.name === assetName
				},)
				if (existing) {
					existing.value = existing.value + usdValue
				} else {
					acc.push({
						name:  assetName,
						value: usdValue,
					},)
				}
				return acc
			}, [],)
		.sort((a, b,) => {
			return b.value - a.value
		},)
}

export const getCurrencyPieChartData = ({
	data,
	filter,
}: { data?: Array<TCurrencyAnalytics>, filter: TOverviewFilter, },):
	Array<TAnalyticsChartData> | undefined => {
	return data
		?.filter((asset,) => {
			return filter.tableCurrencies ?
				filter.tableCurrencies.includes(asset.currency,) :
				true
		},)
		.reduce<Array<TAnalyticsChartData<CurrencyList | CryptoList | MetalList>>>(
			(acc, asset,) => {
				const {
					currency,
					usdValue,
				} = asset
				const existing = acc.find((item,) => {
					return item.name === currency
				},)
				if (existing) {
					existing.value = existing.value + usdValue
				} else {
					acc.push({
						name:  currency,
						value: usdValue,
					},)
				}
				return acc
			}, [],)
		.sort((a, b,) => {
			return b.value - a.value
		},)
}