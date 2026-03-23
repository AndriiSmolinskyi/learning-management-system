/* eslint-disable complexity */
import {
	DatePicker, PickersDay,
} from '@mui/x-date-pickers'
import React from 'react'
import {
	CustomHistoryCalendarHeader,
} from './history-custom-header.component'
import {
	MyCustomDateIcon,
} from './mui-datepicker-icon.component'
import {
	dateTimeHistoryPickerDialogStyles,
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
	Icon, InputAdornment, TextField,
} from '@mui/material'
import {
	formatToUTCISOString,
} from '../../../shared/utils'
import {
	isToday,
} from 'date-fns'

type CustomDatePickerProps = {
  value?: Date | undefined
  disabled?: boolean
  onChange?: (value: string | undefined) => void
  disableFuture?: boolean
  isOpen?: boolean
  toggleIsOpen?: () => void
  isTodayDisabled?: boolean
}

export const HistoryDatePicker: React.FC<CustomDatePickerProps> = ({
	value,
	disabled,
	onChange,
	disableFuture = true,
	isOpen,
	toggleIsOpen,
	isTodayDisabled = false,
},) => {
	const [isError, setIsError,] = React.useState(false,)
	const [tempDate, setTempDate,] = React.useState<Date | null>(value ?? null,)
	const [isClosing, setIsClosing,] = React.useState(false,)
	React.useEffect(() => {
		if (isOpen) {
			setTempDate(value ?? null,)
		}
		return () => {
			setTempDate(null,)
		}
	}, [isOpen, value,],)

	const handleDateChange = (selectedDate: Date | null,): void => {
		if (!selectedDate || isNaN(selectedDate.getTime(),)) {
			setTempDate(null,)
			setIsError(false,)
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
			setTempDate(null,)
			return
		}
		setTempDate(selectedDate,)
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
		setIsClosing(true,)
		setTimeout(() => {
			toggleIsOpen?.()
			setIsClosing(false,)
		}, 250,)
	}
	const handleAccept = (): void => {
		if (tempDate) {
			const formattedDate = formatToUTCISOString(tempDate,)
			onChange?.(formattedDate,)
		} else {
			onChange?.(undefined,)
		}
		toggleIsOpen?.()
	}

	const handleCancel = (): void => {
		handleClose()
		setTempDate(value ?? null,)
		onChange?.(undefined,)
	}
	return (
		<DatePicker
			key={isOpen ?
				'open' :
				'closed'}
			open={isOpen}
			onClose={handleClose}
			showDaysOutsideCurrentMonth
			closeOnSelect={false}
			disabled={disabled}
			minDate={new Date(1930,0,1,)}
			disableFuture={disableFuture}
			shouldDisableDate={(date,) => {
				return isTodayDisabled && isToday(date,)
			}}
			dayOfWeekFormatter={(date: Date,) => {
				return format(date, 'iiiiii',)
			}}
			slotProps={{
				popper:    {
					sx: {
						...dateTimeHistoryPickerDialogStyles,
						opacity:    isClosing ?
							0 :
							1,
						visibility: isClosing ?
							'hidden' :
							'visible',
						transition: 'opacity 0.3s ease !important',
					},
					onClick: (e,) => {
						const target = e.target as HTMLElement
						if (target.classList.contains('MuiPaper-root',)) {
							handleClose()
						}
					},
				},
				actionBar: {
					actions:  ['cancel', 'accept',],
					sx:       actionBarStylse,
					onAccept: handleAccept,
					onCancel: handleCancel,
				},
				day:       {
					sx: dayStyles,
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
			reduceAnimations={true}
			slots={{
				textField: (params,) => {
					return (
						<TextField
							{...params}
							variant='standard'
							style={{
								position:      'absolute',
								opacity:       0,
								pointerEvents: 'none',
								width:         0,
								height:        0,
							}}
						/>
					)
				},
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
					return <CustomHistoryCalendarHeader {...props} additionalInfo={date} handleDateChange={handleDateChange}/>
				},
			}}
			views={['year', 'day',]}
			value={tempDate ?? null}
			onChange={handleDateChange}
			format='dd/MM/yyyy'
		/>
	)
}

export default HistoryDatePicker
