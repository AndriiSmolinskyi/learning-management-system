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
} from '../../../shared/components'
import {
	PenSquare,
	Trash,
	User,
} from '../../../assets/icons'
import type {
	GroupItem,
} from '../../../shared/types'
import type {
	TEditableGroup,
} from '../groups.types'

import * as styles from './table.style'

type Props = {
	children: React.ReactNode
	group: GroupItem
	setDialogOpen: (value: boolean) => void
	toggleStudentsVisible: (id?: string) => void
	handleOpenDeleteModal: (groupId: string) => void
	toggleUpdateVisible: (group: TEditableGroup) => void
}

export const ItemDialog: React.FC<Props> = ({
	children,
	group,
	setDialogOpen,
	toggleUpdateVisible,
	handleOpenDeleteModal,
	toggleStudentsVisible,
},) => {
	const content = (
		<div className={styles.dialogContainer}>
			<Button<ButtonType.TEXT>
				className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
				onClick={() => {
					setTimeout(() => {
						toggleUpdateVisible(group,)
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
			<Button<ButtonType.TEXT>
				className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
				onClick={() => {
					setTimeout(() => {
						toggleStudentsVisible(group.id,)
					}, 300,)
				}}
				additionalProps={{
					btnType:  ButtonType.TEXT,
					text:     'Students',
					leftIcon: <User width={20} height={20} />,
					size:     Size.MEDIUM,
					color:    Color.NON_OUT_BLUE,
				}}
			/>
			<Button<ButtonType.TEXT>
				className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
				onClick={() => {
					setTimeout(() => {
						handleOpenDeleteModal(group.id,)
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
	)

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