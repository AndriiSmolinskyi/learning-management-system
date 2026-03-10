/* eslint-disable no-mixed-operators */
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
	useBondStore,
} from '../bonds.store'
import {
	AssetNamesType,
	AssetOperationType,
	SortOrder,
} from '../../../../shared/types'
import {
	TBondTableSortVariants,
} from '../bonds.types'
import type {
	IBondsByFilter,
} from '../../../../services/analytics/analytics.types'
import {
	getBondsSheetData,
} from '../bonds.utils'
import {
	DeleteAssetModal,
} from '../../components/delete-asset-modal/delete-asset-modal.component'
import {
	EmptyAnalyticsResponse,
} from '../../../../shared/components/empty-analytics-response/empty-analytics-response.component'
import {
	useAnalyticsFilterStore,
} from '../../analytics-store'
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

import * as styles from '../bonds.styles'
import {
	format,
} from 'date-fns'

type Props = {
	tableData?: IBondsByFilter
	refetchData: () => void
	tableIsFetching: boolean
	isFilterApplied?: boolean
}

export const BondsTable: React.FunctionComponent<Props> = ({
	tableData,
	refetchData,
	tableIsFetching,
	isFilterApplied,
},) => {
	const tableRef = React.useRef<HTMLTableElement>(null,)
	const tbodyRef = React.useRef<HTMLTableSectionElement>(null,)
	const [rowClicked, setRowClicked,] = React.useState(false,)
	const [isHorizontalScroll, setIsHorizontalScroll,] = React.useState(false,)
	const [isTbodyEmpty, setIsTbodyEmpty,] = React.useState(true,)
	const [totals, setTotals,] = React.useState<{ profitUsd: number; costValueUsd: number; marketValueUsd: number; costValueFC: number; marketValueFC: number; profitPercentage: number} | undefined>()
	const [isDeleteModalShowed, setIsDeleteModalShown,] = React.useState(false,)
	const [deleteAssetId, setDeleteAssetId,] = React.useState<string | undefined>(undefined,)
	const [isTransferSuccess, setIsTransferSuccess,] = React.useState(false,)
	const [isTableNamesShown, setIsTableNamesShown,] = React.useState(false,)

	const handleRowClicked = (): void => {
		if (!rowClicked) {
			setRowClicked(true,)
		}
		if (rowClicked) {
			setRowClicked(false,)
		}
	}

	const checkTbodyHeight = (): void => {
		if (tbodyRef.current && tableRef.current) {
			const tbodyHeight = tbodyRef.current.offsetHeight
			const tableHeight = tableRef.current.offsetHeight
			setIsTbodyEmpty((tableHeight - tbodyHeight - 44 - 46) > 0,)
		}
	}
	const {
		resetAnalyticsFilterStore,
		setAssetTransferProps,
		assetTransferProps,
	} = useAnalyticsFilterStore()

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

	const toggleDeleteDialog = toggleState(setIsDeleteModalShown,)
	const handleOpenDeleteModal = (assetId: string,): void => {
		setDeleteAssetId(assetId,)
		toggleDeleteDialog()
	}
	const bondsSheetData = getBondsSheetData(tableData?.list ?? [],)

	const {
		filter,
		sortFilter,
		setBankId,
		setCurrency,
		setAssetId,
		setSortFilters,
	} = useBondStore()

	const handleTransferSuccess = (isSuccess: boolean,): void => {
		setIsTransferSuccess(isSuccess,)
	}

	const {
		isAssetDetailsOpen,
		isAssetEditOpen,
		storeAsset,
		storeAssetCurrentId,
		isVersion,
		setIsAssetDetailsOpen,
		setIsAssetEditOpen,
		setStoreAssetCurrentId,
		setStoreAsset,
		setIsTransferDialogOpen,
		isTransferDialogOpen,
	} = useAnalyticsLayoutStore()

	const {
		data,
	} = useGetRefactoredAssetById({
		id: storeAssetCurrentId ?? '', assetName: AssetNamesType.BONDS,
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

	// todo: clear if good
	// React.useEffect(() => {
	// 	if (filter.assetId?.length) {
	// 		let marketValueUsd = 0
	// 		let marketValueFC = 0
	// 		let profitUsd = 0
	// 		let costValueUsd = 0
	// 		let costValueFC = 0
	// 		let profitPercentage = 0
	// 		filter.assetId.forEach((assetId,) => {
	// 			const allAssets = tableData?.list.flatMap((account,) => {
	// 				return account.assets
	// 			},) ?? []
	// 			const currentAsset = allAssets.find((asset,) => {
	// 				return asset?.id === assetId
	// 			},)
	// 			if (currentAsset) {
	// 				profitUsd = profitUsd + currentAsset.profitUsd
	// 				profitPercentage = profitPercentage + currentAsset.profitPercentage
	// 				costValueUsd = currentAsset.operation === AssetOperationType.BUY ?
	// 					costValueUsd + currentAsset.costValueUsd :
	// 					costValueUsd - currentAsset.costValueUsd
	// 				marketValueUsd = currentAsset.operation === AssetOperationType.BUY ?
	// 					marketValueUsd + currentAsset.marketValueUsd :
	// 					marketValueUsd - currentAsset.marketValueUsd
	// 				costValueFC = currentAsset.operation === AssetOperationType.BUY ?
	// 					costValueFC + currentAsset.costValueFC :
	// 					costValueFC - currentAsset.costValueFC
	// 				marketValueFC = currentAsset.operation === AssetOperationType.BUY ?
	// 					marketValueFC + currentAsset.marketValueFC :
	// 					marketValueFC - currentAsset.marketValueFC
	// 			}
	// 		},)
	// 		setTotals({
	// 			marketValueUsd,
	// 			marketValueFC,
	// 			profitUsd,
	// 			costValueUsd,
	// 			costValueFC,
	// 			profitPercentage,
	// 		},)
	// 	} else {
	// 		setTotals(tableData?.list.reduce(
	// 			(acc, item,) => {
	// 				acc.marketValueUsd = acc.marketValueUsd + (Number(item.marketValueUsd,) || 0)
	// 				acc.profitUsd = acc.profitUsd + (Number(item.profitUsd,) || 0)
	// 				acc.costValueUsd = acc.costValueUsd + (Number(item.costValueUsd,) || 0)
	// 				acc.profitPercentage = acc.profitPercentage + (Number(item.profitPercentage,) || 0)
	// 				acc.costValueFC = acc.costValueFC + (Number(item.costValueFC,) || 0)
	// 				acc.marketValueFC = acc.marketValueFC + (Number(item.marketValueFC,) || 0)
	// 				return acc
	// 			},
	// 			{
	// 				marketValueUsd:          0,
	// 				marketValueFC:          0,
	// 				profitUsd:        0,
	// 				costValueUsd:     0,
	// 				costValueFC:      0,
	// 				profitPercentage: 0,
	// 			},
	// 		),)
	// 	}
	// }, [tableData, filter.assetId,],)
	React.useEffect(() => {
		if (!tableData) {
			setTotals(undefined,)
			return
		}

		type BondLike = {
			id: string
			operation: AssetOperationType
			profitUsd: number
			profitPercentage: number
			costValueUsd: number
			marketValueUsd: number
			costValueFC: number
			marketValueFC: number
		}

		const allAssets: Array<BondLike> = tableData.list.flatMap((row,) => {
			if (Array.isArray(row.assets,) && row.assets.length) {
				return row.assets as Array<BondLike>
			}
			return [row as unknown as BondLike,]
		},)

		if (filter.assetId?.length) {
			let marketValueUsd = 0
			let marketValueFC = 0
			let profitUsd = 0
			let costValueUsd = 0
			let costValueFC = 0
			let profitPercentage = 0

			filter.assetId.forEach((assetId,) => {
				const currentAsset = allAssets.find((asset,) => {
					return asset.id === assetId
				},)
				if (!currentAsset) {
					return
				}

				const sign = currentAsset.operation === AssetOperationType.BUY ?
					1 :
					-1

				profitUsd = profitUsd + currentAsset.profitUsd
				profitPercentage = profitPercentage + currentAsset.profitPercentage
				costValueUsd = costValueUsd + sign * currentAsset.costValueUsd
				marketValueUsd = marketValueUsd + sign * currentAsset.marketValueUsd
				costValueFC = costValueFC + sign * currentAsset.costValueFC
				marketValueFC = marketValueFC + sign * currentAsset.marketValueFC
			},)

			setTotals({
				marketValueUsd,
				marketValueFC,
				profitUsd,
				costValueUsd,
				costValueFC,
				profitPercentage,
			},)
		} else {
			const totals = tableData.list.reduce(
				(acc, item,) => {
					acc.marketValueUsd = acc.marketValueUsd + item.marketValueUsd
					acc.profitUsd = acc.profitUsd + item.profitUsd
					acc.costValueUsd = acc.costValueUsd + item.costValueUsd
					acc.profitPercentage = acc.profitPercentage + item.profitPercentage
					acc.costValueFC = acc.costValueFC + item.costValueFC
					acc.marketValueFC = acc.marketValueFC + item.marketValueFC
					return acc
				},
				{
					marketValueUsd:   0,
					marketValueFC:    0,
					profitUsd:        0,
					costValueUsd:     0,
					costValueFC:      0,
					profitPercentage: 0,
				},
			)

			setTotals(totals,)
		}
	}, [tableData, filter.assetId,],)

	const handleTableClear = (): void => {
		setBankId(undefined,)
		setCurrency(undefined,)
		setAssetId(undefined,)
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

	const renderSortArrows = (type: TBondTableSortVariants,): React.ReactElement => {
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
					sortBy: TBondTableSortVariants.PROFIT_USD, sortOrder: SortOrder.DESC,
				},)
			}
		}

		return (
			<span
				className={styles.sortArrows(order === SortOrder.ASC,)}
				onClick={handleClick}
			>
				{isCurrent ?
					<ArrowDownUpFilled /> :
					<ArrowDownUp />}
			</span>
		)
	}

	const totalAssets = tableData?.list.reduce((acc, item,) => {
		return acc + (Array.isArray(item.assets,) ?
			item.assets.length :
			1)
	}, 0,)

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
						{isTableNamesShown &&
							<>
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
								</th>
							</>
						}
						<th className={cx(styles.headerCell, styles.cellWidth130,)}>
							<div className={styles.flex}>
								<p className={styles.tableTitle}>ISIN</p>
								{renderSortArrows(TBondTableSortVariants.ISIN,)}
							</div>
						</th>
						<th className={styles.headerCell}>
							<div className={styles.flex}>
								<p className={styles.tableTitle}>Security</p>
								{renderSortArrows(TBondTableSortVariants.SECURITY,)}
							</div>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth80,)}>
							<p className={styles.tableTitle}>Currency</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth80,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitleNumber}>Units</p>
								{renderSortArrows(TBondTableSortVariants.TOTAL_UNITS,)}
							</div>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth80,)}>
							<p className={styles.tableTitleNumber}>Cost price</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth100,)}>
							<p className={styles.tableTitleNumber}>Market price</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth120,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Cost value FC</p>
								{renderSortArrows(TBondTableSortVariants.COST_VALUE_FC,)}
							</div>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth130,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Cost value USD</p>
								{renderSortArrows(TBondTableSortVariants.COST_VALUE_USD,)}
							</div>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth130,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Market value FC</p>
								{renderSortArrows(TBondTableSortVariants.MARKET_VALUE_FC,)}
							</div>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth140,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Market value USD</p>
								{renderSortArrows(TBondTableSortVariants.MARKET_VALUE_USD,)}
							</div>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth120,)}>
							<div className={styles.flexNumber}>
								<div>
									<p className={styles.tableTitle}>Profit USD</p>
									<p className={styles.tableTitle}>w/ FX&A</p>
								</div>
								{renderSortArrows(TBondTableSortVariants.PROFIT_USD,)}
							</div>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth100,)}>
							<div className={styles.flexNumber}>
								<div>
									<p className={styles.tableTitle}>Profit %</p>
									<p className={styles.tableTitle}>w/o FX&A</p>
								</div>
								{renderSortArrows(TBondTableSortVariants.PROFIT_PERCENTAGE,)}
							</div>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth80,)}>
							<p className={styles.tableTitleNumber}>Yield</p>
						</th>
						{/* <th className={styles.headerCell}>
							<p className={styles.tableTitleNumber}>Current accrued</p>
						</th> */}

						<th className={styles.headerCell}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitleNumber}>Value date</p>
								{renderSortArrows(TBondTableSortVariants.VALUE_DATE,)}
							</div>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitleNumber}>Next coupon date</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitleNumber}>Maturity date</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>Issuer</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth100,)}>
							<p className={styles.tableTitle}>Sector</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth70,)}>
							<p className={styles.tableTitleNumber}>Coupon</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>Country</p>
						</th>
					</tr>
				</thead>
				{!tableIsFetching && Boolean(tableData?.list.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} inTable clearFunction={resetAnalyticsFilterStore}/>}
				{tableIsFetching ?
					<Loader
						radius={6}
						width={150}
						inTable
					/>	:
					<tbody ref={tbodyRef}>
						{/* {Boolean(mockupAssets?.length,) && mockupAssets?.map((asset,) => {
							return <TableMockupItem
								key={asset.id}
								mutatedAssetsIds={mutatedAssetsIds}
								asset={asset}
								isTableNamesShown={isTableNamesShown}
							/>
						},)} */}
						{tableData?.list.map((row,) => {
							return <TableItem
								key={row.id}
								handleRowClicked={handleRowClicked}
								row={row}
								refetchData={refetchData}
								handleOpenDeleteModal={handleOpenDeleteModal}
								isTableNamesShown={isTableNamesShown}
							/>
						},)}
					</tbody>
				}
				<tfoot className={styles.tableFooter(!isTbodyEmpty && !tableIsFetching && Boolean(tableData?.list.length,),)}>
					<tr>
						<th className={cx(styles.headerCell, styles.cellWidth44,)}></th>
						{isTableNamesShown && <><th className={cx(styles.headerCell, styles.cellWidth141,)}>
							<span className={styles.totalLabel}>
							Total: {totalAssets}
							</span>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth141,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth141,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth141,)}>
						</th></>}
						<th className={cx(styles.headerCell, styles.cellWidth130,)}>
							{!isTableNamesShown && <span className={styles.totalLabel}>
							Total: {totalAssets}
							</span>}
						</th>
						<th className={styles.headerCell}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth80,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth80,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth80,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth100,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth120,)}>
						</th>
						<th className={cx(styles.footerTotalCell, styles.cellWidth130,)}>
							<span className={styles.totalLabel}>
								{totals ?
									localeString(totals.costValueUsd, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth130,)}>
						</th>
						<th className={cx(styles.footerTotalCell, styles.cellWidth140,)}>
							<span className={styles.totalLabel}>
								{totals ?
									localeString(totals.marketValueUsd, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={cx(styles.footerTotalCell, styles.cellWidth120,)}>
							<span className={styles.totalLabel}>
								{totals ?
									localeString(totals.profitUsd, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth100,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth80,)}>
						</th>
						{/* <th className={styles.headerCell}>
						</th> */}
						<th className={styles.headerCell}>
						</th>
						<th className={styles.headerCell}>
						</th>
						<th className={styles.headerCell}>
						</th>
						<th className={styles.headerCell}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth100,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth70,)}>
						</th>
						<th className={styles.headerCell}>
						</th>
					</tr>
				</tfoot>
			</table>
			<div className={styles.tableBtnContainer(isHorizontalScroll,)}>
				<Button<ButtonType.ICON>
					onClick={handleTableClear}
					disabled={!filter.assetId}
					className={styles.clearBtn}
					additionalProps={{
						btnType:  ButtonType.ICON,
						icon:     <Rotate />,
						size:     Size.SMALL,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<SaveAsExcelButton
					sheetData={bondsSheetData}
					fileName={`bonds-${format(new Date(), 'dd.MM.yyyy',)}`}
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
					assetName={AssetNamesType.BONDS}
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
					assetName={AssetNamesType.BONDS}
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
