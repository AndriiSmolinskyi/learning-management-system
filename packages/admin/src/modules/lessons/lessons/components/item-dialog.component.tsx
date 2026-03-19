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
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components/button'
import {
	Eye,
	PenSquare,
	Trash,
} from '../../../../assets/icons'

import type {
	LessonItem as TLessonItem,
} from '../../../../shared/types'
import {
	RouterKeys,
} from '../../../../router/keys'
import {
	useDeleteLesson,
} from '../../../../shared/hooks/lessons/lessons.hook'

import * as styles from '../lessons.styles'

type Props = {
	children: React.ReactNode
	lesson: TLessonItem
	setDialogOpen: (value: boolean) => void
	toggleDetailsVisible: (id: string) => void
}

export const ItemDialog: React.FC<Props> = ({
	children,
	lesson,
	setDialogOpen,
	toggleDetailsVisible,
},) => {
	const navigate = useNavigate()

	const {
		mutateAsync: deleteLesson,
		isPending,
	} = useDeleteLesson()

	const content = (
		<div className={styles.dialogContainer}>
			<div className={styles.menuActions}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					onClick={() => {
						setTimeout(() => {
							toggleDetailsVisible(lesson.id,)
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
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					onClick={() => {
						navigate(`${RouterKeys.LESSONS}/${RouterKeys.CUSTOM_LESSONS}`, {
							state: {
								lessonId:      lesson.id,
								customPayload: null,
							},
						},)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Edit',
						leftIcon: <PenSquare width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
			</div>

			<div className={styles.bottomActions}>
				<Button<ButtonType.TEXT>
					onClick={async() => {
						await deleteLesson(lesson.id,)
						setDialogOpen(false,)
					}}
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					disabled={isPending}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Delete',
						leftIcon: <Trash />,
						color:    Color.NON_OUT_RED,
					}}
				/>
			</div>
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