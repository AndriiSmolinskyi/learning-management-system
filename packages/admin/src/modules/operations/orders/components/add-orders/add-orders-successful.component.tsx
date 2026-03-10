import React from 'react'
import {
	Button, ButtonType, Size, Color,
} from '../../../../../shared/components'
import {
	XmarkSecond,
	Check,
} from '../../../../../assets/icons'
import {
	useCreatedOrderStore,
} from '../create-order.store'
import * as styles from './modal-style'
import type {
	IOrder,
} from '../../../../../shared/types'

interface IOrdersSelectReqProps {
	onClose: () => void
	handleViewDrawer: () => void
	handleSetOrder: (order: IOrder) => void
}

export const AddOrderSuccessful: React.FC<IOrdersSelectReqProps> = ({
	onClose,
	handleViewDrawer,
	handleSetOrder,
},) => {
	const {
		resetCreatedOrder, createdOrder,
	} = useCreatedOrderStore()

	const handleViewDetails = (): void => {
		handleViewDrawer()
		if (createdOrder) {
			handleSetOrder(createdOrder,)
		}
		onClose()
		resetCreatedOrder()
	}

	const handleClose = (): void => {
		resetCreatedOrder()
		onClose()
	}

	return (
		<div className={styles.addModalBlock}>
			<div className={styles.addModalCancel}>
				<Button<ButtonType.ICON>
					onClick={handleClose}
					additionalProps={{
						btnType: ButtonType.ICON,
						icon:    <XmarkSecond width={24} height={24} />,
						size:    Size.MEDIUM,
						color:   Color.NONE,
					}}
				/>
			</div>
			<Check width={42} height={42} className={styles.addModalImg} />
			<h3 className={styles.addModalTitle}>New order added!</h3>
			<Button<ButtonType.TEXT>
				className={styles.viewDetails}
				onClick={handleViewDetails}
				additionalProps={{
					btnType: ButtonType.TEXT,
					text:    'View details',
					size:    Size.MEDIUM,
					color:   Color.SECONDRAY_GRAY,
				}}
			/>
		</div>
	)
}
