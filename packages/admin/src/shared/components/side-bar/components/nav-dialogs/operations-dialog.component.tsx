import React from 'react'
import {
	useNavigate,
	useLocation,
} from 'react-router-dom'
import {
	Classes,
	Popover,
} from '@blueprintjs/core'
import {
	cx,
} from '@emotion/css'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../button'
import {
	OrdersIcon,
	RequestIcon,
	Send,
} from '../../../../../assets/icons'

import {
	useBackdrop,
} from '../../../../../store/backdrop.store'
import {
	RouterKeys,
} from '../../../../../router/keys'

import {
	clientBtnMargin,
	clientsBtn,
	clientsDialogContainer,
	clientsHeader,
	popoverContainer,
	buttonLinkIcon,
	marginTop6,
} from './dialog.styles'

interface IProps {
	children: React.ReactNode
	popoverRef?: React.MutableRefObject<null>
	toggleOpen: () => void
}

export const OperationsDialog: React.FC<IProps> = ({
	children,
	popoverRef,
	toggleOpen,
},) => {
	const {
		setVisible,
	} = useBackdrop()
	const navigate = useNavigate()
	const location = useLocation()
	const isRequests = location.pathname.includes(RouterKeys.REQUESTS,)
	const isOrders = location.pathname.includes(RouterKeys.ORDERS,)
	const isTransactions = location.pathname.includes(RouterKeys.TRANSACTIONS,)

	const content = (
		<div className={clientsDialogContainer}>
			<h4 className={clientsHeader}>Operations</h4>
			<div className={clientBtnMargin}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, clientsBtn, buttonLinkIcon(isRequests,),)}
					onClick={() => {
						navigate(RouterKeys.REQUESTS,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Requests',
						leftIcon: <RequestIcon width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    isRequests ?
							Color.BLUE :
							Color.NON_OUT_BLUE,
					}}
				/>
			</div>
			<Button<ButtonType.TEXT>
				className={cx(Classes.POPOVER_DISMISS, clientsBtn, buttonLinkIcon(isOrders,),)}
				onClick={() => {
					navigate(RouterKeys.ORDERS,)
				}}
				additionalProps={{
					btnType:  ButtonType.TEXT,
					text:     'Orders',
					leftIcon: <OrdersIcon width={20} height={20} />,
					size:     Size.MEDIUM,
					color:    isOrders ?
						Color.BLUE :
						Color.NON_OUT_BLUE,
				}}
			/>
			<div className={marginTop6}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, clientsBtn, buttonLinkIcon(isTransactions,),)}
					onClick={() => {
						navigate(RouterKeys.TRANSACTIONS,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Transactions',
						leftIcon: <Send width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    isTransactions ?
							Color.BLUE :
							Color.NON_OUT_BLUE,
					}}
				/>
			</div>
		</div>
	)

	return (
		<Popover
			usePortal={false}
			placement='right-start'
			content={content}
			popoverClassName={cx(popoverContainer, Classes.POPOVER_DISMISS,)}
			popoverRef={popoverRef}
			onOpening={() => {
				setVisible(true,)
				toggleOpen()
			}}
			onClosing={() => {
				setVisible(false,)
				toggleOpen()
			}}
		>
			{children}
		</Popover>
	)
}