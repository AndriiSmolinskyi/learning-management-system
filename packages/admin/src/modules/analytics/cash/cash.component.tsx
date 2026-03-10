/* eslint-disable max-lines */
/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
import React from 'react'

import {
	CashCurrencyTable,
	TableHeader,
	TableWrapper,
} from './components'
import {
	HorizontalBarChart,
	Loader,
	PieChart,
	SaveAsExcelButton,
	VerticalBarChart,
} from '../../../shared/components'
import {
	Header,
} from '../components'

import {
	useCashBankAnalytics,
	useCashCurrencyAnalytics,
	useCashEntityAnalytics,
} from '../../../shared/hooks/analytics/cash.hooks'
import type {
	TAnalyticsChartData,
	TAnalyticsTableData,
} from '../../../shared/types'
import {
	AssetNamesType,
} from '../../../shared/types'
import {
	useCashStore,
} from './cash.store'
import {
	useAnalyticsFilterStore,
} from '../analytics-store'
import type {
	TCashProps,
} from '../../../services/analytics/analytics.types'
import {
	getCurrencySheetData,
} from './cash.utils'
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
	mergeBankChartData,
	mergeCurrencyChartData,
	prepareBankChartData,
	prepareCurrencyChartData,
} from '../../../shared/utils'
import {
	initialBankStore,
} from './cash.store'
import {
	isDeepEqual,
} from '../../../shared/utils'
import * as styles from './cash.styles'

