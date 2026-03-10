/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	ArrowDownUpFilled,
	Rotate,
	ArrowDownUp,
	ChevronRight,
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
	usePrivateEquityStore,
} from '../private-equity.store'
import {
	AssetNamesType,
	SortOrder,
} from '../../../../shared/types'
import {
	TPrivateEquityTableSortVariants,
} from '../private-equity.types'
import type {
	IPrivateEquityByFilter,
} from '../../../../services/analytics/analytics.types'
import {
	getPrivateEquitySheetData,
} from '../private-equity.utils'
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
	TransferConfirmationDialog, TransferSuccessModal,
} from '../../../clients/portfolios/portfolio-details/components/asset'

import * as styles from '../private-equity.styles'

type Props = {
	tableData?: IPrivateEquityByFilter
	refetchData: () => void
	tableIsFetching: boolean
	isFilterApplied?: boolean
}

export const PrivateEquityTable: React.FunctionComponent<Props> = ({
	tableData,
	refetchData,
	tableIsFetching,
	isFilterApplied,
},) => {
	const tableRef = React.useRef<HTMLTableElement>(null,)
	const tbodyRef = React.useRef<HTMLTableSectionElement>(null,)
	const [isHorizontalScroll, setIsHorizontalScroll,] = React.useState(false,)
	const [isTbodyEmpty, setIsTbodyEmpty,] = React.useState(true,)
	const [totals, setTotals,] = React.useState<{capitalCalled: number; totalCommitment: number; valueUsd: number; profitPercentage: number} | undefined>()
	const [isDeleteModalShowed, setIsDeleteModalShown,] = React.useState(false,)
	const [deleteAssetId, setDeleteAssetId,] = React.useState<string | undefined>(undefined,)
	const [isTransferSuccess, setIsTransferSuccess,] = React.useState(false,)
	const [isTableNamesShown, setIsTableNamesShown,] = React.useState(false,)

	const toggleDeleteDialog = toggleState(setIsDeleteModalShown,)
	const handleOpenDeleteModal = (assetId: string,): void => {
		setDeleteAssetId(assetId,)
		toggleDeleteDialog()
	}
	const privateEquitySheetData = getPrivateEquitySheetData(tableData?.list ?? [],)
	const {
		filter,
		sortFilter,
		setBankId,
		setCurrency,
		setAssetId,
		setSortFilters,
	} = usePrivateEquityStore()
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
		if (filter.assetId?.length) {
			let capitalCalled = 0
			let totalCommitment = 0
			let valueUsd = 0
			let profitPercentage = 0
			filter.assetId.forEach((assetId,) => {
				const currentAsset = tableData?.list.find((asset,) => {
					return asset.assetId === assetId
				},)
				if (currentAsset) {
					capitalCalled = capitalCalled + Number(currentAsset.capitalCalled,)
					totalCommitment = totalCommitment + Number(currentAsset.totalCommitment,)
					valueUsd = valueUsd + Number(currentAsset.usdValue,)
					profitPercentage = profitPercentage + Number(currentAsset.pl,)
				}
			},)
			setTotals({
				capitalCalled,
				totalCommitment,
				valueUsd,
				profitPercentage,
			},)
		} else {
			setTotals(tableData?.list.reduce(
				(acc, item,) => {
					acc.capitalCalled = acc.capitalCalled + (Number(item.capitalCalled,) || 0)
					acc.totalCommitment = acc.totalCommitment + (Number(item.totalCommitment,) || 0)
					acc.valueUsd = acc.valueUsd + (Number(item.usdValue,) || 0)
					acc.profitPercentage = acc.profitPercentage + (Number(item.pl,) || 0)
					return acc
				},
				{
					capitalCalled:     0,
					totalCommitment:  0,
					valueUsd:         0,
					profitPercentage: 0,
				},
			),)
		}
	}, [tableData, filter.assetId,],)

	const handleTableClear = (): void => {
		setBankId(undefined,)
		setCurrency(undefined,)
		setAssetId(undefined,)
	}
	const renderSortArrows = (type: TPrivateEquityTableSortVariants,): React.ReactElement => {
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
					sortBy: TPrivateEquityTableSortVariants.ENTRY_DATE, sortOrder: SortOrder.DESC,
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
							<p className={styles.tableTitle}>PE type</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>Status</p>
						</th>
						<th className={styles.headerCell}>
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
						<th className={cx(styles.headerCell, styles.cellWidth90,)}>
							<p className={styles.tableTitle}>Name</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth70,)}>
							<p className={styles.tableTitleNumber}>Number</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth70,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth72,)}>
							<p className={styles.tableTitle}>Currency</p>
						</th>
						<th className={styles.headerCellSortRight}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Called capital</p>
								{renderSortArrows(TPrivateEquityTableSortVariants.CALLED_CAPITAL,)}
							</div>
						</th>
						<th className={styles.headerCellSortRight}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Total commitment</p>
								{renderSortArrows(TPrivateEquityTableSortVariants.TOTAL_COMMITMENT,)}
							</div>
						</th>
						<th className={styles.headerCellSortRight}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Value USD</p>
								{renderSortArrows(TPrivateEquityTableSortVariants.USD_VALUE,)}
							</div>
						</th>
						<th className={cx(styles.headerCellSortRight, styles.cellWidth110,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>P/L%</p>
								{renderSortArrows(TPrivateEquityTableSortVariants.PROFIT,)}
							</div>
						</th>
						<th className={styles.headerCellSortRight}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Start date</p>
								{renderSortArrows(TPrivateEquityTableSortVariants.ENTRY_DATE,)}
							</div>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth70,)}>
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
								key={row.assetId}
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
						<th className={cx(styles.headerCell, styles.cellWidth44,)}>

						</th>
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
						</th>
						<th className={styles.headerCell}>
						</th>
						<th className={styles.headerCell}>
						</th></>}
						<th className={cx(styles.headerCell, styles.cellWidth100,)}>
							{!isTableNamesShown && <span className={styles.totalLabel}>
								Total: {tableData ?
									tableData.list.length :
									0}
							</span>}
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth70,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth70,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth72,)}>
						</th>
						<th className={styles.footerTotalCell}>
							<span className={styles.totalLabel}>
								{totals ?
									localeString(totals.capitalCalled, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={styles.footerTotalCell}>
							<span className={styles.totalLabel}>
								{totals ?
									localeString(totals.totalCommitment, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={styles.footerTotalCell}>
							<span className={styles.totalLabel}>
								{totals ?
									localeString(totals.valueUsd, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth110,)}>
						</th>
						<th className={styles.headerCell}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth70,)}>
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
					sheetData={privateEquitySheetData}
					fileName='private-equity-table-data'
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
					assetName={AssetNamesType.PRIVATE_EQUITY}
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
					assetName={AssetNamesType.PRIVATE_EQUITY}
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
