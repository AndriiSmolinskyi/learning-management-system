import React from 'react'
import {
	useAnalyticsFilterStore,
} from '../analytics-store'
import {
	BondsTable,
	ChartByBank,
	ChartByCurrency,
} from './components'
import {
	useGetAllBondsByFilters,
	useBondBankAnalytics,
	useBondCurrencyAnalytics,
	useBondAnnualIncome,
} from '../../../shared/hooks/analytics'
import {
	AssetNamesType,
} from '../../../shared/types'
import type {
	IBondsFilters,
} from '../../../services/analytics/analytics.types'
import {
	useBondStore,
} from './bonds.store'
import {
	localeString,
} from '../../../shared/utils'
import {
	useGetFilterApplied,
} from '../layout/components/analytics-filter/analytics-filter.util'
import {
	useDebounce,
} from '../../../shared/hooks'

import * as styles from './bonds.styles'

const AnalyticsBond: React.FunctionComponent = () => {
	const {
		filter,
		sortFilter,
		resetBondStore,
	} = useBondStore()
	const {
		analyticsFilter,
	} = useAnalyticsFilterStore()
	React.useEffect(() => {
		resetBondStore()
	},[analyticsFilter,],)
	const getFilteredBanksIds = (): Array<string> | undefined => {
		if (analyticsFilter.bankIds) {
			return filter.bankId ?
				analyticsFilter.bankIds
					.filter((item,) => {
						return item.value.id === filter.bankId
					},)
					.map((item,) => {
						return item.value.id
					},) :
				analyticsFilter.bankIds.map((item,) => {
					return item.value.id
				},)
		}

		return filter.bankId ?
			[filter.bankId,] :
			undefined
	}

	const getFilteredCurrencies = (): Array<string> | undefined => {
		if (analyticsFilter.currencies) {
			return filter.currency ?
				analyticsFilter.currencies
					.filter((item,) => {
						return filter.currency?.includes(item.value.id,)
					},)
					.map((item,) => {
						return item.value.name
					},) :
				analyticsFilter.currencies.map((item,) => {
					return item.value.name
				},)
		}

		return filter.currency ?
			[...filter.currency,] :
			undefined
	}

	const combinedFilter: IBondsFilters = React.useMemo(() => {
		return {
			type:        	AssetNamesType.BONDS,
			clientIds:    analyticsFilter.clientIds?.map((client,) => {
				return client.value.id
			},),
			portfolioIds:	analyticsFilter.portfolioIds?.map((portfolio,) => {
				return portfolio.value.id
			},),
			entitiesIds:	analyticsFilter.entitiesIds?.map((entity,) => {
				return entity.value.id
			},),
			bankListIds:			analyticsFilter.bankIds?.map((bank,) => {
				return bank.value.id
			},),
			accountIds:			analyticsFilter.accountIds?.map((account,) => {
				return account.value.id
			},),
			isins:			analyticsFilter.isins?.map((isin,) => {
				return isin.value.id
			},),
			securities:		analyticsFilter.securities?.map((security,) => {
				return security.value.id
			},),
			currencies:		analyticsFilter.currencies?.map((currency,) => {
				return currency.value.name
			},),
			date:		         analyticsFilter.date,
			tradeOperation: analyticsFilter.tradeOperation?.value.name,
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
		isSuccess,
		isError,
	} = useGetAllBondsByFilters(tableCombinedFilter,)

	const isSettled = isSuccess || isError
	const {
		data: banksData,
		refetch: refetchBanksData,
		isPending: bankIsFetching,
		isSuccess: isBankSuccess,
		isError: isBankError,
	} = useBondBankAnalytics(bankCombinedFilter,isSettled,)
	const isBankSettled = isBankSuccess || isBankError
	const {
		data: currenciesData,
		refetch: refetchCurrenciesData,
		isPending: currencyIsFetching,
	} = useBondCurrencyAnalytics(currencyCombinedFilter,isBankSettled,)

	const {
		data: annualIncome,
	} = useBondAnnualIncome(tableCombinedFilter,)

	const refetchData = (): void => {
		refetchTableData()
		refetchBanksData()
		refetchCurrenciesData()
	}

	const isFilterApplied = useGetFilterApplied()

	return (
		<div className={styles.container}>
			<div className={styles.upSection}>
				<BondsTable
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
						isAssetClicked={Boolean(filter.assetId?.length,)}
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
							0}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AnalyticsBond
