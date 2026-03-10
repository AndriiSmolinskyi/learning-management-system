/* eslint-disable no-mixed-operators */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable max-lines */
/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	ArrowDownUp,
	ArrowDownUpFilled,
	ChevronRight,
	Rotate,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Dialog,
	Drawer,
	Loader,
	SaveAsExcelButton,
	Size,
} from '../../../../shared/components'
import {
	localeString,
	toggleState,
} from '../../../../shared/utils'
import {
	TableItem,
} from './table-item.component'
import {
	useMetalsStore,
} from '../metals.store'
import {
	AssetNamesType,
	AssetOperationType,
	MetalType,
	SortOrder,
} from '../../../../shared/types'
import {
	MetalsTableSortVariants,
} from '../metals.types'
import type {
	IMetalsByFilter,
} from '../../../../services/analytics/analytics.types'
import {
	getMetalsSheetData,
} from '../metals.utils'
import {
	DeleteAssetModal,
} from '../../components/delete-asset-modal/delete-asset-modal.component'
import {
	useAnalyticsFilterStore,
} from '../../analytics-store'
import {
	EmptyAnalyticsResponse,
} from '../../../../shared/components/empty-analytics-response/empty-analytics-response.component'
import {
	EditAsset,
	TransferAssetDialog,
	TransferConfirmationDialog, TransferSuccessModal,
} from '../../../clients/portfolios/portfolio-details/components/asset'
import {
	useAnalyticsLayoutStore,
} from '../../layout/analytics-layout.store'
import {
	useGetRefactoredAssetById,
} from '../../../../shared/hooks'
import {
	AssetDrawer,
} from '../../../clients/portfolios/portfolio-details/components/sub-items-list/asset-drawer.component'

import * as styles from '../metals.styles'

type Props = {
	tableData?: IMetalsByFilter
	refetchData: () => void
	tableIsFetching: boolean
	isFilterApplied?: boolean
}

