
import * as React from 'react'

import {
	TransactionsTable,
} from './table/table.component'
import {
	TransactionHeader,
} from './header/transaction-header.component'
import type {
	IBudgetTransaction,
} from '../../../../../shared/types'
import type {
	IExpenseCategory,
} from '../../../../../shared/types'

import * as styles from './transactions.styles'
interface IProps {
	clientId: string
	budgetId: string
	toggleDetailsVisible: (id: number) => void
	toggleEditVisible: (id: number) => void
	toggleDeleteTransactionVisible: (body: IBudgetTransaction) => void
	openAddModal: () => void
	expenseCategories: Array<IExpenseCategory>
}

export const BudgetTransactions: React.FC<IProps> = ({
	clientId,
	budgetId,
	toggleDetailsVisible,
	toggleEditVisible,
	toggleDeleteTransactionVisible,
	openAddModal,
	expenseCategories,
},) => {
	return (
		<div className={styles.transactionBlockWrapper}>
			<TransactionHeader
				budgetId={budgetId}
				toggleCreateVisible={openAddModal}
				expenseCategories={expenseCategories}
			/>
			<TransactionsTable
				clientId={clientId}
				toggleEditVisible={toggleEditVisible}
				toggleDetailsVisible={toggleDetailsVisible}
				toggleDeleteTransactionVisible={toggleDeleteTransactionVisible}
			/>
		</div>
	)
}