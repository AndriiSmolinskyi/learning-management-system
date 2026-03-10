import React from 'react'
import {
	Classes,
	Popover,
} from '@blueprintjs/core'
import {
	cx,
} from '@emotion/css'

import {
	Button, ButtonType, Color, Size,
} from '../../../../shared/components/button'
import {
	Eye,
	PenSquare,
	ListPlus,
	Trash,
} from '../../../../assets/icons'
import {
	RequestType,
	type IRequest,
} from '../../../../shared/types'

import {
	actionBtn,
	dialogContainer,
	menuActions,
	popoverBackdrop,
	popoverContainer,
} from '../requests.styles'

interface IProps {
	children: React.ReactNode
	request: IRequest
	setDialogOpen: (value: boolean) => void
	toggleUpdateVisible: (id: number) => void
	toggleDetailsVisible: (id: number) => void
	handleOpenDrawer: () => void
	handleOpenDeleteModal: (requestId: number) => void
}

export const RequestItemDialog: React.FC<IProps> = ({
	children,
	request,
	setDialogOpen,
	toggleUpdateVisible,
	toggleDetailsVisible,
	handleOpenDrawer,
	handleOpenDeleteModal,
},) => {
	const content = (
		<div className={dialogContainer}>
			<div className={menuActions}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					onClick={() => {
						setTimeout(() => {
							toggleDetailsVisible(request.id,)
						}, 300,)
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
						setTimeout(() => {
							toggleUpdateVisible(request.id,)
						}, 300,)
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
						setTimeout(() => {
							handleOpenDrawer()
						}, 300,)
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
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					onClick={() => {
						handleOpenDeleteModal(request.id,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Delete',
						leftIcon: <Trash width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_RED,
					}}
				/>
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
			autoFocus={false}
			enforceFocus={false}
			onClosing={() => {
				setDialogOpen(false,)
			}}
		>
			{children}
		</Popover>
	)
}