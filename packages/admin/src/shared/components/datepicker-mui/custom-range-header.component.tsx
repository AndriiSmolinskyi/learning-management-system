import * as React from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import ChevronRight from '@mui/icons-material/ChevronRight'
import type {
	PickersCalendarHeaderProps,
} from '@mui/x-date-pickers/PickersCalendarHeader'
import {
	addMonths, format, subMonths, subYears,
} from 'date-fns'
import {
	headerDataStyles,
	CustomCalendarHeaderRoot,
	HeaderNavigation,
	rangeHeaderMonthValueStyles,
	rangeHeaderCalendarIcon,
	monthRangeButton,
	headerBlock,
} from './mui-datepicker.styles'
import {
	formatDateToDDMMYYYY,
} from '../../utils'
import {
	CalendarPauseIcon,
} from '../../../assets/icons'
interface ICustomCalendarHeaderProps extends PickersCalendarHeaderProps<Date> {
  onRangeSelect: (range: [Date | null, Date | null]) => void;
  onChange?: (value: [Date | null, Date | null]) => void
  selectedRange: [Date | null, Date | null];
}

export const CustomRangeCalendarHeader: React.FC<ICustomCalendarHeaderProps> = ({
	onRangeSelect,
	selectedRange,
	onChange,
	...props
},) => {
	const [activeRange, setActiveRange,] = React.useState<number | null>(null,)
	const {
		currentMonth, onMonthChange,
	} = props
	const selectNextMonth = (): void => {
		onMonthChange(addMonths(currentMonth, 1,), 'left',)
	}
	const selectPreviousMonth = (): void => {
		onMonthChange(subMonths(currentMonth, 1,), 'right',)
	}
	// React.useEffect(() => {
	// 	if (selectedRange[0] && selectedRange[1]) {
	// 		const endDate = new Date()
	// 		const diffMonths = Math.round(
	// 			(endDate.getTime() - selectedRange[0].getTime()) / (1000 * 60 * 60 * 24 * 30),
	// 		)

	// 		if ([1, 3, 12,].includes(diffMonths,)) {
	// 			setActiveRange(diffMonths,)
	// 		} else {
	// 			setActiveRange(null,)
	// 		}
	// 	}
	// }, [selectedRange,],)
	React.useEffect(() => {
		if (selectedRange[0] && selectedRange[1]) {
			const endDate = new Date()
			endDate.setHours(0, 0, 0, 0,)

			const startDate = new Date(selectedRange[0],)
			startDate.setHours(0, 0, 0, 0,)

			const diffMonths = Math.round(
				(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30),
			)

			if ([1, 3, 12,].includes(diffMonths,)) {
				setActiveRange(diffMonths,)
			} else {
				setActiveRange(null,)
			}
		}
	}, [selectedRange,],)
	const handleRangeSelect = (months: number,): void => {
		const endDate = new Date()
		endDate.setHours(0, 0, 0, 0,)

		const startDate = months === 12 ?
			subYears(endDate, 1,) :
			subMonths(endDate, months,)
		onRangeSelect([startDate, endDate,],)
		if (onChange) {
			onChange([startDate, endDate,],)
		}
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
					return (
						<Button
							key={value}
							variant='outlined'
							size='small'
							sx={{
								...monthRangeButton,
								color:           activeRange === value ?
									'var(--primary-500)' :
									'var(--gray-700)',
							}}
							onClick={() => {
								handleRangeSelect(value,)
							}}
						>
							{label}
						</Button>
					)
				},)}
			</Stack>
			<Stack direction='row' spacing={1}>
				<Typography variant='body2' color='textSecondary' sx={rangeHeaderMonthValueStyles}>
					{selectedRange[0] ?
						formatDateToDDMMYYYY(selectedRange[0],) :
						''}
				</Typography>
				<Typography variant='body2' color='textSecondary' sx={rangeHeaderCalendarIcon}>
					<CalendarPauseIcon/>
				</Typography>
				<Typography variant='body2' color='textSecondary' sx={rangeHeaderMonthValueStyles}>
					{selectedRange[1] ?
						formatDateToDDMMYYYY(selectedRange[1],) :
						''}
				</Typography>
			</Stack>
		</CustomCalendarHeaderRoot>
	)
}
