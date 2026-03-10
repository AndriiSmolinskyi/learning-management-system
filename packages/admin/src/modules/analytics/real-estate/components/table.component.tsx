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
	Loader,
	SaveAsExcelButton,
	Size,
} from '../../../../shared/components'
import {
	TableItem,
} from './table-item.component'
import {
	useRealEstateStore,
} from '../real-estate.store'
import {
	AssetNamesType,
	SortOrder,
} from '../../../../shared/types'
import {
	TRealEstateSortVariants,
} from '../real-estate.types'
import type {
	TRealEstateAssetAnalytics,
} from '../../../../services/analytics/analytics.types'
import {
	getRealEstateSheetData,
} from '../real-estate.utils'
import {
	localeString,
	toggleState,
} from '../../../../shared/utils'
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
	TransferConfirmationDialog, TransferSuccessModal,
} from '../../../clients/portfolios/portfolio-details/components/asset'

import * as styles from '../real-estate.styles'

type Props = {
	tableData?: Array<TRealEstateAssetAnalytics>
	refetchData: () => void
	tableIsFetching: boolean
	isFilterApplied?: boolean
}

export const RealEstateTable: React.FunctionComponent<Props> = ({
	tableData = [],
	refetchData,
	tableIsFetching,
	isFilterApplied,
},) => {
	const tableRef = React.useRef<HTMLTableElement>(null,)
	const tbodyRef = React.useRef<HTMLTableSectionElement>(null,)
	const [isHorizontalScroll, setIsHorizontalScroll,] = React.useState(false,)
	const [isTbodyEmpty, setIsTbodyEmpty,] = React.useState(true,)
	const realEstateSheetData = getRealEstateSheetData(tableData,)
	const [isDeleteModalShowed, setIsDeleteModalShown,] = React.useState(false,)
	const [deleteAssetId, setDeleteAssetId,] = React.useState<string | undefined>(undefined,)
	const [totals, setTotals,] = React.useState<{costValueUsd: number; marketValueUsd: number; profitUsd: number; profitPercentage: number} | undefined>()
	const [isTransferSuccess, setIsTransferSuccess,] = React.useState(false,)
	const [isTableNamesShown, setIsTableNamesShown,] = React.useState(false,)

	const toggleDeleteDialog = toggleState(setIsDeleteModalShown,)
	const handleOpenDeleteModal = (assetId: string,): void => {
		setDeleteAssetId(assetId,)
		toggleDeleteDialog()
	}
	const {
		filter,
		setCity,
		setCurrency,
		setAssetIds,
		sortFilter,
		setSortFilters,
	} = useRealEstateStore()
	const {
		resetAnalyticsFilterStore,
		setAssetTransferProps,
		assetTransferProps,
	} = useAnalyticsFilterStore()

	const handleTableClear = (): void => {
		setCity(undefined,)
		setCurrency(undefined,)
		setAssetIds(undefined,)
	}
	const handleTransferSuccess = (isSuccess: boolean,): void => {
		setIsTransferSuccess(isSuccess,)
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
		return () => {
			window.removeEventListener('resize', handleResize,)
		}
	}, [tableData,],)

	React.useEffect(() => {
		if (filter.assetIds?.length) {
			let costValueUsd = 0
			let marketValueUsd = 0
			let profitUsd = 0
			let profitPercentage = 0
			filter.assetIds.forEach((assetId,) => {
				const currentAsset = tableData.find((asset,) => {
					return asset.id === assetId
				},)
				if (currentAsset) {
					costValueUsd = costValueUsd + currentAsset.usdValue
					marketValueUsd = marketValueUsd + currentAsset.marketUsdValue
					profitUsd = profitUsd + currentAsset.profitUsd
					profitPercentage = profitPercentage + currentAsset.profitPercentage
				}
			},)
			setTotals({
				costValueUsd,
				marketValueUsd,
				profitUsd,
				profitPercentage,
			},)
		} else {
			setTotals(tableData.reduce(
				(acc, item,) => {
					acc.costValueUsd = acc.costValueUsd + (Number(item.usdValue,) || 0)
					acc.marketValueUsd = acc.marketValueUsd + (Number(item.marketUsdValue,) || 0)
					acc.profitUsd = acc.profitUsd + (Number(item.profitUsd,) || 0)
					acc.profitPercentage = acc.profitPercentage + (Number(item.profitPercentage,) || 0)
					return acc
				},
				{
					costValueUsd:     0,
					marketValueUsd:   0,
					profitUsd:        0,
					profitPercentage: 0,
				},
			),)
		}
	}, [tableData, filter.assetIds,],)

	const renderSortArrows = (type: TRealEstateSortVariants,): React.ReactElement => {
		return (
			<>
				{sortFilter.sortBy !== type && (
					<span
						className={styles.sortArrows()}
						onClick={() => {
							setSortFilters({
								sortBy:    type,
								sortOrder: SortOrder.DESC,
							},)
						}}
					>
						<ArrowDownUp />
					</span>
				)}

				{sortFilter.sortBy === type && sortFilter.sortOrder === SortOrder.DESC && (
					<span
						className={styles.sortArrows()}
						onClick={() => {
							setSortFilters({
								sortBy:    type,
								sortOrder: SortOrder.ASC,
							},)
						}}
					>
						<ArrowDownUpFilled />
					</span>
				)}

				{sortFilter.sortBy === type && sortFilter.sortOrder === SortOrder.ASC && (
					<span
						className={styles.sortArrows(true,)}
						onClick={() => {
							setSortFilters({
								sortBy:    TRealEstateSortVariants.DATE,
								sortOrder: SortOrder.DESC,
							},)
						}}
					>
						<ArrowDownUpFilled />
					</span>
				)}
			</>
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
			<table ref={tableRef} className={styles.tableContainer(!isTbodyEmpty && !tableIsFetching && Boolean(tableData.length,),)}>
				<thead>
					<tr>
						<th className={cx(styles.headerCell, styles.cellWidth44, styles.chevronContainer,)}><ChevronRight className={styles.chevronIcon(isTableNamesShown,)} onClick={handleTableFold}/></th>
						{isTableNamesShown && <><th className={styles.headerCell}>
							<p className={styles.tableTitle}>Portfolio</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>Entity</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>Bank</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>Account</p>
						</th></>}
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>Country</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>City</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>Project transaction</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>Operation</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth72,)}>
							<p className={styles.tableTitle}>Currency</p>
						</th>
						<th className={cx(styles.headerCellSortRight, styles.cellWidth160,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Value in currency</p>
								{renderSortArrows(TRealEstateSortVariants.CURRENCY_VALUE,)}
							</div>
						</th>
						<th className={cx(styles.headerCellSortRight, styles.cellWidth150,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Cost Value USD</p>
								{renderSortArrows(TRealEstateSortVariants.COST_VALUE_USD,)}
							</div>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth150,)}>
							<p className={styles.tableTitleNumber}>Market Value in FC</p>
						</th>
						<th className={cx(styles.headerCellSortRight, styles.cellWidth160,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Market Value USD</p>
								{renderSortArrows(TRealEstateSortVariants.MARKET_VALUE_USD,)}
							</div>
						</th>
						<th className={styles.headerCellSortRight}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Profit USD</p>
								{renderSortArrows(TRealEstateSortVariants.PROFIT_USD,)}
							</div>
						</th>
						<th className={styles.headerCellSortRight}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Profit %</p>
								{renderSortArrows(TRealEstateSortVariants.PROFIT_PER,)}
							</div>
						</th>
						<th className={cx(styles.headerCellSortRight, styles.cellWidth100,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Value date</p>
								{renderSortArrows(TRealEstateSortVariants.DATE,)}
							</div>
						</th>
					</tr>
				</thead>
				{!tableIsFetching && Boolean(tableData.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} inTable clearFunction={resetAnalyticsFilterStore}/>}
				{tableIsFetching ?
					<Loader
						radius={6}
						width={150}
						inTable
					/> :
					<tbody ref={tbodyRef}>
						{tableData.map((row,) => {
							return <TableItem
								key={row.id}
								row={row}
								refetchData={refetchData}
								handleOpenDeleteModal={handleOpenDeleteModal}
								isTableNamesShown={isTableNamesShown}
							/>
						},)}
					</tbody>
				}
				<tfoot className={styles.tableFooter(!isTbodyEmpty && !tableIsFetching && Boolean(tableData.length,),)}>
					<tr>
						<th className={cx(styles.headerCell, styles.cellWidth44,)}></th>
						{isTableNamesShown && <><th className={styles.headerCell}>
							<span className={styles.totalLabel}>
								Total: {tableData.length}
							</span>
						</th>
						<th className={styles.headerCell}>
						</th>
						<th className={styles.headerCell}>
						</th>
						<th className={styles.headerCell}>
						</th></>}
						<th className={styles.headerCell}>
							{!isTableNamesShown && <span className={styles.totalLabel}>
								Total: {tableData.length}
							</span>}
						</th>
						<th className={styles.headerCell}>
						</th>
						<th className={styles.headerCell}>
						</th>
						<th className={styles.headerCell}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth72,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth160,)}>
						</th>
						<th className={styles.footerTotalCell}>
							<span className={styles.totalLabel}>
								{totals ?
									localeString(totals.costValueUsd, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth150,)}>
						</th>
						<th className={cx(styles.footerTotalCell, styles.cellWidth160,)}>
							<span className={styles.totalLabel}>
								{totals ?
									localeString(totals.marketValueUsd, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={cx(styles.footerTotalCell, styles.cellWidth130,)}>
							<span className={styles.totalLabel}>
								{totals ?
									localeString(totals.profitUsd, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={styles.headerCell}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth100,)}>
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
					sheetData={realEstateSheetData}
					fileName='real-estate-table-data'
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
					assetName={AssetNamesType.REAL_ESTATE}
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
					assetName={AssetNamesType.REAL_ESTATE}
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
		</div>
	)
}