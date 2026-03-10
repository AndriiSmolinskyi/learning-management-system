import React from 'react'
import {
	Download,
	DocsIcon,
} from '../../../../../../assets/icons'
import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../../../shared/components'
import type {
	IDocument,
} from '../../../../../../shared/types'
import {
	useGetDocumentTypes,
} from '../../../../../../shared/hooks/list-hub'
import {
	handleDownload,
} from '../../../../../../services/document/document.util'
import * as styles from './doc-card.style'

type ClientBillingDocProps = {
	dataDocs: Array<IDocument>
}

export const ClientBillingDoc: React.FC<ClientBillingDocProps> = ({
	dataDocs,
},) => {
	const {
		data: documentTypes,
	} = useGetDocumentTypes()
	const updatedDocumentTypes = documentTypes?.map((type,) => {
		return {
			label: type.name,
			value: type.name,
		}
	},)
	return (
		<>
			{dataDocs.length > 0 && (
				<div className={styles.oldDocBlock}>
					{dataDocs.map((doc, index,) => {
						const docTypeLabel = updatedDocumentTypes?.find((type,) => {
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
								<Button
									type='button'
									disabled={false}
									onClick={async() => {
										return handleDownload(doc.storageName,)
									}}
									additionalProps={{
										btnType: ButtonType.ICON,
										size:    Size.SMALL,
										color:   Color.SECONDRAY_GRAY,
										icon:    <Download />,
									}}
								/>
							</div>
						)
					},)}
				</div>
			)}
		</>
	)
}
