/* eslint-disable complexity */
import React from 'react'
import {
	ArrowDownUpFilled,
	Rotate,
	ArrowDownUp,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Loader,
	Size,
} from '../../../../shared/components'
import {
	localeString,
} from '../../../../shared/utils'
import {
	TableItem,
} from './table-item.component'
import {
	useAnalyticTransactionStore,
} from '../transaction.store'
import {
	SortOrder,
} from '../../../../shared/types'
import type {
	TransactionFilter,
} from '../../../../services/analytics/analytics.types'
import {
	TransactionTableSortVariants,
} from '../transactions.types'
import {
	TRANSACTIONS_TAKE,
} from '../transaction.constants'
import {
	useDebounce,
	useTransactionAnalyticsFilteredInfinite,
} from '../../../../shared/hooks'
import {
	EmptyAnalyticsResponse,
} from '../../../../shared/components/empty-analytics-response/empty-analytics-response.component'
import type {
	TAnalyticsStoreFilter,
} from '../../analytics-store'
import {
	useAnalyticsFilterStore,
} from '../../analytics-store'
import {
	SaveAsExcelButton,
} from './save-button'
import {
	cx,
} from '@emotion/css'
import * as styles from '../transactions.styles'

type Props = {
	totalUsdValue: number
	combinedFilter: TransactionFilter
	exelFilter: TransactionFilter
	plFetching: boolean
	isFilterApplied?: boolean
	totalCurrencyValue: number
	analyticsFilter: TAnalyticsStoreFilter
}

