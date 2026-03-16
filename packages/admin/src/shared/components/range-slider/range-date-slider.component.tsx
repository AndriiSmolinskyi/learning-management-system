import * as React from 'react'
import Slider from '@mui/material/Slider'
import {
	format, endOfDay, getTime, isValid, parse,
} from 'date-fns'

import {
	SliderSxStyles,
} from './range-slider.styles'
import {
	useDebounce,
} from '../../hooks'

import * as styles from './range-slider.styles'

type TDateRangeProps = {
  startDate: string
  setDateRange: (dateRange: [Date | null, Date | null] | undefined) => void
  isCleared: boolean
}

const parseDate = (dateStr: string,): Date | null => {
	let date = new Date(dateStr,)
	if (!isValid(date,)) {
		date = parse(dateStr, 'dd.MM.yyyy', new Date(),)
	}
	return isValid(date,) ?
		date :
		null
}

export const DateRangeSlider: React.FC<TDateRangeProps> = ({
	startDate,
	setDateRange,
	isCleared,
},) => {
	const parsedStartDate = parseDate(startDate,)
	const minTs = parsedStartDate ?
		getTime(parsedStartDate,) :
		getTime(new Date('2017-12-01',),)
	const maxTs = getTime(endOfDay(new Date(),),)
	const [rangeValue, setRangeValue,] = React.useState<[number, number]>([
		minTs,
		maxTs,
	],)
	const [hasInteracted, setHasInteracted,] = React.useState(false,)
	React.useEffect(() => {
		if (isCleared) {
			setRangeValue([minTs,maxTs,],)
			setHasInteracted(false,)
		}
	}, [isCleared,],)
	const handleChange = (event: Event, newValue: number | Array<number>,): void => {
		if (Array.isArray(newValue,)) {
			setRangeValue(newValue as [number, number],)
		}
	}
	const debouncedRange = useDebounce<[number, number]>(rangeValue, 1200,)
	React.useEffect(() => {
		if (hasInteracted) {
			setDateRange([new Date(debouncedRange[0],), new Date(debouncedRange[1],),],)
		}
	}, [debouncedRange,],)

	return (
		<div className={styles.dateRangeSliderWrapper}>
			<Slider
				value={rangeValue}
				onChange={handleChange}
				onChangeCommitted={() => {
					setHasInteracted(true,)
				}}
				min={minTs}
				max={maxTs}
				sx={SliderSxStyles}
				valueLabelDisplay='auto'
				valueLabelFormat={(val,) => {
					return format(val, 'dd/MM/yyyy',)
				}}
			/>
		</div>
	)
}
