
import * as React from 'react'

import {
	TransactionFilter,
} from '../filter/filter.component'
import type {
	IExpenseCategory,
} from '../../../../../../shared/types'

import * as styles from './transaction-header.styles'

interface ITransactionHeaderProps {
	toggleCreateVisible: () => void
	budgetId: string
	expenseCategories: Array<IExpenseCategory>

}

export const TransactionHeader: React.FC<ITransactionHeaderProps> = ({
	toggleCreateVisible,
	budgetId,
	expenseCategories,
},) => {
	return (
		<div className={styles.headerWrapper}>
			<div className={styles.titleIconBlock}>
				<p className={styles.headerTitle}>Transactions</p>
			</div>
			<div className={styles.buttonsBlock}>
				<TransactionFilter budgetId={budgetId} expenseCategories={expenseCategories}/>
			</div>
		</div>
	)
}