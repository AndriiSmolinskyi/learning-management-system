/* eslint-disable no-nested-ternary */
import React from 'react'
import {
	useAnalyticsFilterStore,
} from '../analytics-store'
import {
	PrivateEquityTable,
	ChartByBank,
	ChartByCurrency,
} from './components'
import {
	useDebounce,
} from '../../../shared/hooks'
import {
	useGetAllPrivateEquityByFilters,
	usePrivateEquityAnnualIncome,
	usePrivateEquityBankAnalytics,
	usePrivateEquityCurrencyAnalytics,
} from '../../../shared/hooks/analytics'
import {
	AssetNamesType,
} from '../../../shared/types'
import type {
	IPrivateEquityFilters,
} from '../../../services/analytics/analytics.types'
import {
	usePrivateEquityStore,
} from './private-equity.store'
import {
	localeString,
} from '../../../shared/utils'
import {
	useGetFilterApplied,
} from '../layout/components/analytics-filter/analytics-filter.util'

import * as styles from './private-equity.styles'

const AnalyticsPrivateEquity: React.FunctionComponent = () => {
	const {
		filter,
		sortFilter,
		resetPrivateEquityStore,
	} = usePrivateEquityStore()
	const {
		analyticsFilter,
	} = useAnalyticsFilterStore()
	React.useEffect(() => {
		resetPrivateEquityStore()
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

	const combinedFilter: IPrivateEquityFilters = React.useMemo(() => {
		return {
			type:         AssetNamesType.PRIVATE_EQUITY,
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
			fundTypes:    analyticsFilter.privateEquityTypes?.map((item,) => {
				return item.value.name
			},),
			fundNames:    analyticsFilter.privateEquityNames?.map((item,) => {
				return item.value.name
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
	} = useGetAllPrivateEquityByFilters(tableCombinedFilter,)

	const {
		data: annualIncome,
	} = usePrivateEquityAnnualIncome(tableCombinedFilter,)

	const {
		data: banksData,
		refetch: refetchBanksData,
		isPending: bankIsFetching,
	} = usePrivateEquityBankAnalytics(bankCombinedFilter,)

	const {
		data: currenciesData,
		refetch: refetchCurrenciesData,
		isPending: currencyIsFetching,
	} = usePrivateEquityCurrencyAnalytics(currencyCombinedFilter,)

	const refetchData = (): void => {
		refetchTableData()
		refetchBanksData()
		refetchCurrenciesData()
	}

	const isFilterApplied = useGetFilterApplied()

	return (
		<div className={styles.container}>
			<div className={styles.upSection}>
				<PrivateEquityTable
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
						bankIsFetching={bankIsFetching}
						isFilterApplied={isFilterApplied}
					/>
				</div>
				<div className={styles.bottomRightSection}>
					<ChartByCurrency
						currenciesData={currenciesData}
						currencyIsFetching={currencyIsFetching}
						isFilterApplied={isFilterApplied}
					/>
					<div className={styles.annualIncomeBlock}>
						<p>Income annual (USD)</p>
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

export default AnalyticsPrivateEquity
