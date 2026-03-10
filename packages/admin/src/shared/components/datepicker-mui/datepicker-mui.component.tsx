/* eslint-disable complexity */
import {
	DatePicker, PickersDay,
} from '@mui/x-date-pickers'
import React from 'react'
import {
	CustomCalendarHeader,
} from './custom-header.component'
import {
	MyCustomDateIcon,
} from './mui-datepicker-icon.component'
import {
	dateTimePickerDialogStyles,
	dateTimePickerStyles,
	actionBarStylse,
	dayStyles,
} from './mui-datepicker.styles'
import {
	format,
} from 'date-fns/format'
import type {
	PickersDayProps,
} from '@mui/x-date-pickers'
import {
	Icon, InputAdornment,
} from '@mui/material'

type CustomDatePickerProps = {
  value?: Date | null
  disabled?: boolean
  onChange?: (value: Date | null) => void
  disableFuture?: boolean
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
	value,
	disabled,
	onChange,
	disableFuture = true,
},) => {
	const [isError, setIsError,] = React.useState(false,)
	const [open, setOpen,] = React.useState(false,)
	const [tempDate, setTempDate,] = React.useState<Date | null>(value ?? null,)
	React.useEffect(() => {
		setTempDate(value ?? null,)
	}, [value,],)
	const handleDateChange = (selectedDate: Date | null,): void => {
		if (!selectedDate || isNaN(selectedDate.getTime(),)) {
			setTempDate(null,)
			return
		}
		const year = selectedDate.getFullYear()
		const isValidYear = year >= 1900
		if (String(year,).length === 4 && !isValidYear) {
			setTempDate(null,)
			setIsError(true,)
			return
		}
		if (disableFuture && selectedDate > new Date()) {
			onChange?.(null,)
			return
		}
		setTempDate(selectedDate,)
		setIsError(false,)
	}

	const handleFieldDateChange = (selectedDate: Date | null,): void => {
		if (!selectedDate || isNaN(selectedDate.getTime(),)) {
			setTempDate(null,)
			onChange?.(null,)
			setIsError(true,)
			return
		}

		const year = selectedDate.getFullYear()

		if (year < 1900) {
			setTempDate(null,)
			onChange?.(null,)
			setIsError(true,)
			return
		}

		if (disableFuture && selectedDate > new Date()) {
			setTempDate(null,)
			onChange?.(null,)
			setIsError(true,)
			return
		}
		setTempDate(selectedDate,)
		onChange?.(selectedDate,)
		setIsError(false,)
	}
	const CustomDay = (props: PickersDayProps<Date>,): React.JSX.Element => {
		const {
			day,
		} = props
		const uniqueId = `day-${format(day, 'yyyy-MM-dd',)}`
		return (
			<div id={uniqueId} key={uniqueId}>
				<PickersDay {...props} day={day} />
			</div>
		)
	}
	const handleClose = (): void => {
		setOpen(false,)
		setTempDate(value ?? null,)
	}
	const handleAccept = (): void => {
		if (tempDate) {
			onChange?.(tempDate,)
		} else {
			onChange?.(null,)
		}
		setOpen(false,)
	}

	return (
		<DatePicker
			key={open ?
				'open' :
				'closed'}
			showDaysOutsideCurrentMonth
			closeOnSelect={false}
			disabled={disabled}
			minDate={new Date(1930,0,1,)}
			disableFuture={disableFuture}
			dayOfWeekFormatter={(date: Date,) => {
				return format(date, 'iiiiii',)
			}}
			onClose={() => {
				setOpen(false,)
			}}
			onOpen={() => {
				setOpen(true,)
			}}
			open={open}
			slotProps={{
				popper:    {
					sx:            dateTimePickerDialogStyles,
					disablePortal: true,
					onClick:       (e,) => {
						const target = e.target as HTMLElement
						if (target.classList.contains('MuiPaper-root',)) {
							if (value !== undefined) {
								setTempDate(value,)
							}
							setOpen(false,)
						}
					},
				},
				actionBar: {
					actions:  ['cancel', 'accept',],
					sx:       actionBarStylse,
					onAccept: handleAccept,
					onCancel: handleClose,
				},
				day:       {
					sx: dayStyles,
				},
				textField: {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					onChange: (e:any,) => {
						if (!e) {
							handleFieldDateChange(null,)
							return
						}
						handleFieldDateChange(new Date(e,),)
					},
				},
			}}
			sx={{
				...dateTimePickerStyles,
				border: isError ?
					'1px solid var(--error-200)' :
					dateTimePickerStyles.border,
				boxShadow: isError ?
					'0 0 0 4px var(--error-100), 0 1px 2px 0 #101828 !important' :
					dateTimePickerStyles.boxShadow,
				background: disabled ?
					'var(--gray-50)' :
					dateTimePickerStyles.background,
			}}
			slots={{
				day:            CustomDay,
				openPickerIcon: (props,) => {
					return (
						<InputAdornment position='end' sx={{
							marginLeft: '7px',
						}}>
							<Icon
								{...props}
								sx={{
									backgroundColor: 'transparent !important',
									'&:hover':       {
										backgroundColor: 'transparent !important',
									},
									'&:focus': {
										backgroundColor: 'transparent !important',
									},
								}}
							>
								<MyCustomDateIcon/>
							</Icon>
						</InputAdornment>
					)
				},
				calendarHeader: (props,) => {
					const date = tempDate ?
						new Date(tempDate,) :
						new Date()
					return <CustomCalendarHeader {...props} additionalInfo={date} />
				},
			}}
			views={['year', 'day',]}
			value={value ?? null}
			onChange={handleDateChange}
			format='dd/MM/yyyy'
			reduceAnimations={true}
		/>
	)
}

export default CustomDatePicker
