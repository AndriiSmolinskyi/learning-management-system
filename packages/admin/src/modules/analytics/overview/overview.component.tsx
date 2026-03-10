/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
import React from 'react'

import {
	AssetTable, BankTable, CurrencyTable, EntityTable, Header, TableWrapper,
} from './components'
import {
	Loader, PieChart, SaveAsExcelButton,
} from '../../../shared/components'

import {
	useAnalyticsFilterStore,
} from '../analytics-store'
import {
	initialOverviewFilter, useOverviewStore,
} from './overview.store'
import {
	useOverviewAssetAnalytics,
	useOverviewBankAnalytics,
	useOverviewCurrencyAnalytics,
	useOverviewEntityAnalytics,
} from '../../../shared/hooks/analytics/overview.hooks'
import type {
	TBankAnalytics,
	TCurrencyAnalytics,
	TEntityAnalytics,
	TOverviewAssetAnalytics,
	TOverviewProps,
} from '../../../services/analytics/analytics.types'
import type {
	AssetNamesType, CryptoList, CurrencyList, MetalList, TAnalyticsChartData,
} from '../../../shared/types'
import {
	getAssetPieChartData,
	getAssetSheetData,
	getBankPieChartData,
	getBankSheetData,
	getCurrencyPieChartData,
	getCurrencySheetData,
	getEntityPieChartData,
	getEntitySheetData,
} from './overview.utils'
import {
	useAssetCombinedFilter,
	useBankCombinedFilter,
	useCurrencyCombinedFilter,
	useEntityCombinedFilter,
} from './overview.hooks'
import {
	useGetFilterApplied,
} from '../layout/components/analytics-filter/analytics-filter.util'
import {
	EmptyAnalyticsResponse,
} from '../../../shared/components/empty-analytics-response/empty-analytics-response.component'
import {
	isDeepEqual,
} from '../../../shared/utils'
import * as styles from './overview.styles'

