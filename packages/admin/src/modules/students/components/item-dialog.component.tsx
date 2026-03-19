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
	Eye,
} from '../../../assets/icons'
import type {
	StudentItem,
} from '../../../shared/types'

import * as styles from './table.style'

type Props = {
	children: React.ReactNode
	student: StudentItem
	setDialogOpen: (value: boolean) => void
	toggleUpdateVisible: (id: string) => void
	toggleDetailsVisible: (id: string) => void
	handleOpenDeleteModal: (studentId: string) => void
}

export const ItemDialog: React.FC<Props> = ({
	children,
	student,
	setDialogOpen,
	toggleUpdateVisible,
	toggleDetailsVisible,
	handleOpenDeleteModal,
},) => {
	const content = (
		<div className={styles.dialogContainer}>
			<Button<ButtonType.TEXT>
				className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
				onClick={() => {
					setTimeout(() => {
						toggleDetailsVisible(student.id,)
					}, 300,)
				}}
				additionalProps={{
					btnType:  ButtonType.TEXT,
					text:     'Details',
					leftIcon: <Eye width={20} height={20} />,
					size:     Size.MEDIUM,
					color:    Color.NON_OUT_BLUE,
				}}
			/>

			<Button<ButtonType.TEXT>
				className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
				onClick={() => {
					setTimeout(() => {
						toggleUpdateVisible(student.id,)
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
						handleOpenDeleteModal(student.id,)
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