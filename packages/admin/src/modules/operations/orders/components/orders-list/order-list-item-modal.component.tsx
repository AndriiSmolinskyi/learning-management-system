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
} from '../../../../../shared/components/button'
import {
	Eye,
	PenSquare,
	DownoloadBlue,
	Trash,
} from '../../../../../assets/icons'
import {
	actionBtn,
	dialogContainer,
	menuActions,
	popoverBackdrop,
	popoverContainer,
} from './order-list-item.style'

interface IProps {
	children: React.ReactNode
	setDialogOpen: (value: boolean) => void
	handleOpenDrawer: () => void
	handleOpenEdit: () => void
	handleDownload: () => void
	handleOpenDeleteModal: (orderId: number) => void
	orderId: number
}

export const OrderListItemModal: React.FC<IProps> = ({
	children,
	setDialogOpen,
	handleOpenDrawer,
	handleOpenEdit,
	handleDownload,
	handleOpenDeleteModal,
	orderId,
},) => {
	const content = (
		<div className={dialogContainer}>
			<div className={menuActions}>
				<Button<ButtonType.TEXT>
					onClick={
						() => {
							setTimeout(() => {
								handleOpenDrawer()
							}, 300,)
						}
					}
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'View details',
						leftIcon: <Eye width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={
						() => {
							setTimeout(() => {
								handleOpenEdit()
							}, 300,)
						}
					}
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Edit',
						leftIcon: <PenSquare width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={handleDownload}
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Download',
						leftIcon: <DownoloadBlue width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					onClick={() => {
						handleOpenDeleteModal(orderId,)
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