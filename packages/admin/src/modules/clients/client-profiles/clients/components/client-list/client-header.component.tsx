/* eslint-disable complexity */
import * as React from 'react'
import {
	AddClient,
} from '../add-client/add-client.component'
import {
	AddClientSuccess,
} from '../add-client/add-client-success.component'
import {
	ClientLists,
	Search,
	Filter,
	Plus,
	XmarkSecond,
	SearchGray,
} from '../../../../../../assets/icons'
import {
	ReactComponent as CloseIcon,
} from '../../../../../../assets/icons/close-x.svg'
import {
	Button, ButtonType, Size, Color,
} from '../../../../../../shared/components'
import Input from '../../../../../../shared/components/input/input.component'
import {
	toggleState,
} from '../../../../../../shared/utils/react-state-toggle.util'
import {
	FilterListClient,
} from './filter-list-client.component'
import {
	useModalClose,
} from '../../../../../../shared/hooks/use-modal-close.util'
import {
	AddPortfolio,
} from '../../../../portfolios/portfolio/components/add-portfolio/add-portfolio.component'
import type {
	ClientDraft,
} from '../../../../../../shared/types'
import type {
	ClientFormValues,
} from '../../clients.types'
import {
	Dialog,
	Drawer,
} from '../../../../../../shared/components'
import type {
	IFilterProps,
} from '../../clients.types'
import {
	useClientFilterStore,
} from '../../store/client-filter.store'
import {
	useRangeStore,
} from '../../../../../../store/range-slider.store'
import * as styles from '../../clients.style'

interface IClientHeaderProps {
	selectedDraft?: ClientDraft | null
	maxTotal?: number
	handleIsActivatedChange?: (isActivated: boolean | undefined) => void
	setSelectedDraft: (draft: ClientDraft | null) => void
}

