import React from 'react'
import * as styles from './document-details.styles'
import type {
	IStoreDocument,
} from '../../../../../../store/compliance-check.store'
import {
	CloseXIcon,
} from '../../../../../../assets/icons'
import {
	DownloadIcon,
} from '../../../../../../assets/icons'
import {
	DocumentStatus,
} from '../../../../../../shared/types'
import {
	useUpdateDocumentStatus,
} from '../../../../../../shared/hooks'
import {
	FolderOpenIcon,
} from '../../../../../../assets/icons'
import {
	DocumentIcon,
} from '../../../../../../assets/icons'
import {
	formatDateToDDMMYYYY,
} from '../../../../../../shared/utils/date-formatter.util'
import {
	capitalizeFirstLetter,
} from '../../../../../../shared/utils/capitalize-first-letter.util'
import {
	getLabelByValue,
} from '../../../../../../shared/utils/document-type-getter.util'
import {
	ReasonForClose,
} from '../reason-for-decline/reason-for-decline.component'
import {
	toggleState,
} from '../../../../../../shared/utils'
import {
	Dialog,
} from '../../../../../../shared/components'
import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../../../shared/components'
import {
	handleDownload,
} from '../../../../../../services/document/document.util'

interface IDocumentDetailsProps {
    isDetailsShown: boolean
	file?: IStoreDocument
	onClose: () => void
	title?: string
  }

export const DocumentDetails: React.FC<IDocumentDetailsProps> = ({
	isDetailsShown, file, onClose, title,
},) => {
	const [commentDialogVisible, setCommentDialogVisible,] = React.useState<boolean>(false,)

	const handleCloseCommentDialog = React.useCallback((): void => {
		toggleState(setCommentDialogVisible,)()
	}, [],)
	const {
		mutateAsync: handleChangeStatus,
	} = useUpdateDocumentStatus()

	// todo: Revome after testing
	// const {
	// 	mutateAsync: downloadFile,
	// } = useGetDownloadDocument()
	// const handleDownload = async(): Promise<void> => {
	// 	const {
	// 		url,
	// 	} = await downloadFile({
	// 		storageName: file?.storageName ?? '',
	// 	},)
	// 	const a = document.createElement('a',)
	// 	a.href = url
	// 	a.download = 'download'
	// 	document.body.appendChild(a,)
	// 	a.click()
	// 	URL.revokeObjectURL(url,)
	// 	document.body.removeChild(a,)
	// }

	return	file && (
		<div className={styles.documentDetailsWrapper(isDetailsShown,)}>
			<div className={styles.topBlock}>
				<p className={styles.topBlockText}>File details</p>
				<CloseXIcon className={styles.closeIcon} onClick={onClose}/>
			</div>
			<div className={styles.middleBlock}>
				<p className={styles.folderName}><FolderOpenIcon className={styles.folderIcon}/>{title}</p>
				<div className={styles.documentBlock}>
					<DocumentIcon/>
					<p className={styles.fileName}>{file.name}</p>
				</div>
				<div className={styles.documentInfoBlock}>
					<div className={styles.infoKeysBlock}>
						<p className={styles.infoKeyValue}>Document type</p>
						<p className={styles.infoKeyValue}>Date added</p>
						<p className={styles.infoKeyValue}>Status</p>
						<p className={styles.infoKeyValue}>Format</p>
					</div>
					<div className={styles.infoValuesBlock}>
						<p className={styles.infoValue}>{getLabelByValue(file.type,)}</p>
						<p className={styles.infoValue}>{formatDateToDDMMYYYY(file.createdAt,)}</p>
						<p className={styles.infoValue}>{capitalizeFirstLetter(file.status,)}</p>
						<p className={styles.infoValue}>{file.format.toUpperCase()}</p>
					</div>
				</div>
				{file.comment && <div>
					<p className={styles.commentTitle}>Comment</p>
					<p className={styles.commentInfo}>{file.comment}</p>
				</div> }
			</div>
			<div className={styles.bottomBlock}>
				<Button<ButtonType.ICON>
					type='submit'
					onClick={() => {
						if (file.storageName) {
							handleDownload(file.storageName,)
						}
					}}
					additionalProps={{
						btnType:   ButtonType.ICON,
						icon:    <DownloadIcon/>,
						size:      Size.MEDIUM,
						color:   Color.SECONDRAY_COLOR,
					}}
				/>
				<div className={styles.buttonBlock}>
					{file.status !== DocumentStatus.DECLINED &&
						<Button<ButtonType.TEXT>
							type='submit'
							onClick={handleCloseCommentDialog}
							additionalProps={{
								btnType:   ButtonType.TEXT,
								text:      'Decline',
								size:      Size.MEDIUM,
								color:   Color.SECONDARY_RED,
							}}
						/>
					}
					{file.status !== DocumentStatus.APPROVED &&
						<Button<ButtonType.TEXT>
							type='submit'
							onClick={() => {
								handleChangeStatus({
									documentsIds: [file.id,], status: DocumentStatus.APPROVED, comment: '',
								},)
							}}
							additionalProps={{
								btnType: ButtonType.TEXT,
								text:    'Approve',
								size:    Size.MEDIUM,
								color:   Color.SECONDARY_GREEN,
							}}
						/>
					}
				</div>
			</div>
			<Dialog
				open={commentDialogVisible}
				isCloseButtonShown
				onClose={handleCloseCommentDialog}
				isPortalUsed={true}
			>
				<ReasonForClose
					documentsIds={[file.id,]}
					status={DocumentStatus.DECLINED}
					onClose={handleCloseCommentDialog}
				/>
			</Dialog>
		</div>
	)
}

