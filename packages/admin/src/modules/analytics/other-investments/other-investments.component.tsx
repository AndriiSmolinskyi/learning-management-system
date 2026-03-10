/* eslint-disable no-nested-ternary */
import React from 'react'
import {
	useAnalyticsFilterStore,
} from '../analytics-store'
import {
	OtherInvestmentsTable,
	ChartByBank,
	ChartByCurrency,
} from './components'
import {
	useOtherInvestmentsAnalytics,
	useOtherInvestmentsAnnualIncome,
	useOtherInvestmentsBanks,
	useOtherInvestmentsCurrencies,
} from '../../../shared/hooks/analytics'
import type {
	IOtherInvestmentFilters,
} from '../../../services/analytics/analytics.types'
import {
	AssetNamesType,
} from '../../../shared/types'
import {
	useOtherInvestmentsStore,
} from './other-investments.store'
import {
	localeString,
} from '../../../shared/utils'
import {
	useGetFilterApplied,
} from '../layout/components/analytics-filter/analytics-filter.util'
import {
	useDebounce,
} from '../../../shared/hooks'

import * as styles from './other-investments.styles'

const AnalyticsOtherInvestments: React.FunctionComponent = () => {
	const {
		filter,
		sortFilter,
		resetOtherInvestmentsStore,
	} = useOtherInvestmentsStore()
	const {
		analyticsFilter,
	} = useAnalyticsFilterStore()
	const isFilterApplied = useGetFilterApplied()
	React.useEffect(() => {
		resetOtherInvestmentsStore()
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

	const combinedFilter: IOtherInvestmentFilters = React.useMemo(() => {
		return {
			type:                 AssetNamesType.OTHER,
			clientIds:            analyticsFilter.clientIds?.map((item,) => {
				return item.value.id
			},),
			portfolioIds:         analyticsFilter.portfolioIds?.map((item,) => {
				return item.value.id
			},),
			entitiesIds:          analyticsFilter.entitiesIds?.map((item,) => {
				return item.value.id
			},),
			bankListIds:			analyticsFilter.bankIds?.map((bank,) => {
				return bank.value.id
			},),
			currencies: 		analyticsFilter.currencies?.map((currency,) => {
				return currency.value.name
			},),
			accountIds:			analyticsFilter.accountIds?.map((account,) => {
				return account.value.id
			},),
			investmentAssetNames: analyticsFilter.investmentAssetNames?.map((item,) => {
				return item.value.name
			},),
			serviceProviders:     analyticsFilter.serviceProviders?.map((item,) => {
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
		assetIds:   filter.assetIds,
		currencies: getFilteredCurrencies(),
	}, 200,)

	const currencyCombinedFilter = useDebounce({
		...combinedFilter,
		assetIds:    filter.assetIds,
		bankListIds:    getFilteredBanksIds(),
	}, 200,)

	const {
		data: tableData,
		refetch: refetchTableData,
		isPending: tableIsFetching,
	} = useOtherInvestmentsAnalytics(tableCombinedFilter,)

	const {
		data: annualIncome,
	} = useOtherInvestmentsAnnualIncome(tableCombinedFilter,)

	const {
		data: banksData,
		refetch: refetchBanksData,
		isPending: bankIsFetching,
	} = useOtherInvestmentsBanks(bankCombinedFilter,)

	const {
		data: currenciesData,
		refetch: refetchCurrenciesData,
		isPending: currencyIsFetching,
	} = useOtherInvestmentsCurrencies(currencyCombinedFilter,)

	const refetchData = (): void => {
		refetchTableData()
		refetchBanksData()
		refetchCurrenciesData()
	}

	return (
		<div className={styles.container}>
			<div className={styles.upSection}>
				<OtherInvestmentsTable
					tableData={tableData}
					refetchData={refetchData}
					tableIsFetching={tableIsFetching}
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
						<p>Annual income (USD)</p>
						<p>{annualIncome ?
							localeString(annualIncome, '', 0, false,) :
							0}</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AnalyticsOtherInvestments
