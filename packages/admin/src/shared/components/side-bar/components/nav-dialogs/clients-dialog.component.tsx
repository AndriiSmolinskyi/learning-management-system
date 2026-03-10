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
	ReactComponent as UserSquare,
} from '../../../../../assets/icons/user-square-icon.svg'
import {
	ReactComponent as Briefcase,
} from '../../../../../assets/icons/briefcase-icon.svg'
import {
	Button, ButtonType, Color, Size,
} from '../../../button'

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
} from './dialog.styles'

interface IProps {
	children: React.ReactNode
	popoverRef?: React.MutableRefObject<null>
	toggleOpen: () => void
}

export const ClientsDialog: React.FC<IProps> = ({
	children,
	popoverRef,
	toggleOpen,
},) => {
	const {
		setVisible,
	} = useBackdrop()
	const navigate = useNavigate()
	const location = useLocation()
	const isClients = location.pathname.includes(RouterKeys.CLIENTS,)
	const isPortfolio = location.pathname.includes(RouterKeys.PORTFOLIO,)
	const content = (
		<div className={clientsDialogContainer}>
			<h4 className={clientsHeader}>Clients</h4>
			<div className={clientBtnMargin}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, clientsBtn, buttonLinkIcon(isClients,),)}
					onClick={() => {
						navigate(RouterKeys.CLIENTS,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Client profiles',
						leftIcon: <UserSquare width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    isClients ?
							Color.BLUE :
							Color.NON_OUT_BLUE,
					}}
				/>
			</div>
			<Button<ButtonType.TEXT>
				className={cx(Classes.POPOVER_DISMISS, clientsBtn, buttonLinkIcon(isPortfolio,),)}
				onClick={() => {
					navigate(RouterKeys.PORTFOLIO,)
				}}
				additionalProps={{
					btnType:  ButtonType.TEXT,
					text:     'Portfolio',
					leftIcon: <Briefcase width={20} height={20} />,
					size:     Size.MEDIUM,
					color:    isPortfolio ?
						Color.BLUE :
						Color.NON_OUT_BLUE,
				}}
			/>
		</div>)

	return (
		<Popover
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