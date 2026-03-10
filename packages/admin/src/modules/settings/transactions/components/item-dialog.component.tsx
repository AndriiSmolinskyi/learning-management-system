import React from 'react'

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
} from '../../../../shared/components/button'
import {
	Link,
	Trash,
	ArchiveRestore,
	Archive,
	PenSquare,
} from '../../../../assets/icons'
import type {
	ITransactionType,
} from '../../../../shared/types'
import {
	useChangeActivatedStatus,
} from '../../../../shared/hooks/settings/transaction-settings.hook'
import {
	useUserStore,
} from '../../../../store/user.store'
import {
	Roles,
} from '../../../../shared/types'
import * as styles from './table.style'

interface IProps {
	children: React.ReactNode
	transactionType: ITransactionType
	setDialogOpen: (value: boolean) => void
	toggleRelationsVisible: (id: string) => void
	toggleUpdateVisible: (id: string) => void
	handleOpenDeleteModal: (transactionTypeId: string) => void
}

export const ItemDialog: React.FC<IProps> = ({
	children,
	transactionType,
	setDialogOpen,
	toggleRelationsVisible,
	toggleUpdateVisible,
	handleOpenDeleteModal,
},) => {
	const {
		mutateAsync: handleUpdateStatus,
	} = useChangeActivatedStatus()
	const [hasPermission, setHasPermission,] = React.useState<boolean>(false,)

	const {
		userInfo,
	} = useUserStore()

	React.useEffect(() => {
		const permission = userInfo.roles.some((role,) => {
			return [Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		setHasPermission(permission,)
	}, [userInfo,],)

	const content = (
		<div className={styles.dialogContainer}>
			{!transactionType.isActivated && (
				<div className={styles.activateBtn}>
					<Button<ButtonType.TEXT>
						onClick={async() => {
							if (transactionType.id) {
								await handleUpdateStatus({
									id: transactionType.id, activatedStatus: true,
								},)
								setDialogOpen(false,)
							}
						}}
						className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
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
				className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
				onClick={() => {
					if (transactionType.id) {
						setTimeout(() => {
							toggleRelationsVisible(transactionType.id!,)
						}, 300,)
					}
				}}
				additionalProps={{
					btnType:  ButtonType.TEXT,
					text:     'Relations',
					leftIcon: <Link width={20} height={20} />,
					size:     Size.MEDIUM,
					color:    Color.NON_OUT_BLUE,
				}}
			/>
			<Button<ButtonType.TEXT>
				className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
				onClick={() => {
					setTimeout(() => {
						if (transactionType.id) {
							toggleUpdateVisible(transactionType.id,)
						}
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
			{transactionType.isActivated && (
				<div className={styles.deactivateBtn}>
					<Button<ButtonType.TEXT>
						onClick={async() => {
							if (transactionType.id) {
								await handleUpdateStatus({
									id: transactionType.id, activatedStatus: false,
								},)
								setDialogOpen(false,)
							}
						}}
						className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
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
			{transactionType.isActivated === false && hasPermission && (
				<div className={styles.deactivateBtn}>
					<Button<ButtonType.TEXT>
						className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
						onClick={() => {
							setTimeout(() => {
								if (transactionType.id) {
									handleOpenDeleteModal(transactionType.id,)
								}
							}, 300,)
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
			)}
		</div>)

	return (
		<Popover
			usePortal={true}
			hasBackdrop={true}
			backdropProps={{
				className: styles.popoverBackdrop,
			}}
			placement='left-end'
			content={content}
			popoverClassName={cx(
				styles.popoverContainer,
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