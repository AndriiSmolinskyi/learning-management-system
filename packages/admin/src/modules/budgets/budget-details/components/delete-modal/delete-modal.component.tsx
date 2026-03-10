import * as React from 'react'
import {
	useNavigate,
} from 'react-router-dom'

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
	useDeleteBudgetById,
} from '../../../../../shared/hooks'
import {
	RouterKeys,
} from '../../../../../router/keys'

import * as styles from './delete-modal.styles'

interface IDeleteModalProps {
	onClose: () => void
	budgetId: string | undefined
}

export const DeleteBudgetModal: React.FC<IDeleteModalProps> = ({
	onClose,
	budgetId,
},) => {
	const {
		mutateAsync: deleteBudget,
	} = useDeleteBudgetById()
	const navigate = useNavigate()
	const handleDelete = async(): Promise<void> => {
		if (budgetId) {
			await deleteBudget(budgetId,)
			onClose()
			navigate(RouterKeys.BUDGET_MANAGMENT,)
		}
	}
	return (
		<div className={styles.exitModalWrapper}>
			<WarningIcon width={42} height={42}/>
			<h4>Are you sure you want to delete budget plan?</h4>
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