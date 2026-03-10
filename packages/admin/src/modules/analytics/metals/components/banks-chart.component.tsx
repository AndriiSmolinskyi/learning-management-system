import React from 'react'
import {
	HorizontalBarChart, Loader,
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
	TBankAnalytics,
} from '../../../../services/analytics/analytics.types'
import {
	EmptyAnalyticsResponse,
} from '../../../../shared/components/empty-analytics-response/empty-analytics-response.component'
import {
	mergeBankChartData, prepareBankChartData,
} from '../../../../shared/utils'
import {
	useMetalsBanks,
} from '../../../../shared/hooks'

import * as styles from '../metals.styles'
import {
	useAnalyticsFilterStore,
} from '../../analytics-store'

type Props = {
	banksData?: Array<TBankAnalytics>
	isFilterApplied?: boolean
	bankIsFetching: boolean
}

export const MetalBanksChart: React.FunctionComponent<Props> = ({
	banksData,
	bankIsFetching,
	isFilterApplied,
},) => {
	const {
		filter,
		setBankId,
		setCurrency,
		setAssetIds,
	} = useMetalsStore()
	const {
		analyticsFilter,
	} = useAnalyticsFilterStore()
	const {
		data: totalBanksData,
	} = useMetalsBanks({
		type: AssetNamesType.METALS,
		date: analyticsFilter.date,
	},)
	const totalBankBarChartData = prepareBankChartData(totalBanksData,)
	const bankBarChartData = prepareBankChartData(banksData,)
	const result = mergeBankChartData({
		total:   totalBankBarChartData,
		current: bankBarChartData,
	},)

	const handleBankBarClick = (data: TAnalyticsChartData,): void => {
		setCurrency(undefined,)
		setAssetIds(undefined,)
		setBankId(data.id,)
	}

	const handleBankChartClear = (): void => {
		setBankId(undefined,)
		setCurrency(undefined,)
		setAssetIds(undefined,)
	}

	return (
		<div className={styles.chartByBankContainer}>
			<ChartHeader
				title='Market value by bank'
				handleClear={handleBankChartClear}
				isDisabled={!filter.bankId}
			/>
			{!bankIsFetching && Boolean(banksData?.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} isAdditionalText={Boolean(totalBankBarChartData.length,)}/>}
			{bankIsFetching ?
				<Loader
					radius={6}
					width={150}
				/> :
				Boolean(banksData?.length !== 0,) && <HorizontalBarChart
					data={result}
					handleBarClick={handleBankBarClick}
					height={26.2}
					idValue={filter.bankId}
				/>}
		</div>
	)
}