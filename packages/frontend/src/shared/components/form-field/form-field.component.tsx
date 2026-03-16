import * as React from 'react'
import type {
	FieldValidator,
} from 'final-form'
import {
	Field,
} from 'react-final-form'

import Input from '../input/input.component'

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
	name: string
	label?: string
	error?: string | null
	validate?: FieldValidator<string> | undefined
	ref: React.MutableRefObject<HTMLInputElement | null>
	initiaValue?: string
	leftIcon?: React.ReactNode
	rightIcon?: React.ReactNode
	readOnly?: boolean
	isNumber?: boolean
	isDisabled?: boolean
	showError?: boolean
	isNegative?: boolean
}

export const FormField = React.forwardRef<HTMLInputElement, FieldProps>(({
	name,
	label,
	validate,
	initiaValue,
	leftIcon,
	rightIcon,
	error,
	isNumber,
	isNegative,
	isDisabled = false,
	readOnly = false,
	showError = false,
	...inputAttributes
}, ref,) => {
	return <Field
		name={name}
		validate={validate}
		initialValue={initiaValue}
	>
		{({
			input, meta,
		},): React.ReactNode => {
			return <Input
				input={input}
				// error={error ?
				// 	meta.error || error :
				// 	meta.error}
				error={
					!readOnly && (error ?
						meta.error || error :
						meta.error)
				}
				label={label ?? ''}
				leftIcon={leftIcon}
				rightIcon={rightIcon}
				{...inputAttributes}
				touched={meta.touched}
				ref={ref}
				readOnly={readOnly}
				isNumber={isNumber}
				isDisabled={isDisabled}
				showError={showError}
				isNegative={isNegative}
			/>
		}}
	</Field>
},)

export default FormField
