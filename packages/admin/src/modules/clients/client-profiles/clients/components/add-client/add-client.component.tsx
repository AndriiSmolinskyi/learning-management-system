import * as React from 'react'
import {
	ReactComponent as Xmark,
} from '../../../../../../assets/icons/xmark.svg'
import {
	Button, ButtonType, Size, Color, LabeledProgressBar,
} from '../../../../../../shared/components'
import {
	AddClientForm,
} from './add-client-form.component'
import {
	addClientFormSteps,
} from '../../utils/add-client-steps.utils'
import {
	useAddClientStore,
} from '../../store'
import {
	useDocumentStore,
} from '../../../../../../store/document.store'
import {
	AddClientExit,
} from './add-client-exit.component'
import type {
	ClientFormValues,
} from '../../clients.types'
import {
	Dialog,
} from '../../../../../../shared/components'
import * as styles from './add-client.styles'

interface IAddClientProps {
	isConfirmExitVisible: boolean
	draft?: ClientFormValues
	onClose: () => void
	toggleAddClientSuccess: () => void
	handleSetClientDataSuccess: (id: string, email: string) => void
	handleClose: () => void
	handleCancelExit: () => void
}

export const AddClient: React.FunctionComponent<IAddClientProps> = ({
	isConfirmExitVisible,
	draft,
	onClose,
	toggleAddClientSuccess,
	handleSetClientDataSuccess,
	handleClose,
	handleCancelExit,
},) => {
	const {
		step, values, resetStore,
	} = useAddClientStore()
	const {
		clearDocuments,
	} = useDocumentStore()

	const handleExit = (): void => {
		onClose()
		handleCancelExit()
		clearDocuments()
		setTimeout(() => {
			resetStore()
		}, 500,)
	}

	const steps = addClientFormSteps(values,)

	return (
		<div>
			<div className={styles.addClientContainer}>
				<div className={styles.addClientHeader}>
					<h2 className={styles.addTitle}>Add new client</h2>
					<Button<ButtonType.ICON>
						onClick={handleClose}
						additionalProps={{
							btnType: ButtonType.ICON,
							icon:    <Xmark width={36} height={36} />,
							size:    Size.MEDIUM,
							color:   Color.NONE,
						}}
					/>
				</div>
				<LabeledProgressBar currentStep={step} steps={steps} />
				<AddClientForm
					onClose={onClose}
					toggleAddClientSuccess={toggleAddClientSuccess}
					handleSetClientDataSuccess={handleSetClientDataSuccess}
					draft={draft}
				/>
			</div>
			<Dialog
				onClose={handleCancelExit}
				open={isConfirmExitVisible}
			>
				<AddClientExit
					onExit={handleExit}
					onCancel={handleCancelExit}
					onClose={onClose}
				/>
			</Dialog>
		</div>
	)
}
