/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'
import 'react-phone-number-input/style.css'
import {
	Phone,
	Trash,
} from '../../../../../../assets/icons/'
import {
	PhoneField,
	PrevButton,
	NextButton,
	AddAnotherButton,
} from '../../../../../../shared/components'
import {
	SaveDraftButton,
} from './save-draft-button.component'

import {
	useAddClientStore,
} from '../../store'

import * as styles from './add-client.styles'

type Props = {
	hasErrors: boolean
	resetField: () => void
	onClose: () => void
}

export const ThirdStep: React.FC<Props> = ({
	hasErrors,
	resetField,
	onClose,
},) => {
	const {
		values,
		setValues,
		setContacts,
		step,
		setStep,
	} = useAddClientStore()

	const emptyFieldError = values.contacts.length === 0 && !values.contact ?
		'error' :
		null

	const nextBtnDisabled = Boolean(hasErrors && values.contacts.length === 0,)
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
		<div className={cx((step !== 3) && 'hidden-el',)}>
			<div className={styles.inputBlock}>
				<PhoneField
					name='contact'
					placeholder='Contact'
					value={values.contact}
					onChange={(e,) => {
						setValues({
							contact: e.target.value,
						},)
					}}
					error={values.contacts.includes(values.contact,) ?
						'error' :
						null}
					validate={contactValidation}
				/>

				{values.contacts.length > 0 && values.contacts.map((contact,) => {
					return (
						<div key={contact} className={styles.adEmail}>
							<div className={styles.adEmailLeft}>
								<Phone width={18} height={18} />
								<span>{contact}</span>
							</div>
							<Trash width={18} height={18} cursor={'pointer'} onClick={() => {
								handleRemoveContact(contact,)
							}} />
						</div>
					)
				},)}
			</div>
			<div className={styles.addAnother}>
				<AddAnotherButton
					handleAddEnother={handleAddContact}
					disabled={addBtnDisabled}
				/>
			</div>
			<div className={styles.btnsContainer}>
				<SaveDraftButton onClose={onClose}/>
				<div className={styles.btnsLeft}>
					<PrevButton handlePrev={() => {
						setStep(2,)
					}} />
					<NextButton
						disabled={nextBtnDisabled || Boolean(emptyFieldError,)}
						handleNext={() => {
							setStep(4,)
							handleAddContact()
						}}
					/>
				</div>
			</div>
		</div>
	)
}
