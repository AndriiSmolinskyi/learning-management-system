/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	Mail,
	Trash,
} from '../../../../../../assets/icons/'
import {
	FormField,
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

export const SecondStep:React.FC<Props> = ({
	hasErrors,
	resetField,
	onClose,
},) => {
	const {
		values,
		setValues,
		setEmails,
		step,
		setStep,
	} = useAddClientStore()

	const dublicateInputError = values.emails.includes(values.email,) ?
		'error' :
		null

	const emptyFieldError = values.emails.length === 0 && !values.email ?
		'error' :
		null
	const nextBtnDisabled = Boolean(hasErrors && values.emails.length === 0,)
	const addBtnDisabled = Boolean(hasErrors || values.email.trim() === '' || values.emails.includes(values.email,),)

	const handleAddEmail = (): void => {
		if (!hasErrors && values.email.trim() && !values.emails.includes(values.email,)) {
			setEmails()
			resetField()
		}
	}

	const handleRemoveEmail = (email: string,): void => {
		setValues({
			emails: values.emails.filter((item,) => {
				return item !== email
			},),
		},)
	}

	const emailValidator = (value: string,): string | undefined => {
		if (!value.trim()) {
			return undefined
		}
		const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
		return emailPattern.test(value,) ?
			undefined :
			'Email is invalid'
	}

	return (
		<div className={cx((step !== 2) && 'hidden-el',)}>
			<div className={styles.inputBlock}>
				<FormField
					name='email'
					placeholder='Email'
					leftIcon={<Mail width={18} height={18} />}
					value={values.email}
					onChange={(e,) => {
						setValues({
							email: e.target.value,
						},)
					}}
					error={dublicateInputError ?? emptyFieldError}
					validate={emailValidator}
				/>
				{values.emails.length > 0 && (
					[...values.emails,].reverse().map((email,) => {
						return (
							<div key={email} className={styles.adEmail}>
								<div className={styles.adEmailLeft}>
									<Mail width={18} height={18} />
									<span>{email}</span>
								</div>
								<Trash width={18} height={18} cursor={'pointer'} onClick={() => {
									handleRemoveEmail(email,)
								}}/>
							</div>
						)
					},)
				)}
			</div>
			<div className={styles.addAnother}>
				<AddAnotherButton
					handleAddEnother={handleAddEmail}
					disabled={addBtnDisabled}
				/>
			</div>
			<div className={styles.btnsContainer}>
				<SaveDraftButton onClose={onClose}/>
				<div className={styles.btnsLeft}>
					<PrevButton handlePrev={() => {
						setStep(1,)
					}}/>
					<NextButton
						disabled={nextBtnDisabled || Boolean(emptyFieldError,)}
						handleNext={() => {
							setStep(3,)
							handleAddEmail()
						}}
					/>
				</div>
			</div>
		</div>
	)
}