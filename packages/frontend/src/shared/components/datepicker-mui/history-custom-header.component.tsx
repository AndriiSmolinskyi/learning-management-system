import * as React from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import ChevronRight from '@mui/icons-material/ChevronRight'
import type {
	PickersCalendarHeaderProps,
} from '@mui/x-date-pickers/PickersCalendarHeader'
import {
	headerDataStyles,
	headerMonthValueStyles,
	CustomCalendarHeaderRoot,
	HeaderNavigation,
	headerBlock,
	monthRangeButton,
} from './mui-datepicker.styles'
import {
	format, isSameDay, startOfDay, startOfMonth, subYears,
} from 'date-fns'
import {
	addMonths, subMonths,
} from 'date-fns'
import {
	formatDateToDDMMYYYY,
} from '../../../shared/utils'
import Button from '@mui/material/Button'

interface ICustomCalendarHeaderProps extends PickersCalendarHeaderProps<Date> {
	additionalInfo: Date;
	handleDateChange: (date: Date | null) => void
}

export const CustomHistoryCalendarHeader: React.FC<ICustomCalendarHeaderProps> = ({
	additionalInfo, handleDateChange, ...props
},) => {
	const {
		currentMonth, onMonthChange,
	} = props
	const selectNextMonth = (): void => {
		onMonthChange(addMonths(currentMonth, 1,), 'left',)
	}
	const selectPreviousMonth = (): void => {
		onMonthChange(subMonths(currentMonth, 1,), 'right',)
	}
	return (
		<CustomCalendarHeaderRoot>
			<HeaderNavigation>
				<Stack spacing={1} direction='row'>
					<IconButton onClick={selectPreviousMonth} title='Previous month'>
						<ChevronLeft />
					</IconButton>
				</Stack>
				<Typography variant='body2' sx={headerDataStyles} onClick={() => {
					if (props.onViewChange) {
						props.onViewChange('year',)
					}
				}}>
					{format(currentMonth, 'MMMM yyyy',)}</Typography>
				<Stack spacing={1} direction='row'>
					<IconButton onClick={selectNextMonth} title='Next month'>
						<ChevronRight />
					</IconButton>
				</Stack>
			</HeaderNavigation>
			<Stack direction='row' spacing={2.5} sx={headerBlock}>
				{[
					{
						label: '1 M ago', value: 1,
					},
					{
						label: '3 M ago', value: 3,
					},
					{
						label: '1 Y ago', value: 12,
					},
				].map(({
					label, value,
				},) => {
					const endDate = new Date()
					const targetDate = value === 12 ?
						subYears(endDate, 1,) :
						subMonths(endDate, value,)

					const isActive = isSameDay(startOfDay(targetDate,), additionalInfo,)
					return (
						<Button
							key={value}
							variant='outlined'
							size='small'
							sx={{
								...monthRangeButton,
								color:           isActive ?
									'var(--primary-500)' :
									'var(--gray-700)',
							}}

							onClick={() => {
								handleDateChange(targetDate,)
								props.onMonthChange(startOfMonth(targetDate,), 'left',)
							}}
						>
							{label}
						</Button>
					)
				},)}
			</Stack>
			<Typography variant='body2' color='textSecondary' sx={headerMonthValueStyles}>
				{formatDateToDDMMYYYY(additionalInfo,)}
			</Typography>
		</CustomCalendarHeaderRoot>
	)
}