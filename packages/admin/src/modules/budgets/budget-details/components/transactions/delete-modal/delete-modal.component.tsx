import * as React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Input,
	Size,
} from '../../../../../../shared/components'
import {
	TrashIcon,
} from '../../../../../../assets/icons'
import {
	useDeleteTransaction,
} from '../../../../../../shared/hooks'
import type {
	IBudgetTransaction,
} from '../../../../../../shared/types'
import {
	useUserStore,
} from '../../../../../../store/user.store'

import * as styles from './delete-modal.styles'

interface IDeleteModalProps {
	onClose: () => void
	transaction: IBudgetTransaction | undefined
}

export const DeleteTransactionModal: React.FC<IDeleteModalProps> = ({
	onClose,
	transaction,
},) => {
	const [reason, setReason,] = React.useState<string | null>(null,)
	const [showError, setShowError,] = React.useState(false,)
	const {
		mutateAsync: deleteTransaction,
		isPending,
	} = useDeleteTransaction()
	const {
		userInfo,
	} = useUserStore()
	const handleDelete = async(): Promise<void> => {
		if (transaction?.id && userInfo.name && reason) {
			await deleteTransaction({
				id:    transaction.id,
				email: userInfo.email,
				name:  userInfo.name,
				reason,
			},)
		}
		onClose()
	}
	const handleDeletionReason = (e: React.ChangeEvent<HTMLInputElement>,): void => {
		setReason(e.target.value || null,)
		if (e.target.value.trim().length >= 1) {
			setShowError(false,)
		} else {
			setShowError(true,)
		}
	}
	return (
		<div className={styles.exitModalWrapper}>
			<TrashIcon width={42} height={42}/>
			<h4>Delete transaction</h4>
			<p>Are you sure you want to delete {transaction?.id} transaction? This action cannot be undone.</p>
			<Input
				name='search'
				label=''
				input={{
					value:       reason ?? '',
					onChange:    handleDeletionReason,
					placeholder: 'Reason',
					autoFocus:   true,
				}}
				error='Minimum 1 character required'
				showError={showError}
			/>
			<div className={styles.exitModalbuttonBlock}>
				<Button<ButtonType.TEXT>
					className={styles.viewDetailsButton}
					onClick={onClose}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Cancel',
						size:     Size.MEDIUM,
						color:    Color.SECONDRAY_GRAY,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={styles.addButton}
					disabled={isPending}
					onClick={handleDelete}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Delete transaction',
						size:     Size.MEDIUM,
						color:    Color.SECONDARY_RED,
					}}
				/>
			</div>
		</div>
	)
}