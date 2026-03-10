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
	Check,
} from '../../../../../assets/icons'
import {
	RouterKeys,
} from '../../../../../router/keys'

import * as styles from './succes-modal.styles'

interface IExitModalProps {
	toggleVisible: () => void
	budgetId?: string
}

export const SuccessCategoriesModal: React.FC<IExitModalProps> = ({
	toggleVisible,
	budgetId,
},) => {
	const navigate = useNavigate()
	const handleNavigate = (e: React.MouseEvent,): void => {
		toggleVisible()
		if (budgetId) {
			navigate(`${RouterKeys.BUDGET_MANAGMENT}/${budgetId}`,)
		}
	}

	return (
		<div className={styles.exitModalWrapper}>
			<Check width={42} height={42}/>
			<h4>Expanse categories created!</h4>
			<div className={styles.successModalbuttonBlock}>
				<Button<ButtonType.TEXT>
					onClick={handleNavigate}
					className={styles.addButton}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'View budget details',
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
				/>
			</div>
		</div>
	)
}