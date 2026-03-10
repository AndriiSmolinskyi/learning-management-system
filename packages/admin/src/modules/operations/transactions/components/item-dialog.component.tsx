import {
	Classes,
	Popover,
} from '@blueprintjs/core'
import {
	cx,
} from '@emotion/css'
import React from 'react'

import {
	Eye,
	Trash,
	PenSquare,
} from '../../../../assets/icons'
import {
	Button, ButtonType, Color, Size,
} from '../../../../shared/components/button'
import {
	Roles,
} from '../../../../shared/types'
import {
	useUserStore,
} from '../../../../store/user.store'

import type {
	ITransaction,
} from '../../../../shared/types'

import * as styles from '../transactions.styles'

interface IProps {
	children: React.ReactNode
	transaction: ITransaction
	setDialogOpen: (value: boolean) => void
	toggleUpdateVisible: (transactionId: number) => void
	toggleDetailsVisible: (transactionId: number) => void
	toggleRemoveTransaction: (transactionId: number) => void
}

export const TransactionItemDialog: React.FC<IProps> = ({
	children,
	transaction,
	setDialogOpen,
	toggleUpdateVisible,
	toggleDetailsVisible,
	toggleRemoveTransaction,
},) => {
	const [hasPermission, setHasPermission,] = React.useState<boolean>(false,)

	const {
		userInfo,
	} = useUserStore()

	React.useEffect(() => {
		const permission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		setHasPermission(permission,)
	}, [userInfo,],)

	const content = (
		<div className={styles.dialogContainer}>
			<div className={styles.menuActions}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					onClick={() => {
						setTimeout(() => {
							toggleDetailsVisible(transaction.id,)
						}, 300,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'View details',
						leftIcon: <Eye />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				{hasPermission && (
					<Button<ButtonType.TEXT>
						className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
						onClick={() => {
							setTimeout(() => {
								toggleUpdateVisible(transaction.id,)
							}, 300,)
						}}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Edit',
							leftIcon: <PenSquare />,
							size:     Size.MEDIUM,
							color:    Color.NON_OUT_BLUE,
						}}
					/>
				)}
				{hasPermission && (
					<Button<ButtonType.TEXT>
						onClick={() => {
							toggleRemoveTransaction(transaction.id,)
						}}
						className={cx(Classes.POPOVER_DISMISS, styles.actionBtn, styles.textColorRed,)}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Delete',
							leftIcon: <Trash />,
							size:     Size.MEDIUM,
							color:    Color.NON_OUT_BLUE,
						}}
					/>
				)}
			</div>
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