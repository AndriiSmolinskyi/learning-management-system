import React from 'react'
import {
	Loader,
	VerticalBarChart,
} from '../../../../shared/components'
import {
	ChartHeader,
} from './chart-header.component'
import {
	useEquityStore,
} from '../equities.store'
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
	useEquityCurrencyAnalytics,
} from '../../../../shared/hooks'
import {
	mergeCurrencyChartData,
	prepareCurrencyChartData,
} from '../../../../shared/utils'

import * as styles from '../equities.styles'

type Props = {
	currenciesData?: Array<TCurrencyAnalytics>
	currencyIsFetching: boolean
	isFilterApplied?: boolean
}

export const ChartByCurrency: React.FunctionComponent<Props> = ({
	currenciesData,
	currencyIsFetching,
	isFilterApplied,
},) => {
	const {
		filter,
		setBankId,
		setCurrency,
		setAssetId,
	} = useEquityStore()

	const {
		data: totalCurrenciesData,
	} = useEquityCurrencyAnalytics({
		type: AssetNamesType.EQUITY_ASSET,
	},)

	const totalCurrencyBarChartData = prepareCurrencyChartData(totalCurrenciesData,)
	const currencyBarChartData = prepareCurrencyChartData(currenciesData,)
	const result = mergeCurrencyChartData({
		total:   totalCurrencyBarChartData,
		current: currencyBarChartData,
	},)

	const handleCurrencyBarClick = (data: TAnalyticsChartData,): void => {
		setBankId(undefined,)
		setAssetId(undefined,)
		setCurrency([data.name,],)
	}

	const handleCurrencyChartClear = (): void => {
		setBankId(undefined,)
		setCurrency(undefined,)
		setAssetId(undefined,)
	}

	return (
		<div className={styles.chartByCurrencyContainer}>
			<ChartHeader
				title='Market value by currency'
				handleClear={handleCurrencyChartClear}
				isDisabled={!filter.currency}
			/>
			{!currencyIsFetching && Boolean(currenciesData?.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} isAdditionalText={Boolean(currenciesData?.length,)}/>}
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