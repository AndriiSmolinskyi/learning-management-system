/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'

import {
	localeString,
} from '../../../../shared/utils'
import {
	ArrowDownUp,
	ArrowDownUpFilled,
} from '../../../../assets/icons'
import {
	Drawer,
	Loader,
} from '../../../../shared/components'
import {
	TransactionEmpty,
} from './empty.component'
import {
	TransactionItem,
} from './item.component'
import {
	FilterEmpty,
} from './filter-empty.component'
import {
	DraftItem,
} from './draft-item.component'
import {
	useTransactionDraftList,
	useDebounce,
} from '../../../../shared/hooks'
import {
	useTransactionStore,
} from '../transaction.store'
import type {
	ITransaction,
	TransactionSortKey,
} from '../../../../shared/types'
import {
	SortOrder,
} from '../../../../shared/types'
import {
	useUserStore,
} from '../../../../store/user.store'
import {
	Roles,
} from '../../../../shared/types'
import * as styles from '../transactions.styles'
import {
	useOperationsFilterStore,
} from '../../layout/components/filter/filter.store'
import {
	TRANSACTIONS_TAKE,
} from '../transaction.constants'
import {
	EditTransaction,
} from './edit-transaction.component'
import {
	formatToUTCISOString,
} from '../../../../shared/utils'
import {
	useTransactionListFilteredInfinite,
} from '../../../../shared/hooks'
import type {
	OperationTransactionFilterRequest,
} from '../../../../shared/types'
type Props = {
	transactionId: number | undefined
	totalUsdValue: number
	totalCurrencyValue: number
	isUpdateOpen: boolean
	totalTransaction: number | undefined
   toggleCreateVisible: () => void
   toggleDetailsVisible: (transactionId: number) => void
   toggleUpdateVisible: (transactionId: number) => void
   handleResume: (draftId: number) => void
   handleUpdateDrawerClose: () => void
}

