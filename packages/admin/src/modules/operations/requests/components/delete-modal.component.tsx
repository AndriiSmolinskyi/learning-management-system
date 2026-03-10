import * as React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import {
	WarningIcon,
} from '../../../../assets/icons'
import {
	useDeleteRequest,
} from '../../../../shared/hooks'

import * as styles from '../requests.styles'

interface IDeleteModalProps {
	onClose: () => void
	requestId: number | undefined
}

export const DeleteRequestModal: React.FC<IDeleteModalProps> = ({
	onClose,
	requestId,
},) => {
	const {
		mutateAsync: deleteRequest,
		isPending: isDeleting,
	} = useDeleteRequest()
	const handleDelete = async(): Promise<void> => {
		if (requestId) {
			await deleteRequest(requestId,)
			onClose()
		}
	}

	return (
		<div className={styles.exitModalWrapper}>
			<WarningIcon width={42} height={42}/>
			<h4>Are you sure you want to delete this request?</h4>
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