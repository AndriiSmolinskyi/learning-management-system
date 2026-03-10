import React from 'react'
import {
	Loader,
	VerticalBarChart,
} from '../../../../shared/components'
import {
	ChartHeader,
} from './chart-header.component'
import {
	useCryptoStore,
} from '../crypto.store'
import {
	AssetNamesType,
	CryptoType,
	type TAnalyticsChartData,
} from '../../../../shared/types'
import type {
	TCurrencyAnalytics,
} from '../../../../services/analytics/analytics.types'
import {
	EmptyAnalyticsResponse,
} from '../../../../shared/components/empty-analytics-response/empty-analytics-response.component'
import {
	mergeCurrencyChartData, prepareCryptoCurrencyChartData,
} from '../../../../shared/utils'
import {
	useGetCryptoCurrencyAnalytics,
} from '../../../../shared/hooks'

import * as styles from '../crypto.styles'

type Props = {
	chartData?: Array<TCurrencyAnalytics>
	currencyIsFetching: boolean
	isFilterApplied?: boolean
}

export const VerticalChart: React.FunctionComponent<Props> = ({
	chartData,
	currencyIsFetching,
	isFilterApplied,
},) => {
	const {
		filter,
		setCryptoWallets,
		setCurrency,
		setAssetId,
		setCryptoTypes,
	} = useCryptoStore()

	const {
		data: totalCurrenciesData,
	} = useGetCryptoCurrencyAnalytics({
		type: AssetNamesType.CRYPTO,
	},)

	const totalCurrencyBarChartData = prepareCryptoCurrencyChartData(totalCurrenciesData,)
	const currencyBarChartData = prepareCryptoCurrencyChartData(chartData,)
	const result = mergeCurrencyChartData({
		total:   totalCurrencyBarChartData,
		current: currencyBarChartData,
	},)
	const handleCurrencyBarClick = (data: TAnalyticsChartData,): void => {
		setCryptoWallets(undefined,)
		setAssetId(undefined,)
		if (data.productType === CryptoType.DIRECT_HOLD) {
			setCurrency(undefined,)
			setCryptoTypes([data.name,],)
		}
		if (data.productType === CryptoType.ETF) {
			setCryptoTypes(undefined,)
			setCurrency([data.name,],)
		}
	}

	const handleCurrencyChartClear = (): void => {
		setCryptoWallets(undefined,)
		setCryptoTypes(undefined,)
		setCurrency(undefined,)
		setAssetId(undefined,)
	}

	return (
		<div className={styles.chartByCurrencyContainer}>
			<ChartHeader
				title='Market value by currency'
				handleClear={handleCurrencyChartClear}
				isDisabled={!filter.currency && !filter.cryptoTypes}
			/>
			{!currencyIsFetching && Boolean(chartData?.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} isAdditionalText={Boolean(totalCurrencyBarChartData.length,)}/>}
			{currencyIsFetching ?
				<Loader
					radius={6}
					width={150}
				/> :
				Boolean(chartData?.length !== 0,) && <VerticalBarChart
					data={result}
					handleBarClick={handleCurrencyBarClick}
					nameValue={filter.currency}
				/>}
		</div>
	)
}