const AnalyticsOverview: React.FC = () => {
	const {
		filter,
		setPieAssetNames,
		setTableAssetNames,
		setPieBankIds,
		setTableBankIds,
		setTableAccountIds,
		setTableCurrencies,
		setPieCurrencies,
		setPieEntityIds,
		setTableEntityIds,
		resetOverviewStore,
	} = useOverviewStore()
	const {
		analyticsFilter,
	} = useAnalyticsFilterStore()
	const [clearChartOpacity, setClearChartOpacity,] = React.useState(false,)

	React.useEffect(() => {
		if (isDeepEqual(initialOverviewFilter, filter,)) {
			setClearChartOpacity(true,)
		}
	}, [filter,],)
	React.useEffect(() => {
		if (!filter.tableAccountIds) {
			setPieBankIds(undefined,)
			setPieCurrencies(undefined,)
		}
	}, [filter.tableAccountIds,],)

	React.useEffect(() => {
		resetOverviewStore()
	}, [analyticsFilter,],)

	const assetCombinedFilter: TOverviewProps = useAssetCombinedFilter({
		filter,
		analyticsFilter,
	},)

	const bankCombinedFilter: TOverviewProps = useBankCombinedFilter({
		filter,
		analyticsFilter,
	},)

	const currencyCombinedFilter: TOverviewProps = useCurrencyCombinedFilter({
		filter,
		analyticsFilter,
	},)

	const entityCombinedFilter: TOverviewProps = useEntityCombinedFilter({
		filter,
		analyticsFilter,
	},)

	const {
		data: assetData,
		isPending: assetIsFetching,
	} = useOverviewAssetAnalytics(assetCombinedFilter,)

	const {
		data: bankData,
		isPending: bankIsFetching,
	} = useOverviewBankAnalytics(bankCombinedFilter,)
	const {
		data: entityData,
		isPending: entityIsFetching,
	} = useOverviewEntityAnalytics(entityCombinedFilter,)
	const {
		data: currencyData,
		isPending: currencyIsFetching,
	} = useOverviewCurrencyAnalytics(currencyCombinedFilter,)

	const currencyTableData = (currencyData ?
		[...currencyData,] :
		[])
		.filter((asset,) => {
			return filter.pieCurrencies ?
				filter.pieCurrencies.includes(asset.currency,) :
				true
		},)
		.sort((a, b,) => {
			return b.usdValue - a.usdValue
		},)
		.filter((asset,) => {
			return asset.usdValue !== 0
		},)

	const assetTableData = (assetData ?
		[...assetData,] :
		[])
		.filter((asset,) => {
			return filter.pieAssetNames ?
				filter.pieAssetNames.includes(asset.assetName,) :
				true
		},)
		.filter((asset,) => {
			return asset.usdValue !== 0
		},)
		.sort((a, b,) => {
			return b.usdValue - a.usdValue
		},)

	const banksTableData = (bankData ?
		[...bankData,] :
		[])
		.filter((asset,) => {
			return asset.usdValue !== 0
		},)
		.sort((a, b,) => {
			return b.usdValue - a.usdValue
		},)

	const entityTableData = (entityData ?
		[...entityData,] :
		[])
		.filter((asset,) => {
			return filter.pieEntityIds ?
				filter.pieEntityIds.includes(asset.id,) :
				true
		},)
		.sort((a, b,) => {
			return b.usdValue - a.usdValue
		},)
		.filter((asset,) => {
			return asset.usdValue !== 0
		},)

	const currencyPieChartData = getCurrencyPieChartData({
		data: currencyData,
		filter,
	},)

	const assetPieChartData = getAssetPieChartData({
		data: assetData,
		filter,
	},)

	const banksPieChartData = getBankPieChartData({
		data: bankData,
		filter,
	},)
	const entityPieChartData = getEntityPieChartData({
		data: entityData,
		filter,
	},)

	const handleCurrencyTableClear = (): void => {
		setTableCurrencies(undefined,)
	}
	const handleAssetPieClear = (): void => {
		setPieAssetNames(undefined,)
		setPieEntityIds(undefined,)
	}
	const handleBankPieClear = (): void => {
		setPieCurrencies(undefined,)
		setPieBankIds(undefined,)
	}
	const handleBanksTableClear = (): void => {
		setTableBankIds(undefined,)
		setTableAccountIds(undefined,)
		setPieBankIds(undefined,)
		setPieCurrencies(undefined,)
	}
	const handleAssetsTableClear = (): void => {
		setTableAssetNames(undefined,)
	}
	const handleEntitiesTableClear = (): void => {
		setTableEntityIds(undefined,)
	}

	const handleCurrencyPieClick = (data: TAnalyticsChartData,): void => {
		setPieCurrencies([data.name as CurrencyList | MetalList | CryptoList,],)
	}
	const handleAssetPieClick = (data: TAnalyticsChartData,): void => {
		setPieAssetNames([data.name as AssetNamesType,],)
	}
	const handleBanksPieClick = (data: TAnalyticsChartData,): void => {
		setPieBankIds(data.id ?
			[data.id,] :
			undefined,)
	}
	const handleEntityPieClick = (data: TAnalyticsChartData,): void => {
		setPieEntityIds(data.id ?
			[data.id,] :
			undefined,)
	}

	const handleCurrencyRowClick = React.useCallback((data: TCurrencyAnalytics,): void => {
		setTableCurrencies(filter.tableCurrencies?.includes(data.currency,) ?
			filter.tableCurrencies.length === 1 ?
				undefined :
				filter.tableCurrencies.filter((item,) => {
					return item !== data.currency
				},) :
			[...(filter.tableCurrencies ?? []), data.currency,],)
	}, [filter.tableCurrencies,],)

	const handleAssetRowClick = React.useCallback((data: TOverviewAssetAnalytics,): void => {
		setTableAssetNames(filter.tableAssetNames?.includes(data.assetName,) ?
			filter.tableAssetNames.length === 1 ?
				undefined :
				filter.tableAssetNames.filter((item,) => {
					return item !== data.assetName
				},) :
			[...(filter.tableAssetNames ?? []), data.assetName,],)
	}, [filter.tableAssetNames,],)

	const handleBankRowClick = React.useCallback((data: TBankAnalytics,): void => {
		setTableBankIds(filter.tableBankIds?.includes(data.id,) ?
			filter.tableBankIds.length === 1 ?
				undefined :
				filter.tableBankIds.filter((item,) => {
					return item !== data.id
				},) :
			[...(filter.tableBankIds ?? []), data.id,],)
	}, [filter.tableBankIds,],)

	const handleEntityRowClick = React.useCallback((data: TEntityAnalytics,): void => {
		setTableEntityIds(filter.tableEntityIds?.includes(data.id,) ?
			filter.tableEntityIds.length === 1 ?
				undefined :
				filter.tableEntityIds.filter((item,) => {
					return item !== data.id
				},) :
			[...(filter.tableEntityIds ?? []), data.id,],)
	}, [filter.tableEntityIds,],)

	const entitySheetData = getEntitySheetData(entityTableData,)
	const assetSheetData = getAssetSheetData(assetTableData,)
	const bankSheetData = getBankSheetData(banksTableData,)
	const currencySheetData = getCurrencySheetData(currencyTableData,)

	const assetPieChartLoading = filter.pieAssetNames ?
		entityIsFetching :
		assetIsFetching
	const bankPieChartLoading = filter.pieBankIds ?
		currencyIsFetching :
		bankIsFetching

	const assetEntityPieChart = filter.pieAssetNames ?
		entityPieChartData :
		assetPieChartData
	const bankCurrencyPieChart = filter.pieBankIds ?
		currencyPieChartData :
		banksPieChartData

	const isFilterApplied = useGetFilterApplied()

	return (
		<div className={styles.container}>
			<div className={styles.blocksWrapper}>
				<TableWrapper className={styles.piechartContainer}>
					<Header
						title='Assets & Entities'
					/>
					{!assetPieChartLoading && Boolean(assetEntityPieChart?.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} />}
					{assetPieChartLoading ?
						<Loader
							radius={6}
							width={150}
						/> :
						<PieChart
							handleClear={filter.pieAssetNames ?
								handleAssetPieClear :
								undefined}
							data={assetEntityPieChart}
							clearChartOpacity={clearChartOpacity}
							handlePieClick={filter.pieAssetNames ?
								handleEntityPieClick :
								handleAssetPieClick}
						/>}
				</TableWrapper>
				<TableWrapper className={styles.largeTableContainer}>
					<Header
						title='Entities'
						handleClear={handleEntitiesTableClear}
						isDisabled={!filter.tableEntityIds}
					>
						<SaveAsExcelButton
							sheetData={entitySheetData}
							fileName='entity-table-data'
						/>
					</Header>
					{!entityIsFetching && Boolean(entityTableData.length === 0,) && <EmptyAnalyticsResponse wrapperClassName={styles.emptyState} isFilter={isFilterApplied} />}
					{entityIsFetching ?
						<Loader
							radius={6}
							width={150}
						/> :
						<EntityTable
							data={entityTableData}
							handleRowClick={handleEntityRowClick}
						/>
					}
				</TableWrapper>
				<TableWrapper className={styles.smallTableContainer}>
					<Header
						title='Assets'
						handleClear={handleAssetsTableClear}
						isDisabled={!filter.tableAssetNames}
					>
						<SaveAsExcelButton
							sheetData={assetSheetData}
							fileName='asset-table-data'
						/>
					</Header>
					{!assetIsFetching && Boolean(assetTableData.length === 0,) && <EmptyAnalyticsResponse wrapperClassName={styles.emptyState} isFilter={isFilterApplied} />}
					{assetIsFetching ?
						<Loader
							radius={6}
							width={150}
						/> :
						<AssetTable
							data={assetTableData}
							handleRowClick={handleAssetRowClick}
							assetCombinedFilter={assetCombinedFilter}
						/>
					}
				</TableWrapper>
			</div>
			<div className={styles.blocksWrapper}>
				<TableWrapper className={styles.piechartContainer}>
					<Header
						title='Banks & Currencies'
					/>
					{!bankPieChartLoading && Boolean(bankCurrencyPieChart?.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} />}
					{bankPieChartLoading ?
						<Loader
							radius={6}
							width={150}
						/> :
						<PieChart
							handleClear={filter.pieBankIds ?
								handleBankPieClear :
								undefined}
							data={bankCurrencyPieChart}
							clearChartOpacity={clearChartOpacity}
							handlePieClick={filter.pieBankIds ?
								handleCurrencyPieClick :
								handleBanksPieClick}
						/>}
				</TableWrapper>
				<TableWrapper className={styles.largeTableContainer}>
					<Header
						title='Banks'
						handleClear={handleBanksTableClear}
						isDisabled={!filter.tableBankIds}
					>
						<SaveAsExcelButton
							sheetData={bankSheetData}
							fileName='bank-table-data'
						/>
					</Header>
					{!bankIsFetching && Boolean(banksTableData.length === 0,) && <EmptyAnalyticsResponse wrapperClassName={styles.emptyState} isFilter={isFilterApplied} />}
					{bankIsFetching ?
						<Loader
							radius={6}
							width={150}
						/> :
						<BankTable
							data={banksTableData}
							handleRowClick={handleBankRowClick}
						/>
					}
				</TableWrapper>
				<TableWrapper className={styles.smallTableContainer}>
					<Header
						title='Currency'
						handleClear={handleCurrencyTableClear}
						isDisabled={!filter.tableCurrencies}
					>
						<SaveAsExcelButton
							sheetData={currencySheetData}
							fileName='currency-table-data'
						/>
					</Header>
					{!currencyIsFetching && Boolean(currencyTableData.length === 0,) && <EmptyAnalyticsResponse wrapperClassName={styles.emptyState} isFilter={isFilterApplied} />}
					{currencyIsFetching ?
						<Loader
							radius={6}
							width={150}
						/> :
						<CurrencyTable
							data={currencyTableData}
							handleRowClick={handleCurrencyRowClick}
						/>
					}
				</TableWrapper>
			</div>
		</div>
	)
}

export default AnalyticsOverview