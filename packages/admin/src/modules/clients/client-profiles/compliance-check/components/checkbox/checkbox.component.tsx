/* eslint-disable complexity */
import * as React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	useSearchParams,
} from 'react-router-dom'
import {
	DocumentDetails,
} from '../document-details/document-details.component'
import {
	createPortal,
} from 'react-dom'
import {
	useModalClose,
} from '../../../../../../shared/hooks/use-modal-close.util'
import type {
	IStoreDocument,
} from '../../../../../../store/compliance-check.store'
import {
	CustomCheckbox,
} from '../../../../../../shared/components/custom-checkbox/custom-checkbox.component'
import {
	DocumentIcon,
	Way,
	Eye,
	DotsMenuIcon,
	CheckCircle,
	MinusCircle,
	XmarkMid,
	DownoloadBlue,
} from '../../../../../../assets/icons'
import {
	getLabelByValue,
} from '../../../../../../shared/utils/document-type-getter.util'
import {
	Button, ButtonType, Size, Color,
} from '../../../../../../shared/components'
import {
	Popover, Classes,
} from '@blueprintjs/core'
import {
	actionBtn,
	dialogContainer,
	menuActions,
	popoverContainer,
} from './checkbox.styles'
import {
	useUpdateDocumentStatus,
} from '../../../../../../shared/hooks'
import * as styles from './checkbox.styles'
import {
	Dialog,
} from '../../../../../../shared/components'
import {
	ReasonForClose,
} from '../reason-for-decline/reason-for-decline.component'
import {
	DocumentStatus,
} from '../../../../../../shared/types'
interface ICheckboxProps {
	file?: IStoreDocument
	label?: string
	isChecked: boolean
	onChange: () => void
	isSelectAll?: boolean
	isNew?: boolean
	title?: string
}

export type ButtonStatus = keyof typeof DocumentStatus

