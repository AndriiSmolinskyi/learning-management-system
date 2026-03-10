import React from 'react'

import {
	useTransactionStore,
} from '../transaction.store'
import {
	toggleState,
} from '../../../../../../shared/utils'
import {
	CloseXIcon,
	Filter,
	Search,
	XmarkSecond,
} from '../../../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Input,
	Size,
} from '../../../../../../shared/components'
import {
	TransactiontFilterDialog,
} from './filter-dialog.component'

import type {
	IExpenseCategory,
} from '../../../../../../shared/types'

import * as styles from './filter.styles'
import type {
	TTransactionSearch,
} from '../transactions.types'

interface IProps {
	budgetId: string
	expenseCategories: Array<IExpenseCategory>
}
export const TransactionFilter: React.FC<IProps> = ({
	budgetId,
	expenseCategories,
},) => {
	const [isInputVisible, setIsInputVisible,] = React.useState<boolean>(false,)
	const [isFilterVisible, setIsFilterVisible,] = React.useState<boolean>(false,)

	const {
		filter,
		setSearch,
	} = useTransactionStore()

	const [transactionFilter, setTransactionFilter,] = React.useState<TTransactionSearch>(filter,)
	React.useEffect(() => {
		return () => {
			setTransactionFilter(filter,)
		}
	},[filter,setTransactionFilter, isFilterVisible,],)
	const handleSearchButtonClick = (): void => {
		toggleState(setIsInputVisible,)()
	}
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>,): void => {
		setSearch(e.target.value || undefined,)
	}
	return (
		<div className={styles.filterWrapper}>
			{!isInputVisible && (
				<Button<ButtonType.ICON>
					disabled={false}
					onClick={handleSearchButtonClick}
					additionalProps={{
						btnType: ButtonType.ICON,
						size:    Size.SMALL,
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
							value:       filter.search,
							onChange:    handleSearch,
							placeholder: 'Search transaction',
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
			<TransactiontFilterDialog
				setDialogOpen={setIsFilterVisible}
				budgetId={budgetId}
				expenseCategories={expenseCategories}
				transactionFilter={transactionFilter}
				setTransactionFilter={setTransactionFilter}
			>
				<Button<ButtonType.ICON>
					className={styles.filterButton(isFilterVisible,)}
					onClick={toggleState(setIsFilterVisible,)}
					additionalProps={{
						btnType: ButtonType.ICON,
						size:    Size.SMALL,
						color:   Color.SECONDRAY_COLOR,
						icon:    isFilterVisible ?
							<CloseXIcon width={20} height={20} /> :
							<Filter width={20} height={20} />,
					}}
				/>
			</TransactiontFilterDialog>
		</div>
	)
}