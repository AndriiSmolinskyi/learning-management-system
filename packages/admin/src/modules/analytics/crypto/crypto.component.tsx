/* eslint-disable no-nested-ternary */
import React from 'react'
import {
	useAnalyticsFilterStore,
} from '../analytics-store'
import {
	CryptoTable,
	HorizontalChart,
	VerticalChart,
} from './components'
import {
	// useCryptoAnnualIncome,
	useGetAllCryptoByFilters,
	useGetCryptoBankAnalytics,
	useGetCryptoCurrencyAnalytics,
} from '../../../shared/hooks/analytics'
import type {
	ICryptoFilters,
} from '../../../services/analytics/analytics.types'
import {
	AssetNamesType,
} from '../../../shared/types'
import {
	useCryptoStore,
} from './crypto.store'
// import {
// 	localeString,
// } from '../../../shared/utils'
import {
	useGetFilterApplied,
} from '../layout/components/analytics-filter/analytics-filter.util'
import {
	useDebounce,
} from '../../../shared/hooks'

import * as styles from './crypto.styles'

const AnalyticsCrypto: React.FunctionComponent = () => {
	const {
		filter,
		sortFilter,
		resetCryptoStore,
	} = useCryptoStore()
	const {
		analyticsFilter,
	} = useAnalyticsFilterStore()
	React.useEffect(() => {
		resetCryptoStore()
	},[analyticsFilter,],)
	const getFilteredWallets = (): Array<string> | undefined => {
		return analyticsFilter.wallets ?
			filter.wallets ?
				analyticsFilter.wallets
					.map((item,) => {
						return item.value.name
					},)
					.filter((item,) => {
						return filter.wallets?.includes(item,)
					},) :
				analyticsFilter.wallets.map((item,) => {
					return item.value.name
				},) :
			filter.wallets
	}

	const getFilteredCryptoTypes = (): Array<string> | undefined => {
		return analyticsFilter.cryptoTypes ?
			filter.cryptoTypes ?
				analyticsFilter.cryptoTypes
					.map((item,) => {
						return item.value.name
					},)
					.filter((item,) => {
						return filter.cryptoTypes?.includes(item,)
					},) :
				analyticsFilter.cryptoTypes.map((item,) => {
					return item.value.name
				},) :
			filter.cryptoTypes
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

	const getFilteredBankIds = (): Array<string> | undefined => {
		return analyticsFilter.bankIds ?
			filter.bankId ?
				[...analyticsFilter.bankIds
					.map((item,) => {
						return item.value.id
					},)
					.filter((item,) => {
						return filter.bankId === item
					},), filter.bankId,] :
				analyticsFilter.bankIds.map((item,) => {
					return item.value.id
				},) :
			filter.bankId ?
				[filter.bankId,] :
				undefined
	}

	const combinedFilter: ICryptoFilters = React.useMemo(() => {
		return {
			type:         AssetNamesType.CRYPTO,
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
			cryptoTypes:  analyticsFilter.cryptoTypes?.map((item,) => {
				return item.value.name
			},),
			wallets:      analyticsFilter.wallets?.map((item,) => {
				return item.value.name
			},),
			productTypes: analyticsFilter.productTypes ?
				[analyticsFilter.productTypes.value.name,] :
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
			tradeOperation: analyticsFilter.tradeOperation?.value.name,
			date:		         analyticsFilter.date,
		}
	}, [analyticsFilter, filter,],)

	const tableCombinedFilter = useDebounce({
		...combinedFilter,
		...sortFilter,
		wallets:     getFilteredWallets(),
		cryptoTypes: getFilteredCryptoTypes(),
		currencies:  getFilteredCurrencies(),
		bankListIds:     getFilteredBankIds(),
	}, 200,)

	const bankCombinedFilter = useDebounce({
		...combinedFilter,
		assetIds:    filter.assetId,
		cryptoTypes: getFilteredCryptoTypes(),
		currencies:  getFilteredCurrencies(),
	}, 200,)

	const currencyCombinedFilter = useDebounce({
		...combinedFilter,
		assetIds:    filter.assetId,
		bankListIds:     getFilteredBankIds(),
		wallets:     getFilteredWallets(),
	}, 200,)

	const {
		data: tableData,
		refetch: refetchTableData,
		isPending: tableIsFetching,
	} = useGetAllCryptoByFilters(tableCombinedFilter,)

	// const {
	// 	data: cryptoAnnual,
	// } = useCryptoAnnualIncome(tableCombinedFilter,)

	const {
		data: banksData,
		refetch: refetchBanksData,
		isPending: bankIsFetching,
	} = useGetCryptoBankAnalytics(bankCombinedFilter,)

	const {
		data: currenciesData,
		refetch: refetchCurrenciesData,
		isPending: currencyIsFetching,
	} = useGetCryptoCurrencyAnalytics(currencyCombinedFilter,)

	const refetchData = (): void => {
		refetchTableData()
		refetchBanksData()
		refetchCurrenciesData()
	}
	const isFilterApplied = useGetFilterApplied() || Boolean(filter.bankId,)
	return (
		<div className={styles.container}>
			<div className={styles.upSection}>
				<CryptoTable
					tableData={tableData}
					refetchData={refetchData}
					tableIsFetching={tableIsFetching}
					isFilterApplied={isFilterApplied}
				/>
			</div>
			<div className={styles.bottomSection}>
				<div className={styles.bottomLeftSection}>
					<HorizontalChart
						chartData={banksData}
						bankIsFetching={bankIsFetching}
						isFilterApplied={isFilterApplied}
					/>
				</div>
				<div className={styles.bottomRightSection}>
					<VerticalChart
						chartData={currenciesData}
						currencyIsFetching={currencyIsFetching}
						isFilterApplied={isFilterApplied}
					/>
					{/* <div className={styles.annualIncomeBlock}>
						<p>Income annual (USD)</p>
						<p>{cryptoAnnual ?
							localeString(cryptoAnnual, '', 0, false,) :
							0}
						</p>
					</div> */}
				</div>
			</div>
		</div>
	)
}

export default AnalyticsCrypto
