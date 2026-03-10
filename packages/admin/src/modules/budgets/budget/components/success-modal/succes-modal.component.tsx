import * as React from 'react'
import {
	useNavigate,
} from 'react-router-dom'

import {
	RouterKeys,
} from '../../../../../router/keys'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../../shared/components'
import {
	Check,
} from '../../../../../assets/icons'

import * as styles from './succes-modal.styles'

interface IExitModalProps {
	onAddExpenseClick: () => void
	budgetId: string | undefined
}

export const SuccessModal: React.FC<IExitModalProps> = ({
	onAddExpenseClick,
	budgetId,
},) => {
	const navigate = useNavigate()
	const handleNavigate = (e: React.MouseEvent,): void => {
		navigate(`${RouterKeys.BUDGET_MANAGMENT}/${budgetId}`,)
	}
	return (
		<div className={styles.exitModalWrapper}>
			<Check width={42} height={42}/>
			<h4>New budget plan created!</h4>
			<div className={styles.exitModalbuttonBlock}>
				<Button<ButtonType.TEXT>
					onClick={handleNavigate}
					className={styles.viewDetailsButton}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'View details',
						size:     Size.MEDIUM,
						color:    Color.SECONDRAY_GRAY,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={onAddExpenseClick}
					className={styles.addButton}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Add expense categories',
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
				/>
			</div>
		</div>
	)
}