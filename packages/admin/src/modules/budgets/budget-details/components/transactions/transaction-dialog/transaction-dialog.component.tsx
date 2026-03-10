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
	Trash,
} from '../../../../../../assets/icons'
import {
	actionBtn,
	dialogContainer,
	menuActions,
	popoverContainer,
} from './transaction-dialog.styles'
import type {
	IBudgetTransaction,
} from '../../../../../../shared/types'

interface IProps {
	children: React.ReactNode
	popoverRef?: React.MutableRefObject<null>
	id: number
	handlePopoverCondition?: () => void
	isPopoverShown?: boolean
	usePortal?: boolean,
	transaction: IBudgetTransaction
	toggleDetailsVisible: (id: number) => void
	toggleEditVisible: (id: number) => void
	toggleDeleteTransactionVisible: (body: IBudgetTransaction) => void
}

export const TransactionItemDialog: React.FC<IProps> = ({
	children,
	popoverRef,
	id,
	handlePopoverCondition,
	usePortal = false,
	transaction,
	toggleDetailsVisible,
	toggleEditVisible,
	toggleDeleteTransactionVisible,
},) => {
	const content = (
		<div className={dialogContainer}>
			<div className={menuActions}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					onClick={() => {
						toggleDetailsVisible(id,)
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
						toggleEditVisible(id,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Edit',
						leftIcon: <PenSquare width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>

				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					onClick={() => {
						toggleDeleteTransactionVisible(transaction,)
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
			usePortal={usePortal}
			placement='left-start'
			content={content}
			popoverClassName={cx(
				popoverContainer,
				Classes.POPOVER_DISMISS,
			)}
			popoverRef={popoverRef}
			autoFocus={false}
			enforceFocus={false}
			onClosing={() => {
				if (handlePopoverCondition) {
					handlePopoverCondition()
				}
			}}
		>
			{children}
		</Popover>
	)
}