import * as React from 'react'
import {
	useNavigate,
} from 'react-router-dom'

import {
	Check,
} from '../../../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
	Dialog,
} from '../../../../../../shared/components'
import {
	CloseXIcon,
} from '../../../../../../assets/icons'
import {
	RouterKeys,
} from '../../../../../../router/keys'
import {
	useAddPortfolioStore,
} from '../../store/step.store'

import * as styles from './success-modal.styles'

import {
	usePortfolioStateStore,
} from '../../store/portfolio-state.store'

interface ISuccessModalProps {
    onClose: () => void
    isOpen: boolean
}
export const SuccessModal: React.FC<ISuccessModalProps> = ({
	onClose,
	isOpen,
},) => {
	const navigate = useNavigate()
	const {
		createdPortfolioId, clearCreatedPortfolioId, reset, createdMainPortfolioId,
	} = useAddPortfolioStore()
	const {
		setIsSuccessModalVisible,
	} = usePortfolioStateStore()
	const handleNavigateToDetails = (): void => {
		clearCreatedPortfolioId()
		setIsSuccessModalVisible(false,)
		reset()
		if (createdMainPortfolioId) {
			navigate(`${RouterKeys.PORTFOLIO}/${createdMainPortfolioId}/${RouterKeys.SUB_PORTFOLIO}/${createdPortfolioId}`,)
		} else {
			navigate(`${RouterKeys.PORTFOLIO}/${createdPortfolioId}`,)
		}
	}
	return (
		<Dialog open={isOpen} onClose={() => {
			onClose()
			clearCreatedPortfolioId()
			reset()
			setIsSuccessModalVisible(false,)
		}} className={styles.modalWrapper}>
			<CloseXIcon className={styles.closeIcon} onClick={onClose}/>
			<Check width={42} height={42}/>
			<p className={styles.successText}>{createdMainPortfolioId ?
				'New sub-portfolio added!' :
				'New portfolio added!'}</p>

			<Button<ButtonType.TEXT>
				onClick={handleNavigateToDetails}
				className={styles.button}
				additionalProps={{
					btnType:  ButtonType.TEXT,
					text:     'View details',
					size:     Size.MEDIUM,
					color:    Color.SECONDRAY_COLOR,
				}}
			/>
		</Dialog>
	)
}