/* eslint-disable complexity */
import React from 'react'
import {
	useTransactionTypeDraftsList,
} from '../../../../shared/hooks/settings/transaction-settings.hook'
import {
	DraftItem,
} from './draft-item.component'
import {
	TransactionTypeItem,
} from './item.component'
import {
	useTransactionTypeStore,
} from '../transaction-settings.store'
import type {
	ITransactionType,
} from '../../../../shared/types'
import {
	TransactionTypeSortBy,
} from '../../../../shared/types'
import {
	SortOrder,
} from '../../../../shared/types'
import {
	ArrowDownUpFilled,
	ArrowDownUp,
} from '../../../../assets/icons'
import {
	TransactionTypeEmpty,
} from './empty.component'
import {
	FilterEmpty,
} from './filter-empty.component'
import * as styles from './table.style'

type Props = {
	transactionTypeList: Array<ITransactionType> | undefined
	handleResume: (draftId: string) => void
	toggleRelationsVisible: (id: string) => void
	toggleUpdateVisible: (id: string) => void
	handleOpenDeleteModal: (transactionTypeId: string) => void
	onAddTransaction: () => void
}

export const Table: React.FC<Props> = ({
	transactionTypeList,
	handleResume,
	toggleRelationsVisible,
	toggleUpdateVisible,
	handleOpenDeleteModal,
	onAddTransaction,
},) => {
	const {
		filter, setSortOrder, setSortBy,
	} = useTransactionTypeStore()
	const {
		sortBy, sortOrder,
	} = filter

	const {
		data: transactionTypeDraftsList, isFetching,
	} = useTransactionTypeDraftsList()

	const renderSortArrows = (type: TransactionTypeSortBy,): React.ReactElement => {
		const isCurrent = sortBy === type
		const order = sortOrder

		const handleClick = (): void => {
			if (!isCurrent) {
				setSortBy(type,)
				setSortOrder(SortOrder.DESC,)
			} else if (order === SortOrder.DESC) {
				setSortOrder(SortOrder.ASC,)
			} else {
				setSortBy(TransactionTypeSortBy.NAME,)
				setSortOrder(SortOrder.DESC,)
			}
		}

		return (
			<span
				className={styles.orderArrow(order === SortOrder.ASC,)}
				onClick={handleClick}
			>
				{isCurrent ?
					<ArrowDownUpFilled width={16} height={16} /> :
					<ArrowDownUp width={16} height={16} />}
			</span>
		)
	}

	const noTransaction = transactionTypeDraftsList?.length === 0 && transactionTypeList?.length === 0

	const noResult = !transactionTypeList?.length && (
		filter.search?.length ??
		filter.assets?.length ??
		filter.categoryIds?.length ??
		filter.cashFlows?.length ??
		filter.pls?.length ??
		filter.isActivated ??
		filter.isDeactivated
	)

	return (
		<div className={styles.tableWrapper}>
			<div className={styles.scrollPadding} />
			<table className={styles.tableContainer}>
				<thead>
					<tr>
						<th className={styles.smallHeaderCell}>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>
								Name
								{renderSortArrows(TransactionTypeSortBy.NAME,)}
							</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>
								Category
								{renderSortArrows(TransactionTypeSortBy.CATEGORY_ID,)}
							</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>
								Cash flow
								{renderSortArrows(TransactionTypeSortBy.CASH_FLOW,)}
							</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>
								P/L type
								{renderSortArrows(TransactionTypeSortBy.PL,)}
							</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>
								Related transaction
								{renderSortArrows(TransactionTypeSortBy.RELATED_TYPE_ID,)}
							</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>
								Related asset
								{renderSortArrows(TransactionTypeSortBy.ASSET,)}
							</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>
								Comment
							</p>
						</th>
						{/* <th className={styles.headerCell}>
							<p className={styles.tableTitle}>
								Related subset
								{renderSortArrows(TransactionTypeSortBy,)}
							</p>
						</th> */}
					</tr>
				</thead>
				<tbody>

					{!noTransaction && !noResult && (transactionTypeDraftsList?.length ?? 0) > 0 && (
						<tr>
							<td colSpan={8} className='w-full'>
								{transactionTypeDraftsList?.map((draft,) => {
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

					{transactionTypeList?.map((transaction, idx,) => {
						return (
							<TransactionTypeItem
								key={transaction.id}
								transaction={transaction}
								toggleRelationsVisible={toggleRelationsVisible}
								handleOpenDeleteModal={handleOpenDeleteModal}
								toggleUpdateVisible={toggleUpdateVisible}
							/>
						)
					},
					)}

					{!isFetching && noTransaction && !noResult && (
						<TransactionTypeEmpty
							toggleCreateVisible={onAddTransaction}
						/>
					)}

					{!isFetching && noResult &&
                <FilterEmpty />
					}
				</tbody>
			</table>
		</div>
	)
}