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
} from '../../../../../../shared/components/button'
import {
	Eye,
	PenSquare,
	ArchiveRestore,
	MessagePlus,
	Archive,
	Trash,
} from '../../../../../../assets/icons'
import {
	actionBtn,
	dialogContainer,
	menuActions,
	popoverBackdrop,
	popoverContainer,
	deactivateBtn,
	activateBtn,
} from '../../clients.style'
import type {
	Client,
} from '../../../../../../shared/types'
import {
	useEditClientStore,
} from '../../../client-details/store/edit-client.store'

interface IProps {
	client: Client
	handleViewDetailsClick: (clientId: string) => void
	handleEditButtonClick: (client: Client) => void
	handleActivate: (id: string) => Promise<void>
	handleDeactivate: (id: string) => Promise<void>
	setClientModalData: (client: Client | null) => void
	handleCloseCommentDialog: () => void
	children: React.ReactNode
	setDialogOpen: (value: boolean) => void
	handleOpenDeleteModal: (clientId: string) => void
	usePortal?: boolean
}

export const ClientItemModal: React.FC<IProps> = ({
	client,
	handleViewDetailsClick,
	handleEditButtonClick,
	handleActivate,
	handleDeactivate,
	setClientModalData,
	handleCloseCommentDialog,
	setDialogOpen,
	handleOpenDeleteModal,
	children,
	usePortal = false,
},) => {
	const {
		setMutatedClientIds,
	} = useEditClientStore()
	const content = (
		<div className={dialogContainer}>
			<div className={menuActions}>
				{!client.isActivated && (
					<div className={activateBtn}>
						<Button<ButtonType.TEXT>
							onClick={async() => {
								setMutatedClientIds(client.id,)
								await handleActivate(client.id,)
								setDialogOpen(false,)
							}}
							className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
							additionalProps={{
								btnType:  ButtonType.TEXT,
								text:     'Restore',
								leftIcon: <ArchiveRestore width={20} height={20} />,
								size:     Size.MEDIUM,
								color:    Color.NON_OUT_GREEN,
							}}
						/>
					</div>
				)}
				<Button<ButtonType.TEXT>
					onClick={() => {
						handleViewDetailsClick(client.id,)
						setDialogOpen(false,)
					}}
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
					onClick={() => {
						setDialogOpen(false,)
						setTimeout(() => {
							handleEditButtonClick(client,)
						}, 300,)
					}}
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
					onClick={() => {
						setDialogOpen(false,)
						setClientModalData(client,)
						setTimeout(() => {
							handleCloseCommentDialog()
						}, 300,)
					}}
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Add comment',
						leftIcon: <MessagePlus width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>

				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					onClick={() => {
						handleOpenDeleteModal(client.id,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Delete',
						leftIcon: <Trash width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_RED,
					}}
				/>
				{client.isActivated && (
					<div className={deactivateBtn}>
						<Button<ButtonType.TEXT>
							onClick={async() => {
								setMutatedClientIds(client.id,)
								await handleDeactivate(client.id,)
								setDialogOpen(false,)
							}}
							className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
							additionalProps={{
								btnType:  ButtonType.TEXT,
								text:     'Deactivate',
								leftIcon: <Archive width={20} height={20} />,
								size:     Size.MEDIUM,
								color:    Color.NON_OUT_RED,
							}}
						/>
					</div>
				)}
			</div>
		</div>)

	return (
		<Popover
			usePortal={usePortal}
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
