/* eslint-disable complexity */
import * as React from 'react'

import {
	Filter,
	Plus,
	PortfolioIcon,
	Search,
	XmarkSecond,
	SearchGray,
} from '../../../../../../assets/icons'
import {
	Button, ButtonType,
	Color,
	Input,
	Size,
	Dialog,
} from '../../../../../../shared/components'
import {
	toggleState,
} from '../../../../../../shared/utils/react-state-toggle.util'
import {
	AddPortfolioContent,
} from '../add-portfolio-content/add-portfolio-content.component'
import {
	ReactComponent as CloseIcon,
} from '../../../../../../assets/icons/close-x.svg'
import {
	FilterListDialog,
} from '../filter-list-dialog/filter-list-dialog.component'
import {
	useModalClose,
} from '../../../../../../shared/hooks/use-modal-close.util'
import {
	usePortfolioStateStore,
} from '../../store/portfolio-state.store'
import {
	useUserStore,
} from '../../../../../../store/user.store'
import {
	Roles,
} from '../../../../../../shared/types'
import {
	AddPortfolio,
} from '../add-portfolio/add-portfolio.component'
import type {
	IFilterProps,
} from '../../portfolio.types'
import {
	usePortfolioFilterStore,
} from '../../portfolio.store'
import {
	useRangeStore,
} from '../../../../../../store/range-slider.store'

import * as styles from './header.styles'

interface IPortfolioHeaderProps {
	maxTotal?: number
}

export const PortfolioHeader: React.FC<IPortfolioHeaderProps> = ({
	maxTotal,
},) => {
	const [isInputVisible, setIsInputVisible,] = React.useState<boolean>(false,)
	const [isDrawerOpen, setIsDrawerOpen,] = React.useState<boolean>(false,)
	const [isFilterOpen, setIsFilterOpen,] = React.useState<boolean>(false,)
	const [clientId, setClientId,] = React.useState<string>('',)
	const [isEditAllowed, setIsEditAllowed,] = React.useState<boolean>(false,)
	const {
		storeFilters,setFilterStoreFilters,
	} = usePortfolioFilterStore()
	const [filters, setFilters,] = React.useState<IFilterProps>(storeFilters,)
	React.useEffect(() => {
		setFilters(storeFilters,)
	}, [storeFilters,],)
	const {
		userInfo,
	} = useUserStore()
	const {
		maxValue,
		setMaxValue,
		setRange,
	} = useRangeStore()
	const hasFilters = Object.entries(filters,).some(([key, filterValue,],) => {
		if (key === 'search') {
			return false
		}
		if (Array.isArray(filterValue,)) {
			if (filterValue.length === 2 && filterValue[0] === 0 && filterValue[1] === maxValue) {
				return false
			}
			return filterValue.length > 0
		}
		return filterValue !== undefined && filterValue !== false && filterValue !== ''
	},)
	const {
		handleMenuBackdropClick,
	} = useModalClose(setIsFilterOpen,)

	const {
		isAddClientVisible, toggleIsAddClientVisible, setIsAddClientVisible,
	} = usePortfolioStateStore()
	const handleFilterMenuToggle = (): void => {
		setIsFilterOpen(!isFilterOpen,)
	}

	const toggleInputVisibility = toggleState(setIsInputVisible,)

	const handleSearchButtonClick = (): void => {
		toggleInputVisibility()
	}

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>,): void => {
		const {
			value,
		} = e.target
		setFilterStoreFilters({
			...storeFilters,
			search: value,
		},)
	}

	const handleChooseClient = (): void => {
		setIsAddClientVisible(false,)
		setIsDrawerOpen(true,)
	}

	React.useEffect(() => {
		if (maxTotal && !maxValue) {
			setMaxValue(maxTotal,)
			setRange([0, maxTotal,],)
		}
	},[maxTotal, maxValue,],)
	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		if (hasPermission) {
			setIsEditAllowed(true,)
		}
	}, [],)

	const handleSearchBlur = (): void => {
		if (storeFilters.search) {
			return
		}
		toggleState(setIsInputVisible,)()
	}
	const handleSearchCloseClick = (): void => {
		setFilterStoreFilters({
			...storeFilters,
			search: undefined,
		},)
		toggleState(setIsInputVisible,)()
	}

	return (
		<div className={styles.headerWrapper}>
			<div className={styles.titleBlock}>
				<PortfolioIcon/>
				<p className={styles.headerTitle}>Portfolio</p>
			</div>
			<div className={styles.actionsBlock}>
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
								value:       storeFilters.search ?? undefined,
								onChange:    handleSearch,
								placeholder: 'Search portfolio',
								autoFocus:   true,
							}}
							leftIcon={<SearchGray className={styles.inputSearchIcon} onClick={handleSearchButtonClick}/>}
							rightIcon={
								<XmarkSecond
									width={20}
									height={20}
									onClick={handleSearchCloseClick}
									cursor={'pointer'}
								/>
							}
						/>
					</div>
				)}
				{isFilterOpen && <div className={styles.filterBackdrop} onClick={handleMenuBackdropClick}/>}
				<div className={styles.filterWindowWrapper}>
					{isFilterOpen &&
					<FilterListDialog
						handleFilterMenuToggle={handleFilterMenuToggle}
						filters={filters}
						setFilters={setFilters}
					/>
					}
					<Button<ButtonType.ICON>
						className={styles.filterButton(isFilterOpen, hasFilters,)}
						disabled={false}
						onClick={handleFilterMenuToggle}
						additionalProps={{
							btnType: ButtonType.ICON,
							size:    Size.MEDIUM,
							color:   Color.SECONDRAY_COLOR,
							icon:    isFilterOpen ?
								<CloseIcon width={20} height={20} /> :
								<Filter width={20} height={20} />,
						}}
					/>
				</div>
				{isEditAllowed && <Button<ButtonType.TEXT>
					disabled={false}
					onClick={toggleIsAddClientVisible}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Add portfolio',
						leftIcon: <Plus width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
				/>}
			</div>
			<Dialog
				open={isAddClientVisible}
				onClose={toggleIsAddClientVisible}
				className={styles.dialog}
			>
				<AddPortfolioContent
					clientId={clientId}
					setClientId={setClientId}
					onClose={toggleIsAddClientVisible}
					handleChooseClient={handleChooseClient}
				/>
			</Dialog>
			<AddPortfolio
				clientId={clientId}
				isDrawerOpen={isDrawerOpen}
				setIsDrawerOpen={setIsDrawerOpen}
			/>
		</div>
	)
}