/* eslint-disable complexity */
import * as React from 'react'
import {
	format,
} from 'date-fns'

import {
	BankSelect,
	MoreVertical,
	TrashIcon,
	XmarkMid,
} from '../../../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	CustomDialog,
	Size,
} from '../../../../../../shared/components'
import {
	TransactionItemDialog,
} from '../../../../../operations/transactions/components'
import {
	useDeleteTransaction,
} from '../../../../../../shared/hooks'
import {
	TransactionCashFlow,
} from '../../../../../../shared/types'
import type {
	ITransaction,
} from '../../../../../../shared/types'
import {
	toggleState,
	localeString,
} from '../../../../../../shared/utils'
import {
	useUserStore,
} from '../../../../../../store/user.store'

import * as styles from './transactions.styles'

type Props = {
	transaction: ITransaction
	toggleUpdateVisible: (transactionId: number) => void
	toggleDetailsVisible: (transactionId: number) => void
}

export const TransactionItem: React.FC<Props> = ({
	transaction,
	toggleUpdateVisible,
	toggleDetailsVisible,
},) => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState(false,)
	const [showRemoveTransactionDialog, setShowRemoveTransactionDialog,] = React.useState(false,)
	const [transactionId, setTransactionId,] = React.useState<number | undefined>()
	const [reason, setReason,] = React.useState<string | null>(null,)
	const [showError, setShowError,] = React.useState(false,)

	const {
		userInfo,
	} = useUserStore()
	const {
		mutateAsync: deleteTransaction,
		isPending: isDeleting,
	} = useDeleteTransaction()

	const toggleRemoveTransaction = React.useCallback((id: number,) => {
		setTransactionId(id,)
		toggleState(setShowRemoveTransactionDialog,)()
	}, [],)
	const handleDeletionReason = (e: React.ChangeEvent<HTMLInputElement>,): void => {
		setReason(e.target.value || null,)
		if (e.target.value.trim().length >= 1) {
			setShowError(false,)
		} else {
			setShowError(true,)
		}
	}
	return (
		<div className={styles.transactionItem}>
			<div className={styles.amountBlock}>
				<div className={styles.marginBottom2}>
					{transaction.usdValue &&
					<div className={transaction.typeVersion?.cashFlow === TransactionCashFlow.INFLOW ?
						styles.textColorGreen :
						styles.textColorRed
					}>
						{transaction.typeVersion?.cashFlow === TransactionCashFlow.INFLOW ?
							'+' :
							''}
						{localeString(transaction.usdValue, 'USD', 0, false,)}
					</div>}
				</div>
				<p className={styles.itemSubTitle}>
					{transaction.transactionDate && format(transaction.transactionDate, 'dd.MM.yyyy',)}
				</p>
			</div>
			<div className={styles.bankBlock}>
				<div className={styles.bankTitleBlock}>
					<BankSelect width={16} height={16} />
					<p className={styles.itemSubTitle}>Bank</p>
				</div>
				<p className={styles.bankTitle}>{transaction.bank?.bankName}</p>
			</div>
			<TransactionItemDialog
				transaction={transaction}
				toggleDetailsVisible={toggleDetailsVisible}
				toggleUpdateVisible={toggleUpdateVisible}
				toggleRemoveTransaction={toggleRemoveTransaction}
				setDialogOpen={setIsPopoverShown}
			>
				<Button<ButtonType.ICON>
					disabled={false}
					onClick={() => {
						toggleState(setIsPopoverShown,)()
					}}
					className={styles.dotsButton(isPopoverShown,)}
					additionalProps={{
						btnType: ButtonType.ICON,
						size:    Size.SMALL,
						color:   Color.SECONDRAY_GRAY,
						icon:    isPopoverShown ?
							<XmarkMid /> :
							<MoreVertical />,
					}}
				/>
			</TransactionItemDialog>
			<CustomDialog
				open={showRemoveTransactionDialog}
				icon={<TrashIcon />}
				title='Delete transaction'
				description={`Are you sure you want to delete ${transactionId} transaction? This action cannot be undone.`}
				isCloseButtonShown
				submitBtnColor={Color.SECONDARY_RED}
				submitBtnText='Delete transaction'
				isSubmitBtnDisable={isDeleting}
				onCancel={() => {
					toggleState(setShowRemoveTransactionDialog,)()
				}}
				handleDeletionReason={handleDeletionReason}
				reason={reason}
				showError={showError || !reason}
				onSubmit={async() => {
					if (transactionId && userInfo.name && reason) {
						await deleteTransaction({
							id:    transactionId,
							email: userInfo.email,
							name:  userInfo.name,
							reason,
						},)
					}
				}}
			/>
		</div>
	)
}