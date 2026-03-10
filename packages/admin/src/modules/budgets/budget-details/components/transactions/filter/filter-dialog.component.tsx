import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	Classes,
	Popover,
} from '@blueprintjs/core'

import {
	useGetTransactionTypeList,
	useGetAllCurrencies,
} from '../../../../../../shared/hooks'
import {
	Button,
	ButtonType,
	Color,
	SelectComponent,
	Size,
} from '../../../../../../shared/components'
import {
	PortfolioTypeIcon,
} from '../../../../../../assets/icons'
import {
	initialFilterValues,
	useTransactionStore,
} from '../transaction.store'
import type {
	IOptionType,
} from '../../../../../../shared/types'

import {
	isDeepEqual,
} from '../../../../../../shared/utils'
import type {
	StoreTransactionListItem,
	TTransactionSearch,
} from '../transactions.types'
import type {
	IExpenseCategory,
} from '../../../../../../shared/types'
import {
	RangeFilter,
} from '../range-filter/range-filter.component'

import * as styles from './filter.styles'

interface IProps {
	children: React.ReactNode
	setDialogOpen: (value: boolean) => void
	budgetId: string
	expenseCategories: Array<IExpenseCategory>
	setTransactionFilter: React.Dispatch<React.SetStateAction<TTransactionSearch>>
	transactionFilter: TTransactionSearch
}

export const TransactiontFilterDialog: React.FC<IProps> = ({
	children,
	setDialogOpen,
	budgetId,
	expenseCategories,
	setTransactionFilter,
	transactionFilter,
},) => {
	const [isCalendarError, setIsCalendarError,] = React.useState<boolean>(false,)
	const {
		data: transactionNamesList,
	} = useGetTransactionTypeList()
	const {
		data: currencyList,
	} = useGetAllCurrencies()
	const {
		setCategories,
		setCurrencies,
		setTransactionNames,
		filter,
		setDateRange,
	} = useTransactionStore()
	const [isClearClicked, setIsClearClicked,] = React.useState<boolean>(false,)
	const [analyticsFilterOnClose, setAnalyticsFilterOnClose,] = React.useState<TTransactionSearch>(initialFilterValues,)
	React.useEffect(() => {
		setAnalyticsFilterOnClose(filter,)
		return () => {
			setAnalyticsFilterOnClose(filter,)
			setIsClearClicked(false,)
		}
	}, [filter,],)

	const handleFilterApply = (filter: TTransactionSearch,): void => {
		setCurrencies(filter.currencies,)
		setTransactionNames(filter.transactionNames,)
		setCategories(filter.categories,)
		setDateRange(filter.dateRange,)
	}

	const namesOptionsArray = React.useMemo(() => {
		return transactionNamesList
			?.filter((transaction,) => {
				const isClientSelected = transactionFilter.transactionNames?.some(
					(selectedClient,) => {
						return selectedClient.value.id === transaction.id
					},
				)
				return !isClientSelected
			},)
			.map((transaction,) => {
				return {
					label: transaction.name,
					value: {
						id:   transaction.id,
						name: transaction.name,
					},
				}
			},) ?? []
	}, [transactionNamesList, transactionFilter.transactionNames,],)
	const expenseOptionsArray = React.useMemo(() => {
		return expenseCategories
			.filter((transaction,) => {
				const isClientSelected = transactionFilter.categories?.some(
					(selectedClient,) => {
						return selectedClient.value.id === transaction.id
					},
				)
				return !isClientSelected
			},)
			.map((category,) => {
				return {
					label: category.name,
					value: {
						id:   category.id,
						name: category.name,
					},
				}
			},)
	}, [expenseCategories, transactionFilter.categories,],)
	const currencyOptionsArray = React.useMemo(() => {
		return currencyList
			?.filter((currency,) => {
				const isClientSelected = transactionFilter.currencies?.some(
					(selectedClient,) => {
						return selectedClient.value.id === currency.id
					},
				)
				return !isClientSelected
			},)
			.map((currency,) => {
				return {
					label: currency.currency,
					value: {
						id:   currency.id,
						name: currency.currency,
					},
				}
			},) ?? []
	}, [currencyList, transactionFilter.currencies,],)
	const content = (
		<div className={styles.filterDialogContainer}>
			<div className={styles.filterDialogWrapper}>
				<SelectComponent<StoreTransactionListItem>
					isDisabled={!transactionNamesList}
					placeholder='Select transaction name'
					key={transactionFilter.transactionNames?.map((item,) => {
						return item.value.id
					},).join(',',)}
					leftIcon={<PortfolioTypeIcon width={18} height={18} />}
					options={namesOptionsArray}
					onChange={(select,) => {
						if (select && Array.isArray(select,)) {
							setTransactionFilter({
								...transactionFilter,
								transactionNames:   select.length === 0 ?
									undefined :
select as Array<IOptionType<StoreTransactionListItem>>,
							},)
						}
					}}
					value={transactionFilter.transactionNames}
					isSearchable
					isMulti
				/>
				<SelectComponent<StoreTransactionListItem>
					isDisabled={!expenseCategories}
					placeholder='Select expense category'
					key={transactionFilter.categories?.map((item,) => {
						return item.value.id
					},).join(',',)}
					options={expenseOptionsArray}
					onChange={(select,) => {
						if (select && Array.isArray(select,)) {
							setTransactionFilter({
								...transactionFilter,
								categories:   select.length === 0 ?
									undefined :
select as Array<IOptionType<StoreTransactionListItem>>,
							},)
						}
					}}
					value={transactionFilter.categories}
					isSearchable
					isMulti
				/>
				<SelectComponent<StoreTransactionListItem>
					isDisabled={!currencyList}
					placeholder='Select currency'
					key={transactionFilter.currencies?.map((item,) => {
						return item.value.id
					},).join(',',)}
					options={currencyOptionsArray}
					onChange={(select,) => {
						if (select && Array.isArray(select,)) {
							setTransactionFilter({
								...transactionFilter,
								currencies:     select.length === 0 ?
									undefined :
select as Array<IOptionType<StoreTransactionListItem>>,
							},)
						}
					}}
					value={transactionFilter.currencies}
					isSearchable
					isMulti
				/>
				<RangeFilter
					setTransactionFilter={setTransactionFilter}
					transactionFilter={transactionFilter}
					setIsCalendarError={setIsCalendarError}
				/>
			</div>
			<div className={styles.filterBtnWrapper}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						setIsClearClicked(true,)
						setTransactionFilter({
							...initialFilterValues,
						},)
					}}
					disabled={(!isDeepEqual(transactionFilter, filter,) && (isClearClicked)) ||
						isDeepEqual(analyticsFilterOnClose, initialFilterValues,)}
					className={styles.clearBtn}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Clear',
						size:    Size.SMALL,
						color:   Color.SECONDRAY_GRAY,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={() => {
						handleFilterApply(transactionFilter,)
						setDialogOpen(false,)
					}}
					disabled={isDeepEqual(filter, transactionFilter,) && (!isCalendarError)}

					className={cx(styles.applyBtn, Classes.POPOVER_DISMISS,) }
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Apply',
						size:    Size.SMALL,
						color:   Color.BLUE,
					}}
				/>
			</div>
		</div>)
	return (
		<Popover
			usePortal={true}
			hasBackdrop={true}
			backdropProps={{
				className: styles.popoverBackdrop,
			}}
			placement='bottom-end'
			content={content}
			autoFocus={false}
			enforceFocus={false}
			popoverClassName={styles.popoverContainer}
			onClosing={() => {
				setDialogOpen(false,)
			}}
		>
			{children}
		</Popover>
	)
}