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
	useDeleteTransactionTypeCategory,
} from '../../../../shared/hooks/settings/transaction-settings.hook'
import * as styles from './table.style'

interface IDeleteModalProps {
	onClose: () => void
	categoryId: string | undefined
}

export const DeleteCategoryModal: React.FC<IDeleteModalProps> = ({
	onClose,
	categoryId,
},) => {
	const {
		mutateAsync: deleteCategory,
		isPending: isDeleting,
	} = useDeleteTransactionTypeCategory()
	const handleDelete = async(): Promise<void> => {
		if (categoryId) {
			await deleteCategory(categoryId,)
			onClose()
		}
	}

	return (
		<div className={styles.exitModalWrapper}>
			<TrashIcon width={42} height={42}/>
			<h4>Delete category</h4>
			<p className={styles.parText}>Are you sure you want to delete this category? This action cannot be undone.</p>
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