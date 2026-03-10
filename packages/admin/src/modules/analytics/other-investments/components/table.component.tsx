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
	localeString,
	toggleState,
} from '../../../../shared/utils'
import {
	TableItem,
} from './table-item.component'
import {
	useOtherInvestmentsStore,
} from '../other-investments.store'
import {
	AssetNamesType,
	SortOrder,
} from '../../../../shared/types'
import {
	TOtherInvestmentsTableSortVariants,
} from '../other-investments.types'
import type {
	IOtherInvestmentsByFilter,
} from '../../../../services/analytics/analytics.types'
import {
	getOtherInvestmentsSheetData,
} from '../other-investments.utils'
import {
	DeleteAssetModal,
} from '../../components/delete-asset-modal/delete-asset-modal.component'
import {
	useAnalyticsFilterStore,
} from '../../analytics-store'
import {
	useGetFilterApplied,
} from '../../layout/components/analytics-filter/analytics-filter.util'
import {
	EmptyAnalyticsResponse,
} from '../../../../shared/components/empty-analytics-response/empty-analytics-response.component'
import {
	TransferConfirmationDialog, TransferSuccessModal,
} from '../../../clients/portfolios/portfolio-details/components/asset'

import * as styles from '../other-investments.styles'

type Props = {
	tableData?: IOtherInvestmentsByFilter
	refetchData: () => void
	tableIsFetching: boolean
}

export const OtherInvestmentsTable: React.FunctionComponent<Props> = ({
	tableData,
	refetchData,
	tableIsFetching,
},) => {
	const tableRef = React.useRef<HTMLTableElement>(null,)
	const tbodyRef = React.useRef<HTMLTableSectionElement>(null,)
	const [isHorizontalScroll, setIsHorizontalScroll,] = React.useState(false,)
	const [isTbodyEmpty, setIsTbodyEmpty,] = React.useState(true,)
	const [totals, setTotals,] = React.useState<{valueUsd: number; marketValueUsd: number; profitUsd: number; profitPercentage: number} | undefined>()
	const [isDeleteModalShowed, setIsDeleteModalShown,] = React.useState(false,)
	const [deleteAssetId, setDeleteAssetId,] = React.useState<string | undefined>(undefined,)
	const [isTransferSuccess, setIsTransferSuccess,] = React.useState(false,)
	const [isTableNamesShown, setIsTableNamesShown,] = React.useState(false,)

	const toggleDeleteDialog = toggleState(setIsDeleteModalShown,)
	const handleOpenDeleteModal = (assetId: string,): void => {
		setDeleteAssetId(assetId,)
		toggleDeleteDialog()
	}
	const otherInvestmentsSheetData = getOtherInvestmentsSheetData(tableData?.list ?? [],)
	const {
		filter,
		sortFilter,
		setBankId,
		setCurrency,
		setAssetIds,
		setSortFilters,
	} = useOtherInvestmentsStore()
	const isFilterApplied = useGetFilterApplied()
	const {
		resetAnalyticsFilterStore,
		setAssetTransferProps,
		assetTransferProps,
	} = useAnalyticsFilterStore()
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
			let valueUsd = 0
			let marketValueUsd = 0
			let profitUsd = 0
			let profitPercentage = 0
			filter.assetIds.forEach((assetId,) => {
				const currentAsset = tableData?.list.find((asset,) => {
					return asset.id === assetId
				},)
				if (currentAsset) {
					valueUsd = valueUsd + (currentAsset.usdValue ?? 0)
					marketValueUsd = marketValueUsd + (currentAsset.marketValueUsd ?? 0)
					profitUsd = profitUsd + currentAsset.profitUsd
					profitPercentage = profitPercentage + currentAsset.percent
				}
			},)
			setTotals({
				valueUsd,
				marketValueUsd,
				profitUsd,
				profitPercentage,
			},)
		} else {
			setTotals(tableData?.list.reduce(
				(acc, item,) => {
					acc.valueUsd = acc.valueUsd + (Number(item.usdValue,) || 0)
					acc.marketValueUsd = acc.marketValueUsd + (Number(item.marketValueUsd,) || 0)
					acc.profitUsd = acc.profitUsd + (Number(item.profitUsd,) || 0)
					acc.profitPercentage = acc.profitPercentage + (Number(item.percent,) || 0)
					return acc
				},
				{
					valueUsd:         0,
					marketValueUsd:   0,
					profitUsd:        0,
					profitPercentage: 0,
				},
			),)
		}
	}, [tableData, filter.assetIds,],)

	const handleTableClear = (): void => {
		setBankId(undefined,)
		setCurrency(undefined,)
		setAssetIds(undefined,)
	}
	const renderSortArrows = (type: TOtherInvestmentsTableSortVariants,): React.ReactElement => {
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
					sortBy: TOtherInvestmentsTableSortVariants.INVESTMENT_DATE, sortOrder: SortOrder.DESC,
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
							<p className={styles.tableTitle}>Asset name</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>Service provider</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth72,)}>
							<p className={styles.tableTitle}>Currency</p>
						</th>
						<th className={cx(styles.headerCellSortRight, styles.cellWidth160,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Value in currency</p>
								{renderSortArrows(TOtherInvestmentsTableSortVariants.CURRENCY_VALUE,)}
							</div>
						</th>
						<th className={styles.headerCellSortRight}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Cost Value USD</p>
								{renderSortArrows(TOtherInvestmentsTableSortVariants.USD_VALUE,)}
							</div>
						</th>
						<th className={cx(styles.headerCellSortRight, styles.cellWidth160,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Market Value USD</p>
								{renderSortArrows(TOtherInvestmentsTableSortVariants.MARKET_VALUE_USD,)}
							</div>
						</th>
						<th className={styles.headerCellSortRight}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Profit USD</p>
								{renderSortArrows(TOtherInvestmentsTableSortVariants.PROFIT_USD,)}
							</div>
						</th>
						<th className={styles.headerCellSortRight}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Profit %</p>
								{renderSortArrows(TOtherInvestmentsTableSortVariants.PROFIT_PER,)}
							</div>
						</th>
						<th className={styles.headerCellSortRight}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Value date</p>
								{renderSortArrows(TOtherInvestmentsTableSortVariants.INVESTMENT_DATE,)}
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
								row={row}
								refetchData={refetchData}
								handleOpenDeleteModal={handleOpenDeleteModal}
								isTableNamesShown={isTableNamesShown
								}/>
						},)}
					</tbody>
				}
				<tfoot className={styles.tableFooter(!isTbodyEmpty && !tableIsFetching && Boolean(tableData?.list.length,),)}>
					<tr>
						<th className={cx(styles.headerCell, styles.cellWidth44,)}></th>
						{isTableNamesShown && <><th className={styles.headerCell}>
							<span className={styles.totalLabel}>
								Total: {tableData ?
									tableData.list.length :
									0}
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
								Total: {tableData ?
									tableData.list.length :
									0}
							</span>}
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
									localeString(totals.valueUsd, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={cx(styles.footerTotalCell, styles.cellWidth160,)}>
							<span className={styles.totalLabel}>
								{totals ?
									localeString(totals.marketValueUsd, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={styles.footerTotalCell}>
							<span className={styles.totalLabel}>
								{totals ?
									localeString(totals.profitUsd, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={styles.headerCell}>
						</th>
						<th className={styles.headerCell}>
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
					sheetData={otherInvestmentsSheetData}
					fileName='other-investments-table-data'
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
					assetName={AssetNamesType.OTHER}
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
					assetName={AssetNamesType.OTHER}
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
