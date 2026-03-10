import * as React from 'react'

import type {
	IExpenseCategory,
} from '../../../../../shared/types'
import {
	TransactionItem,
} from './transaction-item/transaction-item.component'
import type {
	IBudgetTransaction,
} from '../../../../../shared/types'
import {
	useGetExpenseCategoryById,
} from '../../../../../shared/hooks'
import {
	useBudgetDetailsStore,
} from '../../budget-details.store'
import {
	localeString,
} from '../../../../../shared/utils'

import * as styles from './category-details.styles'

interface IProps {
	expenseCategoryId: string
	onClose: () => void
	toggleDetailsVisible: (id: number) => void
	toggleEditVisible: (id: number) => void
	toggleDeleteTransactionVisible: (body: IBudgetTransaction) => void
	toggleAddTransaction: (expenseCategory: IExpenseCategory) => void
}
export const ExpenseCategoryDetails: React.FC<IProps> = ({
	expenseCategoryId,
	onClose,
	toggleDetailsVisible,
	toggleEditVisible,
	toggleDeleteTransactionVisible,
	toggleAddTransaction,
},): React.JSX.Element => {
	const {
		isYearly,
	} = useBudgetDetailsStore()

	const {
		data: expenseCategory,
	} = useGetExpenseCategoryById({
		id:       expenseCategoryId,
		isYearly,
	},)

	const allocatedValue = expenseCategory?.budget ?? 0
	const actualValue = expenseCategory?.available === 0 ?
		0 :
		(expenseCategory?.available ?? 0) + allocatedValue

	return (
		<div className={styles.addTransactionWrapper}>
			<div className={styles.header}>
				<p className={styles.headerTitle}>Expense category details</p>
			</div>
			<div className={styles.mainBlock}>
				<div className={styles.infoBlock}>
					<p className={styles.infoRow}>
						<span className={styles.infoKey}>Category</span>
						<span className={styles.infoValue}>{expenseCategory?.name}</span>
					</p>
					<p className={styles.infoRow}>
						<span className={styles.infoKey}>Allocated amount</span>
						<span className={styles.infoValue}>$ {localeString(allocatedValue, '', 2, true,)}</span>
					</p>
					<p className={styles.infoRow}>
						<span className={styles.infoKey}>Actual amount</span>
						<span className={styles.infoValue}>$ {localeString(actualValue, '', 2, true,)}</span>
					</p>
				</div>
				<div className={styles.transactionList}>
					{expenseCategory?.transactions.map((transaction,) => {
						return <TransactionItem
							key={transaction.id}
							transaction={transaction}
							toggleDetailsVisible={toggleDetailsVisible}
							toggleEditVisible={toggleEditVisible}
							toggleDeleteTransactionVisible={toggleDeleteTransactionVisible}
						/>
					},)}
				</div>
			</div>
			<div className={styles.footer}>
			</div>
		</div>
	)
}