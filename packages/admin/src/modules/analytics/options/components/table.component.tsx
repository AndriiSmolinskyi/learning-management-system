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
	useOptionsStore,
} from '../options.store'
import {
	AssetNamesType,
	SortOrder,
} from '../../../../shared/types'
import {
	TOptionsSortVariants,
} from '../options.types'
import type {
	TOptionsAssetAnalytics,
} from '../../../../services/analytics/analytics.types'
import {
	getOptionsSheetData,
} from '../options.utils'
import {
	localeString,
	toggleState,
} from '../../../../shared/utils'
import {
	EmptyAnalyticsResponse,
} from '../../../../shared/components/empty-analytics-response/empty-analytics-response.component'
import {
	DeleteAssetModal,
} from '../../components/delete-asset-modal/delete-asset-modal.component'
import {
	useGetFilterApplied,
} from '../../layout/components/analytics-filter/analytics-filter.util'
import {
	useAnalyticsFilterStore,
} from '../../analytics-store'
import {
	TransferConfirmationDialog, TransferSuccessModal,
} from '../../../clients/portfolios/portfolio-details/components/asset'

import * as styles from '../options.styles'

type Props = {
	tableData?: Array<TOptionsAssetAnalytics>
	refetchData: () => void
	tableIsFetching: boolean
}

export const OptionTable: React.FunctionComponent<Props> = ({
	tableData = [],
	refetchData,
	tableIsFetching,
},) => {
	const tableRef = React.useRef<HTMLTableElement>(null,)
	const tbodyRef = React.useRef<HTMLTableSectionElement>(null,)
	const [isHorizontalScroll, setIsHorizontalScroll,] = React.useState(false,)
	const [isTbodyEmpty, setIsTbodyEmpty,] = React.useState(true,)
	const [totalMarketValue, setTotalMarketValue,] = React.useState<number | undefined>(0,)
	const [isDeleteModalShowed, setIsDeleteModalShown,] = React.useState(false,)
	const [deleteAssetId, setDeleteAssetId,] = React.useState<string | undefined>(undefined,)
	const [isTransferSuccess, setIsTransferSuccess,] = React.useState(false,)
	const [isTableNamesShown, setIsTableNamesShown,] = React.useState(false,)

	const toggleDeleteDialog = toggleState(setIsDeleteModalShown,)
	const handleOpenDeleteModal = (assetId: string,): void => {
		setDeleteAssetId(assetId,)
		toggleDeleteDialog()
	}
	const optionsSheetData = getOptionsSheetData(tableData,)
	const {
		filter,
		setBankId,
		setMaturityYear,
		setAssetIds,
		sortFilter,
		setSortFilters,
	} = useOptionsStore()
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
			let total = 0
			filter.assetIds.forEach((assetId,) => {
				const currentAsset = tableData.find((asset,) => {
					return asset.id === assetId
				},)
				if (currentAsset?.marketValue) {
					total = total + (Number(currentAsset.marketValue,) || 0)
				}
			},)
			setTotalMarketValue(total,)
		} else {
			setTotalMarketValue(tableData.reduce((acc, item,) => {
				return acc + (Number(item.marketValue,) || 0)
			},0,),)
		}
	}, [tableData, filter.assetIds,],)

	const handleTableClear = (): void => {
		setBankId(undefined,)
		setMaturityYear(undefined,)
		setAssetIds(undefined,)
	}

	const renderSortArrows = (type: TOptionsSortVariants,): React.ReactElement => {
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
					sortBy: TOptionsSortVariants.START_DATE, sortOrder:  SortOrder.DESC,
				},)
			}
		}

		return (
			<span
				className={styles.sortArrows(order === SortOrder.ASC,)}
				onClick={handleClick}
			>
				{!isCurrent && <ArrowDownUp />}
				{isCurrent && order === SortOrder.ASC && <ArrowDownUpFilled />}
				{isCurrent && order === SortOrder.DESC && <ArrowDownUpFilled />}
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
						<th className={cx(styles.headerCell, styles.cellWidth100,)}>
							<p className={styles.tableTitle}>Currency</p>
						</th>
						<th className={cx(styles.headerCellSortRight, styles.cellWidth100,)}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Start date</p>
								{renderSortArrows(TOptionsSortVariants.START_DATE,)}
							</div>
						</th>
						<th className={styles.headerCellSortRight}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Maturity</p>
								{renderSortArrows(TOptionsSortVariants.MATURITY,)}
							</div>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth70,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth80,)}>
							<p className={styles.tableTitle}>Pair</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth70,)}>
							<p className={styles.tableTitleNumber}>Premium</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth70,)}>
							<p className={styles.tableTitleNumber}>Strike</p>
						</th>
						<th className={styles.headerCellSortRight}>
							<div className={styles.flexNumber}>
								<p className={styles.tableTitle}>Market value USD</p>
								{renderSortArrows(TOptionsSortVariants.MARKET_VALUE,)}
							</div>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitleNumber}>Principal value FC</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth70,)}>
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
						<th className={cx(styles.headerCell, styles.cellWidth44,)}>

						</th>
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
						<th className={cx(styles.headerCell, styles.cellWidth100,)}>
							{!isTableNamesShown && <span className={styles.totalLabel}>
								Total: {tableData.length}
							</span>}
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth100,)}>
						</th>
						<th className={styles.headerCell}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth70,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth80,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth70,)}>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth70,)}>
						</th>
						<th className={styles.footerTotalCell}>
							<span className={styles.totalLabel}>
								{totalMarketValue ?
									localeString(totalMarketValue, 'USD', 0, false,) :
									'$0'}
							</span>
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
					sheetData={optionsSheetData}
					fileName='options-table-data'
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
					assetName={AssetNamesType.OPTIONS}
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
					assetName={AssetNamesType.OPTIONS}
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
