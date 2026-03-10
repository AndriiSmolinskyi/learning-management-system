/* eslint-disable no-nested-ternary */
import React from 'react'
import {
	useAnalyticsFilterStore,
} from '../analytics-store'
import {
	MetalsTable,
	MetalBanksChart,
	MetalCurrenciesChart,
} from './components'
import {
	useMetalsAnalytics,
	// useMetalsAnnualIncome,
	useMetalsBanks,
	useMetalsCurrencies,
} from '../../../shared/hooks/analytics'
import type {
	IMetalsFilters,
} from '../../../services/analytics/analytics.types'
import {
	AssetNamesType,
} from '../../../shared/types'
import {
	useMetalsStore,
} from './metals.store'
import {
	useGetFilterApplied,
} from '../layout/components/analytics-filter/analytics-filter.util'
import {
	useDebounce,
} from '../../../shared/hooks'
// import {
// 	localeString,
// } from '../../../shared/utils'

import * as styles from './metals.styles'

const AnalyticsMetals: React.FunctionComponent = () => {
	const {
		filter,
		sortFilter,
		resetMetalsStore,
	} = useMetalsStore()
	const {
		analyticsFilter,
	} = useAnalyticsFilterStore()
	React.useEffect(() => {
		resetMetalsStore()
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
	const getFilteredMetals = (): Array<string> | undefined => {
		return analyticsFilter.metals ?
			filter.metal ?
				analyticsFilter.metals
					.map((item,) => {
						return item.value.name
					},)
					.filter((item,) => {
						return filter.metal?.includes(item,)
					},) :
				analyticsFilter.metals.map((item,) => {
					return item.value.name
				},) :
			filter.metal
	}
	const combinedFilter: IMetalsFilters = React.useMemo(() => {
		return {
			type:         AssetNamesType.METALS,
			clientIds:    analyticsFilter.clientIds?.map((item,) => {
				return item.value.id
			},),
			portfolioIds: analyticsFilter.portfolioIds?.map((item,) => {
				return item.value.id
			},),
			entitiesIds:  analyticsFilter.entitiesIds?.map((item,) => {
				return item.value.id
			},),
			bankListIds:			analyticsFilter.bankIds?.map((bank,) => {
				return bank.value.id
			},),
			accountIds:			analyticsFilter.accountIds?.map((account,) => {
				return account.value.id
			},),
			metals:       analyticsFilter.metals?.map((item,) => {
				return item.value.name
			},),
			productTypes: analyticsFilter.metalProductTypes ?
				[analyticsFilter.metalProductTypes.value.name,] :
				[],
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
			date:		         analyticsFilter.date,
			tradeOperation: analyticsFilter.tradeOperation?.value.name,
		}
	}, [analyticsFilter, filter,],)

	const tableCombinedFilter = useDebounce({
		...combinedFilter,
		...sortFilter,
		bankListIds:    getFilteredBanksIds(),
		metals:      getFilteredMetals(),
		currencies:  getFilteredCurrencies(),
	}, 200,)

	const bankCombinedFilter = useDebounce({
		...combinedFilter,
		assetIds:   filter.assetIds,
		currencies: getFilteredCurrencies(),
		metals:     getFilteredMetals(),
	}, 200,)

	const currencyCombinedFilter = useDebounce({
		...combinedFilter,
		assetIds:    filter.assetIds,
		bankListIds:  getFilteredBanksIds(),
	}, 200,)

	const {
		data: tableData,
		refetch: refetchTableData,
		isPending: tableIsFetching,
	} = useMetalsAnalytics(tableCombinedFilter,)
	const {
		data: banksData,
		refetch: refetchBanksData,
		isPending: bankIsFetching,
	} = useMetalsBanks(bankCombinedFilter,)

	const {
		data: currenciesData,
		refetch: refetchCurrenciesData,
		isPending: currencyIsFetching,
	} = useMetalsCurrencies(currencyCombinedFilter,)

	// const {
	// 	data: metalsAnnual,
	// } = useMetalsAnnualIncome(tableCombinedFilter,)

	const refetchData = (): void => {
		refetchTableData()
		refetchBanksData()
		refetchCurrenciesData()
	}
	const isFilterApplied = useGetFilterApplied()

	return (
		<div className={styles.container}>
			<div className={styles.upSection}>
				<div className={styles.scrollPadding} />
				<MetalsTable
					tableData={tableData}
					refetchData={refetchData}
					tableIsFetching={tableIsFetching}
					isFilterApplied={isFilterApplied}
				/>
			</div>
			<div className={styles.bottomSection}>
				<div className={styles.bottomLeftSection}>
					<MetalBanksChart
						banksData={banksData}
						bankIsFetching={bankIsFetching}
						isFilterApplied={isFilterApplied}
					/>
				</div>
				<div className={styles.bottomRightSection}>
					<MetalCurrenciesChart
						currenciesData={currenciesData}
						currencyIsFetching={currencyIsFetching}
						isFilterApplied={isFilterApplied}
					/>
					{/* <div className={styles.annualIncomeBlock}>
						<p>Income annual (USD)</p>
						<p>{metalsAnnual ?
							localeString(metalsAnnual, '', 0, false,) :
							0}
						</p>
					</div> */}
				</div>
			</div>
		</div>
	)
}

export default AnalyticsMetals
