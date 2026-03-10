import React from 'react'
import {
	HorizontalBarChart, Loader,
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
	TBankAnalytics,
} from '../../../../services/analytics/analytics.types'
import {
	EmptyAnalyticsResponse,
} from '../../../../shared/components/empty-analytics-response/empty-analytics-response.component'
import {
	mergeBankChartData,
	prepareBankChartData,
} from '../../../../shared/utils'
import {
	useGetCryptoBankAnalytics,
} from '../../../../shared/hooks'

import * as styles from '../crypto.styles'
import {
	useAnalyticsFilterStore,
} from '../../analytics-store'

type Props = {
	chartData?: Array<TBankAnalytics>
	bankIsFetching: boolean
	isFilterApplied?: boolean
}

export const HorizontalChart: React.FunctionComponent<Props> = ({
	chartData,
	bankIsFetching,
	isFilterApplied,
},) => {
	const {
		filter,
		setCryptoWallets,
		setCurrency,
		setAssetId,
		setBankId,
	} = useCryptoStore()
	const {
		analyticsFilter,
	} = useAnalyticsFilterStore()
	const {
		data: totalBanksData,
	} = useGetCryptoBankAnalytics({
		type: AssetNamesType.CRYPTO,
		date: analyticsFilter.date,
	},)
	const totalBankBarChartData = prepareBankChartData(totalBanksData,)
	const walletBarChartData = prepareBankChartData(chartData,)
	const result = mergeBankChartData({
		total:   totalBankBarChartData,
		current: walletBarChartData,
	},)

	const handleWalletBarClick = (data: TAnalyticsChartData,): void => {
		setCurrency(undefined,)
		setAssetId(undefined,)
		if (data.productType === CryptoType.DIRECT_HOLD) {
			setBankId(undefined,)
			setCryptoWallets([data.name,],)
		}
		if (data.productType === CryptoType.ETF) {
			setBankId(data.id,)
			setCryptoWallets(undefined,)
		}
	}

	const handleWalletChartClear = (): void => {
		setCryptoWallets(undefined,)
		setCurrency(undefined,)
		setAssetId(undefined,)
		setBankId(undefined,)
	}
	return (
		<div className={styles.chartByWalletsContainer}>
			<ChartHeader
				title='Market value by wallet/exchange/bank'
				handleClear={handleWalletChartClear}
				isDisabled={!filter.wallets && !filter.bankId}
			/>
			{!bankIsFetching && Boolean(chartData?.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} isAdditionalText={Boolean(totalBankBarChartData.length,)}/>}
			{bankIsFetching ?
				<Loader
					radius={6}
					width={150}
				/> :
				Boolean(chartData?.length !== 0,) && <HorizontalBarChart
					data={result}
					handleBarClick={handleWalletBarClick}
					toolTipName='Wallet/exchange/bank'
					height={26.2}
					nameValue={filter.wallets}
				/>}
		</div>
	)
}