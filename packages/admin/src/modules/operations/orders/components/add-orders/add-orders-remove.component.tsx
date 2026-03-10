import React from 'react'
import {
	Button, ButtonType, Size, Color,
} from '../../../../../shared/components'
import {
	XmarkSecond,
	TrashIcon,
} from '../../../../../assets/icons'
import * as styles from './modal-style'

interface IOrdersSelectReqProps {
   onClose: () => void
	onDeleteRequest: (requestId: number) => void;
	requestId: number;
}

export const AddOrdersRemove: React.FC<IOrdersSelectReqProps> = ({
	onClose,
	onDeleteRequest,
	requestId,
},) => {
	const closeModalWrapper = (): void => {
		onClose()
		onDeleteRequest(requestId,)
	}
	return (
		<div className={styles.clientBlur}>
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
				<TrashIcon width={42} height={42} className={styles.addModalImg} />
				<h3 className={styles.addModalTitle}>Remove connected request</h3>
				<p className={styles.addModalText}>
					Are you sure you want to remove 12345 request?
				</p>
				<div className={styles.addModalBtns}>
					<Button<ButtonType.TEXT>
						onClick={onClose}
						additionalProps={{
							btnType: ButtonType.TEXT,
							text:    'Cancel',
							size:    Size.MEDIUM,
							color:   Color.SECONDRAY_GRAY,
						}}
					/>
					<Button<ButtonType.TEXT>
						onClick={closeModalWrapper}
						additionalProps={{
							btnType: ButtonType.TEXT,
							text:    'Remove request',
							size:    Size.MEDIUM,
							color:   Color.SECONDARY_RED,
						}}
					/>
				</div>
			</div>
		</div>
	)
}
