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
	Share,
	DownoloadBlue,
} from '../../../../../../assets/icons'
import type {
	IDocument,
} from '../../../../../../shared/types'
import {
	actionBtn,
	dialogContainer,
	menuActions,
	popoverContainer,
} from './document-section.style'
import {
	handleDownload,
} from '../../../../../../services/document/document.util'

interface IProps {
	children: React.ReactNode
	setDialogOpen: (value: boolean) => void
	file?: IDocument
	onEditEntity?: () => void
	onViewEntity?: () => void
}

export const DocumentDialog: React.FC<IProps> = ({
	children,
	setDialogOpen,
	file,
	onEditEntity,
	onViewEntity,
},) => {
	const content = (
		<div className={dialogContainer}>
			<div className={menuActions}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						if (onViewEntity) {
							onViewEntity()
						}
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
						if (onEditEntity) {
							onEditEntity()
						}
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
						if (file?.storageName) {
							handleDownload(file.storageName,)
						}
					}}
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Downoload',
						leftIcon: <DownoloadBlue width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Share access',
						leftIcon: <Share width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
			</div>
		</div>)

	return (
		<Popover
			usePortal={true}
			placement='left-start'
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