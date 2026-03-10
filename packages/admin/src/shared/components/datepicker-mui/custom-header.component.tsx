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
} from './mui-datepicker.styles'
import {
	format,
} from 'date-fns'
import {
	addMonths, subMonths,
} from 'date-fns'
import {
	formatDateToDDMMYYYY,
} from '../../../shared/utils'
interface ICustomCalendarHeaderProps extends PickersCalendarHeaderProps<Date> {
	additionalInfo: Date;
}

export const CustomCalendarHeader: React.FC<ICustomCalendarHeaderProps> = ({
	additionalInfo, ...props
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
			<Typography variant='body2' color='textSecondary' sx={headerMonthValueStyles}>
				{formatDateToDDMMYYYY(additionalInfo,)}
			</Typography>
		</CustomCalendarHeaderRoot>
	)
}