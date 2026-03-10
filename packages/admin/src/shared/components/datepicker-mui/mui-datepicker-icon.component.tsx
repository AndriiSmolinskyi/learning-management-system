import React from 'react'
import {
	ReactComponent as CalendarIcon,
} from '../../../assets/icons/calendar.svg'
import {
	SvgIcon,
} from '@mui/material'
import type {
	SvgIconProps,
} from '@mui/material'
import {
	svgCalendarStyles,
} from './mui-datepicker.styles'
export const MyCustomDateIcon: React.FC<SvgIconProps> = (props,) => {
	return (
		<SvgIcon
			component={CalendarIcon}
			sx={svgCalendarStyles}
			{...props} />
	)
}