/* eslint-disable @typescript-eslint/naming-convention */
import type {
	TBankAnalytics,
	TCurrencyAnalytics,
	TMaturityAnalytics,
} from '../../services/analytics/analytics.types'
import type {
	CryptoType,
	MetalType,
	TAnalyticsChartData,
} from '../types'

export const prepareCurrencyChartData = (data?: Array<TCurrencyAnalytics>,): Array<TAnalyticsChartData> => {
	if (!data) {
		return []
	}
	const grouped = data.reduce<Record<string, number>>((acc, {
		currency, usdValue, productType,
	},) => {
		acc[currency] = (acc[currency] ?? 0) + usdValue
		return acc
	}, {
	},)
	return Object.entries(grouped,)
		.map(([name, value,],) => {
			return {
				name, value,
			}
		},)
		.sort((a, b,) => {
			return b.value - a.value
		},)
}

export const prepareCryptoCurrencyChartData = (data?: Array<TCurrencyAnalytics>,): Array<TAnalyticsChartData> => {
	if (!data) {
		return []
	}

	const grouped = data.reduce<Record<string, TAnalyticsChartData>>((acc, {
		currency, usdValue, productType,
	},) => {
		if (acc[currency]) {
			acc[currency]!.value = acc[currency]!.value + usdValue
		} else {
			acc[currency] = {
				id:    currency,
				name:  currency,
				value: usdValue,
				productType,
			}
		}
		return acc
	}, {
	},)
	return Object.values(grouped,)
		.sort((a, b,) => {
			return b.value - a.value
		},)
}

export const prepareBankChartData = (data?: Array<TBankAnalytics>,): Array<TAnalyticsChartData> => {
	if (!data) {
		return []
	}
	const grouped = data.reduce<Record<string, TAnalyticsChartData>>((acc, {
		id, bankName, usdValue, productType,
	},) => {
		if (acc[id]) {
			acc[id]!.value = acc[id]!.value + usdValue
		} else {
			acc[id] = {
				id,
				name:  bankName,
				value: usdValue,
				productType,
			}
		}
		return acc
	}, {
	},)
	return Object.values(grouped,)
		.sort((a, b,) => {
			return b.value - a.value
		},)
}

export const prepareMaturityChartData = (
	data?: Array<TMaturityAnalytics>,
): Array<TAnalyticsChartData<number>> => {
	if (!data) {
		return []
	}

	const grouped = data.reduce<Record<number, number>>((acc, {
		year, usdValue,
	},) => {
		acc[year] = (acc[year] ?? 0) + usdValue
		return acc
	}, {
	},)

	return Object.entries(grouped,)
		.map(([year, value,],) => {
			return {
				name: Number(year,),
				value,
			}
		},)
		.sort((a, b,) => {
			return b.value - a.value
		},)
}

export const mergeBankChartData = <U extends string | number = string, T extends { name: U; value: number; productType?: CryptoType | MetalType } = TAnalyticsChartData<U>>({
	total,
	current,
}:
	{
		total: Array<T>,
		current: Array<T>
	},
): Array<T & { diff: number }> => {
	return total.map((item,) => {
		const match = 'id' in item ?
			current.find((entry,) => {
				return 'id' in entry && entry.id === item.id
			},) :
			current.find((entry,) => {
				return entry.name === item.name
			},)

		const currentValue = match?.value ?? 0
		const productType = match?.productType ?? undefined
		return {
			...item,
			value: currentValue,
			diff:  item.value - currentValue,
			productType,
		}
	},)
		.filter((item,) => {
			return item.value >= 1 || item.value <= -1
		},)
}

export const mergeCurrencyChartData = <
  U extends string | number,
  T extends { name: U; value: number; productType?: CryptoType | MetalType }
>({
		total,
		current,
	}: {
  total: Array<T>;
  current: Array<T>;
},): Array<T & { diff: number }> => {
	const allNames = Array.from(
		new Set([...total.map((t,) => {
			return t.name
		},), ...current.map((c,) => {
			return c.name
		},),],),
	)
	const result = allNames.map((name,) => {
		const totalItem = total.find((t,) => {
			return t.name === name
		},)
		const currentItem = current.find((c,) => {
			return c.name === name
		},)
		const totalValue = totalItem?.value ?? 0
		const currentValue = currentItem?.value ?? 0
		const base = (currentItem ?? totalItem ?? {
			name, value: 0,
		}) as T

		return {
			...base,
			value:       currentValue,
			diff:        totalValue - currentValue,
			productType: currentItem?.productType ?? totalItem?.productType,
		}
	},)
	return result.filter((item,) => {
		return item.value >= 1 || item.value <= -1
	},) as Array<T & { diff: number }>
}