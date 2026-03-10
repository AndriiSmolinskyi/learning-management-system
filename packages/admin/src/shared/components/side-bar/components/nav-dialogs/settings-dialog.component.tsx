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
	TransactionSettings,
} from '../../../../../assets/icons'

import {
	useBackdrop,
} from '../../../../../store/backdrop.store'
import {
	RouterKeys,
} from '../../../../../router/keys'

import {
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

export const SettingsDialog: React.FC<IProps> = ({
	children,
	popoverRef,
	toggleOpen,
},) => {
	const {
		setVisible,
	} = useBackdrop()
	const navigate = useNavigate()
	const location = useLocation()
	const isTransactions = location.pathname.includes(RouterKeys.SETTINGS_TRANSACTIONS,)

	const content = (
		<div className={clientsDialogContainer}>
			<h4 className={clientsHeader}>Settings</h4>
			<div className={marginTop6}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, clientsBtn, buttonLinkIcon(isTransactions,),)}
					onClick={() => {
						navigate(RouterKeys.SETTINGS_TRANSACTIONS,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Transactions',
						leftIcon: <TransactionSettings width={20} height={20} />,
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
			usePortal={true}
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
			modifiers={{
				offset: {
					enabled: true,
					options: {
						offset: [2, 10,],
					},
				},
			}}
		>
			{children}
		</Popover>
	)
}