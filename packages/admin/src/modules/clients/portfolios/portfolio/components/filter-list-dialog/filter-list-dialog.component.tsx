/* eslint-disable complexity */
import * as React from 'react'
import {
	Button, ButtonType, Color, Size, RangeSlider,
} from '../../../../../../shared/components'
import {
	ReactComponent as TypeIcon,
} from '../../../../../../assets/icons/portfolio-type-icon.svg'
import {
	ReactComponent as ClientsTwoIcon,
} from '../../../../../../assets/icons/clients-route.svg'
import {
	portfolioTypesArray,
} from '../drawer-content/components/form-portfolio'
import {
	useClientsListForSelect,
} from '../../../../../clients/client-profiles/clients/hooks'
import {
	ReactComponent as Check,
} from '../../../../../../assets/icons/check.svg'
import {
	ReactComponent as CheckNegative,
} from '../../../../../../assets/icons/check-negative.svg'
import {
	CustomMultiSelect,
} from './components/custom-multi-select.component'
import {
	useRangeStore,
} from '../../../../../../store/range-slider.store'
import {
	RadioChecked, RadioEmpty,
} from '../../../../../../assets/icons'
import {
	SelectComponent,
} from '../../../../../../shared/components'

import type {
	IFilterProps,
} from '../../portfolio.types'
import {
	isDeepEqual,
} from '../../../../../../shared/utils'
import {
	initialFilterStoreState,
	usePortfolioFilterStore,
} from '../../portfolio.store'
import * as styles from './filter-list-dialog.styles'

interface IFilterListDialogProps {
	handleFilterMenuToggle: () => void
	filters: IFilterProps
	setFilters: React.Dispatch<React.SetStateAction<IFilterProps>>
}

export const FilterListDialog: React.FC<IFilterListDialogProps> = ({
	handleFilterMenuToggle,
	filters,
	setFilters,
},) => {
	const [isClearClicked, setIsClearClicked,] = React.useState<boolean>(false,)
	const isAppliedClickedRef = React.useRef(false,)
	const [analyticsFilterOnClose, setAnalyticsFilterOnClose,] = React.useState<IFilterProps>(initialFilterStoreState,)
	const {
		storeFilters,setFilterStoreFilters,
	} = usePortfolioFilterStore()
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

	const {
		data: clientList,
	} = useClientsListForSelect()

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
					<span className={styles.activationStatusText}>Active portfolios</span>
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
					<span className={styles.activationStatusText}>Deactivated portfolios</span>
				</label>
			</div>
			<div className={styles.selectsBlock}>
				<SelectComponent
					options={clientList ?? []}
					value={
						filters.clients ?
							clientList?.filter((opt,) => {
								return filters.clients?.includes(opt.value,)
							},) :
							undefined
					}
					leftIcon={<ClientsTwoIcon width={18} height={18} />}
					placeholder='Select clients'
					isMulti
					onChange={(select,) => {
						if (select && Array.isArray(select,)) {
							setFilters({
								...filters,
								clients: select.length === 0 ?
									undefined :
									select.map((option,) => {
										return option.value
									},),
							},)
						}
					}}
				/>
				<CustomMultiSelect
					placeholder='Select types'
					value={
						filters.types ?
							portfolioTypesArray.filter((opt,) => {
								return filters.types?.includes(opt.value,)
							},) :
							undefined
					}
					list={portfolioTypesArray}
					onChange={(select,) => {
						if (select && Array.isArray(select,)) {
							setFilters({
								...filters,
								types: select.length === 0 ?
									undefined :
									select.map((option,) => {
										return option.value
									},),
							},)
						}
					}}
					icon={<TypeIcon/>}
				/>
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