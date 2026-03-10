import React from 'react'

import {
	HistoryClockIcon,
} from '../../../../../assets/icons'
import {
	HistoryDatePicker,
} from '../../../../../shared/components/datepicker-mui/history-datepicker.component'
import type {
	TAnalyticsFilter,
} from './analytics-filter.types'
import type {
	TOperationsStoreFilter,
} from '../../../../../modules/operations/layout/components/filter/filter.store'
import * as styles from './analytics-filter.styles'

type THistoryViewTypes = {
		setAnalyticsFilter: React.Dispatch<React.SetStateAction<TAnalyticsFilter>> | React.Dispatch<React.SetStateAction<TOperationsStoreFilter>>
		analyticsFilter: TAnalyticsFilter | TOperationsStoreFilter;
		clearAssetIds?: () => void
}

export const HistoryView: React.FC<THistoryViewTypes> = ({
	setAnalyticsFilter,
	analyticsFilter,
	clearAssetIds,
},) => {
	const [isActive, setIsActive,] = React.useState<boolean>(false,)
	const switcherCircleRef = React.useRef<HTMLDivElement | null>(null,)
	const handleSwitcherClick = (): void => {
		setIsActive(!isActive,)
	}

	const handleDateChange = (date: string | undefined,):void => {
		clearAssetIds?.()
		setAnalyticsFilter({
			...analyticsFilter,
			date,
		},
		)
	}
	const dateValue = analyticsFilter.date ?
		new Date(analyticsFilter.date,) :
		undefined
	return (
		<div className={styles.historyWrapper}>
			<div className={styles.historyLeftBlock}>
				<div className={styles.iconBlock}>
					<HistoryClockIcon width={18} height={18}/>
					<p className={styles.iconText}>History view</p>
				</div>
				<p className={styles.historyInfoText}>Switch from real-time to archived data</p>
			</div>
			<div className={styles.historyRightBlock(isActive || Boolean(analyticsFilter.date,),)} onClick={() => {
				if (analyticsFilter.date) {
					setAnalyticsFilter({
						...analyticsFilter,
						date: undefined,
					},
					)
				} else {
					handleSwitcherClick()
				}
			}}>
				<div ref={switcherCircleRef} className={styles.historySwitcherItem(isActive || Boolean(analyticsFilter.date,),)} onClick={(e,) => {
					if (switcherCircleRef.current && analyticsFilter.date) {
						e.stopPropagation()
						handleSwitcherClick()
					}
				}}/>
			</div>
			<HistoryDatePicker isOpen={isActive} toggleIsOpen={handleSwitcherClick} onChange={handleDateChange} value={dateValue} isTodayDisabled/>
		</div>
	)
}
