import * as React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../../shared/components'
import {
	WarningIcon,
} from '../../../../../assets/icons'
import {
	useDeleteExpenseCategoryById,
} from '../../../../../shared/hooks'
import {
	queryKeys,
} from '../../../../../shared/constants'
import {
	useTransactionStore,
} from '../transactions/transaction.store'
import {
	queryClient,
} from '../../../../../providers/query.provider'
import * as styles from './delete-modal.styles'

interface IDeleteModalProps {
	onClose: () => void
	expenseCategoryId: string | undefined
	clientId: string
}

export const DeleteCategoryModal: React.FC<IDeleteModalProps> = ({
	onClose,
	expenseCategoryId,
	clientId,
},) => {
	const {
		filter,
	} = useTransactionStore()
	const {
		mutateAsync: deleteCategory,
	} = useDeleteExpenseCategoryById()
	const handleDelete = async(): Promise<void> => {
		if (expenseCategoryId) {
			await deleteCategory(expenseCategoryId,)
			queryClient.invalidateQueries({
				queryKey: [queryKeys.BUDGET_TRANSACTIONS, {
					...filter, clientId,
				},],
			},)
			onClose()
		}
	}
	return (
		<div className={styles.exitModalWrapper}>
			<WarningIcon width={42} height={42}/>
			<h4>Are you sure you want to delete expense category?</h4>
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