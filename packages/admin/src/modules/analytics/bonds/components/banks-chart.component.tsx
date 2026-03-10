import React from 'react'
import {
	HorizontalBarChart, Loader,
} from '../../../../shared/components'
import {
	ChartHeader,
} from './chart-header.component'
import {
	useBondStore,
} from '../bonds.store'
import {
	AssetNamesType,
	type TAnalyticsChartData,
} from '../../../../shared/types'
import type {
	TBankAnalytics,
} from '../../../../services/analytics/analytics.types'
import {
	EmptyAnalyticsResponse,
} from '../../../../shared/components'
import {
	useBondBankAnalytics,
} from '../../../../shared/hooks'
import {
	mergeBankChartData,
	prepareBankChartData,
} from '../../../../shared/utils'

import * as styles from '../bonds.styles'
import {
	useAnalyticsFilterStore,
} from '../../analytics-store'

type Props = {
	banksData?: Array<TBankAnalytics>
	bankIsFetching: boolean
	isFilterApplied?: boolean
	isAssetClicked?: boolean
}

export const ChartByBank: React.FunctionComponent<Props> = ({
	banksData,
	bankIsFetching,
	isFilterApplied,
	isAssetClicked,
},) => {
	const {
		filter,
		setBankId,
		setCurrency,
		setAssetId,
	} = useBondStore()
	const {
		analyticsFilter,
	} = useAnalyticsFilterStore()
	const {
		data: totalBanksData,
	} = useBondBankAnalytics({
		type:     AssetNamesType.BONDS,
		date: analyticsFilter.date,
	},
	true,)

	const totalBankBarChartData = prepareBankChartData(totalBanksData,)
	const bankBarChartData = prepareBankChartData(banksData,)
	const result = mergeBankChartData({
		total:   totalBankBarChartData,
		current: bankBarChartData,
	},)
	const handleBankBarClick = (data: TAnalyticsChartData,): void => {
		setCurrency(undefined,)
		setAssetId(undefined,)
		setBankId(data.id,)
	}

	const handleBankChartClear = (): void => {
		setBankId(undefined,)
		setCurrency(undefined,)
		setAssetId(undefined,)
	}

	return (
		<div className={styles.chartByBankContainer}>
			<ChartHeader
				title='Market value by bank'
				handleClear={handleBankChartClear}
				isDisabled={!filter.bankId}
			/>
			{!bankIsFetching && Boolean(banksData?.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} isAdditionalText={Boolean(banksData?.length,)}/>}
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
					isAssetClicked={isAssetClicked}
				/>}
		</div>
	)
}