export const MetalsTable: React.FunctionComponent<Props> = ({
	tableData,
	refetchData,
	tableIsFetching,
	isFilterApplied,
},) => {
	const tableRef = React.useRef<HTMLTableElement>(null,)
	const tbodyRef = React.useRef<HTMLTableSectionElement>(null,)
	const [isHorizontalScroll, setIsHorizontalScroll,] = React.useState(false,)
	const [rowClicked, setRowClicked,] = React.useState(false,)
	const [isTbodyEmpty, setIsTbodyEmpty,] = React.useState(true,)
	const [totals, setTotals,] = React.useState<{ profitUsd: number; marketValueUsd: number; costValueUsd: number; profitPercentage: number} | undefined>()
	const [isDeleteModalShowed, setIsDeleteModalShown,] = React.useState(false,)
	const [deleteAssetId, setDeleteAssetId,] = React.useState<string | undefined>(undefined,)
	const [isTransferSuccess, setIsTransferSuccess,] = React.useState(false,)
	const [isTableNamesShown, setIsTableNamesShown,] = React.useState(false,)

	const toggleDeleteDialog = toggleState(setIsDeleteModalShown,)
	const handleOpenDeleteModal = (assetId: string,): void => {
		setDeleteAssetId(assetId,)
		toggleDeleteDialog()
	}
	const metalsSheetData = getMetalsSheetData(tableData?.list ?? [],)
	const {
		filter,
		sortFilter,
		setBankId,
		setCurrency,
		setAssetIds,
		setSortFilters,
		setProductDirectHold,
		setProductETF,
		productType,
		setProductFilterDirectHold,
		setProductFilterETF,
	} = useMetalsStore()
	const {
		resetAnalyticsFilterStore,
		setAssetTransferProps,
		assetTransferProps,
		analyticsFilter,
	} = useAnalyticsFilterStore()
	const handleTransferSuccess = (isSuccess: boolean,): void => {
		setIsTransferSuccess(isSuccess,)
	}

	const {
		isAssetDetailsOpen,
		isAssetEditOpen,
		storeAsset,
		storeAssetCurrentId,
		setIsAssetDetailsOpen,
		setIsAssetEditOpen,
		setStoreAssetCurrentId,
		setStoreAsset,
		setIsTransferDialogOpen,
		isTransferDialogOpen,
		isVersion,
	} = useAnalyticsLayoutStore()

	const {
		data,
	} = useGetRefactoredAssetById({
		id: storeAssetCurrentId ?? '', assetName: AssetNamesType.METALS,
		...(isVersion ?
			{
				isVersion: true,
			} :
			{
			}),
	},)
	React.useEffect(() => {
		if (data) {
			setStoreAsset(data,)
		}
	}, [data,],)
	const isMetalFilterApplied = analyticsFilter.clientIds?.length ||
		analyticsFilter.portfolioIds?.length ||
		analyticsFilter.entitiesIds?.length ||
		analyticsFilter.bankIds?.length ||
		analyticsFilter.accountIds?.length
	React.useEffect(() => {
		if (isMetalFilterApplied) {
			return
		}
		const shouldShowEtfColumns = tableData?.list.some((item,) => {
			return item.productType === MetalType.ETF
		},) ?? false

		const shouldShowDirectColumns = tableData?.list.some((item,) => {
			return item.productType === MetalType.DIRECT_HOLD
		},) ?? false
		setProductFilterDirectHold(shouldShowDirectColumns,)
		setProductFilterETF(shouldShowEtfColumns,)
	}, [tableData?.list, filter,],)

	React.useEffect(() => {
		const shouldShowEtfColumns = tableData?.list.some((item,) => {
			return item.productType === MetalType.ETF
		},) ?? false
		const shouldShowDirectColumns = tableData?.list.some((item,) => {
			return item.productType === MetalType.DIRECT_HOLD
		},) ?? false
		setProductDirectHold(shouldShowDirectColumns,)
		setProductETF(shouldShowEtfColumns,)
	}, [tableData?.list, filter,],)

	const handleRowClicked = (): void => {
		if (!rowClicked) {
			setRowClicked(true,)
		}
		if (rowClicked) {
			setRowClicked(false,)
		}
	}

	const checkHorizontalScroll = (): void => {
		if (tableRef.current) {
			setIsHorizontalScroll(tableRef.current.scrollWidth > tableRef.current.clientWidth,)
		}
	}

	React.useEffect(() => {
		checkHorizontalScroll()
		const handleResize = (): void => {
			checkHorizontalScroll()
		}
		window.addEventListener('resize', handleResize,)
		return () => {
			window.removeEventListener('resize', handleResize,)
		}
	}, [tableData,],)

	const checkTbodyHeight = (): void => {
		if (tbodyRef.current && tableRef.current) {
			const tbodyHeight = tbodyRef.current.offsetHeight
			const tableHeight = tableRef.current.offsetHeight
			setIsTbodyEmpty((tableHeight - tbodyHeight - 44 - 46) > 0,)
		}
	}

	React.useEffect(() => {
		checkTbodyHeight()

		const handleResize = (): void => {
			checkTbodyHeight()
		}
		window.addEventListener('resize', handleResize,)

		const ro = new ResizeObserver(() => {
			checkTbodyHeight()
			if (tableRef.current) {
				setIsHorizontalScroll(tableRef.current.scrollWidth > tableRef.current.clientWidth,)
			}
		},)
		if (tbodyRef.current) {
			ro.observe(tbodyRef.current,)
		}
		if (tableRef.current) {
			ro.observe(tableRef.current,)
		}

		return () => {
			window.removeEventListener('resize', handleResize,)
			ro.disconnect()
		}
	}, [tableData, rowClicked,],)

	// React.useEffect(() => {
	// 	if (filter.assetIds?.length) {
	// 		let profitPercentage = 0
	// 		let profitUsd = 0
	// 		let marketValueUsd = 0
	// 		let costValueUsd = 0
	// 		filter.assetIds.forEach((assetId,) => {
	// 			const allAssets = tableData?.list.flatMap((account,) => {
	// 				return account.assets
	// 			},) ?? []
	// 			const currentAsset = allAssets.find((asset,) => {
	// 				return asset?.id === assetId
	// 			},)
	// 			if (currentAsset) {
	// 				profitPercentage = profitPercentage + (currentAsset.profitPercentage || 0)
	// 				profitUsd = profitUsd + (currentAsset.profitUsd || 0)
	// 				marketValueUsd = currentAsset.operation === AssetOperationType.BUY ?
	// 					marketValueUsd + currentAsset.marketValueUsd :
	// 					marketValueUsd - currentAsset.marketValueUsd
	// 				costValueUsd = currentAsset.operation === AssetOperationType.BUY ?
	// 					costValueUsd + currentAsset.costValueUsd :
	// 					costValueUsd - currentAsset.costValueUsd
	// 			}
	// 		},)
	// 		setTotals({
	// 			profitPercentage,
	// 			profitUsd,
	// 			marketValueUsd,
	// 			costValueUsd,
	// 		},)
	// 	} else {
	// 		setTotals(tableData?.list.reduce(
	// 			(acc, item,) => {
	// 				acc.profitPercentage = acc.profitPercentage + (item.profitPercentage || 0)
	// 				acc.profitUsd = acc.profitUsd + (item.profitUsd || 0)
	// 				acc.marketValueUsd = acc.marketValueUsd + (item.marketValueUsd || 0)
	// 				acc.costValueUsd = acc.costValueUsd + (item.costValueUsd || 0)
	// 				return acc
	// 			},
	// 			{
	// 				profitPercentage:          0,
	// 				profitUsd:        0,
	// 				marketValueUsd:      0,
	// 				costValueUsd:     0,
	// 			},
	// 		),)
	// 	}
	// }, [tableData, filter.assetIds,],)
	React.useEffect(() => {
		if (!tableData) {
			setTotals(undefined,)
			return
		}

		type AssetLike = {
			id: string
			operation: AssetOperationType
			profitPercentage: number
			profitUsd: number
			marketValueUsd: number
			costValueUsd: number
		}

		const allAssets: Array<AssetLike> = tableData.list.flatMap((row,) => {
			if (Array.isArray(row.assets,) && row.assets.length) {
				return row.assets as Array<AssetLike>
			}
			return [row as unknown as AssetLike,]
		},)

		if (filter.assetIds?.length) {
			let profitPercentage = 0
			let profitUsd = 0
			let marketValueUsd = 0
			let costValueUsd = 0

			filter.assetIds.forEach((assetId,) => {
				const currentAsset = allAssets.find((asset,) => {
					return asset.id === assetId
				},)
				if (!currentAsset) {
					return
				}

				const sign = currentAsset.operation === AssetOperationType.BUY ?
					1 :
					-1

				profitPercentage = profitPercentage + currentAsset.profitPercentage
				profitUsd = profitUsd + currentAsset.profitUsd
				marketValueUsd = marketValueUsd + sign * currentAsset.marketValueUsd
				costValueUsd = costValueUsd + sign * currentAsset.costValueUsd
			},)

			setTotals({
				profitPercentage,
				profitUsd,
				marketValueUsd,
				costValueUsd,
			},)
		} else {
			const totals = tableData.list.reduce(
				(acc, item,) => {
					acc.profitPercentage = acc.profitPercentage + item.profitPercentage
					acc.profitUsd = acc.profitUsd + item.profitUsd
					acc.marketValueUsd = acc.marketValueUsd + item.marketValueUsd
					acc.costValueUsd = acc.costValueUsd + item.costValueUsd
					return acc
				},
				{
					profitPercentage: 0,
					profitUsd:        0,
					marketValueUsd:   0,
					costValueUsd:     0,
				},
			)

			setTotals(totals,)
		}
	}, [tableData, filter.assetIds,],)

	const handleTableClear = (): void => {
		setBankId(undefined,)
		setCurrency(undefined,)
		setAssetIds(undefined,)
	}
	const renderSortArrows = (type: MetalsTableSortVariants,): React.ReactElement => {
		const isCurrent = sortFilter.sortBy === type
		const order = sortFilter.sortOrder

		const handleClick = (): void => {
			if (!isCurrent) {
				setSortFilters({
					sortBy: type, sortOrder: SortOrder.DESC,
				},)
			} else if (order === SortOrder.DESC) {
				setSortFilters({
					sortBy: type, sortOrder: SortOrder.ASC,
				},)
			} else {
				setSortFilters({
					sortBy: MetalsTableSortVariants.VALUE_DATE, sortOrder: SortOrder.DESC,
				},)
			}
		}

		return (
			<span
				className={styles.sortArrows(isCurrent && order === SortOrder.ASC,)}
				onClick={handleClick}
			>
				{!isCurrent && <ArrowDownUp />}
				{isCurrent && order === SortOrder.DESC && <ArrowDownUpFilled />}
				{isCurrent && order === SortOrder.ASC && <ArrowDownUpFilled />}
			</span>
		)
	}

	React.useEffect(() => {
		const table = tableRef.current
		if (!table) {
			return undefined
		}
		const onWheel = (e: WheelEvent,): void => {
			if (e.shiftKey && e.deltaY !== 0) {
				e.preventDefault()
				table.scrollLeft = table.scrollLeft + e.deltaY
				return
			}
			if (e.deltaY !== 0) {
				e.preventDefault()
				table.scrollTop = table.scrollTop + (Math.sign(e.deltaY,) * 44)
			}
			if (e.deltaX !== 0) {
				table.scrollLeft = table.scrollLeft + e.deltaX
			}
		}
		table.addEventListener('wheel', onWheel, {
			passive: false,
		},)
		return () => {
			table.removeEventListener('wheel', onWheel,)
		}
	}, [],)

	const handleTableFold = (): void => {
		setIsTableNamesShown(!isTableNamesShown,)
	}
	return (
		<div className={styles.tableWrapper}>
			<div className={styles.scrollPadding} />
			<table ref={tableRef} className={styles.tableContainer(!isTbodyEmpty && !tableIsFetching && Boolean(tableData?.list.length,),)}>
				<thead>
					<tr>
						<th className={cx(styles.headerCell, styles.cellWidth44, styles.chevronContainer,)}><ChevronRight className={styles.chevronIcon(isTableNamesShown,)} onClick={handleTableFold}/></th>
						{isTableNamesShown && <><th className={cx(styles.headerCell, styles.cellWidth110,)}>
							<p className={styles.tableTitle}>Product type</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth141,)}>
							<p className={styles.tableTitle}>Portfolio</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth141,)}>
							<p className={styles.tableTitle}>Entity</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth141,)}>
							<p className={styles.tableTitle}>Bank</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth141,)}>
							<p className={styles.tableTitle}>Account</p>
						</th></>}
						{productType.isETF && (
							<th className={cx(styles.headerCell, styles.cellWidth120,)}>
								<p className={styles.tableTitle}>Issuer</p>
							</th>
						)}
						{productType.isETF && (
							<th className={cx(styles.headerCell, styles.cellWidth120,)}>
								<p className={styles.tableTitle}>ISIN</p>
							</th>
						)}
						{productType.isETF && (
							<th className={cx(styles.headerCell, styles.cellWidth80,)}>
								<p className={styles.tableTitle}>Security</p>
							</th>
						)}
						<th className={cx(styles.headerCell, styles.cellWidth80,)}>
							<p className={styles.tableTitle}>Currency</p>
						</th>
						<th className={cx(styles.headerCellSortRight,styles.cellWidth80,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Units</p>
								{renderSortArrows(MetalsTableSortVariants.UNITS,)}
							</div>
						</th>
						{productType.isDirectHold && (
							<th className={cx(styles.headerCell, styles.cellWidth80,)}>
								<p className={styles.tableTitle}>Metal type</p>
							</th>
						)}
						{productType.isDirectHold && (
							<th className={cx(styles.headerCell, styles.cellWidth90,)}>
								<p className={styles.tableTitle}>Metal name</p>
							</th>
						)}
						<th className={cx(styles.headerCellSortRight, styles.cellWidth110,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Cost price</p>
								{renderSortArrows(MetalsTableSortVariants.COST_PRICE,)}
							</div>
						</th>
						<th className={cx(styles.headerCellSortRight, styles.cellWidth130,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Market price</p>
								{renderSortArrows(MetalsTableSortVariants.MARKET_PRICE,)}
							</div>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth130,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Cost value FC</p>
								{renderSortArrows(MetalsTableSortVariants.COST_VALUE_FC,)}
							</div>
						</th>
						<th className={cx(styles.headerCellSortRight, styles.cellWidth130,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Cost value USD</p>
								{renderSortArrows(MetalsTableSortVariants.COST_VALUE_USD,)}
							</div>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth160,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Market value FC</p>
								{renderSortArrows(MetalsTableSortVariants.MARKET_VALUE_FC,)}
							</div>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth160,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Market value USD</p>
								{renderSortArrows(MetalsTableSortVariants.MARKET_VALUE_USD,)}
							</div>
						</th>
						<th className={cx(styles.headerCellSortRight,styles.cellWidth130,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Profit USD</p>
								{renderSortArrows(MetalsTableSortVariants.USD_VALUE,)}
							</div>
						</th>
						<th className={cx(styles.headerCellSortRight,styles.cellWidth130,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Profit %</p>
								{renderSortArrows(MetalsTableSortVariants.PERCENT,)}
							</div>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth110,)}>
							<p className={styles.tableTitle}>Country</p>
						</th>
						<th className={cx(styles.headerCellSortRight,styles.cellWidth110,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Value Date</p>
								{renderSortArrows(MetalsTableSortVariants.VALUE_DATE,)}
							</div>
						</th>
					</tr>
				</thead>
				{!tableIsFetching && Boolean(tableData?.list.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} inTable clearFunction={resetAnalyticsFilterStore}/>}
				{tableIsFetching ?
					<Loader
						radius={6}
						width={150}
						inTable
					/> :
					<tbody ref={tbodyRef}>
						{tableData?.list.map((row,) => {
							return <TableItem
								key={row.id}
								handleRowClicked={handleRowClicked}
								row={row}
								refetchData={refetchData}
								handleOpenDeleteModal={handleOpenDeleteModal}
								shouldShowEtfColumns={productType.isETF}
								shouldShowDirectColumns={productType.isDirectHold}
								isTableNamesShown={isTableNamesShown}
							/>
						},)}
					</tbody>
				}
				<tfoot className={styles.tableFooter(!isTbodyEmpty && !tableIsFetching && Boolean(tableData?.list.length,),)}>
					<tr>
						<th className={cx(styles.headerCell, styles.cellWidth44,)}>
						</th>
						{isTableNamesShown && <><th className={cx(styles.headerCell,styles.cellWidth110,)}>
							<span className={styles.totalLabel}>
								Total: {tableData ?
									tableData.list.length :
									0}
							</span>
						</th>
						<th className={cx(styles.headerCell,styles.cellWidth125,)}>
						</th>
						<th className={cx(styles.headerCell,styles.cellWidth125,)}>
						</th>
						<th className={cx(styles.headerCell,styles.cellWidth110,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth110,)}>
						</th></>}
						{productType.isETF && <th className={cx(styles.headerCell, styles.cellWidth120,)}>{!isTableNamesShown && <span className={styles.totalLabel}>
								Total: {tableData ?
								tableData.list.length :
								0}
						</span>}</th>}
						{productType.isETF && <th className={cx(styles.headerCell, styles.cellWidth120,)}></th>}
						{productType.isETF && <th className={cx(styles.headerCell, styles.cellWidth80,)}></th>}
						<th className={cx(styles.headerCell, styles.cellWidth80,)}>{!isTableNamesShown && (!productType.isETF) && <span className={styles.totalLabel}>
								Total: {tableData ?
								tableData.list.length :
								0}
						</span>}</th>
						<th className={cx(styles.headerCell, styles.cellWidth80,)}></th>
						{productType.isDirectHold && <th className={cx(styles.headerCell, styles.cellWidth80,)}>
						</th>}
						{productType.isDirectHold && <th className={cx(styles.headerCell, styles.cellWidth90,)}>
						</th>}
						<th className={cx(styles.headerCell, styles.cellWidth110,)}></th>
						<th className={cx(styles.headerCell,styles.cellWidth130,)}></th>
						<th className={cx(styles.headerCell,styles.cellWidth130,)}></th>
						<th className={cx(styles.footerTotalCell, styles.cellWidth130,)}>
							<span className={styles.totalLabel}>
								{totals ?
									localeString(totals.costValueUsd, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={cx(styles.headerCell,styles.cellWidth160,)}></th>
						<th className={cx(styles.footerTotalCell, styles.cellWidth160,)}>
							<span className={styles.totalLabel}>
								{totals ?
									localeString(totals.marketValueUsd, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>

						<th className={cx(styles.footerTotalCell,styles.cellWidth130,)}>
							<span className={styles.totalLabel}>
								{totals ?
									localeString(totals.profitUsd, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={cx(styles.headerCell,styles.cellWidth130,)}></th>
						<th className={cx(styles.headerCell, styles.cellWidth110,)}></th>
						<th className={cx(styles.headerCell, styles.cellWidth110,)}>
						</th>
					</tr>
				</tfoot>
			</table>
			<div className={styles.tableBtnContainer(isHorizontalScroll,)}>
				<Button<ButtonType.ICON>
					onClick={handleTableClear}
					disabled={!filter.assetIds}
					className={styles.clearBtn}
					additionalProps={{
						btnType:  ButtonType.ICON,
						icon:     <Rotate />,
						size:     Size.SMALL,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<SaveAsExcelButton
					sheetData={metalsSheetData}
					fileName='metals-table-data'
				/>
			</div>
			<Dialog
				onClose={() => {
					setIsDeleteModalShown(false,)
				}}
				open={isDeleteModalShowed}
				isCloseButtonShown
			>
				<DeleteAssetModal
					onClose={toggleDeleteDialog}
					assetName={AssetNamesType.METALS}
					assetId={deleteAssetId}
				/>
			</Dialog>
			<Dialog
				open={Boolean(assetTransferProps,)}
				onClose={() => {
					setAssetTransferProps(undefined,)
				}}
				onClosed={() => {
					setAssetTransferProps(undefined,)
				}}
				isCloseButtonShown
			>
				{assetTransferProps && <TransferConfirmationDialog
					assetProps={assetTransferProps} onClose={() => {
						setAssetTransferProps(undefined,)
					}}
					handleTransferSuccess={handleTransferSuccess}
					assetName={AssetNamesType.METALS}
				/>}
			</Dialog>
			<Dialog
				open={isTransferSuccess}
				onClose={() => {
					refetchData()
					setIsTransferSuccess(false,)
				}}
				onClosed={() => {
					setIsTransferSuccess(false,)
				}}
				isCloseButtonShown
			>
				<TransferSuccessModal onClose={() => {
					setIsTransferSuccess(false,)
					refetchData()
				}}/>
			</Dialog>
			{storeAsset && (
				<>
					<AssetDrawer
						isOpen={isAssetDetailsOpen}
						onClose={() => {
							setStoreAsset(undefined,)
							setStoreAssetCurrentId(undefined,)
							setIsAssetDetailsOpen(false,)
						}}
						asset={storeAsset}
						onEditAsset={() => {
							setIsAssetDetailsOpen(false,)
							setIsAssetEditOpen(true,)
						}}
						onTransferClick={() => {
							setIsTransferDialogOpen(true,)
						}}
					/>
					<Drawer
						isOpen={isAssetEditOpen}
						onClose={() => {
							setStoreAssetCurrentId(undefined,)
							setIsAssetEditOpen(false,)
						}}
						onClosed={() => {
							setStoreAsset(undefined,)
							setStoreAssetCurrentId(undefined,)
						}}
						isCloseButtonShown
					>
						<EditAsset
							assetModalData={storeAsset}
							onClose={() => {
								setIsAssetEditOpen(false,)
								refetchData()
							}}
							portfolioName={storeAsset.portfolio.name}
							entityName={storeAsset.entity.name}
							bankName={storeAsset.bank.bankName}
							accountName={storeAsset.account.accountName}
						/>
					</Drawer>
					<Dialog
						open={isTransferDialogOpen}
						onClose={() => {
							setIsTransferDialogOpen(false,)
						}}
						isCloseButtonShown
					>
						<TransferAssetDialog
							onClose={() => {
								setIsTransferDialogOpen(false,)
							}}
							asset={storeAsset}
						/>
					</Dialog>
				</>
			)}
		</div>

	)
}
