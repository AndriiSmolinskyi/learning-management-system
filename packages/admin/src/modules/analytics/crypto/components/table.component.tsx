/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable max-lines */
/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	ArrowDownUp, ArrowDownUpFilled, ChevronRight, Rotate,
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
	localeString, toggleState,
} from '../../../../shared/utils'
import {
	TableItem,
} from './table-item.component'
import {
	useCryptoStore,
} from '../crypto.store'
import {
	AssetNamesType,
	AssetOperationType,
	CryptoType,
	SortOrder,
} from '../../../../shared/types'
import {
	TCryptoTableSortVariants,
} from '../crypto.types'
import type {
	ICryptoByFilters,
} from '../../../../services/analytics/analytics.types'
import {
	getCryptoSheetData,
} from '../crypto.utils'
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
	TransferConfirmationDialog,
	TransferSuccessModal,
} from '../../../clients/portfolios/portfolio-details/components/asset'

import * as styles from '../crypto.styles'
import {
	useAnalyticsLayoutStore,
} from '../../layout/analytics-layout.store'
import {
	useGetRefactoredAssetById,
} from '../../../../shared/hooks'
import {
	AssetDrawer,
} from '../../../clients/portfolios/portfolio-details/components/sub-items-list/asset-drawer.component'

type Props = {
	tableData?: ICryptoByFilters
	refetchData: () => void
	tableIsFetching: boolean
	isFilterApplied?: boolean
}

