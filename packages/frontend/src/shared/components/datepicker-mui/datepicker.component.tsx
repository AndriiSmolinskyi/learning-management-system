import React from 'react'
import {
	Field,
} from 'react-final-form'
import type {
	FieldValidator,
} from 'final-form'
import {
	CustomDatePicker,
} from './datepicker-mui.component'

type CustomDatePickerProps = {
	name: string;
	value?: Date | null
	disabled?: boolean
	validate?: FieldValidator<string> | undefined
	onChange?: (value: Date | null) => void
	disableFuture?: boolean
	tabIndex?: number
};

export const CustomDatePickerField: React.FC<CustomDatePickerProps> = ({
	name,
	value,
	disabled,
	tabIndex,
	disableFuture = true,
	validate,
	onChange,
},) => {
	return (
		<Field
			name={name}
			validate={validate}
			placeholder='dd/mm/yyyy'
			tabIndex={tabIndex}
		>
			{({
				input,
			},): React.ReactNode => {
				return (
					<CustomDatePicker
						value={value ?? input.value ?
							new Date(input.value,) :
							null}
						disabled={disabled}
						onChange={onChange ?? input.onChange}
						disableFuture={disableFuture}
					/>
				)
			}}
		</Field>
	)
}
