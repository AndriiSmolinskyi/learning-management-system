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
	useDeleteOrder,
} from '../../../../../shared/hooks'

import * as styles from './delete-order-modal.styles'

interface IDeleteModalProps {
	onClose: () => void
	orderId: number | undefined
}

export const DeleteOrderModal: React.FC<IDeleteModalProps> = ({
	onClose,
	orderId,
},) => {
	const {
		mutateAsync: deleteOrder,
		isPending: isDeleting,
	} = useDeleteOrder()
	const handleDelete = async(): Promise<void> => {
		if (orderId) {
			await deleteOrder(orderId,)
			onClose()
		}
	}

	return (
		<div className={styles.exitModalWrapper}>
			<WarningIcon width={42} height={42}/>
			<h4>Are you sure you want to delete this order?</h4>
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