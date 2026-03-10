/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
import React from 'react'
import {
	ChartHeader,
	RealEstateTable,
} from './components'
import {
	Loader,
	PieChart,
	VerticalBarChart,
} from '../../../shared/components'

import {
	AssetNamesType,
	type TAnalyticsChartData,
} from '../../../shared/types'
import {
	useRealEstateAssetAnalytics,
	useRealEstateCityAnalytics,
	useRealEstateCurrencyAnalytics,
} from '../../../shared/hooks/analytics'
import {
	useRealEstateStore,
} from './real-estate.store'
import type {
	TRealEstateProps,
} from '../../../services/analytics/analytics.types'
import {
	useAnalyticsFilterStore,
} from '../analytics-store'
import {
	localeString,
	mergeCurrencyChartData,
	prepareCurrencyChartData,
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
import {
	isDeepEqual,
} from '../../../shared/utils'
import {
	initialRealEstateFilter,
} from './real-estate.store'
import {
	useRealEstateIncome,
} from '../../../shared/hooks/analytics'
import * as styles from './real-estate.styles'

const AnalyticsRealEstate: React.FunctionComponent = () => {
	const {
		filter,
		setCurrency,
		setAssetIds,
		setCity,
		sortFilter,
		resetRealEstateStore,
	} = useRealEstateStore()
	const {
		analyticsFilter,
	} = useAnalyticsFilterStore()
	React.useEffect(() => {
		resetRealEstateStore()
	},[analyticsFilter,],)
	const [clearChartOpacity, setClearChartOpacity,] = React.useState(false,)

	React.useEffect(() => {
		if (clearChartOpacity) {
			setClearChartOpacity(false,)
		}
	}, [clearChartOpacity,],)

	React.useEffect(() => {
		if (isDeepEqual(initialRealEstateFilter, filter,)) {
			setClearChartOpacity(true,)
		}
	}, [filter,],)

	const getFilteredCities = (): Array<string> | undefined => {
		return analyticsFilter.cities ?
			filter.city ?
				analyticsFilter.cities
					.map((item,) => {
						return item.value.name
					},)
					.filter((item,) => {
						return filter.city === item
					},) :
				analyticsFilter.cities.map((item,) => {
					return item.value.name
				},) :
			filter.city ?
				[filter.city,] :
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

	const combinedFilter: TRealEstateProps = React.useMemo(() => {
		return {
			type:                AssetNamesType.REAL_ESTATE,
			clientIds:           analyticsFilter.clientIds?.map((item,) => {
				return item.value.id
			},),
			portfolioIds:        analyticsFilter.portfolioIds?.map((item,) => {
				return item.value.id
			},),
			entityIds:           analyticsFilter.entitiesIds?.map((item,) => {
				return item.value.id
			},),
			bankListIds: analyticsFilter.bankIds?.map((item,) => {
				return item.value.id
			},),
			accountIds:			analyticsFilter.accountIds?.map((account,) => {
				return account.value.id
			},),
			operations:          analyticsFilter.operations?.map((item,) => {
				return item.value.name
			},),
			projectTransactions: analyticsFilter.projectTransactions?.map((item,) => {
				return item.value.name
			},),
			countries:           analyticsFilter.countries?.map((item,) => {
				return item.value.name
			},),
			serviceProviders:    analyticsFilter.serviceProviders?.map((item,) => {
				return item.value.name
			},),
			date:		analyticsFilter.date,
		}
	}, [analyticsFilter, filter,],)

	const tableCombinedFilter = useDebounce({
		...sortFilter,
		...combinedFilter,
		cities:     getFilteredCities(),
		currencies: getFilteredCurrencies(),
	}, 200,)

	const cityCombinedFilter = useDebounce({
		...combinedFilter,
		currencies: getFilteredCurrencies(),
		assetIds:   filter.assetIds,
	}, 200,)

	const currencyCombinedFilter = useDebounce({
		...combinedFilter,
		cities:   getFilteredCities(),
		assetIds: filter.assetIds,
	}, 200,)

	const {
		data: annualIncome,
	} = useRealEstateIncome(tableCombinedFilter,)
	const {
		data: assetData,
		refetch: refetchTableData,
		isPending: tableIsFetching,
	} = useRealEstateAssetAnalytics(tableCombinedFilter,)
	const {
		data: cityData,
		refetch: refetchCityData,
		isPending: cityIsFetching,
	} = useRealEstateCityAnalytics(cityCombinedFilter,)
	const {
		data: currencyData,
		refetch: refetchCurrenciesData,
		isPending: currencyIsFetching,
	} = useRealEstateCurrencyAnalytics(currencyCombinedFilter,)

	const {
		data: totalCurrencyData,
	} = useRealEstateCurrencyAnalytics({
		type: AssetNamesType.REAL_ESTATE,
	},)

	const refetchData = (): void => {
		refetchTableData()
		refetchCityData()
		refetchCurrenciesData()
	}

	const totalCurrencyBarChartData = prepareCurrencyChartData(totalCurrencyData,)
	const currencyBarChartData = prepareCurrencyChartData(currencyData,)
	const currencyResult = mergeCurrencyChartData({
		total:   totalCurrencyBarChartData,
		current: currencyBarChartData,
	},)

	const cityPieChartData = (cityData ?
		[...cityData,] :
		[])
		.reduce<Array<TAnalyticsChartData>>((acc, asset,) => {
			const {
				city,
			} = asset
			const existing = acc.find((item,) => {
				return item.name === city
			},)
			if (existing) {
				existing.value = existing.value + asset.usdValue
			} else {
				acc.push({
					name:  city,
					value: asset.usdValue,
				},)
			}
			return acc
		}, [],)
		.filter((item,) => {
			return analyticsFilter.cities ?
				analyticsFilter.cities.map((item,) => {
					return item.value.name
				},).includes(item.name,) :
				true
		},)
		.filter((asset,) => {
			return asset.value > 0
		},)
		.sort((a, b,) => {
			return b.value - a.value
		},)

	const handleCurrencyBarClick = (data: TAnalyticsChartData,): void => {
		setCity(undefined,)
		setAssetIds(undefined,)
		setCurrency([data.name,],)
	}

	const handleCityPieClick = (data: TAnalyticsChartData,): void => {
		setCurrency(undefined,)
		setAssetIds(undefined,)
		setCity(data.name,)
	}

	const handleCityChartClear = (): void => {
		setCity(undefined,)
		setClearChartOpacity(true,)
	}

	const handleCurrencyChartClear = (): void => {
		setCurrency(undefined,)
	}

	const isFilterApplied = useGetFilterApplied()

	return (
		<div className={styles.container}>
			<div className={styles.upSection}>
				<RealEstateTable
					tableData={assetData}
					refetchData={refetchData}
					tableIsFetching={tableIsFetching}
					isFilterApplied={isFilterApplied}
				/>
			</div>
			<div className={styles.bottomSection}>
				<div className={styles.bottomLeftSection}>
					<div className={styles.cityChartWrapper}>
						<ChartHeader
							title='Real estate by city'
							handleClear={handleCityChartClear}
							isDisabled={!filter.city}
						/>
						{!cityIsFetching && Boolean(cityPieChartData.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} isAdditionalText={Boolean(cityData?.length,)}/>}
						{cityIsFetching ?
							<Loader
								radius={6}
								width={150}
							/> :
							<PieChart
								data={cityPieChartData}
								handlePieClick={handleCityPieClick}
								nameValue={filter.city ?
									[filter.city,] :
									undefined}
								clearChartOpacity={clearChartOpacity}
							/>}
					</div>
				</div>
				<div className={styles.bottomRightSection}>
					<div className={styles.currencyChartWrapper}>
						<ChartHeader
							title='Market value by currency'
							handleClear={handleCurrencyChartClear}
							isDisabled={!filter.currency}
						/>
						{!currencyIsFetching && Boolean(currencyData?.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} isAdditionalText={Boolean(totalCurrencyBarChartData.length,)}/>}
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
						<p>Annual income</p>
						<p>{annualIncome && localeString(annualIncome, 'USD', 0, false,)}</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AnalyticsRealEstate
