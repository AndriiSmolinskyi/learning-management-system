import * as React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../../../shared/components'
import {
	CloseXIcon,
} from '../../../../../../assets/icons'
import {
	useAddPortfolioStore,
} from '../../store/step.store'
import {
	useDeletePortfolio,
} from '../../../../../../shared/hooks/portfolio'
import {
	ReactComponent as WarningIcon,
} from '../../../../../../assets/icons/warning-yellow-icon.svg'

import * as styles from './close-portfolio-creation.styles'

interface IClosePortfolioCreationContentProps {
    onClose: () => void
	handleDrawerToggle: () => void
	draftStep?: number
	isSubportfolio?: boolean
}

export const ClosePortfolioCreationContent: React.FC<IClosePortfolioCreationContentProps> = ({
	onClose,handleDrawerToggle, draftStep, isSubportfolio,
},) => {
	const {
		portfolioId, clearPortfolioId, reset,
	} = useAddPortfolioStore()
	const {
		mutateAsync: deletePortfolio,
	} = useDeletePortfolio()
	const handleDeleteDraft = async(id: string | null,): Promise<void> => {
		if (id) {
			await deletePortfolio(id,)
		}
		onClose()
		handleDrawerToggle()
		clearPortfolioId()
		reset()
	}
	const handleClose = (): void => {
		onClose()
		handleDrawerToggle()
		clearPortfolioId()
		reset()
	}
	return (
		<div className={styles.modalWrapper}>
			<CloseXIcon className={styles.closeIcon} onClick={onClose}/>
			<WarningIcon/>
			<p className={styles.selectText}>{isSubportfolio ?
				'Exit sub-portfolio creation' :
				'Exit portfolio creation'}</p>
			<p className={styles.infoText}>Are you sure you want to leave without saving? All unsaved progress will be lost.</p>
			<div className={styles.buttonBlock}>
				<Button<ButtonType.TEXT>
					disabled={false}
					onClick={async() => {
						await handleDeleteDraft(portfolioId,)
					}}
					className={styles.button}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Exit unsaved',
						size:     Size.MEDIUM,
						color:    Color.SECONDARY_RED,
					}}
				/>
				<Button<ButtonType.TEXT>
					disabled={!Boolean(portfolioId,) && (!draftStep || draftStep === 1)}
					onClick={handleClose}
					className={styles.button}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Save as draft',
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
				/>
			</div>

		</div>
	)
}