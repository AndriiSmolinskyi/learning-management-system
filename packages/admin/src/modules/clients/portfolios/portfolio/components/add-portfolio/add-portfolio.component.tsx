import React from 'react'
import {
	ClosePortfolioCreationContent,
} from '../close-portfolio-creation/close-portfolio-creation.component'
import Dialog from '../../../../../../shared/components/dialog/dialog.component'
import {
	DrawerContent,
} from '../drawer-content/drawer-content.component'
import {
	SuccessModal,
} from '../success-modal/success-modal.component'
import {
	toggleState,
} from '../../../../../../shared/utils'
import type {
	IPortfolio,
} from '../../../../../../shared/types'
import {
	usePortfolioStateStore,
} from '../../store/portfolio-state.store'
import {
	useAddPortfolioStore,
} from '../../store/step.store'
import {
	Drawer,
} from '../../../../../../shared/components'
import * as styles from './add-portfolio.styles'

interface IAddPortfolioProps {
	clientId: string
	isDrawerOpen: boolean
	setIsDrawerOpen: (isDrawerOpen: boolean) => void
	mainPortfolioId?: string
	draftStep?: number
	isSubportfolio?: boolean
	portfolioDraft?: IPortfolio
	isSuccesModalOut?: boolean
	isDraft?: boolean
}

export const AddPortfolio: React.FC<IAddPortfolioProps> = ({
	clientId,
	isDrawerOpen,
	setIsDrawerOpen,
	mainPortfolioId,
	draftStep,
	isSubportfolio,
	portfolioDraft,
	isSuccesModalOut,
	isDraft,
},) => {
	const [isSuccessModalOpen, setIsSuccessModalOpen,] = React.useState<boolean>(false,)
	const [isCloseDialogOpen, setIsCloseDialogOpen,] = React.useState<boolean>(false,)
	const {
		toggleIsSuccessModalVisible,
	} = usePortfolioStateStore()
	const toggleSuccessModalIsOpen = toggleState(setIsSuccessModalOpen,)
	const {
		reset,
	} = useAddPortfolioStore()
	const handleCloseDialogIsOpen = (): void => {
		setIsCloseDialogOpen(!isCloseDialogOpen,)
	}
	const handleDrawerToggle = (): void => {
		if (isCloseDialogOpen) {
			setIsDrawerOpen(!isDrawerOpen,)
		} else {
			setIsCloseDialogOpen(true,)
		}
	}
	const handleDraftClose = (): void => {
		setIsDrawerOpen(!isDrawerOpen,)
		reset()
	}

	return (
		<>
			<Dialog
				isPortalUsed
				open={isCloseDialogOpen}
				onClose={handleCloseDialogIsOpen}
				className={styles.dialog}
			>
				<ClosePortfolioCreationContent
					handleDrawerToggle={handleDrawerToggle}
					onClose={handleCloseDialogIsOpen}
					draftStep={draftStep}
					isSubportfolio={isSubportfolio}
				/>
			</Dialog>
			<Drawer
				isOpen={isDrawerOpen}
				onClose={isDraft ?
					handleDraftClose :
					handleDrawerToggle}
			>
				<DrawerContent
					clientId={clientId}
					onClose={isDraft ?
						handleDraftClose :
						handleDrawerToggle}
					toggleSuccessModalIsOpen={isSuccesModalOut ?
						toggleIsSuccessModalVisible :
						toggleSuccessModalIsOpen}
					handleCloseDialogIsOpen={handleCloseDialogIsOpen}
					onSaveAsSraftClick={() => {
						setIsDrawerOpen(false,)
					}}
					mainPortfolioId={mainPortfolioId}
					portfolioDraft={portfolioDraft}
					draftStep={draftStep}
				/>
			</Drawer>
			<SuccessModal isOpen={isSuccessModalOpen} onClose={toggleSuccessModalIsOpen}/>
		</>
	)
}