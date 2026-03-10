/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import React from 'react'
import {
	format,
} from 'date-fns'
import {
	cx,
} from '@emotion/css'

import {
	MoreVertical, XmarkMid, TrashIcon,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	CustomDialog,
	Size,
} from '../../../../shared/components'
import {
	TransactionItemDialog,
} from './item-dialog.component'
import {
	useDeleteTransaction,
} from '../../../../shared/hooks'
import {
	TransactionCashFlow,
} from '../../../../shared/types'
import type {
	ITransaction,
} from '../../../../shared/types'
import {
	toggleState,
	localeString,
} from '../../../../shared/utils'
import {
	useTransactionStore,
} from '../transaction.store'
import {
	useUserStore,
} from '../../../../store/user.store'

import * as styles from '../transactions.styles'

type Props = {
	transaction: ITransaction
	toggleUpdateVisible: (transactionId: number) => void
	toggleDetailsVisible: (transactionId: number) => void
	isAllowed: boolean
	setTransactionList?: React.Dispatch<React.SetStateAction<Array<ITransaction>>>
	rowId: number
}

export const TransactionItem: React.FC<Props> = ({
	transaction,
	toggleUpdateVisible,
	toggleDetailsVisible,
	isAllowed,
	setTransactionList,
	rowId,
},) => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState(false,)
	const [showRemoveTransactionDialog, setShowRemoveTransactionDialog,] = React.useState(false,)
	const [transactionId, setTransactionId,] = React.useState<number | undefined>()
	const [reason, setReason,] = React.useState<string | null>(null,)
	const [showError, setShowError,] = React.useState(false,)

	const {
		filter,
		setTransactionIds,
	} = useTransactionStore()
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

	const handleRowClick = React.useCallback((): void => {
		setTransactionIds(filter.transactionIds?.includes(rowId,) ?
			filter.transactionIds.length === 1 ?
				undefined :
				filter.transactionIds.filter((item,) => {
					return item !== rowId
				},) :
			[...(filter.transactionIds ?? []), rowId,],)
	}, [filter,],)
	const handleDeletionReason = (e: React.ChangeEvent<HTMLInputElement>,): void => {
		setReason(e.target.value || null,)
		if (e.target.value.trim().length >= 1) {
			setShowError(false,)
		} else {
			setShowError(true,)
		}
	}
	return (
		<tr
			className={styles.tableRow(Boolean(filter.transactionIds?.includes(rowId,),),)}
			onClick={handleRowClick}>
			<td className={styles.smallTableCell}>
				<div className={styles.menuCell}>
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
				</div>
			</td>
			<td className={cx(styles.smallTableCell, styles.textNowrap,)}>
				{transaction.transactionDate ?
					format(transaction.transactionDate, 'dd.MM.yyyy',) :
					''}
			</td>
			<td className={styles.tableCell}>{transaction.portfolio?.name}</td>
			<td className={styles.tableCell}>{transaction.entity?.name}</td>
			<td className={styles.tableCell}>{transaction.bank?.bankName}</td>
			<td className={styles.tableCell}>{transaction.account?.accountName}</td>
			<td className={styles.tableCell}>{transaction.typeVersion?.name}</td>
			<td className={styles.smallTableCell}>{transaction.currency}</td>
			<td className={cx(styles.tableCell, styles.amountColor(transaction.typeVersion?.cashFlow === TransactionCashFlow.INFLOW,), styles.tableNumberField,)}>
				{
					transaction.typeVersion?.cashFlow === TransactionCashFlow.INFLOW ?
						'+' :
						''
				}
				{localeString(Number(transaction.amount,), '', 2, true,)}
			</td>
			<td className={cx(styles.tableCell, styles.amountColor(transaction.typeVersion?.cashFlow === TransactionCashFlow.INFLOW,), styles.tableNumberField,)}>
				{
					transaction.typeVersion?.cashFlow === TransactionCashFlow.INFLOW ?
						'+' :
						''
				}
				{localeString(Number(transaction.usdValue,), '', 2, true,)}
			</td>

			<td className={cx(styles.bigTableCell, styles.additionalLeftPadding24,)}>{transaction.comment ?? <span className={styles.empty}>- -</span>}</td>
			<td className={styles.tableCell}>{transaction.serviceProvider ?? 'N/A'}</td>
			<td className={styles.tableCell}>{transaction.isin ?? <span className={styles.empty}>- -</span>}</td>
			<td className={styles.tableCell}>{transaction.security ?? <span className={styles.empty}>- -</span>}</td>

			<CustomDialog
				open={showRemoveTransactionDialog}
				icon={<TrashIcon />}
				title='Delete transaction'
				description={`Are you sure you want to delete ${transactionId} transaction? This action cannot be undone.`}
				isCloseButtonShown
				submitBtnColor={Color.SECONDARY_RED}
				submitBtnText='Delete transaction'
				isSubmitBtnDisable={isDeleting}
				reason={reason}
				handleDeletionReason={handleDeletionReason}
				onCancel={() => {
					toggleState(setShowRemoveTransactionDialog,)()
				}}
				showError={showError || !reason}
				onSubmit={async() => {
					if (transactionId && userInfo.name && reason) {
						toggleState(setShowRemoveTransactionDialog,)()
						await deleteTransaction({
							id:    transactionId,
							email: userInfo.email,
							name:  userInfo.name,
							reason,
						},)
						setTransactionList?.((prev,) => {
							return prev.filter((item,) => {
								return item.id !== transactionId
							},)
						},)
					}
				}}
			/>
		</tr>
	)
}
