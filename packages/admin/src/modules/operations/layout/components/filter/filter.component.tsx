/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable complexity */
/* eslint-disable no-unused-vars */
import React from 'react'
import {
	useLocation,
} from 'react-router-dom'

import {
	Button, ButtonType, Color, Input, Size,
} from '../../../../../shared/components'
import {
	CloseXIcon, Filter,
	Refresh,
	Search,
	XmarkSecond,
} from '../../../../../assets/icons'
import {
	toggleState,
} from '../../../../../shared/utils'
import {
	useOperationsFilterStore,
} from './filter.store'
import type {
	TOperationsStoreFilter,
} from './filter.store'
import {
	OperationsFilterDialog,
} from './dialog.component'
import {
	RouterKeys,
} from '../../../../../router/keys'

import * as styles from './filter.styles'
import {
	useTransactionStore,
} from '../../../../../modules/operations/transactions'

export const initialFilterValues: TOperationsStoreFilter = {
	clientIds:       undefined,
	portfolioIds:    undefined,
	entitiesIds:       undefined,
	bankIds:         undefined,
	accountIds:      undefined,
	isins:           undefined,
	securities:      undefined,
	currencies:      undefined,
	names:           undefined,
	categories:      undefined,
	orderStatuses:   undefined,
	requestStatuses: undefined,
	search:          undefined,
}

export const OperationsFilter: React.FC = () => {
	const [isFilterVisible, setIsFilterVisible,] = React.useState<boolean>(false,)
	const [isInputVisible, setIsInputVisible,] = React.useState<boolean>(false,)
	const [isRefreshClicked, setIsRefreshClicked,] = React.useState<boolean>(false,)
	const location = useLocation()
	const {
		setSearch,
		operationsFilter: storeFilter,
	} = useOperationsFilterStore()
	const {
		setShowChart,
		showChart,
	} = useTransactionStore()
	const [operationsFilter, setOperationsFilter,] = React.useState<TOperationsStoreFilter>(storeFilter,)
	React.useEffect(() => {
		setOperationsFilter(storeFilter,)
		return () => {
			setOperationsFilter(storeFilter,)
		}
	},[storeFilter,setOperationsFilter, isFilterVisible,],)
	React.useEffect(() => {
		setSearch(undefined,)
	},[location.pathname,],)
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>,): void => {
		setSearch(e.target.value || undefined,)
	}
	const handleSearchButtonClick = (): void => {
		toggleState(setIsInputVisible,)()
	}
	const handleSearchCloseClick = (): void => {
		setSearch(undefined,)
		toggleState(setIsInputVisible,)()
	}
	const handleSearchBlur = (): void => {
		if (storeFilter.search) {
			return
		}
		toggleState(setIsInputVisible,)()
	}

	const isFilterApplied = (location.pathname.includes(RouterKeys.ORDERS,) && (
		storeFilter.bankIds?.length ??
		storeFilter.search?.length ??
		storeFilter.accountIds?.length ??
		storeFilter.clientIds?.length ??
		storeFilter.entitiesIds?.length ??
		storeFilter.portfolioIds?.length ??
		storeFilter.orderStatuses?.length ??
		storeFilter.isins?.length ??
		storeFilter.securities?.length
	)) || (location.pathname.includes(RouterKeys.REQUESTS,) && (
		storeFilter.accountIds?.length ??
		storeFilter.search?.length ??
		storeFilter.bankIds?.length ??
		storeFilter.clientIds?.length ??
		storeFilter.entitiesIds?.length ??
		storeFilter.portfolioIds?.length ??
		storeFilter.requestStatuses?.length
	)) || (location.pathname.includes(RouterKeys.TRANSACTIONS,) && (
		storeFilter.accountIds?.length ??
		storeFilter.search?.length ??
		storeFilter.bankIds?.length ??
		storeFilter.clientIds?.length ??
		storeFilter.entitiesIds?.length ??
		storeFilter.portfolioIds?.length ??
		storeFilter.currencies?.length ??
		storeFilter.serviceProviders?.length ??
		storeFilter.categories
	))
	return (
		<div className={styles.filterContainer}>
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
					onBlur={handleSearchBlur}
				>
					<Input
						name='search'
						label=''
						input={{
							value:       storeFilter.search ?? '',
							onChange:    handleSearch,
							placeholder: 'Search',
							autoFocus:   true,
						}}
						leftIcon={<Search width={20} height={20} />}
						rightIcon={<XmarkSecond
							width={20} height={20}
							onClick={handleSearchCloseClick}
							cursor={'pointer'}
						/>}
					/>
				</div>
			)}
			<OperationsFilterDialog
				setDialogOpen={setIsFilterVisible}
				operationsFilter={operationsFilter}
				setOperationsFilter={setOperationsFilter}
				setIsRefreshClicked={setIsRefreshClicked}
				isRefreshClicked={isRefreshClicked}
			>
				<Button<ButtonType.ICON>
					className={styles.filterButton(isFilterVisible, Boolean(isFilterApplied,),)}
					onClick={() => {
						if (location.pathname.includes(RouterKeys.TRANSACTIONS,)) {
							setShowChart()
						} else {
							setIsFilterVisible((prev,) => {
								return !prev
							},)
						}
					}}
					additionalProps={{
						btnType: ButtonType.ICON,
						size:    Size.MEDIUM,
						color:   Color.SECONDRAY_COLOR,
						icon:    isFilterVisible ?
							<CloseXIcon width={20} height={20} /> :
							<Filter width={20} height={20} />,
					}}
				/>
			</OperationsFilterDialog>
		</div>
	)
}
