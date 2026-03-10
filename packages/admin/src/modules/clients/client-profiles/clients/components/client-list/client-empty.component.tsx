import * as React from 'react'
import {
	AddClient,
} from '../add-client/add-client.component'
import {
	AddClientSuccess,
} from '../add-client/add-client-success.component'
import {
	EmptyState,
	Plus,
} from '../../../../../../assets/icons'
import {
	Button, ButtonType, Size, Color,
} from '../../../../../../shared/components'
import {
	toggleState,
} from '../../../../../../shared/utils/react-state-toggle.util'
import {
	AddPortfolio,
} from '../../../../portfolios/portfolio/components/add-portfolio/add-portfolio.component'
import {
	Dialog,
	Drawer,
} from '../../../../../../shared/components'

import * as styles from './client-empty.style'

export const ClientEmpty: React.FC = () => {
	const [isAddClientVisible, setIsAddClientVisible,] = React.useState(false,)
	const [addClientSucces, setAddClientSuccess,] = React.useState(false,)
	const [clientDataSuccess, setClientDataSuccess,] = React.useState<{ id: string, email: string }>({
		id:    '',
		email: '',
	},)
	const [isDrawerOpen, setIsDrawerOpen,] = React.useState<boolean>(false,)

	const toggleAddClientModal = toggleState(setIsAddClientVisible,)
	const toggleAddClientSuccess = toggleState(setAddClientSuccess,)
	const toggleAddPortfolio = toggleState(setIsDrawerOpen,)

	const handleSetClientDataSuccess = (id: string, email: string,): void => {
		setClientDataSuccess({
			id, email,
		},)
	}

	const [isConfirmExitVisible, setIsConfirmExitVisible,] = React.useState(false,)

	const handleClose = (): void => {
		if (!isConfirmExitVisible) {
			setIsConfirmExitVisible(true,)
		}
	}

	const handleCancelExit = (): void => {
		setIsConfirmExitVisible(false,)
	}

	const handleCloseAddClient = (): void => {
		toggleAddClientModal()
	}

	return (
		<div className={styles.emptyContainer}>

			<EmptyState width={164} height={164}/>
			<p className={styles.emptyText}>Nothing here yet. Add client to get started</p>
			<Button<ButtonType.TEXT>
				disabled={false}
				onClick={toggleAddClientModal}
				additionalProps={{
					btnType:  ButtonType.TEXT,
					text:     'Add client',
					leftIcon: <Plus width={20} height={20} />,
					size:     Size.SMALL,
					color:    Color.BLUE,
				}}
			/>
			<Drawer
				isOpen={isAddClientVisible}
				onClose={handleClose}
			>
				<AddClient
					onClose={handleCloseAddClient}
					toggleAddClientSuccess={toggleAddClientSuccess}
					handleSetClientDataSuccess={handleSetClientDataSuccess}
					handleClose={handleClose}
					handleCancelExit={handleCancelExit}
					isConfirmExitVisible={isConfirmExitVisible}
				/>
			</Drawer>
			<Dialog
				onClose={toggleAddClientSuccess}
				open={addClientSucces}
			>
				<AddClientSuccess
					toggleAddClientSuccess={toggleAddClientSuccess}
					handleSetClientDataSuccess={handleSetClientDataSuccess}
					clientDataSuccess={clientDataSuccess}
					toggleAddPortfolio={toggleAddPortfolio}
				/>
			</Dialog>
			<AddPortfolio
				clientId={clientDataSuccess.id}
				setIsDrawerOpen={setIsDrawerOpen}
				isDrawerOpen={isDrawerOpen}
			/>
		</div>
	)
}