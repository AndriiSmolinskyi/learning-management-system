/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import * as React from 'react'
import {
	Button, ButtonType, Color, Size,
} from '../../../../shared/components'
import {
	CustomRangeDatePicker,
} from '../../../../shared/components/datepicker-mui/datepicker-range-mui.component'
import {
	ReactComponent as CalendarIcon,
} from '../../../../assets/icons/calendar.svg'
import {
	DatepickerField,
} from '../../../../shared/components/datepicker-field/datepicker-field.component'
import {
	isValid,
} from 'date-fns'
import {
	useAnalyticsFilterStore,
} from '../../analytics-store'
import type {
	TransactionFilter,
} from '../transactions.types'
import type {
	OperationTransactionFilter,
} from '../../../../shared/types/types'
import * as styles from '../transactions.styles'

interface IProps {
	children?: React.ReactNode
	filter: TransactionFilter | OperationTransactionFilter
	setDateRange: (dateRange: [Date | null, Date | null] | undefined) => void
	setIsCalendarError: (isError: boolean) => void
}
export const RangeFilter: React.FC<IProps> = ({
	children,
	filter,
	setDateRange,
	setIsCalendarError,
},) => {
	const [isActive, setIsActive,] = React.useState<boolean>(false,)
	const {
		setDate,
	} = useAnalyticsFilterStore()
	const handleSwitcherClick = (): void => {
		setIsActive(!isActive,)
	}

	const handleDateChange = (date: [Date | null, Date | null] | undefined,):void => {
		setDateRange(date,)
		setDate(undefined,)
	}
	React.useEffect(() => {
		if (filter.dateRange) {
			const [startDate, endDate,] = filter.dateRange
			const startDateObj = typeof startDate === 'string' ?
				new Date(startDate,) :
				startDate
			const endDateObj = typeof endDate === 'string' ?
				new Date(endDate,) :
				endDate
			const isAcceptDisabled =
      !startDateObj ||
      !endDateObj ||
      !isValid(startDateObj,) ||
      !isValid(endDateObj,) ||
      endDateObj.getTime() <= startDateObj.getTime()
			setIsCalendarError(isAcceptDisabled,)
		}
	}, [filter.dateRange,],)
	return (
		<>
			<p className={styles.selectText}>Select date range</p>
			<div className={styles.rangeFieldsWrapper}>
				<DatepickerField
					value={filter.dateRange ?
						(typeof filter.dateRange[0] === 'string' ?
							new Date(filter.dateRange[0],) :
							filter.dateRange[0]) :
						null}
					onChange={(newValue,) => {
						setDateRange([newValue, null,],)
						setDate(undefined,)
					}}
					format='dd/MM/yyyy'
				/>
				<Button<ButtonType.ICON>
					additionalProps={{
						btnType:  ButtonType.ICON,
						size:     Size.SMALL,
						color:    Color.SECONDRAY_GRAY,
						icon:	    <CalendarIcon width={20} height={20}/>,
					}}
					className={styles.calendarIcon}
					onClick={handleSwitcherClick}
				/>
				<DatepickerField
					value={filter.dateRange ?
						(typeof filter.dateRange[1] === 'string' ?
							new Date(filter.dateRange[1],) :
							filter.dateRange[1]) :
						null}
					onChange={(newValue,) => {
						setDateRange([
							filter.dateRange ?
								(typeof filter.dateRange[0] === 'string' ?
									new Date(filter.dateRange[0],) :
									filter.dateRange[0]) :
								null,
							newValue instanceof Date ?
								newValue :
								null,
						],)
						setDate(undefined,)
					}}
					minDate={filter.dateRange?.[0] ?
						(typeof filter.dateRange[0] === 'string' ?
							new Date(filter.dateRange[0],) :
							filter.dateRange[0]) :
						undefined}
					format='dd/MM/yyyy'
				/>

			</div>
			{children}
			<CustomRangeDatePicker
				isOpen={isActive}
				toggleIsOpen={handleSwitcherClick}
				onChange={handleDateChange}
				value={filter.dateRange ?
					[
						(typeof filter.dateRange[0] === 'string' ?
							new Date(filter.dateRange[0],) :
							filter.dateRange[0]),
						(typeof filter.dateRange[1] === 'string' ?
							new Date(filter.dateRange[1],) :
							filter.dateRange[1]),
					] :
					undefined}
				isControlPanel
			/>
		</>
	)
}