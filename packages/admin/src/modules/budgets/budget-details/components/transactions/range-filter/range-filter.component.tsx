import * as React from 'react'

import {
	Plus,
} from '../../../../../../assets/icons'
import {
	Button, ButtonType, Color, Size,
} from '../../../../../../shared/components'
import {
	CalendarPauseIcon,
} from '../../../../../../assets/icons'
import {
	CustomRangeDatePicker,
} from '../../../../../../shared/components/datepicker-mui/datepicker-range-mui.component'
import {
	ReactComponent as CalendarIcon,
} from '../../../../../../assets/icons/calendar.svg'
import type {
	TTransactionSearch,
} from '../transactions.types'
import {
	DatepickerField,
} from '../../../../../../shared/components/datepicker-field/datepicker-field.component'

import * as styles from './range-filter.styles'
import {
	isValid,
} from 'date-fns'

interface IProps {
	setTransactionFilter: React.Dispatch<React.SetStateAction<TTransactionSearch>>
	transactionFilter: TTransactionSearch
	setIsCalendarError: React.Dispatch<React.SetStateAction<boolean>>
}
export const RangeFilter: React.FC<IProps> = ({
	setTransactionFilter,
	transactionFilter,
	setIsCalendarError,
},) => {
	const [isActive, setIsActive,] = React.useState<boolean>(false,)

	const handleSwitcherClick = (): void => {
		setIsActive(!isActive,)
	}

	const handleDateChange = (date: [Date | null, Date | null] | undefined,):void => {
		setTransactionFilter({
			...transactionFilter,
			dateRange:    date,
		},)
	}
	React.useEffect(() => {
		if (transactionFilter.dateRange) {
			const [startDate, endDate,] = transactionFilter.dateRange

			const isAcceptDisabled = !startDate ||
			!endDate ||
			!isValid(startDate,) ||
			!isValid(endDate,) ||
			endDate.getTime() <= startDate.getTime()
			setIsCalendarError(isAcceptDisabled,)
		}
	}, [transactionFilter.dateRange,],)

	return (
		<div className={styles.rangeWrapper}>
			<p className={styles.rangeTitle}>Transaction date range</p>
			<div className={styles.infoBlock}>
				<DatepickerField
					value={transactionFilter.dateRange ?
						transactionFilter.dateRange[0] :
						null}
					onChange={(newValue,) => {
						setTransactionFilter({
							...transactionFilter,
							dateRange: [newValue, null,],
						},)
					}}
					format='dd/MM/yyyy'
					disableFuture
				/>
				<CalendarPauseIcon width={22} height={2}/>
				<DatepickerField
					value={transactionFilter.dateRange ?
						transactionFilter.dateRange[1] :
						null}
					onChange={(newValue,) => {
						setTransactionFilter({
							...transactionFilter,
							dateRange: [transactionFilter.dateRange ?
								transactionFilter.dateRange[0] :
								null, newValue,],
						},)
					}}
					minDate={transactionFilter.dateRange?.[0] ?? undefined}
					format='dd/MM/yyyy'
					disableFuture
				/>
				<Button<ButtonType.ICON>
					additionalProps={{
						btnType:  ButtonType.ICON,
						leftIcon: <Plus/>,
						size:     Size.SMALL,
						color:    Color.SECONDRAY_GRAY,
						icon:	    <CalendarIcon width={20} height={20}/>,
					}}
					className={styles.clearButton}
					onClick={handleSwitcherClick}
				/>
			</div>
			<CustomRangeDatePicker
				isOpen={isActive}
				toggleIsOpen={handleSwitcherClick}
				onChange={handleDateChange}
				value={transactionFilter.dateRange}
				isControlPanel
			/>
		</div>
	)
}