export const ComplianceCheckbox: React.FC<ICheckboxProps> = ({
	label,
	isChecked,
	onChange,
	isSelectAll,
	file,
	isNew,
	title,
},) => {
	const [isDetailsShown, setIsDetailsShown,] = React.useState<boolean>(false,)
	const [isPopoverOpen, setIsPopoverOpen,] = React.useState<boolean>(false,)
	const [commentDialogVisible, setCommentDialogVisible,] = React.useState<boolean>(false,)
	const [searchParams,] = useSearchParams()
	const {
		handleMenuBackdropClick,
	} = useModalClose(setIsDetailsShown,)
	const {
		mutateAsync: handleChangeStatus,
	} = useUpdateDocumentStatus()

	const handleDetailsOpen = (): void => {
		setIsDetailsShown(!isDetailsShown,)
	}

	const handleCloseCommentDialog = React.useCallback((): void => {
		setCommentDialogVisible(false,)
	}, [],)

	const approveDocument = async(): Promise<void> => {
		if (file?.id) {
			await handleChangeStatus({
				documentsIds: [file.id,],
				status:       DocumentStatus.APPROVED,
				comment:      '',
			},)
		}
	}

	const handleDownload = async(storageName: string,): Promise<void> => {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/document/download`, {
			method:  'POST',
			body:    JSON.stringify({
				storageName,
			},),
			headers: {
				'Content-Type':  'application/json',
			},
			credentials: 'include',
		},)
		const blob = await response.blob()
		const contentDisposition = response.headers.get('Content-Disposition',)
		const filename = contentDisposition ?
			contentDisposition.split('filename=',)[1]?.replace(/"/g, '',) ?? 'download' :
			'download'
		const url = URL.createObjectURL(blob,)
		const a = document.createElement('a',)
		a.href = url
		a.download = filename
		document.body.appendChild(a,)
		a.click()
		URL.revokeObjectURL(url,)
		document.body.removeChild(a,)
	}

	const declineDocument = (): void => {
		setCommentDialogVisible(true,)
	}

	const currentStatus = searchParams.get('status',)?.toUpperCase() as ButtonStatus | undefined

	return isSelectAll ?
		(
			<div>
				<CustomCheckbox
					input={{
						checked: isChecked,
					}}
					label={label ?? 'Select All'}
					onChange={onChange}
					disabled={false}
					isSelectAll
				/>
			</div>
		) :
		(
			<div
				className={cx(
					styles.checkboxItemWrapper,
					isNew && !isChecked && styles.checkboxItemWrapperNew,
				)}
			>
				<div className={styles.checkboxItemWrapperDoc}>
					<div className={styles.checkboxLabelBlock}>
						{file && (
							<CustomCheckbox
								input={{
									checked: isChecked,
								}}
								label={label ?? ''}
								onChange={onChange}
								disabled={false}
							/>
						)}
						<p className={styles.documentIconWrapper}>
							<DocumentIcon className={styles.documentIcon} />
						</p>
						<div className={styles.typeFormatBlock}>
							<p className={styles.documentType}>{getLabelByValue(file?.type ?? '',)}</p>
							<p className={styles.documentFormat}>{file?.name.replace(/ /g, '_',)}</p>
						</div>
						{isNew && !isChecked && <span className={styles.newDocument}>New!</span>}
					</div>
					<Popover
						usePortal={true}
						placement='right-start'
						popoverClassName={cx(popoverContainer, Classes.POPOVER_DISMISS,)}
						content={
							<div className={dialogContainer}>
								<div className={menuActions}>
									{currentStatus !== DocumentStatus.APPROVED && (
										<Button
											onClick={approveDocument}
											className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
											additionalProps={{
												btnType:  ButtonType.TEXT,
												size:     Size.MEDIUM,
												color:    Color.NON_OUT_GREEN,
												text:     'Approve',
												leftIcon: <CheckCircle width={20} height={20} />,
											}}
										/>
									)}
									{currentStatus !== DocumentStatus.DECLINED && (
										<Button
											onClick={declineDocument}
											className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
											additionalProps={{
												btnType:  ButtonType.TEXT,
												size:     Size.MEDIUM,
												color:    Color.NON_OUT_RED,
												text:     'Decline',
												leftIcon: <MinusCircle width={20} height={20} />,
											}}
										/>
									)}
									<Button
										onClick={handleDetailsOpen}
										className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
										additionalProps={{
											btnType:  ButtonType.TEXT,
											size:     Size.MEDIUM,
											color:    Color.NON_OUT_BLUE,
											text:     'View details',
											leftIcon: <Eye width={20} height={20} />,
										}}
									/>
									<Button
										onClick={() => {
											if (file) {
												handleDownload(file.storageName,)
											}
										}}
										className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
										additionalProps={{
											btnType:  ButtonType.TEXT,
											size:     Size.MEDIUM,
											color:    Color.NON_OUT_BLUE,
											text:     'Download',
											leftIcon: <DownoloadBlue width={20} height={20} />,
										}}
									/>
								</div>
							</div>
						}
						isOpen={isPopoverOpen}
						onInteraction={(nextOpenState,) => {
							setIsPopoverOpen(nextOpenState,)
						}}
						autoFocus={false}
						enforceFocus={false}
					>
						<Button
							additionalProps={{
								btnType: ButtonType.ICON,
								size:    Size.MEDIUM,
								color:   Color.SECONDRAY_GRAY,
								icon:    isPopoverOpen ?
									(
										<XmarkMid width={20} height={20} />
									) :
									(
										<DotsMenuIcon width={20} height={20} />
									),
							}}
						/>
					</Popover>
				</div>
				{file?.comment && (
					<div className={styles.commentBlock}>
						<Way width={16} height={16} />
						<p>{file.comment}</p>
					</div>
				)}
				{createPortal(
					<div
						onClick={handleMenuBackdropClick}
						className={styles.detailsBackdrop(isDetailsShown,)}
					>
						<DocumentDetails
							isDetailsShown={isDetailsShown}
							file={file}
							onClose={handleDetailsOpen}
							title={title}
						/>
					</div>,
					document.body,
				)}
				<Dialog
					open={commentDialogVisible}
					isCloseButtonShown
					onClose={handleCloseCommentDialog}
				>
					<ReasonForClose
						documentsIds={file?.id ?
							[file.id,] :
							[]}
						status={DocumentStatus.DECLINED}
						onClose={handleCloseCommentDialog}
					/>
				</Dialog>
			</div>
		)
}
