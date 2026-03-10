import React, {
	useRef,
} from 'react'
import {
	cx,
} from '@emotion/css'
import {
	useOldDocumentStore,
} from '../../store/edit-client-docs.store'
import {
	ChevronDown, ChevronUpBlue,
} from '../../../../../../assets/icons'
import {
	Button, ButtonType, Size, Color,
} from '../../../../../../shared/components'
import {
	useDocumentStore,
} from '../../../../../../store/document.store'
import {
	DocumentManager,
} from '../../../../../../shared/components/document-manager/document-manager.component'
import {
	DeleteBucketIcon, DocsIcon,
} from '../../../../../../assets/icons'
import {
	useGetDocumentTypes,
} from '../../../../../../shared/hooks/list-hub'
import * as styles from './edit-client.style'

export const SixStepEdit: React.FC = () => {
	const {
		data: documentTypes,
	} = useGetDocumentTypes()
	const {
		oldDocuments, removeOldDocument,
	} = useOldDocumentStore()
	const {
		documents, addDocument, removeDocument,
	} = useDocumentStore()
	const [isOpen, setIsOpen,] = React.useState(false,)
	const sixStepRef = useRef<HTMLDivElement | null>(null,)

	const handleToggle = (): void => {
		setIsOpen((prevState,) => {
			if (!prevState && sixStepRef.current) {
				setTimeout(() => {
					sixStepRef.current?.scrollIntoView({
						behavior: 'smooth',
						block:    'start',
					},)
				}, 0,)
			}
			return !prevState
		},)
	}

	const updatedDocumentTypes = documentTypes?.map((type,) => {
		return {
			label: type.name,
			value: type.name,
		}
	},)
	return (
		<div
			className={cx(
				styles.editFormItem({
					isActive: isOpen,
				},),
				styles.sixStep,
			)}
			ref={sixStepRef}
		>
			<div className={styles.editFormItemHeader}>
				<div>
					<h5 className={styles.editFormItemTitle}>Documents</h5>
					<p className={styles.editFormItemText}>
						{oldDocuments.length + documents.length === 1 ?
							'1 file attached' :
							`${oldDocuments.length + documents.length} files attached`}
					</p>
				</div>
				<Button<ButtonType.ICON>
					onClick={handleToggle}
					additionalProps={{
						btnType: ButtonType.ICON,
						size:    Size.SMALL,
						icon:    isOpen ?
							(
								<ChevronUpBlue width={20} height={20} />
							) :
							(
								<ChevronDown width={20} height={20} />
							),
						color: Color.NONE,
					}}
				/>
			</div>
			{isOpen && (
				<div className={styles.editFormItemDocs}>
					{oldDocuments.length > 0 && (
						<div className={styles.oldDocBlock}>
							{oldDocuments.map((doc, index,) => {
								const docTypeLabel =
									updatedDocumentTypes?.find((type,) => {
										return type.value === doc.type
									},)?.label ?? 'Unknown'
								return (
									<div key={index} className={styles.oldDoc}>
										<div className={styles.oldDocLeft}>
											<DocsIcon className={styles.docsIcon} />
											<div className={styles.oldDocTextBlock}>
												<span className={styles.oldDocTextType}>{docTypeLabel}</span>
												<span className={styles.oldDocTextFormat}>
													{doc.format.toLocaleUpperCase()}
												</span>
											</div>
										</div>
										<DeleteBucketIcon
											className={styles.oldDocDelete}
											onClick={() => {
												removeOldDocument(doc.id,)
											}}
										/>
									</div>
								)
							},)}
						</div>
					)}
					{Boolean(documents.length > 0,) && <p className={styles.newDocumentsText}>New documents:</p>}
					<DocumentManager
						documents={documents}
						addDocument={addDocument}
						removeDocument={removeDocument}
					/>
				</div>
			)}
		</div>
	)
}
