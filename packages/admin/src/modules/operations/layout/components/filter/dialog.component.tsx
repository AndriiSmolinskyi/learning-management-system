/* eslint-disable complexity */
import React from 'react'
import {
	Classes,
	Popover,
} from '@blueprintjs/core'
import type {
	MultiValue,
} from 'react-select'
import {
	cx,
} from '@emotion/css'
import {
	useLocation,
	useNavigate,
} from 'react-router-dom'

import {
	Button,
	ButtonType,
	Color,
	Size,
	SelectComponent,
} from '../../../../../shared/components'
import {
	BankSelect,
	ClientsRoute,
	Briefcase,
	EntitySelect,
} from '../../../../../assets/icons'
import {
	useGetPortfolioListByClientIds,
} from '../../../../../shared/hooks/portfolio'
import {
	isDeepEqual,
} from '../../../../../shared/utils'
import type {
	SelectOptionType,
	TOperationsStoreFilter,
} from './filter.store'
import {
	useClientsList,
} from '../../../../clients/client-profiles/clients/hooks'
import {
	Roles,
	type IOptionType,
} from '../../../../../shared/types'
import {
	useGetBankListBySourceIds,
	useAccountsBySourceIds,
	useEntitiesBySourceIds,
} from '../../../../../shared/hooks'
import {
	useOperationsFilterStore,
} from './filter.store'
import {
	OperationsVariablesFilter,
} from './components'
import {
	useUserStore,
} from '../../../../../store/user.store'
import {
	initialState as initialStoreValues,
} from './filter.store'
import {
	initialFilterValues,
} from './filter.component'
import {
	RouterKeys,
} from '../../../../../router/keys'

import * as styles from './filter.styles'

interface IProps {
	children: React.ReactNode
	setDialogOpen: (value: boolean) => void
	setOperationsFilter: React.Dispatch<React.SetStateAction<TOperationsStoreFilter>>
	operationsFilter: TOperationsStoreFilter
	setIsRefreshClicked: React.Dispatch<React.SetStateAction<boolean>>
	isRefreshClicked: boolean
}

export const OperationsFilterDialog: React.FC<IProps> = ({
	children,
	setDialogOpen,
	setOperationsFilter,
	operationsFilter,
	setIsRefreshClicked,
	isRefreshClicked,
},) => {
	const {
		setClientsIds,
		setPortfolioIds,
		setEntitiesIds,
		setBankIds,
		setCurrencies,
		setISINs,
		setSecurities,
		setNames,
		setRequestStatuses,
		setOrderStatuses,
		setCategories,
		setAccountIds,
		setSearch,
		setServiceProviders,
		setDate,
		operationsFilter: storeFilter,
	} = useOperationsFilterStore()
	const [isAllowed, setIsAllowed,] = React.useState<boolean>(false,)
	const [isClearClicked, setIsClearClicked,] = React.useState<boolean>(false,)
	const [analyticsFilterOnClose, setAnalyticsFilterOnClose,] = React.useState<TOperationsStoreFilter>(initialFilterValues,)
	const location = useLocation()
	const navigate = useNavigate()
	const portfolioId = location.state?.portfolioId

	React.useEffect(() => {
		setAnalyticsFilterOnClose(storeFilter,)
		return () => {
			setAnalyticsFilterOnClose(storeFilter,)
			setIsClearClicked(false,)
			setIsRefreshClicked(false,)
		}
	}, [storeFilter,],)
	const {
		userInfo,
	} = useUserStore()

	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		if (hasPermission) {
			setIsAllowed(true,)
		}
	}, [],)

	const {
		data: clientList,
	} = useClientsList()
	const clientIds = operationsFilter.clientIds?.map((portfolio,) => {
		return portfolio.value.id
	},)
	const {
		data: portfolioList,
	} = useGetPortfolioListByClientIds({
		id: clientIds ?? [],
	},)
	const portfolioIds = operationsFilter.portfolioIds?.map((portfolio,) => {
		return portfolio.value.id
	},)
	const {
		data: entityList,
	} = useEntitiesBySourceIds({
		portfolioIds,
		clientIds,
	},)

	const entitiesIds = operationsFilter.entitiesIds?.map((entity,) => {
		return entity.value.id
	},)

	const {
		data: bankList,
	} = useGetBankListBySourceIds({
		clientIds,
		portfolioIds,
		entityIds:    entitiesIds,
	},)

	const bankIds = operationsFilter.bankIds?.map((bank,) => {
		return bank.value.id
	},)

	const {
		data: accountList,
	} = useAccountsBySourceIds({
		clientIds,
		portfolioIds,
		entityIds:   entitiesIds,
		bankListIds: bankIds,
	},)

	const handleFilterApply = (filter: TOperationsStoreFilter,): void => {
		setAnalyticsFilterOnClose(filter,)
		setClientsIds(filter.clientIds,)
		setPortfolioIds(filter.portfolioIds,)
		setEntitiesIds(filter.entitiesIds,)
		setBankIds(filter.bankIds,)
		setAccountIds(filter.accountIds,)
		setCurrencies(filter.currencies,)
		setISINs(filter.isins,)
		setSecurities(filter.securities,)
		setNames(filter.names,)
		setCategories(filter.categories,)
		setRequestStatuses(filter.requestStatuses,)
		setOrderStatuses(filter.orderStatuses,)
		setSearch(filter.search,)
		setServiceProviders(filter.serviceProviders,)
		setDate(filter.date,)
	}

	const clientOptionsArray = React.useMemo(() => {
		return clientList?.list
			.filter((client,) => {
				return client.isActivated
			},)
			.map((client,) => {
				return {
					label: `${client.firstName} ${client.lastName}`,
					value: {
						id:   client.id,
						name: `${client.firstName} ${client.lastName}`,
					},
				}
			},) ?? []
	}, [clientList,],)

	const portfolioOptionsArray = React.useMemo(() => {
		return portfolioList?.filter((portfolio,) => {
			return portfolio.isActivated
		},).map((portfolio,) => {
			return {
				label: portfolio.name,
				value: {
					id:   portfolio.id,
					name: portfolio.name,
				},
			}
		},) ?? []
	}, [portfolioList,],)

	const entityOptionsArray = React.useMemo(() => {
		return entityList?.map((entity,) => {
			return {
				label: entity.name,
				value: {
					id:   entity.id,
					name: entity.name,
				},
			}
		},) ?? []
	}, [entityList,],)

	const bankOptionsArray = React.useMemo(() => {
		return bankList?.map((bank,) => {
			return {
				label: bank.name,
				value: {
					id:   bank.id,
					name: bank.name,
				},
			}
		},) ?? []
	}, [bankList,],)

	const bankAccountsOptionsArray = React.useMemo(() => {
		return accountList?.map((account,) => {
			return {
				label: account.accountName,
				value: {
					id:   account.id,
					name: account.accountName,
				},
			}
		},) ?? []
	}, [accountList,],)
	const content = (
		<div className={styles.filterDialogContainer}>
			<div className={styles.filterDialogWrapper}>
				{isAllowed && <SelectComponent<SelectOptionType>
					options={clientOptionsArray}
					key={operationsFilter.clientIds?.map((item,) => {
						return item.value.id
					},).join(',',)}
					value={operationsFilter.clientIds}
					leftIcon={<ClientsRoute width={18} height={18} />}
					placeholder='Select clients'
					isMulti
					onChange={(select,) => {
						if (select && Array.isArray(select,)) {
							setOperationsFilter({
								...operationsFilter,
								portfolioIds: undefined,
								entitiesIds:    undefined,
								bankIds:      undefined,
								accountIds:    undefined,
								clientIds:    select.length === 0 ?
									undefined :
									select as MultiValue<IOptionType<SelectOptionType>>,
							},)
						}
					}}
				/>}
				<SelectComponent<SelectOptionType>
					options={portfolioOptionsArray}
					value={operationsFilter.portfolioIds}
					key={operationsFilter.portfolioIds?.map((item,) => {
						return item.value.id
					},).join(',',)}
					leftIcon={<Briefcase width={18} height={18} />}
					placeholder='Select portfolio or sub-portfolio'
					isMulti
					onChange={(select,) => {
						if (select && Array.isArray(select,)) {
							setOperationsFilter({
								...operationsFilter,
								entitiesIds:    undefined,
								bankIds:       undefined,
								accountIds:    undefined,
								portfolioIds:    select.length === 0 ?
									undefined :
									select as MultiValue<IOptionType<SelectOptionType>>,
							},)
						}
					}}
				/>
				<SelectComponent<SelectOptionType>
					options={entityOptionsArray}
					value={operationsFilter.entitiesIds}
					key={operationsFilter.entitiesIds?.map((item,) => {
						return item.value.id
					},).join(',',)}
					leftIcon={<EntitySelect width={18} height={18} />}
					placeholder='Select entity'
					isMulti
					onChange={(select,) => {
						if (select && Array.isArray(select,)) {
							setOperationsFilter({
								...operationsFilter,
								bankIds:     undefined,
								accountIds:    undefined,
								entitiesIds:      select.length === 0 ?
									undefined :
									select as MultiValue<IOptionType<SelectOptionType>>,
							},)
						}
					}}
				/>
				<SelectComponent<SelectOptionType>
					options={bankOptionsArray}
					value={operationsFilter.bankIds}
					key={operationsFilter.bankIds?.map((item,) => {
						return item.value.id
					},).join(',',)}
					leftIcon={<BankSelect width={18} height={18} />}
					placeholder='Select bank'
					isMulti
					onChange={(select,) => {
						if (select && Array.isArray(select,)) {
							setOperationsFilter({
								...operationsFilter,
								accountIds:    undefined,
								bankIds:      select.length === 0 ?
									undefined :
									select as MultiValue<IOptionType<SelectOptionType>>,
							},)
						}
					}}
				/>
				<SelectComponent<SelectOptionType>
					options={bankAccountsOptionsArray}
					value={operationsFilter.accountIds}
					key={operationsFilter.accountIds?.map((item,) => {
						return item.value.id
					},).join(',',)}
					leftIcon={<BankSelect width={18} height={18} />}
					placeholder='Select bank account'
					isMulti
					onChange={(select,) => {
						if (select && Array.isArray(select,)) {
							setOperationsFilter({
								...operationsFilter,
								accountIds:      select.length === 0 ?
									undefined :
									select as MultiValue<IOptionType<SelectOptionType>>,
							},)
						}
					}}
				/>
				<OperationsVariablesFilter
					operationsFilter={operationsFilter}
					setOperationsFilter={setOperationsFilter}
				/>
			</div>
			<div className={styles.filterBtnWrapper}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						setOperationsFilter(initialFilterValues,)
						setIsClearClicked(true,)
					}}
					disabled={(((!isDeepEqual(storeFilter, operationsFilter,) && (isClearClicked)) ||
						isDeepEqual(analyticsFilterOnClose, initialStoreValues.operationsFilter,) ||
						isRefreshClicked) && !portfolioId) || (portfolioId && isClearClicked)}
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
						handleFilterApply(operationsFilter,)
						setDialogOpen(false,)
						setIsClearClicked(false,)
						setIsRefreshClicked(false,)
						navigate(location.pathname, {
							replace: true,
						},)
					}}
					disabled={isDeepEqual(storeFilter, operationsFilter,) && (!isClearClicked || !isRefreshClicked)}
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
			disabled={location.pathname.includes(RouterKeys.TRANSACTIONS,)}
			usePortal={true}
			hasBackdrop={true}
			backdropProps={{
				className: styles.popoverBackdrop,
			}}
			placement='bottom-end'
			content={content}
			popoverClassName={styles.popoverContainer}
			onClosing={() => {
				setDialogOpen(false,)
				setIsClearClicked(false,)
				setIsRefreshClicked(false,)
			}}
			autoFocus={false}
			enforceFocus={false}
		>
			{children}
		</Popover>
	)
}