import React from 'react'

import type {
	IBudgetTransaction,
} from '../../../../../../shared/types'
import {
	TransactionItemDialog,
} from '../transaction-dialog/transaction-dialog.component'
import {
	Button, ButtonType,
	Color,
	Size,
} from '../../../../../../shared/components'
import {
	MoreVertical, XmarkMid,
} from '../../../../../../assets/icons'
import {
	formatDateToThreeLetterMonth,
	localeString,
} from '../../../../../../shared/utils'

import * as styles from './table.styles'

type Props = {
	transaction: IBudgetTransaction
	toggleDetailsVisible: (id: number) => void
	toggleEditVisible: (id: number) => void
	toggleDeleteTransactionVisible: (body: IBudgetTransaction) => void

}

export const TableItem: React.FC<Props> = ({
	transaction,
	toggleEditVisible,
	toggleDetailsVisible,
	toggleDeleteTransactionVisible,
},) => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)
	const handlePopoverCondition = (): void => {
		setIsPopoverShown(!isPopoverShown,)
	}
	return (
		<tr className={styles.itemWrapper}>
			<td className={styles.tableCell}>{transaction.id}</td>
			<td className={styles.tableCell}>{transaction.typeVersion?.name}</td>
			<td className={styles.tableCell}>{transaction.typeVersion?.categoryType?.name}</td>
			<td className={styles.tableCell}>{transaction.currency}</td>
			<td className={styles.tableAmountCell((transaction.amount ?
				transaction.amount :
				0) >= 0,)}>{transaction.amount && (transaction.amount > 0 ?
					`+${localeString(Number(transaction.amount,), '', 2, true,)}` :
					localeString(Number(transaction.amount,), '', 2, true,))}</td>
			<td className={styles.tableCell}>{formatDateToThreeLetterMonth(transaction.transactionDate as string,)}</td>
			<td className={styles.tableButtonCell}>
				<TransactionItemDialog
					id={transaction.id}
					transaction={transaction}
					toggleDetailsVisible={toggleDetailsVisible}
					toggleEditVisible={toggleEditVisible}
					handlePopoverCondition={handlePopoverCondition}
					toggleDeleteTransactionVisible={toggleDeleteTransactionVisible}
				>
					<Button<ButtonType.ICON>
						disabled={false}
						onClick={handlePopoverCondition}
						additionalProps={{
							btnType: ButtonType.ICON,
							size:    Size.SMALL,
							color:   Color.SECONDRAY_GRAY,
							icon:    isPopoverShown ?
								<XmarkMid width={20} height={20} />			:
								<MoreVertical width={20} height={20} />	,
						}}
					/>
				</TransactionItemDialog>
			</td>
		</tr>
	)
}