export const TransactionTable: React.FC<Props> = ({
	isUpdateOpen,
	transactionId,
	totalUsdValue,
	totalCurrencyValue,
	totalTransaction,
	toggleCreateVisible,
	toggleDetailsVisible,
	toggleUpdateVisible,
	handleResume,
	handleUpdateDrawerClose,
},) => {
	const tbodyRef = React.useRef<HTMLTableSectionElement>(null,)
	const tableRef = React.useRef<HTMLTableElement>(null,)
	const [isTbodyEmpty, setIsTbodyEmpty,] = React.useState(true,)
	const [isHorizontalScroll, setIsHorizontalScroll,] = React.useState(false,)
	const {
		filter,
		setSortOrder,
		setSortBy,
	} = useTransactionStore()
	const {
		operationsFilter,
	} = useOperationsFilterStore()

	const isValidDate = (d: unknown,): d is Date => {
		return d instanceof Date && !isNaN(d.getTime(),)
	}

	const filterConfigured: OperationTransactionFilterRequest = {
		clientIds: operationsFilter.clientIds?.map((client,) => {
			return client.value.id
		},),
		portfolioIds: operationsFilter.portfolioIds?.map((portfolio,) => {
			return portfolio.value.id
		},),
		entityIds: operationsFilter.entitiesIds?.map((entity,) => {
			return entity.value.id
		},),
		bankListIds: operationsFilter.bankIds?.map((bank,) => {
			return bank.value.id
		},),
		accountIds: operationsFilter.accountIds?.map((bank,) => {
			return bank.value.id
		},),
		transactionNames: operationsFilter.names?.map((name,) => {
			return name.value.name
		},),
		currencies: operationsFilter.currencies?.map((security,) => {
			return security.value.name
		},),
		serviceProviders: operationsFilter.serviceProviders?.map((item,) => {
			return item.value.name
		},),
		sortBy:           filter.sortBy,
		sortOrder:        filter.sortOrder,
		search:           operationsFilter.search,
		date:             operationsFilter.date,
		transactionTypes: filter.transactionTypes,
		isins:            filter.isins,
		securities:       filter.securities,
		dateRange:        filter.isError ?
			undefined :
			isValidDate(filter.dateRange?.[0],) && isValidDate(filter.dateRange[1],) ?
				[formatToUTCISOString(filter.dateRange[0],),formatToUTCISOString(filter.dateRange[1],),] :
				undefined,
	}

	const finalFilter = useDebounce({
		// ...filter,
		...filterConfigured,
		take: TRANSACTIONS_TAKE,
	}, 200,)

	const {
		data: transactionFilteredData,
		isFetching,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isPending,
	} = useTransactionListFilteredInfinite(finalFilter,)

	const transactionList: Array<ITransaction> = React.useMemo(() => {
		return transactionFilteredData?.pages.flatMap((page,) => {
			return page.list
		},) ?? []
	}, [transactionFilteredData,],)
	const {
		data: transactionDraftList,
	} = useTransactionDraftList()
	const [isAllowed, setIsAllowed,] = React.useState<boolean>(false,)
	const {
		userInfo,
	} = useUserStore()

	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		if (hasPermission) {
			setIsAllowed(true,)
		}
	}, [],)

	const noTransaction = transactionDraftList?.length === 0 && transactionList.length === 0
	const noResult = !transactionList.length && (
		operationsFilter.bankIds?.length ??
      operationsFilter.clientIds?.length ??
      operationsFilter.entitiesIds?.length ??
      operationsFilter.currencies?.length ??
      operationsFilter.portfolioIds?.length ??
      operationsFilter.search ??
		operationsFilter.names?.length ??
		operationsFilter.date ??
		operationsFilter.serviceProviders?.length ??
		filter.transactionTypes?.length ??
		filter.isins?.length ??
		filter.securities?.length ??
		filter.dateRange?.length
	)

	const renderSortArrow = (type: TransactionSortKey,): React.ReactElement => {
		const isCurrent = filter.sortBy === type
		const order = filter.sortOrder

		const handleClick = (): void => {
			if (!isCurrent) {
				setSortBy(type,)
				setSortOrder(SortOrder.DESC,)
			} else if (order === SortOrder.DESC) {
				setSortOrder(SortOrder.ASC,)
			} else {
				setSortBy('transactionDate',)
				setSortOrder(SortOrder.DESC,)
			}
		}

		return (
			<span
				className={styles.sortArrow(order === SortOrder.ASC,)}
				onClick={handleClick}
			>
				{isCurrent ?
					(
						<ArrowDownUpFilled width={16} height={16} />
					) :
					(
						<ArrowDownUp width={16} height={16} />
					)}
			</span>
		)
	}

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
	}, [transactionList,],)

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
	}, [transactionList,],)
	return (
		<div className={styles.tableWrapper}>
			<div className={styles.scrollPadding} />
			<table ref={tableRef} className={styles.tableContainer(!isTbodyEmpty && !isFetching && Boolean(transactionList.length,),)}>
				<thead>
					<tr>
						<th className={styles.smallHeaderCell}>
						</th>
						<th className={styles.smallHeaderCell}>
							<div className={styles.flex}>
								<div className={styles.flex}>
									<p className={styles.tableTitle}>Date</p>
									{renderSortArrow('transactionDate',)}
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
						<th className={styles.headerCell}>
							<div className={styles.flexNumber}>
								<div className={styles.flex}>
									<p className={styles.tableTitle}>Value FC</p>
									{renderSortArrow('amount',)}
								</div>
							</div>
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
							<p className={styles.tableTitle}>ISIN</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>Security</p>
						</th>
					</tr>
				</thead>
				<tbody ref={tbodyRef}>
					{!noTransaction && !noResult && (transactionDraftList?.length ?? 0) > 0 && (
						<tr>
							<td colSpan={14} className='w-full'>
								{transactionDraftList?.map((draft,) => {
									return (
										<DraftItem
											key={draft.id}
											draft={draft}
											handleResume={handleResume}
										/>
									)
								},)}
							</td>
						</tr>
					)}
					{transactionList.map((transaction, idx,) => {
						return (
							<TransactionItem
								key={transaction.id}
								transaction={transaction}
								toggleUpdateVisible={toggleUpdateVisible}
								toggleDetailsVisible={toggleDetailsVisible}
								isAllowed={isAllowed}
								rowId={transaction.id}
							/>
						)
					},
					)}
					{hasNextPage && (
						<tr>
							<td colSpan={14}>
								<div ref={lastRowRef} style={{
									height: '20px',
								}} />
							</td>
						</tr>
					)}

					{!isFetching && noTransaction && !noResult && (
						<TransactionEmpty
							toggleCreateVisible={toggleCreateVisible}
						/>
					)}
					{!isFetching && noResult &&
                <FilterEmpty />
					}
				</tbody>
				<tfoot className={styles.tableFooter(!isTbodyEmpty && !isPending && Boolean(transactionList.length,),)}>
					<tr>
						<td className={styles.smallHeaderCell}>
							<span className={styles.totalLabel}>
								Total: {totalTransaction ?? 0}
							</span>
						</td>
						<td className={styles.smallHeaderCell}>
						</td>
						<td className={styles.headerCell}>
						</td>
						<td className={styles.headerCell}>
						</td>
						<td className={styles.headerCell}>
						</td>
						<td className={styles.headerCell}>
						</td>
						<td className={styles.headerCell}>
						</td>
						<td className={styles.smallHeaderCell}>
						</td>
						<td className={styles.footerTotalCell}>
							<span className={styles.totalLabel}>
								{totalCurrencyValue && operationsFilter.currencies?.length === 1 &&
									localeString(totalCurrencyValue, '', 0, false,)}
							</span>
						</td>
						<td className={styles.footerTotalCell}>
							<span className={styles.totalLabel}>
								{totalUsdValue ?
									localeString(totalUsdValue, 'USD', 0, false,) :
									'$0'}
							</span>
						</td>
						<td className={styles.bigHeaderCell}>
						</td>
						<td className={styles.headerCell}>
						</td>
						<td className={styles.headerCell}>
						</td>
						<td className={styles.headerCell}>
						</td>
					</tr>
				</tfoot>
			</table>
			{(isFetching && transactionList.length === 0) || isFetchingNextPage ?
				(
					<Loader />
				) :
				null}
			<Drawer
				isOpen={isUpdateOpen}
				onClose={handleUpdateDrawerClose}
				isCloseButtonShown
			>
				<EditTransaction
					transactionId={transactionId}
					onClose={handleUpdateDrawerClose}
				/>
			</Drawer>
			<div className={styles.tableBtnContainer(isHorizontalScroll,)}>
			</div>
		</div>
	)
}