export const TransactionsTable: React.FunctionComponent<Props> = ({
	totalUsdValue,
	combinedFilter,
	plFetching,
	isFilterApplied,
	exelFilter,
	totalCurrencyValue,
	analyticsFilter,
},) => {
	const tbodyRef = React.useRef<HTMLTableSectionElement>(null,)
	const [isHorizontalScroll, setIsHorizontalScroll,] = React.useState(false,)
	const [isTbodyEmpty, setIsTbodyEmpty,] = React.useState(true,)
	const [totalTransactions, setTotalTransactions,] = React.useState(0,)
	const {
		filter,
		sortFilter,
		setSortFilters,
		setTransactionIds,
	} = useAnalyticTransactionStore()

	const finalFilter = useDebounce({
		...combinedFilter,
		...sortFilter,
		take: TRANSACTIONS_TAKE,
	}, 200,)

	const {
		data: transactionFilteredData,
		isFetching,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isPending,
	} = useTransactionAnalyticsFilteredInfinite(finalFilter,)
	const {
		resetAnalyticsFilterStore,
	} = useAnalyticsFilterStore()
	const tableRef = React.useRef<HTMLTableElement>(null,)

	const tableData = transactionFilteredData?.pages.flatMap((page,) => {
		return page.list
	},)

	React.useEffect(() => {
		if (transactionFilteredData?.pages[0]?.total) {
			setTotalTransactions(transactionFilteredData.pages[0]?.total,)
		}
	}, [transactionFilteredData?.pages[0]?.total,],)

	const observer = React.useRef<IntersectionObserver | null>(null,)

	const lastRowRef = React.useCallback((node: HTMLTableRowElement | null,) => {
		if (isFetchingNextPage) {
			return
		}
		if (observer.current) {
			observer.current.disconnect()
		}
		observer.current = new IntersectionObserver((entries,) => {
			if (entries[0]?.isIntersecting && hasNextPage) {
				fetchNextPage()
			}
		},)

		if (node) {
			observer.current.observe(node,)
		}
	}, [fetchNextPage, hasNextPage, isFetchingNextPage,],)

	const handleTableClear = (): void => {
		setTransactionIds(undefined,)
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
	const renderSortArrows = (type: TransactionTableSortVariants,): React.ReactElement => {
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
					sortBy: TransactionTableSortVariants.TRANSACTION_DATE, sortOrder: SortOrder.DESC,
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
	return (
		<div className={styles.tableWrapper}>
			<div className={styles.scrollPadding} />
			<table ref={tableRef} className={styles.tableContainer(!isTbodyEmpty && !isFetching && Boolean(tableData?.length,),)}>
				<thead>
					<tr>
						<th className={styles.smallHeaderCell}>
							<div className={styles.flex}>
								<div className={styles.flex}>
									<p className={styles.tableTitle}>Date</p>
									{renderSortArrows(TransactionTableSortVariants.TRANSACTION_DATE,)}
								</div>
							</div>
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
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>Transaction name</p>
						</th>
						<th className={styles.smallHeaderCell}>
							<p className={styles.tableTitle}>Currency</p>
						</th>
						<th className={cx(styles.headerCell, styles.cellWidth100,)}>
							<p className={styles.tableTitleNumber}>Value FC</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitleNumber}>Value in USD</p>
						</th>
						<th className={cx(styles.bigHeaderCell, styles.additionalLeftPadding24,)}>
							<div className={styles.flex}>
								<p className={styles.tableTitle}>Comment</p>
							</div>
						</th>
						<th className={styles.headerCell}>
							<div className={styles.flex}>
								<p className={styles.tableTitle}>Service provider</p>
							</div>
						</th>
						<th className={styles.headerCell}>
							<div className={styles.flex}>
								<div className={styles.flex}>
									<p className={styles.tableTitle}>ISIN</p>
									{renderSortArrows(TransactionTableSortVariants.ISIN,)}
								</div>
							</div>
						</th>
						<th className={styles.headerCell}>
							<div className={styles.flex}>
								<div className={styles.flex}>
									<p className={styles.tableTitle}>Security</p>
									{renderSortArrows(TransactionTableSortVariants.SECURITY,)}
								</div>
							</div>
						</th>
					</tr>
				</thead>
				{!isFetching && Boolean(tableData?.length === 0,) && <EmptyAnalyticsResponse isFilter={isFilterApplied} inTable clearFunction={resetAnalyticsFilterStore}/>}
				{isFetching && <Loader inTable/>}
				<tbody ref={tbodyRef}>
					{tableData?.map((row,) => {
						return <TableItem key={row.id} row={row} />
					},)}
					{hasNextPage && (
						<tr>
							<td colSpan={14}>
								<div ref={lastRowRef} style={{
									height: '20px',
								}} />
							</td>
						</tr>
					)}
				</tbody>
				<tfoot className={styles.tableFooter(!isTbodyEmpty && !isPending && Boolean(tableData?.length,),)}>
					<tr>
						<th className={styles.smallHeaderCell}>
							<span className={styles.totalLabel}>
								Total: {totalTransactions}
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
						</th>
						<th className={styles.smallHeaderCell}>
						</th>
						<th className={cx(styles.footerTotalCell, styles.cellWidth100,)}>
							<span className={styles.totalLabel}>
								{totalCurrencyValue && analyticsFilter.currencies?.length === 1 &&
									localeString(totalCurrencyValue, '', 0, false,)}
							</span>
						</th>
						<th className={styles.footerTotalCell}>
							<span className={styles.totalLabel}>
								{totalUsdValue ?
									localeString(totalUsdValue, 'USD', 0, false,) :
									'$0'}
							</span>
						</th>
						<th className={styles.bigHeaderCell}>
						</th>
						<th className={styles.headerCell}>
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
					disabled={!filter.transactionIds}
					className={styles.clearBtn}
					additionalProps={{
						btnType:  ButtonType.ICON,
						icon:     <Rotate width={20} height={20} />,
						size:     Size.SMALL,
						color:    Color.SECONDRAY_COLOR,
					}}
				/>
				<SaveAsExcelButton
					fileName='transactions-table-data'
					exelFilter={{
						...exelFilter, ...sortFilter,
					}}
				/>
			</div>
		</div>

	)
}
