import React from 'react'
import {
	useNavigate,
} from 'react-router-dom'
import {
	Button, ButtonType, Size, Color,
} from '../../../../../../shared/components'
import {
	Check,
	XmarkSecond,
} from '../../../../../../assets/icons'
import {
	RouterKeys,
} from '../../../../../../router/keys'
import * as styles from './add-client.styles'

interface IAddClientProps {
    toggleAddClientSuccess: () => void;
    handleSetClientDataSuccess: (id: string, email: string) => void
    clientDataSuccess: { id: string; email: string }
	toggleAddPortfolio: () => void;
}

export const AddClientSuccess: React.FC<IAddClientProps> = ({
	toggleAddClientSuccess,
	handleSetClientDataSuccess,
	clientDataSuccess,
	toggleAddPortfolio,
},) => {
	const navigate = useNavigate()

	const handleCloseModal = (): void => {
		toggleAddClientSuccess()
		handleSetClientDataSuccess('', '',)
	}

	const handleViewDetailsClick = (clientId: string,): void => {
		navigate(`${RouterKeys.CLIENTS}/${clientId}`,)
	}

	return (
		<div >
			<div className={styles.addModalBlock}>
				<div className={styles.addModalCancel}>
					<Button<ButtonType.ICON>
						onClick={(e,) => {
							handleCloseModal()
						}}
						additionalProps={{
							btnType:  ButtonType.ICON,
							icon:     <XmarkSecond width={24} height={24}/>,
							size:     Size.MEDIUM,
							color:    Color.NONE,
						}}
					/>
				</div>
				<Check width={42} height={42} className={styles.addModalImg}/>
				<h3 className={styles.addModalTitle}>New client added!</h3>
				<p className={styles.addModalText}>
					Account credits have been sent to <span className={styles.modalEmail}>{clientDataSuccess.email}</span>
				</p>
				<div className={styles.addModalBtns}>
					<Button<ButtonType.TEXT>
						onClick={(e,) => {
							e.stopPropagation()
							handleViewDetailsClick(clientDataSuccess.id,)
							toggleAddClientSuccess()
						}}
						additionalProps={{
							btnType: ButtonType.TEXT,
							text:    'View details',
							size:    Size.MEDIUM,
							color:   Color.SECONDRAY_GRAY,
						}}
					/>
					<Button<ButtonType.TEXT>
						onClick={(e,) => {
							e.stopPropagation()
							toggleAddPortfolio()
							toggleAddClientSuccess()
						}}
						additionalProps={{
							btnType: ButtonType.TEXT,
							text:    'Add portfolio',
							size:    Size.MEDIUM,
							color:   Color.BLUE,
						}}
					/>
				</div>
			</div>
		</div>
	)
}
