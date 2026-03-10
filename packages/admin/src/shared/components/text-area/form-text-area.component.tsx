import * as React from 'react'
import type {
	FieldValidator,
} from 'final-form'
import {
	Field,
} from 'react-final-form'

import {
	TextArea,
} from './text-area.component'

type FieldProps = React.InputHTMLAttributes<HTMLTextAreaElement> & {
	name: string
	label: string
	error?: string | null
	validate?: FieldValidator<string> | undefined
	ref: React.MutableRefObject<HTMLTextAreaElement | null>
	initiaValue?: string
	isTouched?: boolean
	tabIndex?: number
	className?: string
}

export const FormTextArea = React.forwardRef<HTMLTextAreaElement, FieldProps>(({
	name,
	label,
	validate,
	initiaValue,
	isTouched,
	tabIndex,
	className,
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
			return <TextArea
				input={input}
				error={meta.error}
				label={label}
				{...inputAttributes}
				touched={meta.touched ?? isTouched}
				ref={ref}
				tabIndex={tabIndex}
				className={className}
			/>
		}}
	</Field>
},)