export const ClientHeader: React.FunctionComponent<IClientHeaderProps> = ({
	selectedDraft,
	maxTotal,
	handleIsActivatedChange,
	setSelectedDraft,
},) => {
	const {
		storeFilters, setFilterStoreFilters,
	} = useClientFilterStore()
	const {
		maxValue,
		setMaxValue,
		setRange,
	} = useRangeStore()
	const [filters, setFilters,] = React.useState<IFilterProps>(storeFilters,)
	const [isInputVisible, setIsInputVisible,] = React.useState(false,)
	const [isAddClientVisible, setIsAddClientVisible,] = React.useState(false,)
	const [addClientSucces, setAddClientSuccess,] = React.useState(false,)
	const [clientDataSuccess, setClientDataSuccess,] = React.useState<{ id: string, email: string }>({
		id:    '',
		email: '',
	},)
	const [isFilterVisible, setIsFilterVisible,] = React.useState(false,)
	const [isDrawerOpen, setIsDrawerOpen,] = React.useState<boolean>(false,)

	React.useEffect(() => {
		if (selectedDraft) {
			setIsAddClientVisible(true,)
		}
	}, [selectedDraft,],)

	const toggleFilterVisibility = toggleState(setIsFilterVisible,)

	const toggleInputVisibility = toggleState(setIsInputVisible,)
	const toggleAddClientModal = toggleState(setIsAddClientVisible,)
	const toggleAddClientSuccess = toggleState(setAddClientSuccess,)
	const toggleAddPortfolio = toggleState(setIsDrawerOpen,)

	const handleSearchButtonClick = (): void => {
		toggleInputVisibility()
		setFilterStoreFilters({
			...storeFilters,
			search: undefined,
		},)
	}

	const handleSetClientDataSuccess = (id: string, email: string,): void => {
		setClientDataSuccess({
			id, email,
		},)
	}

	const {
		handleMenuBackdropClick,
	} = useModalClose(setIsFilterVisible,)

	const handleCloseAddClient = (): void => {
		toggleAddClientModal()
		setSelectedDraft(null,)
	}

	const formattedDraft: ClientFormValues = selectedDraft ?
		{
			firstName:      selectedDraft.firstName ?? '',
			lastName:       selectedDraft.lastName ?? '',
			residence:      selectedDraft.residence ?? '',
			country:        selectedDraft.country ?? '',
			region:         selectedDraft.region ?? '',
			city:           selectedDraft.city ?? '',
			streetAddress:  selectedDraft.streetAddress ?? '',
			buildingNumber: selectedDraft.buildingNumber ?? '',
			postalCode:     selectedDraft.postalCode ?? '',
			contact:        selectedDraft.contacts && selectedDraft.contacts.length > 0 ?
				selectedDraft.contacts[0] :
				'',
			email:          selectedDraft.emails && selectedDraft.emails.length > 0 ?
				selectedDraft.emails[0] :
				'',
			comment:        selectedDraft.comment ?? '',
		} :
		{
			firstName:      '',
			lastName:       '',
			residence:      '',
			country:        '',
			region:         '',
			city:           '',
			streetAddress:  '',
			buildingNumber: '',
			postalCode:     '',
			contact:        '',
			email:          '',
			comment:        '',
		}

	const [isConfirmExitVisible, setIsConfirmExitVisible,] = React.useState(false,)

	const handleClose = (): void => {
		if (!isConfirmExitVisible) {
			setIsConfirmExitVisible(true,)
		}
	}

	const handleCancelExit = (): void => {
		setIsConfirmExitVisible(false,)
	}

	React.useEffect(() => {
		setFilters(storeFilters,)
	}, [storeFilters,],)

	React.useEffect(() => {
		if (maxTotal && !maxValue) {
			setMaxValue(maxTotal,)
			setRange([0, maxTotal,],)
		}
	}, [maxTotal, maxValue,],)

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>,): void => {
		const {
			value,
		} = e.target
		setFilterStoreFilters({
			...storeFilters,
			search: value,
		},)
	}

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

	return (
		<div className={styles.clientHeader}>
			<div className={styles.clientHeaderLeft}>
				<ClientLists width={32} height={32} />
				<h2 className={styles.clientTitle}>Client profiles</h2>
			</div>
			<div className={styles.clientHeaderRight}>
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
						// todo: clear if good
						// onBlur={handleSearchButtonClick}
					>
						<Input
							name='search'
							label=''
							input={{
								value:       storeFilters.search ?? undefined,
								onChange:    handleSearch,
								placeholder: 'Search client profile',
								autoFocus:   true,
							}}
							leftIcon={<SearchGray width={20} height={20} />}
							rightIcon={
								<XmarkSecond
									width={20}
									height={20}
									onClick={handleSearchButtonClick}
									cursor={'pointer'}
								/>
							}
						/>
					</div>
				)}
				{isFilterVisible && <div className={styles.filterBackdrop} onClick={handleMenuBackdropClick}/>}
				<div className={styles.filterWindowWrapper}>
					{isFilterVisible &&
						<FilterListClient
							handleFilterMenuToggle={toggleFilterVisibility}
							filters={filters}
							setFilters={setFilters}
						/>}
					<Button<ButtonType.ICON>
						className={styles.filterButton(isFilterVisible, hasFilters,)}
						disabled={false}
						onClick={toggleFilterVisibility}
						additionalProps={{
							btnType: ButtonType.ICON,
							size:    Size.MEDIUM,
							color:   Color.SECONDRAY_COLOR,
							icon:    isFilterVisible ?
								<CloseIcon width={20} height={20} /> :
								<Filter width={20} height={20} />,
						}}
					/>
				</div>
				<Button<ButtonType.TEXT>
					disabled={false}
					onClick={toggleAddClientModal}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Add client',
						leftIcon: <Plus width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
				/>
			</div>
			<Drawer
				isOpen={isAddClientVisible}
				onClose={handleClose}
			>
				<AddClient
					onClose={handleCloseAddClient}
					toggleAddClientSuccess={toggleAddClientSuccess}
					handleSetClientDataSuccess={handleSetClientDataSuccess}
					draft={formattedDraft}
					handleClose={handleClose}
					handleCancelExit={handleCancelExit}
					isConfirmExitVisible={isConfirmExitVisible}
				/>
			</Drawer>
			<Dialog
				onClose={toggleAddClientSuccess}
				open={addClientSucces}
			>
				<AddClientSuccess
					toggleAddClientSuccess={toggleAddClientSuccess}
					handleSetClientDataSuccess={handleSetClientDataSuccess}
					clientDataSuccess={clientDataSuccess}
					toggleAddPortfolio={toggleAddPortfolio}
				/>
			</Dialog>
			<AddPortfolio
				clientId={clientDataSuccess.id}
				setIsDrawerOpen={setIsDrawerOpen}
				isDrawerOpen={isDrawerOpen}
			/>
		</div>
	)
}
