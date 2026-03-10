
/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	ArrowDownUp,
	ArrowDownUpFilled,
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
	useDepositStore,
} from '../deposit.store'
import {
	AssetNamesType,
	SortOrder,
} from '../../../../shared/types'
import {
	TDepositTableSortVariants,
} from '../deposit.types'
import type {
	IDepositByFilter,
} from '../../../../services/analytics/analytics.types'
import {
	localeString,
	toggleState,
} from '../../../../shared/utils'
import {
	getDepositSheetData,
} from '../deposit.utils'
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
import {
	ChevronRight,
} from '../../../../assets/icons'

import * as styles from '../deposit.styles'

type Props = {
	tableData?: IDepositByFilter
	refetchData: () => void
	tableIsFetching: boolean
	isFilterApplied?: boolean
}

export const DepositTable: React.FunctionComponent<Props> = ({
	tableData,
	refetchData,
	tableIsFetching,
	isFilterApplied,
},) => {
	const tableRef = React.useRef<HTMLTableElement>(null,)
	const tbodyRef = React.useRef<HTMLTableSectionElement>(null,)
	const [isHorizontalScroll, setIsHorizontalScroll,] = React.useState(false,)
	const [isTbodyEmpty, setIsTbodyEmpty,] = React.useState(true,)
	const [totalUsdValue, setTotalUsdValue,] = React.useState<number | undefined>(0,)
	const [isDeleteModalShowed, setIsDeleteModalShown,] = React.useState(false,)
	const [deleteAssetId, setDeleteAssetId,] = React.useState<string | undefined>(undefined,)
	const [isTransferSuccess, setIsTransferSuccess,] = React.useState(false,)
	const [isTableNamesShown, setIsTableNamesShown,] = React.useState(false,)
	const toggleDeleteDialog = toggleState(setIsDeleteModalShown,)

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

	const {
		setAssetTransferProps,
		assetTransferProps,
		resetAnalyticsFilterStore,
	} = useAnalyticsFilterStore()
	const handleTransferSuccess = (isSuccess: boolean,): void => {
		setIsTransferSuccess(isSuccess,)
	}
	const handleOpenDeleteModal = (assetId: string,): void => {
		setDeleteAssetId(assetId,)
		toggleDeleteDialog()
	}
	const depositSheetData = getDepositSheetData(tableData?.list ?? [],)
	const {
		filter,
		sortFilter,
		setBankId,
		setCurrency,
		setAssetId,
		setSortFilters,
	} = useDepositStore()

	React.useEffect(() => {
		if (filter.assetId?.length) {
			let total = 0
			filter.assetId.forEach((assetId,) => {
				const currentAsset = tableData?.list.find((asset,) => {
					return asset.assetId === assetId
				},)
				if (currentAsset?.usdValue) {
					total = total + currentAsset.usdValue
				}
			},)
			setTotalUsdValue(total,)
		} else {
			setTotalUsdValue(tableData?.totalAssets,)
		}
	}, [tableData, filter.assetId,],)

	const handleTableClear = (): void => {
		setBankId(undefined,)
		setCurrency(undefined,)
		setAssetId(undefined,)
	}
	const renderSortArrows = (type: TDepositTableSortVariants,): React.ReactElement => {
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
					sortBy: TDepositTableSortVariants.START_DATE, sortOrder: SortOrder.DESC,
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
						<th className={cx(styles.totalCell, styles.cellWidth44, styles.chevronContainer,)}><ChevronRight className={styles.chevronIcon(isTableNamesShown,)} onClick={handleTableFold}/></th>
						{isTableNamesShown && <><th className={cx(styles.headerCell, styles.cellWidth115,)}>
							<p className={styles.tableTitle}>Portfolio</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth115,)}>
							<p className={styles.tableTitle}>Entity</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth115,)}>
							<p className={styles.tableTitle}>Bank</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth115,)}>
							<p className={styles.tableTitle}>Account</p>
						</th></>}
						<th className={cx(styles.headerCellSortRight, styles.cellWidth100,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Start date</p>
								{renderSortArrows(TDepositTableSortVariants.START_DATE,)}
							</div>
						</th>
						<th className={cx(styles.headerCellSortRight, styles.cellWidth115,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Maturity</p>
								{renderSortArrows(TDepositTableSortVariants.MATURITY_DATE,)}
							</div>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth70,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth72,)}>
							<p className={styles.tableTitle}>Currency</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth115,)}>
							<p className={styles.tableTitleNumber}>Value FC</p>
						</th>
						<th className={styles.headerCellSortRight}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Value USD</p>
								{renderSortArrows(TDepositTableSortVariants.USD_VALUE,)}
							</div>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth72,)}>
							<p className={styles.tableTitleNumber}>Interest</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth70,)}>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>Policy</p>
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
						<th className={cx(styles.totalCell, styles.cellWidth44,)}>
						</th>
						{isTableNamesShown && <><th className={cx(styles.headerCell, styles.cellWidth115,)}><span className={styles.totalLabel}>
								Total: {tableData ?
								tableData.list.length :
								0}
						</span>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth115,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth115,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth115,)}>
						</th></>}
						<th className={cx(styles.headerCell, styles.cellWidth100,)}>
							{!isTableNamesShown && <span className={styles.totalLabel}>
								Total: {tableData ?
									tableData.list.length :
									0}</span>}
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth115,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth70,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth72,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth115,)}>
						</th>
						<th className={styles.footerTotalCell}>
							<span className={styles.totalLabel}>
								{totalUsdValue ?
									localeString(totalUsdValue, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth72,)}>
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
					sheetData={depositSheetData}
					fileName='deposit-table-data'
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
					assetName={AssetNamesType.CASH_DEPOSIT}
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
					assetName={AssetNamesType.CASH_DEPOSIT}
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
