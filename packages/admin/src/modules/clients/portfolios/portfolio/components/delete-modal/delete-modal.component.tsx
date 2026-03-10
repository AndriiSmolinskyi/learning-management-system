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
	useDeletePortfolioById,
} from '../../../../../../shared/hooks/portfolio/portfolio.hook'
import {
	RouterKeys,
} from '../../../../../../router/keys'

import * as styles from './delete-modal.styles'

interface IDeleteModalProps {
	onClose: () => void
	portfolioId: string | undefined
	isDetails?: boolean
}

export const DeletePortfolioModal: React.FC<IDeleteModalProps> = ({
	onClose,
	portfolioId,
	isDetails,
},) => {
	const navigate = useNavigate()
	const {
		mutateAsync: deletePortfolio,
		isPending: isDeleting,
	} = useDeletePortfolioById()

	const handleDelete = async(): Promise<void> => {
		if (portfolioId) {
			await deletePortfolio(portfolioId,)
			onClose()
		}
		if (isDetails) {
			navigate(RouterKeys.PORTFOLIO,)
		}
	}
	return (
		<div className={styles.exitModalWrapper}>
			<WarningIcon width={42} height={42}/>
			<h4>Are you sure you want to delete this portfolio?</h4>
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