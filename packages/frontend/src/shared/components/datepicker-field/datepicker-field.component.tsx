import * as React from 'react'

import {
	DateField,
} from '@mui/x-date-pickers/DateField'

import {
	datepickerFieldStyles,
} from './datepicker-field.styles'

interface IProps {
	value: Date | null
	onChange: (value: Date | null) => void
	label?: string
	minDate?: Date
	maxDate?: Date
	disableFuture?: boolean
	format?: string
}

export const DatepickerField: React.FC<IProps> = ({
	value,
	onChange,
	label,
	disableFuture,
	maxDate,
	minDate,
	format,
},) => {
	return (
		<DateField
			label={label ?? ''}
			value={value}
			onChange={(newValue,) => {
				onChange(newValue,)
			}}
			format={format ?? 'dd/mm/yyyy'}
			disableFuture={disableFuture}
			minDate={minDate}
			maxDate={maxDate}
			sx={datepickerFieldStyles}
		/>
	)
}