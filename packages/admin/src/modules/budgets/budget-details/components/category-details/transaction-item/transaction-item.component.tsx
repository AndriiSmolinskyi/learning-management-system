
import * as React from 'react'

import {
	Button, ButtonType, Color, Size,
} from '../../../../../../shared/components'
import type {
	IBudgetTransaction,
} from '../../../../../../shared/types'
import {
	formatDateToThreeLetterMonth,
} from '../../../../../../shared/utils'
import {
	TransactionDialog,
} from '../transaction-dialog/transaction-dialog.component'
import {
	MoreVertical, XmarkMid,
} from '../../../../../../assets/icons'

import * as styles from './transaction-item.styles'

interface IProps {
	transaction: IBudgetTransaction
	toggleDetailsVisible: (id: number) => void
	toggleEditVisible: (id: number) => void
	toggleDeleteTransactionVisible: (body: IBudgetTransaction) => void
}
export const TransactionItem: React.FC<IProps> = ({
	transaction,
	toggleDetailsVisible,
	toggleEditVisible,
	toggleDeleteTransactionVisible,
},): React.JSX.Element => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)
	const handlePopoverCondition = (): void => {
		setIsPopoverShown(!isPopoverShown,)
	}
	return (
		<div className={styles.transactionWrapper}>
			<p className={styles.infotextBlock}>
				<span className={styles.amount((transaction.amount ?
					transaction.amount :
					0) >= 0,)}>{transaction.usdAmount && transaction.usdAmount > 0 ?
						`+$${transaction.usdAmount}` :
						`-$${Math.abs(transaction.usdAmount,)}`}</span>
				<span className={styles.dataText}>{formatDateToThreeLetterMonth(transaction.transactionDate as string,)}</span>
			</p>
			<TransactionDialog
				id={transaction.id}
				transaction={transaction}
				toggleDetailsVisible={toggleDetailsVisible}
				toggleEditVisible={toggleEditVisible}
				handlePopoverCondition={handlePopoverCondition}
				toggleDeleteTransactionVisible={toggleDeleteTransactionVisible}
				usePortal
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
			</TransactionDialog>
		</div>
	)
}