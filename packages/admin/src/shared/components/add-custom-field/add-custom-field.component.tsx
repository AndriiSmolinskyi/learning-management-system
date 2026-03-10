/* eslint-disable max-depth */
/* eslint-disable no-negated-condition */
import * as React from 'react'

import {
	Field,
} from 'react-final-form'
import {
	ReactComponent as PlusIcon,
} from '../../../assets/icons/plus-blue.svg'
import {
	toggleState,
} from '../../../shared/utils'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../button'
import {
	ReactComponent as BucketIcon,
} from '../../../assets/icons/delete-bucket.svg'
import {
	ReactComponent as EditIcon,
} from '../../../assets/icons/pen-square.svg'

import * as styles from './add-custom-field.styles'

interface IField {
	label: string;
	info: string;
}

type Props = {
	initialValues?: Array<IField>
	tabIndex?: number
	onChange?: (values: Array<IField>) => void
}

export const AddCustomField: React.FC<Props> = ({
	initialValues, tabIndex, onChange,
}:Props,) => {
	const [isNewFieldShown, setIsNewFieldShown,] = React.useState<boolean>(false,)
	const [fieldLabel, setFieldLabel,] = React.useState<string>('',)
	const [fieldInfo, setFieldInfo,] = React.useState<string>('',)
	const [fields, setFields,] = React.useState<Array<IField>>(initialValues ?? [],)
	const [editIndex, setEditIndex,] = React.useState<number | null>(null,)
	React.useEffect(() => {
		if (initialValues) {
			setFields(initialValues,)
		}
	},[initialValues,],)
	const handleCancel = (): void => {
		setEditIndex(null,)
		setIsNewFieldShown(false,)
		setFieldLabel('',)
		setFieldInfo('',)
	}
	const handleCreation = toggleState(setIsNewFieldShown,)
	const handleFieldLabelChange = (e: React.ChangeEvent<HTMLInputElement>,):void => {
		setFieldLabel(e.target.value,)
	}

	const handleFieldInfoChange = (e: React.ChangeEvent<HTMLInputElement>,): void => {
		setFieldInfo(e.target.value,)
	}

	const handleSave = (): void => {
		if (fieldLabel && fieldInfo) {
			if (editIndex !== null) {
				const updatedFields = [...fields,]
				updatedFields[editIndex] = {
					label: fieldLabel, info: fieldInfo,
				}
				setFields(updatedFields,)
				if (onChange) {
					onChange(updatedFields,)
				}
				setEditIndex(null,)
			} else {
				setFields([...fields, {
					label: fieldLabel, info: fieldInfo,
				},],)
				if (onChange) {
					onChange([...fields, {
						label: fieldLabel, info: fieldInfo,
					},],)
				}
			}
			setFieldLabel('',)
			setFieldInfo('',)
			setIsNewFieldShown(false,)
		}
	}

	const handleDelete = (index: number,): void => {
		setFields(fields.filter((item, i,) => {
			return i !== index
		},),)
		if (onChange) {
			onChange(fields.filter((item, i,) => {
				return i !== index
			},),)
		}
		setEditIndex(null,)
		setIsNewFieldShown(false,)
		setFieldLabel('',)
		setFieldInfo('',)
	}

	const handleEdit = (index: number,): void => {
		const fieldToEdit = fields[index]
		setFieldLabel(String(fieldToEdit?.label,),)
		setFieldInfo(String(fieldToEdit?.info,),)
		setEditIndex(index,)
		setIsNewFieldShown(true,)
	}

	return (
		<div className={styles.fieldsList}>
			{fields.map((field, index,) => {
				const fieldName = `field${index}-${String(field.label,)}`
				return (
					<div key={index}>
						<div>
							<Field
								name={fieldName}
								type='text'
								initialValue={String(field.info,)}
								tabIndex={tabIndex}
							>
								{() => {
									return (
										<div className={styles.addedFieldWrapper}>
											<div>
												<p className={styles.customFieldText}>{String(field.label,)}</p>
												<p className={styles.customInfoText}>{String(field.info,)}</p>
											</div>
											<div className={styles.iconButtonsBlockWrapper}>
												<Button<ButtonType.ICON>
													className={styles.fieldIconButton}
													onClick={() => {
														handleCreation()
														handleEdit(index,)
													}}
													additionalProps={{
														btnType:  ButtonType.ICON,
														size:     Size.SMALL,
														color:    Color.NONE,
														icon:    <EditIcon width={18} height={18}/>,
													}}
												/>
												<Button<ButtonType.ICON>
													className={styles.fieldIconButton}
													onClick={() => {
														handleDelete(index,)
													}}
													additionalProps={{
														btnType:  ButtonType.ICON,
														size:     Size.SMALL,
														color:    Color.NONE,
														icon:    <BucketIcon width={18} height={18}/>,
													}}
												/>
											</div>
										</div>
									)
								}}
							</Field>
						</div>
					</div>
				)
			},)}
			{isNewFieldShown && <div className={styles.creationBlockWrapper}>
				<div>
					<p className={styles.customFieldText}>{editIndex !== null ?
						'Edit Field' :
						'Custom Field'}</p>
					<p className={styles.customInfoText}>{editIndex !== null ?
						'Edit the label and information for this field' :
						'Add a label and information for this field'}</p>
				</div>
				<div className={styles.inputWrapper}>
					<input
						id='fieldLabel'
						type='text'
						value={fieldLabel}
						onChange={handleFieldLabelChange}
						placeholder='Field label'
						className={styles.inputField}
					/>
				</div>
				<div className={styles.inputWrapper}>
					<input
						id='fieldInfo'
						type='text'
						value={fieldInfo}
						onChange={handleFieldInfoChange}
						placeholder='Field information'
						className={styles.inputField}
					/>
				</div>
				<div className={styles.buttonBlock}>
					<Button<ButtonType.TEXT>
						className={styles.cancelButton}
						onClick={handleCancel}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Cancel',
							size:     Size.SMALL,
							color:    Color.NONE,
						}}
						tabIndex={tabIndex}
					/>
					<Button<ButtonType.TEXT>
						onClick={handleSave}
						disabled={!fieldLabel || !fieldInfo}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Save',
							size:     Size.SMALL,
							color:    Color.BLUE,
						}}
						tabIndex={tabIndex}
					/>
				</div>
			</div>}
			<Button<ButtonType.TEXT>
				className={styles.addButton}
				tabIndex={tabIndex}
				onClick={handleCreation}
				disabled={isNewFieldShown}
				additionalProps={{
					btnType:  ButtonType.TEXT,
					text:     'Add custom field',
					leftIcon: <PlusIcon width={18} height={18}/>,
					size:     Size.MEDIUM,
					color:    Color.NONE,
				}}
			/>
		</div>
	)
}