export const CryptoTable: React.FunctionComponent<Props> = ({
	tableData,
	refetchData,
	tableIsFetching,
	isFilterApplied,
},) => {
	const tableRef = React.useRef<HTMLTableElement>(null,)
	const tbodyRef = React.useRef<HTMLTableSectionElement>(null,)
	const [isHorizontalScroll, setIsHorizontalScroll,] = React.useState(false,)
	const [isTbodyEmpty, setIsTbodyEmpty,] = React.useState(true,)
	const [totals, setTotals,] = React.useState<{ costValueUsd: number; marketValueUsd: number; profitUsd: number; profitPercentage: number } | undefined>()
	const [isDeleteModalShowed, setIsDeleteModalShown,] = React.useState(false,)
	const [isTransferSuccess, setIsTransferSuccess,] = React.useState(false,)
	const [deleteAssetId, setDeleteAssetId,] = React.useState<string | undefined>(undefined,)
	const [isTableNamesShown, setIsTableNamesShown,] = React.useState(false,)

	const toggleDeleteDialog = toggleState(setIsDeleteModalShown,)
	const handleOpenDeleteModal = (assetId: string,): void => {
		setDeleteAssetId(assetId,)
		toggleDeleteDialog()
	}
	const cryptoSheetData = getCryptoSheetData(tableData?.list ?? [],)
	const {
		resetAnalyticsFilterStore,
		analyticsFilter,
	} = useAnalyticsFilterStore()
	const {
		sortFilter,
		setSortFilters,
		filter,
		setCryptoWallets,
		setCurrency,
		setAssetId,
		setProductDirectHold,
		setProductETF,
		productType,
		setProductFilterDirectHold,
		setProductFilterETF,
	} = useCryptoStore()
	const checkTbodyHeight = (): void => {
		if (tbodyRef.current && tableRef.current) {
			const tbodyHeight = tbodyRef.current.offsetHeight
			const tableHeight = tableRef.current.offsetHeight
			setIsTbodyEmpty((tableHeight - tbodyHeight - 44 - 46) > 0,)
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
	}, [tableData,],)

	const isCryptoFilterApplied = analyticsFilter.clientIds?.length ||
		analyticsFilter.portfolioIds?.length ||
		analyticsFilter.entitiesIds?.length ||
		analyticsFilter.bankIds?.length ||
		analyticsFilter.accountIds?.length
	React.useEffect(() => {
		if (isCryptoFilterApplied) {
			return
		}
		const shouldShowEtfColumns = tableData?.list.some((item,) => {
			return item.productType === CryptoType.ETF
		},) ?? false

		const shouldShowDirectColumns = tableData?.list.some((item,) => {
			return item.productType === CryptoType.DIRECT_HOLD
		},) ?? false
		setProductFilterDirectHold(shouldShowDirectColumns,)
		setProductFilterETF(shouldShowEtfColumns,)
	}, [tableData?.list,filter,],)
	React.useEffect(() => {
		const shouldShowEtfColumns = tableData?.list.some((item,) => {
			return item.productType === CryptoType.ETF
		},) ?? false
		const shouldShowDirectColumns = tableData?.list.some((item,) => {
			return item.productType === CryptoType.DIRECT_HOLD
		},) ?? false
		setProductDirectHold(shouldShowDirectColumns,)
		setProductETF(shouldShowEtfColumns,)
	}, [tableData?.list,filter,],)

	const {
		setAssetTransferProps,
		assetTransferProps,
	} = useAnalyticsFilterStore()
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
	const handleTransferSuccess = (isSuccess: boolean,): void => {
		setIsTransferSuccess(isSuccess,)
	}
	const {
		data,
	} = useGetRefactoredAssetById({
		id: storeAssetCurrentId ?? '', assetName: AssetNamesType.CRYPTO,
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
	// todo: clear if new good
	// React.useEffect(() => {
	// 	if (filter.assetId?.length) {
	// 		let costValueUsd = 0
	// 		let marketValueUsd = 0
	// 		let profitUsd = 0
	// 		let profitPercentage = 0
	// 		filter.assetId.forEach((assetId,) => {
	// 			const allAssets = tableData?.list.flatMap((account,) => {
	// 				return account.assets
	// 			},) ?? []
	// 			const currentAsset = allAssets.find((asset,) => {
	// 				return asset?.id === assetId
	// 			},)
	// 			if (currentAsset) {
	// 				costValueUsd = costValueUsd + currentAsset.costValueUsd
	// 				marketValueUsd = marketValueUsd + currentAsset.marketValueUsd
	// 				profitUsd = profitUsd + currentAsset.profitUsd
	// 				profitPercentage = profitPercentage + currentAsset.profitPercentage
	// 			}
	// 		},)
	// 		setTotals({
	// 			costValueUsd,
	// 			marketValueUsd,
	// 			profitUsd,
	// 			profitPercentage,
	// 		},)
	// 	} else {
	// 		setTotals(tableData?.list.reduce(
	// 			(acc, item,) => {
	// 				acc.costValueUsd = acc.costValueUsd + (Number(item.costValueUsd,) || 0)
	// 				acc.marketValueUsd = acc.marketValueUsd + (Number(item.marketValueUsd,) || 0)
	// 				acc.profitUsd = acc.profitUsd + (Number(item.profitUsd,) || 0)
	// 				acc.profitPercentage = acc.profitPercentage + (Number(item.profitPercentage,) || 0)
	// 				return acc
	// 			},
	// 			{
	// 				costValueUsd:     0,
	// 				marketValueUsd:   0,
	// 				profitUsd:        0,
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

		type AssetLike = {
			id: string
			costValueUsd: number
			marketValueUsd: number
			profitUsd: number
			profitPercentage: number
			operation: AssetOperationType
			productType: CryptoType
		}

		const allAssets: Array<AssetLike> = tableData.list.flatMap((row,) => {
			if (Array.isArray(row.assets,) && row.assets.length) {
				return row.assets as Array<AssetLike>
			}
			return [row as unknown as AssetLike,]
		},)

		if (filter.assetId?.length) {
			let costValueUsd = 0
			let marketValueUsd = 0
			let profitUsd = 0
			let profitPercentage = 0

			filter.assetId.forEach((assetId,) => {
				const currentAsset = allAssets.find((asset,) => {
					return asset.id === assetId
				},)
				if (!currentAsset) {
					return
				}
				const sign = currentAsset.productType === CryptoType.ETF ?
					currentAsset.operation === AssetOperationType.BUY ?
						1 :
						-1 :
					1
				costValueUsd = costValueUsd + (currentAsset.costValueUsd * sign)
				marketValueUsd = marketValueUsd + (currentAsset.marketValueUsd * sign)
				profitUsd = profitUsd + currentAsset.profitUsd
				profitPercentage = profitPercentage + currentAsset.profitPercentage
			},)

			setTotals({
				costValueUsd,
				marketValueUsd,
				profitUsd,
				profitPercentage,
			},)
		} else {
			const totals = tableData.list.reduce(
				(acc, item,) => {
					acc.costValueUsd = acc.costValueUsd + Number(item.costValueUsd,)
					acc.marketValueUsd = acc.marketValueUsd + Number(item.marketValueUsd,)
					acc.profitUsd = acc.profitUsd + Number(item.profitUsd,)
					acc.profitPercentage = acc.profitPercentage + Number(item.profitPercentage,)
					return acc
				},
				{
					costValueUsd:     0,
					marketValueUsd:   0,
					profitUsd:        0,
					profitPercentage: 0,
				},
			)

			setTotals(totals,)
		}
	}, [tableData, filter.assetId,],)

	const handleTableClear = (): void => {
		setCryptoWallets(undefined,)
		setCurrency(undefined,)
		setAssetId(undefined,)
	}
	const renderSortArrows = (type: TCryptoTableSortVariants,): React.ReactElement => {
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
					sortBy: TCryptoTableSortVariants.CRYPTO_AMOUNT, sortOrder: SortOrder.DESC,
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
						<th className={cx(styles.headerCell, styles.cellWidth125,)}>
							<p className={styles.tableTitle}>Portfolio</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth125,)}>
							<p className={styles.tableTitle}>Entity</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth110,)}>
							<p className={styles.tableTitle}>Bank</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth110,)}>
							<p className={styles.tableTitle}>Account</p>
						</th></>}
						{productType.isETF && (
							<th className={cx(styles.headerCell, styles.cellWidth120,)}>
								<p className={styles.tableTitle}>Issuer</p>
							</th>
						)}
						{productType.isETF && (
							<th className={cx(styles.headerCell, styles.cellWidth135,)}>
								<p className={styles.tableTitle}>ISIN</p>
							</th>
						)}
						{productType.isETF && (
							<th className={cx(styles.headerCell, styles.cellWidth72,)}>
								<p className={styles.tableTitle}>Security</p>
							</th>
						)}
						{productType.isDirectHold && (
							<th className={cx(styles.headerCell, styles.cellWidth110,)}>
								<p className={styles.tableTitle}>Crypto</p>
							</th>
						)}
						{productType.isETF && (
							<th className={cx(styles.headerCell, styles.cellWidth80,)}>
								<p className={styles.tableTitle}>Currency</p>
							</th>
						)}
						<th className={cx(styles.headerCellSortRight, styles.cellWidth80,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Units</p>
								{renderSortArrows(TCryptoTableSortVariants.UNITS,)}
							</div>
						</th>
						<th className={cx(styles.headerCellSortRight, styles.cellWidth110,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Cost price</p>
								{renderSortArrows(TCryptoTableSortVariants.COST_PRICE,)}
							</div>
						</th>
						<th className={cx(styles.headerCellSortRight, styles.cellWidth115,)}>
							<div className={styles.flexNumber}>
								<div>
									<p className={styles.tableTitle}>Current</p>
									<p className={styles.tableTitle}>price</p>
								</div>
								{renderSortArrows(TCryptoTableSortVariants.CURRENT_STOCK_PRICE,)}
							</div>
						</th>
						<th className={styles.headerCellSortRight}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Cost value USD</p>
								{renderSortArrows(TCryptoTableSortVariants.COST_VALUE_USD,)}
							</div>
						</th>
						<th className={styles.headerCellSortRight}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Market value USD</p>
								{renderSortArrows(TCryptoTableSortVariants.MARKET_VALUE_USD,)}
							</div>
						</th>
						<th className={cx(styles.headerCellSortRight, styles.cellWidth140,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Profit USD</p>
								{renderSortArrows(TCryptoTableSortVariants.PROFIT_USD,)}
							</div>
						</th>
						<th className={cx(styles.headerCellSortRight, styles.cellWidth110,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Profit %</p>
								{renderSortArrows(TCryptoTableSortVariants.PROFIT_PER,)}
							</div>
						</th>
						{productType.isETF && (
							<th className={cx(styles.headerCell, styles.cellWidth100,)}>
								<p className={styles.tableTitle}>Country</p>
							</th>
						)}
						{productType.isDirectHold && (
							<th className={styles.headerCell}>
								<p className={styles.tableTitle}>Wallet/Exchange</p>
							</th>
						)}
						<th className={cx(styles.headerCellSortRight, styles.cellWidth115,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Value Date</p>
								{renderSortArrows(TCryptoTableSortVariants.VALUE_DATE,)}
							</div>
						</th>
						<th className={cx(styles.footerCell, styles.cellWidth60,)}>
						</th>
					</tr>
				</thead>
				{!tableIsFetching && Boolean(tableData?.list.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} inTable clearFunction={resetAnalyticsFilterStore} />}
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
								row={row}
								refetchData={refetchData}
								handleOpenDeleteModal={handleOpenDeleteModal}
								shouldShowEtfColumns={productType.isETF}
								shouldShowDirectColumns={productType.isDirectHold}
								isTableNamesShown={isTableNamesShown}
							/>
						},)}
					</tbody>}
				<tfoot className={styles.tableFooter(!isTbodyEmpty && !tableIsFetching && Boolean(tableData?.list.length,),)}>
					<tr>
						<th className={cx(styles.footerCell, styles.cellWidth44,)}>
						</th>
						{isTableNamesShown && <><th className={cx(styles.footerCell,styles.cellWidth110, styles.noPadding,)}>
							<span className={styles.totalLabel}>
								Total: {tableData ?
									tableData.list.length :
									0}
							</span>
						</th>
						<th className={cx(styles.footerCell,styles.cellWidth125,)}>
						</th>
						<th className={cx(styles.footerCell,styles.cellWidth125,)}>
						</th>
						<th className={cx(styles.footerCell,styles.cellWidth110,)}>
						</th>
						<th className={cx(styles.footerCell,styles.cellWidth110,)}>
						</th></>}
						{productType.isETF && (
							<th className={cx(styles.footerCell,styles.cellWidth120, styles.noPadding,)}>
								{!isTableNamesShown && <span className={styles.totalLabel}>
								Total: {tableData ?
										tableData.list.length :
										0}
								</span>}
							</th>
						)}
						{productType.isETF && (
							<th className={cx(styles.footerCell,styles.cellWidth135,)}>
							</th>
						)}
						{productType.isETF && (
							<th className={cx(styles.footerCell, styles.cellWidth72,)}>
							</th>
						)}
						{productType.isDirectHold && (
							<th className={cx(styles.footerCell, styles.cellWidth110, styles.noPadding,)}>
								{!isTableNamesShown && (!productType.isETF) && <span className={styles.totalLabel}>
								Total: {tableData ?
										tableData.list.length :
										0}
								</span>}
							</th>
						)}
						{productType.isETF && (
							<th className={cx(styles.footerCell, styles.cellWidth80,)}>
							</th>
						)}
						<th className={cx(styles.footerCell, styles.cellWidth80,)}>
						</th>
						<th className={cx(styles.footerCell, styles.cellWidth110,)}>
						</th>
						<th className={cx(styles.footerCell, styles.cellWidth115,)}>
						</th>
						<th className={styles.footerTotalCell}>
							<span className={styles.totalLabel}>
								{totals ?
									localeString(totals.costValueUsd, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={styles.footerTotalCell}>
							<span className={styles.totalLabel}>
								{totals ?
									localeString(totals.marketValueUsd, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={cx(styles.footerTotalCell, styles.cellWidth140,)}>
							<span className={styles.totalLabel}>
								{totals ?
									localeString(totals.profitUsd, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={cx(styles.footerCell, styles.cellWidth110,)}>
						</th>
						{productType.isETF && (
							<th className={cx(styles.footerCell, styles.cellWidth100,)}>
							</th>
						)}
						{productType.isDirectHold && (
							<th className={styles.footerCell}>
							</th>
						)}
						<th className={cx(styles.footerCell, styles.cellWidth115,)}>
						</th>
						<th className={cx(styles.footerCell, styles.cellWidth60,)}>
						</th>
					</tr>
				</tfoot>
			</table>
			<div className={styles.tableBtnContainer(isHorizontalScroll, Boolean(tableData?.list.length === 0,),)}>
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
					sheetData={cryptoSheetData}
					fileName='crypto-table-data'
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
					assetName={AssetNamesType.CRYPTO}
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
					assetName={AssetNamesType.CRYPTO}
				/>}
			</Dialog>
			<Dialog
				open={isTransferSuccess}
				onClose={() => {
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
				}} />
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
					assetName={AssetNamesType.CRYPTO}
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
				}} />
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