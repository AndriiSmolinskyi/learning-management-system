/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-depth */
/* eslint-disable complexity */

import React, {
	useState, useEffect,
} from 'react'
import {
	DatePicker, PickersDay, pickersDayClasses,
} from '@mui/x-date-pickers'
import {
	CustomRangeCalendarHeader,
} from './custom-range-header.component'
import {
	MyCustomDateIcon,
} from './mui-datepicker-icon.component'
import {
	rangeDateTimePickerDialogStyles,
	rangeDateTimePickerStyles,
	dayStyles,
	actionBarStyles,
} from './mui-datepicker.styles'
import {
	format, isSameDay,
} from 'date-fns'
import type {
	PickersDayProps,
} from '@mui/x-date-pickers'
import {
	Icon,
	InputAdornment,
	TextField,
} from '@mui/material'

type CustomDatePickerProps = {
	isOpen?: boolean
	value?: [Date | null, Date | null]
	disabled?: boolean
	onChange?: (value: [Date | null, Date | null] | undefined) => void
	disableFuture?: boolean
	toggleIsOpen?: () => void
	isControlPanel?: boolean
}

export const CustomRangeDatePicker: React.FC<CustomDatePickerProps> = ({
	value,
	disabled,
	onChange,
	disableFuture = true,
	isOpen,
	toggleIsOpen,
	isControlPanel,
},) => {
	const [tempRange, setTempRange,] = useState<[Date | null, Date | null]>(value ?? [null, null,],)
	const [isClosing, setIsClosing,] = useState(false,)
	const [view, setView,] = React.useState<'year' | 'month' | 'day'>('day',)
	useEffect(() => {
		if (isOpen) {
			setTempRange(value ?? [null, null,],)
		}
		return () => {
			setTempRange([null, null,],)
		}
	}, [isOpen, value,],)

	const handleDateChange = (date: Date | null,): void => {
		if (view !== 'day') {
			return
		}
		if (tempRange[0] && tempRange[1]) {
			setTempRange([date, null,],)
			return
		}
		if (!tempRange[0]) {
			setTempRange([date, null,],)
		} else if (!tempRange[1]) {
			if (date) {
				if (date < tempRange[0]) {
					setTempRange([date, null,],)
				} else {
					setTempRange([tempRange[0], date,],)
				}
			}
		}
	}
	const handleClose = (): void => {
		setIsClosing(true,)
		setTimeout(() => {
			toggleIsOpen?.()
			setIsClosing(false,)
		}, 250,)
	}
	const handleAccept = (): void => {
		onChange?.(tempRange,)
		toggleIsOpen?.()
	}

	const handleCancel = (): void => {
		setIsClosing(true,)
		setTimeout(() => {
			onChange?.(undefined,)
			toggleIsOpen?.()
			setIsClosing(false,)
		}, 250,)
	}
	const CustomDay = (props: PickersDayProps<Date>,): React.JSX.Element => {
		const {
			day, ...other
		} = props
		const isStartDate =
		tempRange[0] && isSameDay(day, (tempRange[0]),)

		const isEndDate =
		tempRange[1] && isSameDay(day, (tempRange[1]),)

		const isInRange =
		tempRange[0] &&
		tempRange[1] &&
		day > (tempRange[0]) &&
		day < (tempRange[1])
		const isToday = isSameDay(day, new Date(),)
		const isUnselectedToday = isToday && !isStartDate && !isEndDate && !isInRange
		return (
			<PickersDay
				{...other}
				day={day}
				selected={false}
				sx={{
					...dayStyles,
					...(isStartDate || isEndDate ?
						{
							backgroundColor: 'var(--primary-500) !important',
							color:           'var(--base-white)',
							borderRadius:    '50%',
						} :
						isInRange ?
							{
								backgroundColor: 'var(--gray-50)',
								color:           'var(--gray-700)',
								borderRadius:    0,
							} :
							{
							}),
					...(isUnselectedToday ?
						{
							[`&.${pickersDayClasses.today}`]: {
								border:          'var(--gray-700) 1px solid !important',
								backgroundColor: 'transparent !important',
							},
						} :
						{
						}),
					...(isStartDate && tempRange[0] && tempRange[1] && {
						position:    'relative',
						zIndex:                 '20 !important',
						'&::before': {
							content:         '""',
							position:        'absolute',
							top:             0,
							bottom:          0,
							left:            '50%',
							right:           '-4px',
							backgroundColor: 'var(--gray-50)',
							zIndex:          -2,
						},
						'&::after': {
							content:         '""',
							position:        'absolute',
							inset:           0,
							borderRadius:    '50%',
							backgroundColor: 'var(--primary-500)',
							zIndex:          -1,
						},
					}),
					...(isEndDate && tempRange[0] && tempRange[1] && {
						position:    'relative',
						zIndex:                 '20 !important',
						'&::before': {
							content:         '""',
							position:        'absolute',
							top:             0,
							bottom:          0,
							right:            '50%',
							left:            '-4px',
							backgroundColor: 'var(--gray-50)',
							zIndex:          -2,
						},
						'&::after': {
							content:         '""',
							position:        'absolute',
							inset:           0,
							borderRadius:    '50%',
							backgroundColor: 'var(--primary-500)',
							zIndex:          -1,
						},
					}),
					...(isEndDate && tempRange[0] && tempRange[1] && isToday && {
						[`&.${pickersDayClasses.today}`]: {
							border:          'none',
						},
					}),
					...(isInRange && !isStartDate && !isEndDate && {
						...(day.getDay() === 0 && {
							borderTopLeftRadius:    '50%',
							borderBottomLeftRadius: '50%',
						}),
						...(day.getDay() === 6 && {
							borderTopRightRadius:    '50%',
							borderBottomRightRadius: '50%',
						}),
					}),
				}}
			/>
		)
	}
	const isValid = tempRange[0] && tempRange[1] && tempRange[0] <= tempRange[1]
	return (
		<DatePicker
			key={isOpen ?
				'open' :
				'closed'}
			open={isOpen}
			showDaysOutsideCurrentMonth
			closeOnSelect={false}
			onClose={handleClose}
			disabled={disabled}
			disableFuture={disableFuture}
			dayOfWeekFormatter={(date: Date,) => {
				return format(date, 'iiiiii',)
			}}
			minDate={new Date(1930, 0, 1,)}
			slotProps={{
				popper: {
					sx: {
						...rangeDateTimePickerDialogStyles,
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
					sx:       actionBarStyles(isValid ?? false,),
					onAccept: handleAccept,
					onCancel: handleCancel,
				},
				day: {
					sx: dayStyles,
				},
			}}
			sx={rangeDateTimePickerStyles}
			reduceAnimations
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
									'&:focus':       {
										backgroundColor: 'transparent !important',
									},
								}}
							>
								<MyCustomDateIcon />
							</Icon>
						</InputAdornment>
					)
				},
				calendarHeader: (props,) => {
					return (
						<CustomRangeCalendarHeader
							{...props}
							selectedRange={tempRange}
							onRangeSelect={setTempRange}
						/>
					)
				},
			}}
			views={['year', 'day',]}
			onViewChange={(v,) => {
				setView(v,)
			}}
			value={tempRange[0]}
			onChange={handleDateChange}
			format='dd/MM/yyyy'
		/>
	)
}

export default CustomRangeDatePicker
