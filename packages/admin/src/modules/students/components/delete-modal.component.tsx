import * as React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../shared/components'
import {
	TrashIcon,
} from '../../../assets/icons'
import {
	useDeleteStudent,
} from '../../../shared/hooks/students/students.hooks'
import * as styles from './table.style'

interface IDeleteModalProps {
	onClose: () => void
	studentId: string | undefined
}

export const DeleteModal: React.FC<IDeleteModalProps> = ({
	onClose,
	studentId,
},) => {
	const {
		mutateAsync: deleteTransactionType,
		isPending: isDeleting,
	} = useDeleteStudent()

	const handleDelete = async(): Promise<void> => {
		if (studentId) {
			await deleteTransactionType(studentId,)
			onClose()
		}
	}

	return (
		<div className={styles.exitModalWrapper}>
			<TrashIcon width={42} height={42}/>
			<h4>Delete student</h4>
			<p className={styles.parText}>Are you sure you want to delete this student? This action cannot be undone.</p>
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