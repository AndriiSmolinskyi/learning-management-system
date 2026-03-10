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
	PrinterIcon,
	DownoloadBlue,
	Send,
	ChevronRight,
	Trash,
} from '../../../../assets/icons'

import type {
	IReport,
} from '../../../../shared/types'
import {
	ReportCategory,
} from '../../../../shared/types'
import {
	RouterKeys,
} from '../../../../router/keys'
import {
	useDeleteReport,
} from '../../../../shared/hooks/reports'

import * as styles from '../reports.styles'

interface IProps {
	children: React.ReactNode
	report: IReport
	setDialogOpen: (value: boolean) => void
	toggleDetailsVisible: (id: number) => void
	handleDownload: () => void
}

export const ItemDialog: React.FC<IProps> = ({
	children,
	report,
	setDialogOpen,
	toggleDetailsVisible,
	handleDownload,
},) => {
	const navigate = useNavigate()

	const {
		mutateAsync: deleteReport, isPending,
	} = useDeleteReport()

	const content = (
		<div className={styles.dialogContainer}>
			<div className={styles.menuActions}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					onClick={() => {
						setTimeout(() => {
							toggleDetailsVisible(report.id,)
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
				{report.category === ReportCategory.CUSTOM && (
					<Button<ButtonType.TEXT>
						className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
						onClick={() => {
							navigate(`${RouterKeys.REPORTS}/${RouterKeys.CUSTOM_REPORT}`, {
								state: {
									reportId:      report.id,
									reportDraftId: null,
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
				)}
			</div>
			<div className={styles.menuActions}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						// todo: add print report
						setDialogOpen(false,)
					}}
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Print',
						leftIcon: <PrinterIcon width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={() => {
						handleDownload()
						setDialogOpen(false,)
					}}
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Download',
						leftIcon: <DownoloadBlue width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
			</div>
			<div className={styles.bottomActions}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						setDialogOpen(false,)
					}}
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					additionalProps={{
						btnType:   ButtonType.TEXT,
						text:      'Send document',
						leftIcon:  <Send width={20} height={20} />,
						rightIcon: <ChevronRight width={20} height={20} />,
						size:      Size.MEDIUM,
						color:     Color.NON_OUT_BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={async() => {
						await deleteReport(report.id,)
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