const AnalyticsCash: React.FunctionComponent = () => {
	const {
		filter,
		setBankName,
		setCurrency,
		setChartCurrency,
		setEntityId,
		resetCashStore,
	} = useCashStore()
	const {
		analyticsFilter,
		resetAnalyticsFilterStore,
	} = useAnalyticsFilterStore()
	React.useEffect(() => {
		resetCashStore()
	},[analyticsFilter,],)
	const [clearChartOpacity, setClearChartOpacity,] = React.useState(false,)
	const isFilterApplied = useGetFilterApplied()

	const entityCombinedFilter: TCashProps = useDebounce(React.useMemo(() => {
		const filteredCurrencies = analyticsFilter.currencies ?
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

		const filteredBankIds = analyticsFilter.bankIds ?
			filter.bankId ?
				analyticsFilter.bankIds.filter((item,) => {
					return item.value.id === filter.bankId
				},).map((item,) => {
					return item.value.id
				},) :
				analyticsFilter.bankIds.map((item,) => {
					return item.value.id
				},) :
			filter.bankId ?
				[filter.bankId,] :
				undefined

		return {
			type:         AssetNamesType.CASH,
			clientIds:    analyticsFilter.clientIds?.map((item,) => {
				return item.value.id
			},),
			portfolioIds: analyticsFilter.portfolioIds?.map((item,) => {
				return item.value.id
			},),
			date:        analyticsFilter.date,
			currencies:   filteredCurrencies,
			bankListIds:      filteredBankIds,
			accountIds:			analyticsFilter.accountIds?.map((account,) => {
				return account.value.id
			},),
			entitiesIds: analyticsFilter.entitiesIds?.map((entity,) => {
				return entity.value.id
			},),
		}
	}, [analyticsFilter, filter,],), 200,)

	const bankCombinedFilter: TCashProps = useDebounce(React.useMemo(() => {
		const filteredEntitiesIds = analyticsFilter.entitiesIds ?
			filter.entityId ?
				analyticsFilter.entitiesIds
					.filter((item,) => {
						return item.value.id === filter.entityId
					},)
					.map((item,) => {
						return item.value.id
					},) :
				analyticsFilter.entitiesIds.map((item,) => {
					return item.value.id
				},) :
			filter.entityId ?
				[filter.entityId,] :
				undefined

		const filteredCurrencies = analyticsFilter.currencies ?
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

		return {
			type:         AssetNamesType.CASH,
			clientIds:    analyticsFilter.clientIds?.map((item,) => {
				return item.value.id
			},),
			portfolioIds: analyticsFilter.portfolioIds?.map((item,) => {
				return item.value.id
			},),
			bankListIds: analyticsFilter.bankIds?.map((item,) => {
				return item.value.id
			},),
			date:		      analyticsFilter.date,
			entitiesIds:  filteredEntitiesIds,
			currencies:   filteredCurrencies,
			accountIds:			analyticsFilter.accountIds?.map((account,) => {
				return account.value.id
			},),
		}
	}, [analyticsFilter, filter,],), 200,)

	const currencyCombinedFilter: TCashProps = useDebounce(React.useMemo(() => {
		const filteredEntitiesIds = analyticsFilter.entitiesIds ?
			filter.entityId ?
				analyticsFilter.entitiesIds.filter((item,) => {
					return item.value.id === filter.entityId
				},)
					.map((item,) => {
						return item.value.id
					},) :
				analyticsFilter.entitiesIds.map((item,) => {
					return item.value.id
				},) :
			filter.entityId ?
				[filter.entityId,] :
				undefined

		const filteredBankIds = analyticsFilter.bankIds ?
			filter.bankId ?
				analyticsFilter.bankIds.filter((item,) => {
					return item.value.id === filter.bankId
				},).map((item,) => {
					return item.value.id
				},) :
				analyticsFilter.bankIds.map((item,) => {
					return item.value.id
				},) :
			filter.bankId ?
				[filter.bankId,] :
				undefined
		return {
			type:         AssetNamesType.CASH,
			clientIds:    analyticsFilter.clientIds?.map((item,) => {
				return item.value.id
			},),
			portfolioIds: analyticsFilter.portfolioIds?.map((item,) => {
				return item.value.id
			},),
			date:		      analyticsFilter.date,
			entitiesIds:  filteredEntitiesIds,
			bankListIds:      filteredBankIds,
			currencies:   analyticsFilter.currencies?.map((item,) => {
				return item.value.name
			},),
			accountIds:			analyticsFilter.accountIds?.map((account,) => {
				return account.value.id
			},),
		}
	}, [analyticsFilter, filter,],), 200,)

	const {
		data: bankData,
		isPending: bankIsFetching,
	} = useCashBankAnalytics(bankCombinedFilter,)
	const {
		data: entityData,
		isPending: entityIsFetching,
	} = useCashEntityAnalytics(entityCombinedFilter,)
	const {
		data: currencyData,
		isPending: currencyIsFetching,
	} = useCashCurrencyAnalytics(currencyCombinedFilter,)
	const {
		data: totalBankData,
	} = useCashBankAnalytics({
		type: AssetNamesType.CASH,
	},)
	const {
		data: totalCurrencyData,
	} = useCashCurrencyAnalytics({
		type: AssetNamesType.CASH,
	},)

	const handleCurrencyBarClick = (data: TAnalyticsChartData,): void => {
		setBankName(undefined,)
		setEntityId(undefined,)
		setCurrency(filter.chartCurrency?.includes(data.name,) ?
			filter.chartCurrency.length === 1 ?
				undefined :
				filter.chartCurrency.filter((item,) => {
					return item !== data.name
				},) :
			[...(filter.chartCurrency ?? []), data.name,],)
		setChartCurrency(filter.chartCurrency?.includes(data.name,) ?
			filter.chartCurrency.length === 1 ?
				undefined :
				filter.chartCurrency.filter((item,) => {
					return item !== data.name
				},) :
			[...(filter.chartCurrency ?? []), data.name,],)
	}

	const handleCurrencyRowClick = React.useCallback((data: TAnalyticsTableData,): void => {
		setBankName(undefined,)
		setEntityId(undefined,)
		setCurrency(filter.currency?.includes(data.currency,) ?
			filter.currency.length === 1 ?
				undefined :
				filter.currency.filter((item,) => {
					return item !== data.currency
				},) :
			[...(filter.currency ?? []), data.currency,],)
		if (filter.currency?.includes(data.currency,) &&	filter.currency.length === 1) {
			setChartCurrency(undefined,)
		}
	}, [filter,],)

	const handleEntityPieClick = (data: TAnalyticsChartData,): void => {
		setCurrency(undefined,)
		setEntityId(data.id,)
		setBankName(undefined,)
	}

	const handleBankBarClick = (data: TAnalyticsChartData,): void => {
		setCurrency(undefined,)
		setEntityId(undefined,)
		setBankName(data.id,)
	}

	const handleBankChartClear = (): void => {
		setBankName(undefined,)
	}

	const handleEntityChartClear = (): void => {
		setEntityId(undefined,)
		setClearChartOpacity(true,)
	}

	React.useEffect(() => {
		if (clearChartOpacity) {
			setClearChartOpacity(false,)
		}
	}, [clearChartOpacity,],)

	React.useEffect(() => {
		if (isDeepEqual(initialBankStore, filter,)) {
			setClearChartOpacity(true,)
		}
	}, [filter,],)

	const handleCurrencyChartClear = (): void => {
		setCurrency(undefined,)
		setChartCurrency(undefined,)
	}

	const handleCurrencyTableClear = (): void => {
		setCurrency(undefined,)
		setChartCurrency(undefined,)
	}

	const entityPieChartData = (entityData ?
		[...entityData,] :
		[])
		.reduce<Array<TAnalyticsChartData>>((acc, asset,) => {
			const {
				id,
				entityName,
			} = asset
			const existing = acc.find((item,) => {
				return item.id === id
			},)
			if (existing) {
				existing.value = existing.value + asset.usdValue
			} else {
				acc.push({
					id,
					name:  entityName,
					value: asset.usdValue,
				},)
			}
			return acc
		}, [],)
		.filter((item,) => {
			return analyticsFilter.entitiesIds && item.id ?
				analyticsFilter.entitiesIds
					.map((item,) => {
						return item.value.id
					},)
					.includes(item.id,) :
				true
		},)
		.filter((asset,) => {
			return asset.value > 0
		},)
		.sort((a, b,) => {
			return b.value - a.value
		},)

	const totalCurrencyBarChartData = prepareCurrencyChartData(totalCurrencyData,)
	const currencyBarChartData = prepareCurrencyChartData(currencyData,)
	const currencyResult = mergeCurrencyChartData({
		total:   totalCurrencyBarChartData,
		current: currencyBarChartData,
	},)

	const currencyTableData = (currencyData ?
		[...currencyData,] :
		[])
		.filter((item,) => {
			return analyticsFilter.currencies ?
				analyticsFilter.currencies
					.map((item,) => {
						return item.value.name
					},)
					.includes(item.currency,) :
				true
		},)
		.filter((item,) => {
			return filter.chartCurrency ?
				filter.chartCurrency
					.includes(item.currency,) :
				true
		},)
		.sort((a, b,) => {
			return b.usdValue - a.usdValue
		},)
		.filter((asset,) => {
			return asset.usdValue >= 1 || asset.usdValue <= -1
		},)

	const totalBankBarChartData = prepareBankChartData(totalBankData,)
	const bankBarChartData = prepareBankChartData(bankData,)
	const bankResult = mergeBankChartData({
		total:   totalBankBarChartData,
		current: bankBarChartData,
	},)

	const currencySheetData = getCurrencySheetData(currencyTableData,)

	return (
		<div className={styles.container}>
			<div className={styles.chartsWrapper}>
				<TableWrapper>
					<Header
						title='Currency'
						handleClear={handleCurrencyTableClear}
						isDisabled={!filter.currency}
					>
						<SaveAsExcelButton
							sheetData={currencySheetData}
							fileName='currency-table-data'
						/>
					</Header>
					{!currencyIsFetching && Boolean(currencyTableData.length === 0,) && <EmptyAnalyticsResponse wrapperClassName={styles.emptyState} isFilter={isFilterApplied} clearFunction={resetAnalyticsFilterStore} />}
					{currencyIsFetching ?
						<Loader
							radius={6}
							width={150}
						/> :
						<CashCurrencyTable
							data={currencyTableData}
							handleRowClick={handleCurrencyRowClick}
						/>}
				</TableWrapper>
				<TableWrapper>
					<TableHeader
						title='Entities & Currencies'
						handleClear={handleEntityChartClear}
						isDisabled={!filter.entityId}
					/>
					{!entityIsFetching && Boolean(entityPieChartData.length === 0,) && <EmptyAnalyticsResponse wrapperClassName={styles.emptyState} isFilter={isFilterApplied} isAdditionalText={Boolean(entityData?.length,)}/>}
					{entityIsFetching ?
						<Loader
							radius={6}
							width={150}
						/> :
						<PieChart
							data={entityPieChartData}
							handlePieClick={handleEntityPieClick}
							idValue={filter.entityId}
							clearChartOpacity={clearChartOpacity}
						/>}
				</TableWrapper>
			</div>
			<div className={styles.chartsWrapper}>
				<TableWrapper>
					<TableHeader
						title='Market value by bank'
						handleClear={handleBankChartClear}
						isDisabled={!filter.bankId}
					/>
					{!bankIsFetching && Boolean(bankResult.length === 0,) && <EmptyAnalyticsResponse wrapperClassName={styles.emptyState} isFilter={isFilterApplied} isAdditionalText={Boolean(bankData?.length,)}/>}
					{bankIsFetching ?
						<Loader
							radius={6}
							width={150}
						/> :
						Boolean(totalBankBarChartData.length !== 0,) && <HorizontalBarChart
							data={bankResult}
							handleBarClick={handleBankBarClick}
							height={26.2}
							idValue={filter.bankId}
						/>}
				</TableWrapper>
				<TableWrapper>
					<TableHeader
						title='Market value by currency'
						handleClear={handleCurrencyChartClear}
						isDisabled={!filter.currency && !filter.chartCurrency}
					/>
					{!currencyIsFetching && Boolean(currencyResult.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} isAdditionalText={Boolean(currencyData?.length,)}/>}
					{currencyIsFetching ?
						<Loader
							radius={6}
							width={150}
						/> :
						Boolean(totalCurrencyBarChartData.length !== 0,) && <VerticalBarChart
							data={currencyResult}
							handleBarClick={handleCurrencyBarClick}
							nameValue={filter.currency}
						/>}
				</TableWrapper>
			</div>
		</div>
	)
}

export default AnalyticsCash
