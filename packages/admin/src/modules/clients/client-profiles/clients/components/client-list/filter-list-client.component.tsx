/* eslint-disable complexity */
import * as React from 'react'
import {
	Button, ButtonType, Color, Size, RangeSlider,
} from '../../../../../../shared/components'
import {
	ReactComponent as Check,
} from '../../../../../../assets/icons/check.svg'
import {
	ReactComponent as CheckNegative,
} from '../../../../../../assets/icons/check-negative.svg'
import {
	useRangeStore,
} from '../../../../../../store/range-slider.store'
import {
	RadioChecked, RadioEmpty,
} from '../../../../../../assets/icons'
import {
	isDeepEqual,
} from '../../../../../../shared/utils'
import type {
	IFilterProps,
} from '../../clients.types'
import {
	initialFilterStoreState,
	useClientFilterStore,
} from '../../store/client-filter.store'
import * as styles from './filter-list-client.style'

interface IFilterListDialogProps {
	handleFilterMenuToggle: () => void
	filters: IFilterProps
	setFilters: React.Dispatch<React.SetStateAction<IFilterProps>>
}

export const FilterListClient: React.FC<IFilterListDialogProps> = ({
	handleFilterMenuToggle,
	filters,
	setFilters,
},) => {
	const [isClearClicked, setIsClearClicked,] = React.useState<boolean>(false,)
	const isAppliedClickedRef = React.useRef(false,)
	const [analyticsFilterOnClose, setAnalyticsFilterOnClose,] = React.useState<IFilterProps>(initialFilterStoreState,)
	const {
		storeFilters,setFilterStoreFilters,
	} = useClientFilterStore()
	const {
		maxValue,
	} = useRangeStore()
	React.useEffect(() => {
		return () => {
			setFilters({
				...storeFilters,
				range: storeFilters.range ?
					storeFilters.range :
					[0, maxValue,],

			},)
		}
	},[storeFilters,setFilters,],)

	React.useEffect(() => {
		setAnalyticsFilterOnClose({
			...storeFilters,
			range: storeFilters.range ?
				storeFilters.range :
				[0, maxValue,],
		},)

		return () => {
			setAnalyticsFilterOnClose({
				...storeFilters,
				range: storeFilters.range ?
					storeFilters.range :
					[0, maxValue,],
			},)
			setIsClearClicked(false,)
		}
	}, [],)

	const handleApply = ():void => {
		isAppliedClickedRef.current = true
		handleFilterMenuToggle()
		setFilterStoreFilters(filters,)
	}
	const handleClearClick = (): void => {
		setIsClearClicked(!isClearClicked,)
		setFilters({
			...initialFilterStoreState,
			range: [0, maxValue,],
		},)
	}
	const isRangeSliderOff = !Boolean(maxValue,)

	const handleCheckboxToggle = (key: 'isActivated' | 'isDeactivated',): void => {
		const isCurrentlyChecked = filters[key] === true
		const newFilters = {
			...filters,
			[key]:                                                     isCurrentlyChecked ?
				undefined :
				true,
			[key === 'isActivated' ?
				'isDeactivated' :
				'isActivated']: undefined,
		}
		setFilters(newFilters,)
	}

	const handleRangeSliderChange = (value: Array<number | null> | undefined,): void => {
		setFilters({
			...filters,
			range: value,
		},)
	}
	const areFiltersEqual = (filters: IFilterProps, storeFilters: IFilterProps, maxValue: number | null,): boolean => {
		const normalizeRange = (range: Array<number | null> | undefined,): Array<number | null> | undefined => {
			if (!range && maxValue) {
				return [0, maxValue,]
			}
			if (
				Array.isArray(range,) &&
			range.length === 2 &&
			range[0] === 0 &&
			range[1] === maxValue
			) {
				return undefined
			}
			return range
		}
		const normalizedCurrent = {
			...filters,
			range: normalizeRange(filters.range,),
		}
		const normalizedStore = {
			...storeFilters,
			range: normalizeRange(storeFilters.range,),
		}
		return isDeepEqual(normalizedCurrent, normalizedStore,)
	}
	return (
		<div className={styles.filterWrapper(isRangeSliderOff,)}>
			<RangeSlider propValue={filters.range} onChange={handleRangeSliderChange} />
			<div>
				<p className={styles.showText}>Show only</p>
				<label className={styles.activateLabel}>
					<input
						type='checkbox'
						checked={Boolean(filters.isActivated,)}
						className='hidden-el'
						onChange={() => {
							handleCheckboxToggle('isActivated',)
						}}
					/>
					{filters.isActivated ?
						<RadioChecked /> :
						<RadioEmpty />}
					<Check />
					<span className={styles.activationStatusText}>Active clients</span>
				</label>

				<label className={styles.activateLabel}>
					<input
						type='checkbox'
						checked={Boolean(filters.isDeactivated,)}
						className='hidden-el'
						onChange={() => {
							handleCheckboxToggle('isDeactivated',)
						}}
					/>
					{filters.isDeactivated ?
						<RadioChecked /> :
						<RadioEmpty />}
					<CheckNegative />
					<span className={styles.activationStatusText}>Deactivated clients</span>
				</label>
			</div>
			<div className={styles.selectsBlock}>
			</div>
			<div className={styles.buttonBlock}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						handleClearClick()
					}}
					className={styles.clearButton}
					disabled={(!areFiltersEqual(filters,storeFilters, maxValue,) && isClearClicked) || isDeepEqual(filters, {
						...initialFilterStoreState, range: [0, maxValue,],
					},) || isDeepEqual(filters,initialFilterStoreState,)}
					// disabled={(!isDeepEqual(storeFilters, filters,) && isClearClicked) || isDeepEqual(analyticsFilterOnClose, initialFilterStoreState,)}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Clear',
						size:    Size.SMALL,
						color:   Color.SECONDRAY_GRAY,
					}}
				/>
				<Button<ButtonType.TEXT>
					type='submit'
					className={styles.applyButton}
					onClick={() => {
						handleClearClick()
						handleApply()
					}}
					// disabled={(areFiltersEqual(filters, storeFilters,maxValue,)) && (!isClearClicked)}
					disabled={(areFiltersEqual(filters, storeFilters,maxValue,) && !isClearClicked) || isDeepEqual(filters, analyticsFilterOnClose,)}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Apply',
						size:    Size.SMALL,
						color:   Color.BLUE,
					}}
				/>
			</div>

		</div>
	)
}