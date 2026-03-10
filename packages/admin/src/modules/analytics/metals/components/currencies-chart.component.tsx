import React from 'react'
import {
	Loader,
	VerticalBarChart,
} from '../../../../shared/components'
import {
	ChartHeader,
} from './chart-header.component'
import {
	useMetalsStore,
} from '../metals.store'
import {
	AssetNamesType,
	type TAnalyticsChartData,
} from '../../../../shared/types'
import type {
	TCurrencyAnalytics,
} from '../../../../services/analytics/analytics.types'
import {
	EmptyAnalyticsResponse,
} from '../../../../shared/components/empty-analytics-response/empty-analytics-response.component'
import {
	mergeCurrencyChartData,
	prepareCryptoCurrencyChartData,
} from '../../../../shared/utils'
import {
	useMetalsCurrencies,
} from '../../../../shared/hooks'

import * as styles from '../metals.styles'

type Props = {
	currenciesData?: Array<TCurrencyAnalytics>
	currencyIsFetching: boolean
	isFilterApplied?: boolean
}

export const MetalCurrenciesChart: React.FunctionComponent<Props> = ({
	currenciesData,
	currencyIsFetching,
	isFilterApplied,
},) => {
	const {
		filter,
		setBankId,
		setCurrency,
		setAssetIds,
		setMetal,
	} = useMetalsStore()

	const {
		data: totalCurrenciesData,
	} = useMetalsCurrencies({
		type: AssetNamesType.METALS,
	},)

	const totalCurrencyBarChartData = prepareCryptoCurrencyChartData(totalCurrenciesData,)
	const currencyBarChartData = prepareCryptoCurrencyChartData(currenciesData,)
	const result = mergeCurrencyChartData({
		total:   totalCurrencyBarChartData,
		current: currencyBarChartData,
	},)
	const metalsArray = ['XAU','XAG','XPD','XPT',]
	const handleCurrencyBarClick = (data: TAnalyticsChartData,): void => {
		setBankId(undefined,)
		setAssetIds(undefined,)
		if (metalsArray.includes(data.name,)) {
			setCurrency(undefined,)
			setMetal([data.name,],)
		} else {
			setMetal(undefined,)
			setCurrency([data.name,],)
		}
	}

	const handleCurrencyChartClear = (): void => {
		setBankId(undefined,)
		setCurrency(undefined,)
		setAssetIds(undefined,)
		setMetal(undefined,)
	}

	return (
		<div className={styles.chartByCurrencyContainer}>
			<ChartHeader
				title='Market value by currency'
				handleClear={handleCurrencyChartClear}
				isDisabled={!filter.currency}
			/>
			{!currencyIsFetching && Boolean(currenciesData?.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} isAdditionalText={Boolean(totalCurrencyBarChartData.length,)}/>}
			{currencyIsFetching ?
				<Loader
					radius={6}
					width={150}
				/> :
				Boolean(currenciesData?.length !== 0,) && <VerticalBarChart
					data={result}
					handleBarClick={handleCurrencyBarClick}
					nameValue={filter.currency}
				/>}
		</div>
	)
}