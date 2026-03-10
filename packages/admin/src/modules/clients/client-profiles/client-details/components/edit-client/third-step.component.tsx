/* eslint-disable complexity */
import React from 'react'
import 'react-phone-number-input/style.css'
import {
	Phone,
	Trash,
	ChevronDown,
	ChevronUpBlue,
} from '../../../../../../assets/icons/'
import {
	PhoneField,
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../../../shared/components'
import {
	useEditClientStore,
} from '../../store/edit-client.store'
import {
	AddAnotherEdit,
} from './add-another-edit.component'
import * as styles from './edit-client.style'

type Props = {
	hasErrors: boolean
	resetField: () => void
}

export const ThirdStepEdit: React.FC<Props> = ({
	hasErrors,
	resetField,
},) => {
	const {
		values,
		setValues,
		setContacts,
	} = useEditClientStore()

	const [isOpen, setIsOpen,] = React.useState(false,)

	const handleToggle = (): void => {
		setIsOpen((prevState,) => {
			return !prevState
		},)
	}

	const dublicateInputError = values.contacts.includes(values.contact,) ?
		'error' :
		null
	const emptyFieldError = values.contacts.length === 0 && !values.contact ?
		'error' :
		null

	const addBtnDisabled = Boolean(hasErrors || values.contact.trim() === '' || values.contacts.includes(values.contact,),)

	const handleAddContact = (): void => {
		if (!hasErrors && values.contact.trim() && !values.contacts.includes(values.contact,)) {
			setContacts()
			resetField()
		}
	}

	const handleRemoveContact = (contact: string,): void => {
		setValues({
			contacts: values.contacts.filter((item,) => {
				return item !== contact
			},),
		},)
	}

	const contactValidation = (value: string,): string | undefined => {
		const phonePattern = /^[+]?[0-9]{1,4}[.\s-]?[(]?[0-9]{1,3}[)]?[\s.-]?[0-9]{1,4}[\s.-]?[0-9]{1,4}[\s.-]?[0-9]{1,4}$/

		if (value && !phonePattern.test(value.trim(),)) {
			return 'Contact is invalid'
		}
		return undefined
	}

	return (
		<div>
			<div className={styles.editFormItem({
				isActive: isOpen,
			},)}>
				<div className={styles.editFormItemHeader}>
					<div>
						<h5 className={styles.editFormItemTitle}>Contact numbers</h5>
						<p className={styles.editFormItemText}>
							{values.contacts.slice(0, 1,).join(', ',)}
							{values.contacts.length > 1 && `, + ${values.contacts.length - 1}`}
						</p>
					</div>
					<Button<ButtonType.ICON>
						onClick={handleToggle}
						additionalProps={{
							btnType: ButtonType.ICON,
							size:    Size.SMALL,
							icon:    isOpen ?
								<ChevronUpBlue width={20} height={20} /> :
								<ChevronDown width={20} height={20} />,
							color: Color.NONE,
						}}
					/>
				</div>

				{isOpen && (
					<div>
						<div className={styles.editFormItemInputs}>
							<PhoneField
								name='contact'
								placeholder='Contact'
								value={values.contact}
								onChange={(e,) => {
									setValues({
										contact: e.target.value,
									},)
								}}
								error={dublicateInputError ?? emptyFieldError}
								validate={contactValidation}
							/>

							{values.contacts.length > 0 && (
								values.contacts.map((contact,) => {
									return (
										<div key={contact} className={styles.editFormItemAdditional}>
											<div className={styles.editFormItemAdditionalLeft}>
												<Phone width={18} height={18} />
												<span>{contact}</span>
											</div>
											<Trash width={18} height={18} cursor='pointer' onClick={() => {
												handleRemoveContact(contact,)
											}} />
										</div>
									)
								},)
							)}
						</div>

						<div className={styles.editFormItemAddAnother}>
							<AddAnotherEdit
								handleAddEnother={handleAddContact}
								disabled={addBtnDisabled}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
