import React from 'react'
import {
	Button, ButtonType, Size, Color,
} from '../../../../../shared/components'
import {
	XmarkSecond,
	AlertImg,
} from '../../../../../assets/icons'
import * as styles from './modal-style'

interface IOrdersSelectReqProps {
   onClose: () => void
	handleClose: () => void
	handleSaveAsDraft: () => void
	isDraftDisabled: boolean
}

export const OrdersSelectExit: React.FC<IOrdersSelectReqProps> = ({
	onClose,
	handleClose,
	handleSaveAsDraft,
	isDraftDisabled,
},) => {
	const closeModalWrapper = (): void => {
		onClose()
		handleClose()
	}

	return (
		<div className={styles.addModalBlock}>
			<div className={styles.addModalCancel}>
				<Button<ButtonType.ICON>
					onClick={onClose}
					additionalProps={{
						btnType: ButtonType.ICON,
						icon:    <XmarkSecond width={24} height={24} />,
						size:    Size.MEDIUM,
						color:   Color.NONE,
					}}
				/>
			</div>
			<AlertImg width={42} height={42} className={styles.addModalImg} />
			<h3 className={styles.addModalTitle}>Exit order creation</h3>
			<p className={styles.addModalText}>
					Are you sure you want to leave without saving? All unsaved progress will be lost.
			</p>
			<div className={styles.addModalBtns}>
				<Button<ButtonType.TEXT>
					onClick={closeModalWrapper}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Exit unsaved',
						size:    Size.MEDIUM,
						color:   Color.SECONDARY_RED,
					}}
				/>
				<Button<ButtonType.TEXT>
					disabled={isDraftDisabled}
					onClick={handleSaveAsDraft}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Save as draft',
						size:    Size.MEDIUM,
						color:   Color.BLUE,
					}}
				/>
			</div>
		</div>
	)
}
