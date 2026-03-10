import * as React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import {
	TrashIcon,
} from '../../../../assets/icons'
import {
	useDeleteTransactionType,
} from '../../../../shared/hooks/settings/transaction-settings.hook'
import * as styles from './table.style'

interface IDeleteModalProps {
	onClose: () => void
	transactionTypeId: string | undefined
}

export const DeleteTransactionTypeModal: React.FC<IDeleteModalProps> = ({
	onClose,
	transactionTypeId,
},) => {
	const {
		mutateAsync: deleteTransactionType,
		isPending: isDeleting,
	} = useDeleteTransactionType()
	const handleDelete = async(): Promise<void> => {
		if (transactionTypeId) {
			await deleteTransactionType(transactionTypeId,)
			onClose()
		}
	}

	return (
		<div className={styles.exitModalWrapper}>
			<TrashIcon width={42} height={42}/>
			<h4>Delete transaction settings</h4>
			<p className={styles.parText}>Are you sure you want to delete this transaction setting? This action cannot be undone.</p>
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
					disabled={isDeleting}
					className={styles.addButton}
					onClick={handleDelete}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Delete',
						size:     Size.MEDIUM,
						color:    Color.SECONDARY_RED,
					}}
				/>
			</div>

		</div>
	)
}