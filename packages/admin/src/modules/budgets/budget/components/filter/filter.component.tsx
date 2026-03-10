/* eslint-disable complexity */
import React from 'react'

import {
	initialFilterValues,
	useBudgetStore,
} from '../../budget.store'
import {
	toggleState,
} from '../../../../../shared/utils'
import {
	CloseXIcon,
	Filter,
	Search, XmarkSecond,
} from '../../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Input,
	Size,
} from '../../../../../shared/components'
import {
	BudgetFilterDialog,
} from './filter-dialog.component'
import type {
	TBudgetSearch,
} from '../../budget.types'

import * as styles from './filter.styles'

export const BudgetFilter: React.FC = () => {
	const [isInputVisible, setIsInputVisible,] = React.useState<boolean>(false,)
	const [isFilterVisible, setIsFilterVisible,] = React.useState<boolean>(false,)
	const [budgetFilter, setBudgetFilter,] = React.useState<TBudgetSearch>(initialFilterValues,)

	const {
		filter,
		setSearch,
	} = useBudgetStore()
	React.useEffect(() => {
		return () => {
			setBudgetFilter(filter,)
		}
	},[filter,setBudgetFilter, isFilterVisible,],)
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>,): void => {
		setSearch(e.target.value || undefined,)
	}

	const handleSearchButtonClick = (): void => {
		toggleState(setIsInputVisible,)()
	}

	const hasFilters = filter.clientIds !== undefined || filter.isActivated !== undefined || filter.search !== undefined

	return (
		<div className={styles.filterWrapper}>
			{!isInputVisible && (
				<Button<ButtonType.ICON>
					disabled={false}
					onClick={handleSearchButtonClick}
					additionalProps={{
						btnType: ButtonType.ICON,
						size:    Size.MEDIUM,
						color:   Color.SECONDRAY_COLOR,
						icon:    <Search width={20} height={20} />,
					}}
				/>
			)}
			{isInputVisible && (
				<div
					className={styles.clientHeaderInput}
					onBlur={handleSearchButtonClick}
				>
					<Input
						name='search'
						label=''
						input={{
							value:       filter.search ?? '',
							onChange:    handleSearch,
							placeholder: 'Search budget plan',
							autoFocus:   true,
						}}
						leftIcon={<Search width={20} height={20} />}
						rightIcon={<XmarkSecond
							width={20} height={20}
							onClick={handleSearchButtonClick}
							cursor={'pointer'}
						/>}
					/>
				</div>
			)}
			<BudgetFilterDialog
				setDialogOpen={setIsFilterVisible}
				setBudgetFilter={setBudgetFilter}
				budgetFilter={budgetFilter}
			>
				<Button<ButtonType.ICON>
					className={styles.filterButton(isFilterVisible, hasFilters,)}
					onClick={toggleState(setIsFilterVisible,)}
					additionalProps={{
						btnType: ButtonType.ICON,
						size:    Size.MEDIUM,
						color:   Color.SECONDRAY_COLOR,
						icon:    isFilterVisible ?
							<CloseXIcon width={20} height={20} /> :
							<Filter width={20} height={20} />,
					}}
				/>
			</BudgetFilterDialog>
		</div>
	)
}