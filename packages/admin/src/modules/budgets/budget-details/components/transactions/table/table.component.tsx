import React from 'react'

import {
	ArrowDownUp,
	ArrowDownUpFilled,
} from '../../../../../../assets/icons'
import {
	TableItem,
} from './table-item.component'
import {
	useTransactionStore,
} from '../transaction.store'
import type {
	IBudgetTransaction,
} from '../../../../../../shared/types'
import {
	TTransactionTableSortVariants,
} from '../../../../../../shared/types'
import {
	SortOrder,
} from '../../../../../../shared/types'
import {
	useDebounce,
	useGetBudgetTransactions,
} from '../../../../../../shared/hooks'

import * as styles from './table.styles'

type Props = {
	clientId: string
	toggleDetailsVisible: (id: number) => void
	toggleEditVisible: (id: number) => void
	toggleDeleteTransactionVisible: (body: IBudgetTransaction) => void
}

export const TransactionsTable: React.FunctionComponent<Props> = ({
	clientId,
	toggleDetailsVisible,
	toggleEditVisible,
	toggleDeleteTransactionVisible,
},) => {
	const tableRef = React.useRef<HTMLTableElement>(null,)
	const {
		filter,
		sortFilter,
		setSortBy,
		setSortOrder,
	} = useTransactionStore()

	const finalFilter = useDebounce({
		...filter,
		...sortFilter,
		clientId,
	}, 700,)

	const {
		data: transactionList,
	} = useGetBudgetTransactions(finalFilter,)

	const renderSortArrow = (type: TTransactionTableSortVariants,): React.ReactElement => {
		return (
			<>
				{sortFilter.sortBy !== type && (
					<span
						className={styles.sortArrow()}
						onClick={() => {
							setSortBy(type,)
							setSortOrder(SortOrder.DESC,)
						}}
					>
						<ArrowDownUp
							width={16}
							height={16}
						/>
					</span>
				)}
				{sortFilter.sortBy === type && sortFilter.sortOrder === SortOrder.DESC && (
					<span
						className={styles.sortArrow()}
						onClick={() => {
							setSortOrder(SortOrder.ASC,)
						}}
					>
						<ArrowDownUpFilled
							width={16}
							height={16}
						/>
					</span>
				)}
				{sortFilter.sortBy === type && sortFilter.sortOrder === SortOrder.ASC && (
					<span
						className={styles.sortArrow(true,)}
						onClick={() => {
							setSortOrder(SortOrder.DESC,)
							setSortBy(TTransactionTableSortVariants.TRANSACTION_DATE,)
						}}
					>
						<ArrowDownUpFilled
							width={16}
							height={16}
						/>
					</span>
				)}
			</>
		)
	}
	return transactionList && Boolean(transactionList.length > 0,) && (
		<div className={styles.tableWrapper}>
			<table ref={tableRef} className={styles.tableContainer}>
				<thead>
					<tr>
						<th className={styles.headerCell}>
							<div className={styles.flex}>
								<p className={styles.tableTitle}>Transaction ID</p>
								{renderSortArrow(TTransactionTableSortVariants.ID,)}
							</div>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>Type</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>Category</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>Currency</p>
						</th>
						<th className={styles.headerCell}>
							<div className={styles.flex}>
								<p className={styles.tableTitle}>Amount</p>
								{renderSortArrow(TTransactionTableSortVariants.AMOUNT,)}
							</div>
						</th>
						<th className={styles.headerCell}>
							<div className={styles.flex}>
								<p className={styles.tableTitle}>Date</p>
								{renderSortArrow(TTransactionTableSortVariants.TRANSACTION_DATE,)}
							</div>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}></p>
						</th>
					</tr>
				</thead>
				<tbody>
					{transactionList.map((transaction,) => {
						return <TableItem
							key={transaction.id}
							transaction={transaction}
							toggleDetailsVisible={toggleDetailsVisible}
							toggleEditVisible={toggleEditVisible}
							toggleDeleteTransactionVisible={toggleDeleteTransactionVisible}
						/>
					},)}
				</tbody>
			</table>
		</div>
	)
}