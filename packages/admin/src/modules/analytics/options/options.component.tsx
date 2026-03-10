/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
import React from 'react'
import {
	OptionTable,
	SectionHeader,
} from './components'
import {
	HorizontalBarChart, Loader,
} from '../../../shared/components'

import {
	AssetNamesType,
	type TAnalyticsChartData,
} from '../../../shared/types'
import {
	useOptionsAssetAnalytics,
	useOptionsBankAnalytics,
	useOptionsMaturityAnalytics,
	useOptionsPremium,
} from '../../../shared/hooks/analytics'
import {
	useOptionsStore,
} from './options.store'
import type {
	TOptionsProps,
} from '../../../services/analytics/analytics.types'
import {
	useAnalyticsFilterStore,
} from '../analytics-store'
import {
	localeString,
	mergeBankChartData,
	mergeCurrencyChartData,
	prepareBankChartData,
	prepareMaturityChartData,
} from '../../../shared/utils'
import {
	EmptyAnalyticsResponse,
} from '../../../shared/components/empty-analytics-response/empty-analytics-response.component'
import {
	useGetFilterApplied,
} from '../layout/components/analytics-filter/analytics-filter.util'
import {
	useDebounce,
} from '../../../shared/hooks'

import * as styles from './options.styles'

const AnalyticsOptions: React.FunctionComponent = () => {
	const {
		filter,
		setAssetIds,
		setBankId,
		setMaturityYear,
		sortFilter,
		resetOptionsStore,
	} = useOptionsStore()
	const {
		analyticsFilter,
	} = useAnalyticsFilterStore()
	React.useEffect(() => {
		resetOptionsStore()
	},[analyticsFilter,],)
	const isFilterApplied = useGetFilterApplied()
	const getFilteredBankIds = (): Array<string> | undefined => {
		return analyticsFilter.bankIds ?
			filter.bankId ?
				analyticsFilter.bankIds
					.map((item,) => {
						return item.value.id
					},)
					.filter((item,) => {
						return filter.bankId === item
					},) :
				analyticsFilter.bankIds.map((item,) => {
					return item.value.id
				},) :
			filter.bankId ?
				[filter.bankId,] :
				undefined
	}

	const combinedFilter: TOptionsProps = React.useMemo(() => {
		return {
			type:         AssetNamesType.OPTIONS,
			clientIds:    analyticsFilter.clientIds?.map((item,) => {
				return item.value.id
			},),
			portfolioIds: analyticsFilter.portfolioIds?.map((item,) => {
				return item.value.id
			},),
			entityIds:    analyticsFilter.entitiesIds?.map((item,) => {
				return item.value.id
			},),
			bankListIds:      analyticsFilter.bankIds?.map((item,) => {
				return item.value.id
			},),
			accountIds:			analyticsFilter.accountIds?.map((account,) => {
				return account.value.id
			},),
			pairs:        analyticsFilter.pairs?.map((item,) => {
				return item.value.name
			},),
			date:		analyticsFilter.date,
		}
	}, [analyticsFilter, filter,],)

	const tableCombinedFilter = useDebounce({
		...combinedFilter,
		...sortFilter,
		maturityYear: filter.maturityYear,
		bankListIds:      getFilteredBankIds(),
	}, 200,)

	const bankCombinedFilter = useDebounce({
		...combinedFilter,
		maturityYear: filter.maturityYear,
		assetIds:     filter.assetIds,
	}, 200,)

	const maturityCombinedFilter = useDebounce({
		...combinedFilter,
		assetIds:    filter.assetIds,
		bankListIds:  getFilteredBankIds(),
	}, 200,)

	const {
		data: assetData,
		refetch: refetchTableData,
		isPending: tableIsFetching,
	} = useOptionsAssetAnalytics(tableCombinedFilter,)
	const {
		data: optionsPremium,
	} = useOptionsPremium(tableCombinedFilter,)
	const {
		data: bankData,
		refetch: refetchBanksData,
		isPending: bankIsFetching,
	} = useOptionsBankAnalytics(bankCombinedFilter,)
	const {
		data: maturityData,
		refetch: refetchMaturityData,
		isPending: maturityIsFetching,
	} = useOptionsMaturityAnalytics(maturityCombinedFilter,)

	const {
		data: totalBankData,
	} = useOptionsBankAnalytics({
		type: AssetNamesType.OPTIONS,
		date: analyticsFilter.date,
	},)
	const {
		data: totalMaturityData,
	} = useOptionsMaturityAnalytics({
		type: AssetNamesType.OPTIONS,
	},)

	const refetchData = (): void => {
		refetchTableData()
		refetchBanksData()
		refetchMaturityData()
	}

	const totalBankBarChartData = prepareBankChartData(totalBankData,)
	const bankBarChartData = prepareBankChartData(bankData,)
	const bankResult = mergeBankChartData({
		total:   totalBankBarChartData,
		current: bankBarChartData,
	},)

	const totalMaturityBarChartData = prepareMaturityChartData(totalMaturityData,)
	const maturityBarChartData = prepareMaturityChartData(maturityData,)
	const maturityResult = mergeCurrencyChartData({
		total:   totalMaturityBarChartData,
		current: maturityBarChartData,
	},)

	const handleBankBarClick = (data: TAnalyticsChartData,): void => {
		setAssetIds(undefined,)
		setMaturityYear(undefined,)
		setBankId(data.id,)
	}

	const handleMaturityBarClick = (data: TAnalyticsChartData<number>,): void => {
		setAssetIds(undefined,)
		setMaturityYear(data.name,)
		setBankId(undefined,)
	}

	const handleBankChartClear = (): void => {
		setBankId(undefined,)
	}

	const handleMaturityChartClear = (): void => {
		setMaturityYear(undefined,)
	}

	return (
		<div className={styles.container}>
			<div className={styles.upSection}>
				<OptionTable
					tableData={assetData}
					refetchData={refetchData}
					tableIsFetching={tableIsFetching}
				/>
			</div>
			<div className={styles.bottomSection}>
				<div className={styles.bottomLeftSection}>
					<div className={styles.bankChartWrapper}>
						<SectionHeader
							title='Market value by bank'
							handleClear={handleBankChartClear}
							isDisabled={!filter.bankId}
						/>
						{!bankIsFetching && Boolean(bankData?.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} isAdditionalText={Boolean(bankData?.length,)}/>}
						{bankIsFetching ?
							<Loader
								radius={6}
								width={150}
							/> :
							Boolean(bankData?.length !== 0,) && <HorizontalBarChart
								data={bankResult}
								handleBarClick={handleBankBarClick}
								height={26}
								idValue={filter.bankId}
							/>}
					</div>
				</div>
				<div className={styles.bottomRightSection}>
					<div className={styles.maturityChartWrapper}>
						<SectionHeader
							title='Maturity'
							handleClear={handleMaturityChartClear}
							isDisabled={!filter.maturityYear}
						/>
						{!maturityIsFetching && Boolean(maturityData?.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} isAdditionalText={Boolean(maturityData?.length,)}/>}
						{maturityIsFetching ?
							<Loader
								radius={6}
								width={150}
							/> :
							Boolean(maturityData?.length !== 0,) && <HorizontalBarChart<number>
								data={maturityResult}
								handleBarClick={handleMaturityBarClick}
								height={43}
								nameValue={filter.maturityYear ?
									[filter.maturityYear,] :
									undefined}
								right={true}
								toolTipName={'Maturity year'}
							/>}
					</div>
					<div className={styles.totalWrapper}>
						<p>Option premium (USD)</p>
						<p>{optionsPremium && localeString(Number(optionsPremium,), '', 0, false,)}</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AnalyticsOptions
