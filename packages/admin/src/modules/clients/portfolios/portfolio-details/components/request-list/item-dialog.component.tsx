import React from 'react'
import {
	useNavigate,
} from 'react-router-dom'
import {
	Classes,
	Popover,
} from '@blueprintjs/core'
import {
	cx,
} from '@emotion/css'

import {
	Button, ButtonType, Color, Size,
} from '../../../../../../shared/components/button'
import {
	Eye,
	PenSquare,
	ListPlus,
} from '../../../../../../assets/icons'

import {
	RouterKeys,
} from '../../../../../../router/keys'
import {
	RequestType,
	type IRequest,
} from '../../../../../../shared/types'

import {
	actionBtn,
	dialogContainer,
	menuActions,
	popoverBackdrop,
	popoverContainer,
} from './request-list.styles'

interface IProps {
	children: React.ReactNode
	request: IRequest
	setDialogOpen: (value: boolean) => void
}

export const RequestItemDialog: React.FC<IProps> = ({
	children,
	request,
	setDialogOpen,
},) => {
	const navigate = useNavigate()

	const content = (
		<div className={dialogContainer}>
			<div className={menuActions}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					onClick={() => {
						navigate(RouterKeys.REQUESTS, {
							state: {
								details: {
									requestId: request.id,
								},
							},
						},)
						setDialogOpen(false,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'View details',
						leftIcon: <Eye width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					onClick={() => {
						navigate(RouterKeys.REQUESTS, {
							state: {
								edit: {
									requestId: request.id,
								},
							},
						},)
						setDialogOpen(false,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Edit',
						leftIcon: <PenSquare width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				{(request.type === RequestType.BUY || request.type === RequestType.SELL) && <Button<ButtonType.TEXT>
					onClick={() => {
						navigate(RouterKeys.ORDERS,)
						setDialogOpen(false,)
					}}
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     `Add ${request.type.toLowerCase()} order`,
						leftIcon: <ListPlus width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>}
			</div>
		</div>)

	return (
		<Popover
			usePortal={true}
			hasBackdrop={true}
			backdropProps={{
				className: popoverBackdrop,
			}}
			placement='left-end'
			content={content}
			popoverClassName={cx(
				popoverContainer,
				Classes.POPOVER_DISMISS,
			)}
			onClosing={() => {
				setDialogOpen(false,)
			}}
			autoFocus={false}
			enforceFocus={false}
		>
			{children}
		</Popover>
	)
}