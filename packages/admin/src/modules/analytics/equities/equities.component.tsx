/* eslint-disable no-nested-ternary */
import React from 'react'
import {
	useAnalyticsFilterStore,
} from '../analytics-store'
import {
	EquitiesTable,
	ChartByBank,
	ChartByCurrency,
} from './components'
import {
	useGetAllEquitiesByFilters,
	useEquityBankAnalytics,
	useEquityCurrencyAnalytics,
	useEquityAnnualIncome,
} from '../../../shared/hooks/analytics'
import {
	AssetNamesType,
} from '../../../shared/types'
import type {
	IEquitiesFilters,
} from '../../../services/analytics/analytics.types'
import {
	useEquityStore,
} from './equities.store'
import {
	localeString,
} from '../../../shared/utils'
import {
	useGetFilterApplied,
} from '../layout/components/analytics-filter/analytics-filter.util'
import {
	useDebounce,
} from '../../../shared/hooks'

import * as styles from './equities.styles'

const AnalyticsEquity: React.FunctionComponent = () => {
	const {
		filter,
		sortFilter,
		resetEquityStore,
	} = useEquityStore()
	const {
		analyticsFilter,
	} = useAnalyticsFilterStore()
	React.useEffect(() => {
		resetEquityStore()
	},[analyticsFilter,],)
	const getFilteredBanksIds = (): Array<string> | undefined => {
		return analyticsFilter.bankIds ?
			filter.bankId ?
				analyticsFilter.bankIds
					.map((item,) => {
						return item.value.id
					},)
					.filter((item,) => {
						return item === filter.bankId
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

	const combinedFilter: IEquitiesFilters = React.useMemo(() => {
		return {
			type:         AssetNamesType.EQUITY_ASSET,
			clientIds:    analyticsFilter.clientIds?.map((item,) => {
				return item.value.id
			},),
			portfolioIds: analyticsFilter.portfolioIds?.map((item,) => {
				return item.value.id
			},),
			entitiesIds:  analyticsFilter.entitiesIds?.map((item,) => {
				return item.value.id
			},),
			bankListIds:      analyticsFilter.bankIds?.map((item,) => {
				return item.value.id
			},),
			accountIds:			analyticsFilter.accountIds?.map((account,) => {
				return account.value.id
			},),
			equityTypes:  analyticsFilter.equityTypes?.map((item,) => {
				return item.value.name
			},),
			isins:        analyticsFilter.isins?.map((item,) => {
				return item.value.name
			},),
			securities:   analyticsFilter.securities?.map((item,) => {
				return item.value.name
			},),
			currencies:   analyticsFilter.currencies?.map((item,) => {
				return item.value.name
			},),
			tradeOperation: analyticsFilter.tradeOperation?.value.name,
			date:		         analyticsFilter.date,
		}
	}, [analyticsFilter, filter,],)

	const tableCombinedFilter = useDebounce({
		...combinedFilter,
		...sortFilter,
		bankListIds:    getFilteredBanksIds(),
		currencies:  getFilteredCurrencies(),
	}, 200,)

	const bankCombinedFilter = useDebounce({
		...combinedFilter,
		assetIds:   filter.assetId,
		currencies: getFilteredCurrencies(),
	}, 200,)

	const currencyCombinedFilter = useDebounce({
		...combinedFilter,
		assetIds:    filter.assetId,
		bankListIds:    getFilteredBanksIds(),
	}, 200,)

	const {
		data: tableData,
		refetch: refetchTableData,
		isPending: tableIsFetching,
	} = useGetAllEquitiesByFilters(tableCombinedFilter,)

	const {
		data: annualIncome,
	} = useEquityAnnualIncome(tableCombinedFilter,)

	const {
		data: banksData,
		refetch: refetchBanksData,
		isPending: bankIsFetching,
	} = useEquityBankAnalytics(bankCombinedFilter,)

	const {
		data: currenciesData,
		refetch: refetchCurrenciesData,
		isPending: currencyIsFetching,
	} = useEquityCurrencyAnalytics(currencyCombinedFilter,)

	const refetchData = (): void => {
		refetchTableData()
		refetchBanksData()
		refetchCurrenciesData()
	}
	const isFilterApplied = useGetFilterApplied()
	return (
		<div className={styles.container}>
			<div className={styles.upSection}>
				<EquitiesTable
					tableData={tableData}
					refetchData={refetchData}
					tableIsFetching={tableIsFetching}
					isFilterApplied={isFilterApplied}
				/>
			</div>
			<div className={styles.bottomSection}>
				<div className={styles.bottomLeftSection}>
					<ChartByBank
						banksData={banksData}
						isFilterApplied={isFilterApplied}
						bankIsFetching={bankIsFetching}
					/>
				</div>
				<div className={styles.bottomRightSection}>
					<ChartByCurrency
						currenciesData={currenciesData}
						isFilterApplied={isFilterApplied}
						currencyIsFetching={currencyIsFetching}
					/>
					<div className={styles.annualIncomeBlock}>
						<p>Annual dividend net (USD)</p>
						<p>{annualIncome ?
							localeString(annualIncome, '', 0, false,) :
							0}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AnalyticsEquity
