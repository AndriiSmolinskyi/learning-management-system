/* eslint-disable complexity */
import React from 'react'
import {
	FormField,
} from '../../../../../../shared/components'
import {
	useEditClientStore,
} from '../../store/edit-client.store'
import {
	ChevronDown,
	ChevronUpBlue,
} from '../../../../../../assets/icons'
import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../../../shared/components'
import {
	Mail,
	Trash,
} from '../../../../../../assets/icons/'
import {
	AddAnotherEdit,
} from './add-another-edit.component'
import * as styles from './edit-client.style'

type Props = {
    hasErrors: boolean
    resetField: () => void
}

export const SecondStepEdit:React.FC<Props> = ({
	hasErrors,
	resetField,
},) => {
	const {
		values,
		setValues,
		setEmails,
	} = useEditClientStore()

	const [isOpen, setIsOpen,] = React.useState(false,)

	const handleToggle = (): void => {
		setIsOpen((prevState,) => {
			return !prevState
		},)
	}

	const dublicateInputError = values.emails.includes(values.email,) ?
		'error' :
		null

	const emptyFieldError = values.emails.length === 0 && !values.email ?
		'error' :
		null
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
		<div className={styles.editFormItem({
			isActive: isOpen,
		},)}>
			<div className={styles.editFormItemHeader}>
				<div>
					<h5 className={styles.editFormItemTitle}>Email addresses</h5>
					<p className={styles.editFormItemText}>
						{values.emails.slice(0, 1,).join(', ',)}
						{values.emails.length > 1 && `, + ${values.emails.length - 1}`}
					</p>
				</div>
				<Button<ButtonType.ICON>
					onClick={handleToggle}
					additionalProps={{
						btnType:   ButtonType.ICON,
						size:      Size.SMALL,
						icon:      isOpen ?
							<ChevronUpBlue width={20} height={20} /> :
							<ChevronDown width={20} height={20} />,
						color:     Color.NONE,
					}}
				/>
			</div>

			{isOpen && (
				<div>
					<div className={styles.editFormItemInputs}>
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
							onKeyDown={(e,) => {
								if (e.key === 'Enter') {
									e.preventDefault()
									if (!hasErrors && values.email.trim() && !values.emails.includes(values.email,)) {
										handleAddEmail()
									}
								}
							}}
						/>
						{values.emails.length > 0 && (
							[...values.emails,].reverse().map((email,) => {
								return (
									<div key={email} className={styles.editFormItemAdditional}>
										<div className={styles.editFormItemAdditionalLeft}>
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
					<div>

					</div>
					<div className={styles.editFormItemAddAnother}>
						<AddAnotherEdit
							handleAddEnother={handleAddEmail}
							disabled={addBtnDisabled}
						/>
					</div>
				</div>
			)}

		</div>
	)
}