/* eslint-disable complexity */

import * as React from 'react'

import {
	BigTransactionSettings,
	Plus,
	ExcelIcon,
	HistoryClockIcon,
	Filter,
	Search,
	XmarkSecond,
	CloseXIcon,
	PanelTop,
} from '../../../../assets/icons'
import {
	Button, ButtonType, Color, Size, Input,
} from '../../../../shared/components'
import {
	toggleState,
} from '../../../../shared/utils'
import {
	useTransactionTypeStore,
} from '../transaction-settings.store'
import {
	TransactionTypeFilterDialog,
} from './filter-dialog.component'
import type {
	TransactionTypeFilter,
} from '../../../../shared/types'
import {
	exportToExcel,
} from '../../../../shared/utils'
import {
	getTransactionTypeSheetData,
} from '../transaction.utils'
import type {
	ITransactionType,
} from '../../../../shared/types'
import {
	useUserStore,
} from '../../../../store/user.store'
import {
	Roles,
} from '../../../../shared/types'
import * as styles from './header.styles'

type HeaderProps = {
	transactionTypeList: Array<ITransactionType> | undefined
	transactionTypeFilter: TransactionTypeFilter | undefined
	onAddTransaction: () => void
	toggleAuditOpen: () => void
	toggleCategoryDrawerOpen: () => void
	setTransactionTypeFilter: React.Dispatch<React.SetStateAction<TransactionTypeFilter | undefined>>
}

export const Header: React.FC<HeaderProps> = ({
	transactionTypeList,
	transactionTypeFilter,
	onAddTransaction,
	toggleAuditOpen,
	toggleCategoryDrawerOpen,
	setTransactionTypeFilter,
},) => {
	const {
		filter, setSearch,
	} = useTransactionTypeStore()
	const [isInputVisible, setIsInputVisible,] = React.useState<boolean>(false,)
	const [isFilterVisible, setIsFilterVisible,] = React.useState<boolean>(false,)
	const [hasPermission, setHasPermission,] = React.useState<boolean>(false,)
	const [hasFomPermission, setHasFomPermission,] = React.useState<boolean>(false,)

	const {
		userInfo,
	} = useUserStore()

	React.useEffect(() => {
		const permission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		setHasPermission(permission,)
	}, [userInfo,],)

	React.useEffect(() => {
		const permission = userInfo.roles.some((role,) => {
			return [Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		setHasFomPermission(permission,)
	}, [userInfo,],)

	const handleSearchButtonClick = (): void => {
		toggleState(setIsInputVisible,)()
	}

	const handleSearchCloseClick = (): void => {
		setSearch(undefined,)
		toggleState(setIsInputVisible,)()
	}

	const handleSearchBlur = (): void => {
		if (filter.search) {
			return
		}
		toggleState(setIsInputVisible,)()
	}

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>,): void => {
		setSearch(e.target.value || undefined,)
	}

	const sheetData = React.useMemo(() => {
		return getTransactionTypeSheetData(transactionTypeList ?? [],)
	}, [transactionTypeList,],)
	const fileName = 'transaction-type-table-data'

	const hasFilters = !(filter.categoryIds ?? filter.assets ?? filter.cashFlows ?? filter.pls ?? filter.isActivated ?? filter.isDeactivated ?? filter.search)

	return (
		<div className={styles.headerWrapper}>
			<div className={styles.titleIconBlock}>
				<BigTransactionSettings width={32} height={32}/>
				<p className={styles.headerTitle}>Transaction settings</p>
			</div>
			<div className={styles.buttonsBlock}>
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
				{(isInputVisible || filter.search) && (
					<div
						className={styles.clientHeaderInput}
						onBlur={handleSearchBlur}
					>
						<Input
							name='search'
							label=''
							input={{
								value:       filter.search ?? '',
								onChange:    handleSearch,
								placeholder: 'Search report',
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
				<TransactionTypeFilterDialog
					setDialogOpen={setIsFilterVisible}
					isFilterVisible={isFilterVisible}
					transactionTypeFilter={transactionTypeFilter}
					setTransactionTypeFilter={setTransactionTypeFilter}
				>
					<Button<ButtonType.ICON>
						className={styles.filterButton(isFilterVisible, !hasFilters,)}
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
				</TransactionTypeFilterDialog>
				<Button<ButtonType.TEXT>
					onClick={toggleCategoryDrawerOpen}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Category',
						leftIcon: <PanelTop/>,
						size:     Size.MEDIUM,
						color:    Color.SECONDRAY_COLOR,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={toggleAuditOpen}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Audit trail',
						leftIcon: <HistoryClockIcon/>,
						size:     Size.MEDIUM,
						color:    Color.SECONDRAY_COLOR,
					}}
				/>
				{hasFomPermission &&
					<Button<ButtonType.TEXT>
						onClick={() => {
							exportToExcel({
								sheetData,
								fileName,
							},)
						}}
						disabled={!transactionTypeList?.length}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Export',
							leftIcon: <ExcelIcon/>,
							size:     Size.MEDIUM,
							color:    Color.SECONDRAY_COLOR,
						}}
					/>
				}
				{hasPermission &&
					<Button<ButtonType.TEXT>
						className={styles.addButton}
						onClick={onAddTransaction}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Add transaction',
							leftIcon: <Plus/>,
							size:     Size.MEDIUM,
							color:    Color.BLUE,
						}}
					/>
				}
			</div>
		</div>
	)
}