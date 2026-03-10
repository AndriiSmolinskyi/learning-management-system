import * as React from 'react'
import type {
	FieldValidator,
} from 'final-form'
import {
	Field,
} from 'react-final-form'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import * as styles from './phone-field.style'

interface IPhoneFieldProps {
	name: string
	label?: string
	error?: string | null
	validate?: FieldValidator<string>
	initialValue?: string
	placeholder?: string
	value?: string
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const PhoneField: React.FunctionComponent<IPhoneFieldProps> = ({
	name,
	label,
	validate,
	initialValue,
	placeholder = '(XXX) XXX-XXXX',
	onChange,
},) => {
	return (
		<Field name={name} validate={validate} initialValue={initialValue}>
			{({
				input, meta,
			},) => {
				const handlePhoneChange = (value: string | undefined,): void => {
					input.onChange(value,)
					if (onChange) {
						const fakeEvent = {
							target: {
								value: value ?? '',
							},
						} as React.ChangeEvent<HTMLInputElement>
						onChange(fakeEvent,)
					}
				}

				return (
					<div>
						{label && <label htmlFor={name}>{label}</label>}
						<div className={`${styles.inputWrapper} ${meta.error && meta.touched ?
							'error' :
							''}`}>
							<PhoneInput
								id={name}
								international
								limitMaxLength
								defaultCountry='US'
								withCountryCallingCode
								value={input.value}
								onChange={handlePhoneChange}
								placeholder={placeholder}
								className={styles.phoneInputField}
							/>
						</div>
					</div>
				)
			}}
		</Field>
	)
}
