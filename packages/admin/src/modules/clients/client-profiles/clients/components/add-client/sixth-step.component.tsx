import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	Button,
	ButtonType,
	Size,
	PrevButton,
} from '../../../../../../shared/components'
import {
	SaveDraftButton,
} from './save-draft-button.component'
import {
	useAddClientStore,
} from '../../store'
import * as styles from './add-client.styles'
import {
	useDocumentStore,
} from '../../../../../../store/document.store'
import {
	DocumentManager,
} from '../../../../../../shared/components/document-manager/document-manager.component'
import {
	DocsIcon,
	DeleteBucketIcon,
} from '../../../../../../assets/icons'
import {
	useGetDocumentsByClientDraftId,
} from '../../../../../../shared/hooks'
import type {
	IDocument,
} from '../../../../../../shared/types'

type Props = {
	onClose: () => void
	draftId?: string
}

export const SixthStep: React.FC<Props> = ({
	onClose,
	draftId,
},) => {
	const {
		step, setStep,
	} = useAddClientStore()
	const {
		documents, addDocument, removeDocument,
	} = useDocumentStore()
	const {
		data: docsDraft,
	} = useGetDocumentsByClientDraftId(draftId,)
	const [existedDocuments, setExistedDocuments,] = React.useState<Array<IDocument>>([],)

	React.useEffect(() => {
		if (docsDraft) {
			setExistedDocuments(docsDraft,)
		}
	}, [docsDraft,],)

	const handleDeleteExistedDocument = (id: string,): void => {
		setExistedDocuments((docs,) => {
			return docs.filter((item,) => {
				return item.id !== id
			},)
		},
		)
	}

	return (
		<div className={cx(step !== 6 && 'hidden-el',)}>
			<div>
				<div className={styles.inputBlock}>
					{existedDocuments.length > 0 && (
						<div className={styles.oldDocBlock}>
							{existedDocuments.map((doc, index,) => {
								return (
									<div key={index} className={styles.oldDoc}>
										<div className={styles.oldDocLeft}>
											<DocsIcon className={styles.docsIcon} />
											<div className={styles.oldDocTextBlock}>
												<span className={styles.oldDocTextType}>{doc.type}</span>
												<span className={styles.oldDocTextFormat}>
													{doc.format.toLocaleUpperCase()}
												</span>
											</div>
										</div>
										<DeleteBucketIcon
											className={styles.oldDocDelete}
											onClick={() => {
												handleDeleteExistedDocument(doc.id,)
											}}
										/>
									</div>
								)
							},)}
						</div>
					)}
					<DocumentManager
						documents={documents}
						addDocument={addDocument}
						removeDocument={removeDocument}
					/>
				</div>

				<div className={styles.btnsContainer}>
					<SaveDraftButton onClose={onClose}/>
					<div className={styles.btnsLeft}>
						<PrevButton
							handlePrev={() => {
								setStep(5,)
							}}
						/>
						<Button<ButtonType.TEXT>
							type='submit'
							additionalProps={{
								btnType: ButtonType.TEXT,
								text:    'Add new client',
								size:    Size.MEDIUM,
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}