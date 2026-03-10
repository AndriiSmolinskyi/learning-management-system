import * as React from 'react'
import {
	useNavigate,
} from 'react-router-dom'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../../../shared/components'
import {
	WarningIcon,
} from '../../../../../../assets/icons'
import {
	useDeleteClientById,
} from '../../../../../../shared/hooks'
import {
	RouterKeys,
} from '../../../../../../router/keys'

import * as styles from './delete-modal.styles'

interface IDeleteModalProps {
	onClose: () => void
	clientId: string | undefined
	isDetails?: boolean
}

export const DeleteClientModal: React.FC<IDeleteModalProps> = ({
	onClose,
	clientId,
	isDetails,
},) => {
	const navigate = useNavigate()
	const {
		mutateAsync: deleteClient,
		isPending: isDeleting,
	} = useDeleteClientById()
	const handleDelete = async(): Promise<void> => {
		if (clientId) {
			await deleteClient(clientId,)
			onClose()
		}
		if (isDetails) {
			navigate(RouterKeys.CLIENTS,)
		}
	}
	return (
		<div className={styles.exitModalWrapper}>
			<WarningIcon width={42} height={42}/>
			<h4>Are you sure you want to delete this client?</h4>
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