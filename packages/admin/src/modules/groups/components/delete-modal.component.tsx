import React from 'react'

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
	useDeleteGroup,
} from '../../../shared/hooks/groups/groups.hook'
import * as styles from './table.style'

interface IDeleteModalProps {
	onClose: () => void
	groupId: string | undefined
}

export const DeleteModal: React.FC<IDeleteModalProps> = ({
	onClose,
	groupId,
},) => {
	const {
		mutateAsync: deleteGroup,
		isPending: isDeleting,
	} = useDeleteGroup()

	const handleDelete = async(): Promise<void> => {
		if (groupId) {
			await deleteGroup(groupId,)
			onClose()
		}
	}

	return (
		<div className={styles.exitModalWrapper}>
			<TrashIcon width={42} height={42} />
			<h4>Delete group</h4>
			<p className={styles.parText}>Are you sure you want to delete this group? This action cannot be undone.</p>
			<div className={styles.exitModalbuttonBlock}>
				<Button<ButtonType.TEXT>
					className={styles.viewDetailsButton}
					onClick={onClose}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Cancel',
						size:    Size.MEDIUM,
						color:   Color.SECONDRAY_GRAY,
					}}
				/>
				<Button<ButtonType.TEXT>
					disabled={isDeleting}
					className={styles.addButton}
					onClick={handleDelete}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Delete',
						size:    Size.MEDIUM,
						color:   Color.SECONDARY_RED,
					}}
				/>
			</div>
		</div>
	)
}