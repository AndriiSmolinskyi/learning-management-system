/* eslint-disable complexity */
import React, {
	useState, useRef, useEffect,
} from 'react'
import {
	Button, ButtonType, Size, AddAnotherButton,
} from '../../../shared/components'
import {
	DeleteBucketIcon, CloudSmooth,
} from '../../../assets/icons'
import {
	getFileFormat,
} from '../../../shared/utils/format-extractor.util'
import {
	getLabelByValue,
} from '../../../shared/utils/document-type-getter.util'
import type {
	SingleValue,
} from 'react-select'

import {
	DocumentIcon,
} from '../../../assets/icons'
import {
	validateFile,
} from '../../../shared/utils/validate-file.util'
import {
	useAddDocumentType,
	useGetDocumentTypes,
} from '../../../shared/hooks/list-hub'
import {
	DocumentTypeIcon,
} from '../../../assets/icons'
import {
	CreatebleSelectEnum,
} from '../../../shared/constants/createble-select.constants'
import {
	SelectComponent,
} from '../../../shared/components'
import type {
	IOptionType,
	SelectValueType,
} from '../../../shared/types'
import {
	cx,
} from '@emotion/css'

import * as styles from './document-manager.styles'

type DocumentManagerProps = {
  documents: Array<{ documentType: string; file: File }>;
  addDocument: (type: string, file: File) => void;
  removeDocument: (index: number) => void;
};

export const DocumentManager: React.FC<DocumentManagerProps> = ({
	documents,
	addDocument,
	removeDocument,
},) => {
	const [selectedType, setSelectedType,] = useState<SingleValue<IOptionType> | undefined>()
	const [isSelectShown, setIsSelectShown,] = useState<boolean>(true,)
	const fileInputRef = useRef<HTMLInputElement>(null,)
	const [inputValue, setInputValue,] = useState<string>('',)
	const {
		data: documentTypes,
	} = useGetDocumentTypes()
	const {
		mutateAsync: addDocumentType,
		isPending: documentAddLoading,
	} = useAddDocumentType()
	const handleCreateDocumentType = async(name : string,): Promise<void> => {
		await addDocumentType({
			name,
		},)
	}
	const handleFileInputClick = (): void => {
		fileInputRef.current?.click()
	}
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>,): void => {
		const {
			files,
		} = event.target
		if (files && files.length > 0 && selectedType && files[0]) {
			if (validateFile(files[0],)) {
				addDocument(inputValue === '' ?
					selectedType.label :
					inputValue, files[0],)
			}

			event.target.value = ''
			setSelectedType(undefined,)
			setInputValue('',)
		}
		setIsSelectShown(false,)
	}
	const handleSelectChange = (selected: SelectValueType,): void => {
		if (!Array.isArray(selected,)) {
			setSelectedType(selected as SingleValue<IOptionType>,)
		}
	}
	const handleSelectShown = (): void => {
		setIsSelectShown(!isSelectShown,)
	}
	useEffect(() => {
		if (documents.length === 0) {
			setIsSelectShown(true,)
		}
	}, [documents,],)
	const adaptiveInputValue = inputValue ?
		{
			value: inputValue.toLowerCase(), label: inputValue,
		} :
		null
	const updatedDocumentTypes = documentTypes?.map((type,) => {
		return {
			label: type.name,
			value: type.name,
		}
	},)
	return (
		<div>
			<div className={styles.inputBlock}>
				{documents.length > 0 && (
					<ul className={cx(styles.selectedFilesList,)}>
						{documents.map((file, index,) => {
							return (
								<li key={index} className={styles.selectedFilesListItem}>
									<p className={styles.documentIconWrapper}><DocumentIcon className={styles.documentIcon}/></p>
									<div className={styles.typeFormatBlock}>
										<span className={styles.typeText}>{getLabelByValue(file.documentType,)}</span>
										<span className={styles.formatText}>{getFileFormat(file.file.name.toUpperCase(),)}</span>
									</div>
									<DeleteBucketIcon
										className={styles.deleteFileSvg}
										onClick={() => {
											removeDocument(index,)
										}}
									/>
								</li>
							)
						},)}
					</ul>
				)}
				{isSelectShown && documentTypes && (
					<SelectComponent
						placeholder='Select or add a new document'
						isMulti={false}
						options={updatedDocumentTypes ?? []}
						leftIcon={<DocumentTypeIcon width={18} height={18} />}
						onChange={handleSelectChange}
						value={adaptiveInputValue ?? selectedType}
						isCreateble={Boolean(true,)}
						createbleStatus={CreatebleSelectEnum.DOCUMENT}
						createFn={handleCreateDocumentType}
						isLoading={documentAddLoading}
					/>
				)}
				<div className={styles.docBlock}>
					<div>
						<input
							type='file'
							onChange={handleFileChange}
							ref={fileInputRef}
							style={{
								display: 'none',
							}}
						/>
						<Button<ButtonType.TEXT>
							type='button'
							className={cx(!selectedType && 'hidden-el',)}
							disabled={!isSelectShown || !selectedType}
							additionalProps={{
								btnType:  ButtonType.TEXT,
								text:     'Upload document',
								size:     Size.MEDIUM,
								leftIcon: <CloudSmooth width={20} height={20} />,
							}}
							onClick={handleFileInputClick}
						/>
					</div>
					<AddAnotherButton
						handleAddEnother={handleSelectShown}
						disabled={Boolean(isSelectShown,)}
					/>
				</div>

			</div>
			<div className={styles.validateInfoBlock}>
				<p className={styles.validateInfoText}>Supported file types: .pdf, .doc, .xlsx, .png, .jpg. </p>
				<p className={styles.validateInfoText}>Maximum file size: 50 MB.</p>
			</div>
		</div>

	)
}
