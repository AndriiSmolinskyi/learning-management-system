/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
import React from 'react'
import {
	SectionHeader,
} from './components'
import {
	HorizontalBarChart,
	Loader,
	VerticalBarChart,
} from '../../../shared/components'

import {
	AssetNamesType,
	type TAnalyticsChartData,
} from '../../../shared/types'
import {
	useGetAllDepositByFilters,
	useDepositBankAnalytics,
	useDepositCurrencyAnalytics,
	useDepositAnnualIncome,
} from '../../../shared/hooks/analytics/deposit.hook'
import {
	useDepositStore,
} from './deposit.store'
import type {
	IDepositFilters,
} from '../../../services/analytics/analytics.types'
import {
	useAnalyticsFilterStore,
} from '../analytics-store'
import {
	localeString,
	mergeCurrencyChartData,
	mergeBankChartData,
	prepareBankChartData,
	prepareCurrencyChartData,
} from '../../../shared/utils'
import {
	useGetFilterApplied,
} from '../layout/components/analytics-filter/analytics-filter.util'
import {
	EmptyAnalyticsResponse,
} from '../../../shared/components/empty-analytics-response/empty-analytics-response.component'
import {
	useDebounce,
} from '../../../shared/hooks'
import {
	TanstackDepositTable,
} from './components/tanstack-table.component'
import * as styles from './deposit.styles'

const AnalyticsDeposit: React.FunctionComponent = () => {
	const {
		filter,
		sortFilter,
		setAssetId,
		setBankId,
		setCurrency,
		resetDepositStore,
	} = useDepositStore()
	const {
		analyticsFilter,
	} = useAnalyticsFilterStore()
	React.useEffect(() => {
		resetDepositStore()
	},[analyticsFilter,],)
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

	const getFilteredCurrencies = (): Array<string> | undefined => {
		return analyticsFilter.currencies ?
			filter.currency ?
				analyticsFilter.currencies
					.map((item,) => {
						return item.value.name
					},)
					.filter((item,) => {
						return filter.currency?.includes(item,)
					},) :
				analyticsFilter.currencies.map((item,) => {
					return item.value.name
				},) :
			filter.currency
	}

	const combinedFilter: IDepositFilters = React.useMemo(() => {
		return {
			type:         AssetNamesType.CASH_DEPOSIT,
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
			currencies:   analyticsFilter.currencies?.map((item,) => {
				return item.value.name
			},),
			date:		analyticsFilter.date,
		}
	}, [analyticsFilter, filter,],)

	const tableCombinedFilter = useDebounce({
		...combinedFilter,
		...sortFilter,
		currencies:  getFilteredCurrencies(),
		bankListIds:    getFilteredBankIds(),
	}, 200,)

	const bankCombinedFilter = useDebounce({
		...combinedFilter,
		assetIds: 		     filter.assetId,
		currencies:      getFilteredCurrencies(),
	}, 200,)

	const currencyCombinedFilter = useDebounce({
		...combinedFilter,
		assetIds: 		     filter.assetId,
		bankListIds:     getFilteredBankIds(),
	}, 200,)

	const {
		data: tableData,
		isPending: tableIsFetching,
		refetch: refetchTableData,
	} = useGetAllDepositByFilters(tableCombinedFilter,)
	const {
		data: depositAnnual,
	} = useDepositAnnualIncome(tableCombinedFilter,)

	const {
		data: bankData,
		refetch: refetchBanksData,
		isPending: bankIsFetching,
	} = useDepositBankAnalytics(bankCombinedFilter,)

	const {
		data: currencyData,
		isPending: currencyIsFetching,
		refetch: refetchCurrenciesData,
	} = useDepositCurrencyAnalytics(currencyCombinedFilter,)

	const {
		data: totalBankData,
	} = useDepositBankAnalytics({
		type: AssetNamesType.CASH_DEPOSIT,
		date: analyticsFilter.date,
	},)
	const {
		data: totalCurrencyData,
	} = useDepositCurrencyAnalytics({
		type: AssetNamesType.CASH_DEPOSIT,
	},)

	const refetchData = (): void => {
		refetchTableData()
		refetchBanksData()
		refetchCurrenciesData()
	}
	const totalBankBarChartData = prepareBankChartData(totalBankData,)
	const bankBarChartData = prepareBankChartData(bankData,)
	const bankResult = mergeBankChartData({
		total:   totalBankBarChartData,
		current: bankBarChartData,
	},)

	const totalCurrencyBarChartData = prepareCurrencyChartData(totalCurrencyData,)
	const currencyBarChartData = prepareCurrencyChartData(currencyData,)
	const currencyResult = mergeCurrencyChartData({
		total:   totalCurrencyBarChartData,
		current: currencyBarChartData,
	},)

	const handleBankBarClick = (data: TAnalyticsChartData,): void => {
		setAssetId(undefined,)
		setCurrency(undefined,)
		setBankId(data.id,)
	}

	const handleCurrencyBarClick = (data: TAnalyticsChartData,): void => {
		setBankId(undefined,)
		setAssetId(undefined,)
		setCurrency([data.name,],)
	}

	const handleBankChartClear = (): void => {
		setBankId(undefined,)
	}

	const handleCurrencyChartClear = (): void => {
		setCurrency(undefined,)
	}
	const isFilterApplied = useGetFilterApplied()

	return (
		<div className={styles.container}>
			<div className={styles.upSection}>
				<TanstackDepositTable
					tableData={tableData}
					refetchData={refetchData}
					tableIsFetching={tableIsFetching}
					isFilterApplied={isFilterApplied}/>
				{/* <DepositTable
					tableData={tableData}
					refetchData={refetchData}
					tableIsFetching={tableIsFetching}
					isFilterApplied={isFilterApplied}
				/> */}
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
								height={26.2}
								idValue={filter.bankId}
							/>}
					</div>
				</div>
				<div className={styles.bottomRightSection}>
					<div className={styles.currencyChartWrapper}>
						<SectionHeader
							title='Market value by currency'
							handleClear={handleCurrencyChartClear}
							isDisabled={!filter.currency}
						/>
						{!currencyIsFetching &&
							Boolean(currencyData?.length === 0,) &&
							<EmptyAnalyticsResponse
								isFilter={isFilterApplied}
								isAdditionalText={Boolean(currencyData?.length,)}
							/>
						}
						{currencyIsFetching ?
							<Loader
								radius={6}
								width={150}
							/> :
							Boolean(currencyData?.length !== 0,) && <VerticalBarChart
								data={currencyResult}
								handleBarClick={handleCurrencyBarClick}
								nameValue={filter.currency}
							/>}
					</div>
					<div className={styles.totalWrapper}>
						<p>Interest annually (USD)</p>
						<p>
							{depositAnnual ?
								localeString(Number(depositAnnual,), '', 0, false,) :
								0}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AnalyticsDeposit
