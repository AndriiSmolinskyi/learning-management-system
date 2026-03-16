import * as React from 'react'
import {
	Field,
} from 'react-final-form'

import {
	Radio,
} from './radio.component'

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
	name: string
	label: string
	error?: string | null
	initialValue?: string
	isTouched?: boolean
}

export function FormRadio({
	name,
	label,
	initialValue,
	isTouched,
	checked,
	value,
	...inputAttributes
}: FieldProps,): React.ReactNode {
	return <Field
		type='radio'
		name={name}
		checked={checked}
		value={value}
		initialValue={initialValue}
	>
		{({
			input, meta,
		},): React.ReactNode => {
			return <Radio
				input={input}
				error={meta.error}
				label={label}
				{...inputAttributes}
				touched={meta.touched ?? isTouched}
			/>
		}}
	</Field>
}