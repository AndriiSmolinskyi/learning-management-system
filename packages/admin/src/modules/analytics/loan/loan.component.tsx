/* eslint-disable no-nested-ternary */
import React from 'react'
import {
	useAnalyticsFilterStore,
} from '../analytics-store'
import {
	LoanTable,
	ChartByBank,
	ChartByCurrency,
} from './components'
import {
	useGetAllLoansByFilters,
	useLoanAnnualIncome,
	useLoanBankAnalytics,
	useLoanCurrencyAnalytics,
} from '../../../shared/hooks/analytics'
import {
	AssetNamesType,
} from '../../../shared/types'
import type {
	ILoansFilters,
} from '../../../services/analytics/analytics.types'
import {
	useLoanStore,
} from './loan.store'
import {
	localeString,
} from '../../../shared/utils'
import {
	useGetFilterApplied,
} from '../layout/components/analytics-filter/analytics-filter.util'
import {
	useDebounce,
} from '../../../shared/hooks'

import * as styles from './loan.styles'

const AnalyticsLoan: React.FunctionComponent = () => {
	const {
		filter,
		sortFilter,
		resetLoanStore,
	} = useLoanStore()
	const {
		analyticsFilter,
	} = useAnalyticsFilterStore()
	React.useEffect(() => {
		resetLoanStore()
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

	const combinedFilter: ILoansFilters = React.useMemo(() => {
		return {
			type:         AssetNamesType.LOAN,
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
			loanNames:    analyticsFilter.loanNames?.map((item,) => {
				return item.value.name
			},),
			currencies:   analyticsFilter.currencies?.map((item,) => {
				return item.value.name
			},),
			date: analyticsFilter.date,
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
	} = useGetAllLoansByFilters(tableCombinedFilter,)

	const {
		data: loanAnnual,
	} = useLoanAnnualIncome(tableCombinedFilter,)

	const {
		data: banksData,
		refetch: refetchBanksData,
		isPending: bankIsFetching,
	} = useLoanBankAnalytics(bankCombinedFilter,)

	const {
		data: currenciesData,
		refetch: refetchCurrenciesData,
		isPending: currencyIsFetching,
	} = useLoanCurrencyAnalytics(currencyCombinedFilter,)

	const refetchData = (): void => {
		refetchTableData()
		refetchBanksData()
		refetchCurrenciesData()
	}

	const isFilterApplied = useGetFilterApplied()

	return (
		<div className={styles.container}>
			<div className={styles.upSection}>
				<LoanTable
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
						<p>Interest annually (USD)</p>
						<p>{loanAnnual ?
							localeString(loanAnnual, '', 0, false,) :
							0}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AnalyticsLoan
