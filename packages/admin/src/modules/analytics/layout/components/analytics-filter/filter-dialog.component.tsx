/* eslint-disable max-lines */
/* eslint-disable complexity */
import React from 'react'
import {
	useLocation,
} from 'react-router-dom'
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
	AccountIcon,
} from '../../../../../assets/icons'
import {
	useGetPortfolioListByClientIds,
} from '../../../../../shared/hooks/portfolio'
import {
	useClientsListForSelect,
} from '../../../../clients/client-profiles/clients/hooks'
import {
	isDeepEqual,
} from '../../../../../shared/utils'
import type {
	SelectOptionType,
	TAnalyticsFilter,
} from './analytics-filter.types'
import {
	Roles,
	type IOptionType,
} from '../../../../../shared/types'
import {
	useEntitiesBySourceIds,
	useGetBankListBySourceIds,
	useAccountsBySourceIds,
	useGetAllCurrencies,
} from '../../../../../shared/hooks'
import {
	useAnalyticsFilterStore,
} from '../../../analytics-store'
import {
	AssetVariablesFilter,
} from './components'
import {
	useUserStore,
} from '../../../../../store/user.store'
import {
	initialFilterValues,
} from './analytics-filter.component'
import {
	HistoryView,
} from './history-view.component'
import {
	initialState as initialStoreValues,
} from '../../../analytics-store'
import {
	useAnalyticTransactionStore,
} from '../../../../analytics/transactions/transaction.store'
import {
	RouterKeys,
} from '../../../../../router/keys'
import {
	useBondStore,
} from '../../../../../modules/analytics/bonds'
import {
	useDepositStore,
} from '../../../../../modules/analytics/deposit'

import * as styles from './analytics-filter.styles'
import {
	useCryptoStore,
} from '../../../../../modules/analytics/crypto'
import {
	useEquityStore,
} from '../../../../../modules/analytics/equities'
import {
	usePrivateEquityStore,
} from '../../../../../modules/analytics/private-equity'
import {
	useOtherInvestmentsStore,
} from '../../../../../modules/analytics/other-investments'
import {
	useRealEstateStore,
} from '../../../../../modules/analytics/real-estate/real-estate.store'
import {
	useLoanStore,
} from '../../../../../modules/analytics/loan'
import {
	useMetalsStore,
} from '../../../../../modules/analytics/metals'
import {
	useOptionsStore,
} from '../../../../../modules/analytics/options'

interface IProps {
	children: React.ReactNode
	setDialogOpen: (value: boolean) => void
	setAnalyticsFilter: React.Dispatch<React.SetStateAction<TAnalyticsFilter>>
	analyticsFilter: TAnalyticsFilter
	setIsRefreshClicked: React.Dispatch<React.SetStateAction<boolean>>
	isRefreshClicked: boolean
}

export const AnalyticsFilterDialog: React.FC<IProps> = ({
	children,
	setDialogOpen,
	setAnalyticsFilter,
	analyticsFilter,
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
		setPairs,
		setLoanNames,
		setInvestmentAssetNames,
		setServiceProviders,
		setMetals,
		setOperations,
		setProjectTransactions,
		setCities,
		setCountries,
		setEquityTypes,
		setPrivateEquityTypes,
		setPrivateEquityNames,
		setCryptoTypes,
		setWallets,
		setProductTypes,
		setMetalProductTypes,
		setDate,
		setAccountIds,
		setTradeOperation,
		analyticsFilter: storeFilter,
	} = useAnalyticsFilterStore()

	const {
		setDateRange,
	} = useAnalyticTransactionStore()
	const [isAllowed, setIsAllowed,] = React.useState<boolean>(false,)
	const [isClearClicked, setIsClearClicked,] = React.useState<boolean>(false,)
	const [analyticsFilterOnClose, setAnalyticsFilterOnClose,] = React.useState<TAnalyticsFilter>(initialFilterValues,)
	const location = useLocation()
	const locationState = location.state
	React.useEffect(() => {
		setAnalyticsFilterOnClose(storeFilter,)

		return () => {
			setAnalyticsFilterOnClose(storeFilter,)
			setIsClearClicked(false,)
			setIsRefreshClicked(false,)
		}
	}, [],)
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
	}, [userInfo,],)

	const {
		data: clientList,
	} = useClientsListForSelect()
	const clientIds = analyticsFilter.clientIds?.map((portfolio,) => {
		return portfolio.value.id
	},)
	const {
		data: portfolioList,
	} = useGetPortfolioListByClientIds({
		id: clientIds ?? [],
	},)
	const portfolioIds = analyticsFilter.portfolioIds?.map((portfolio,) => {
		return portfolio.value.id
	},)
	const {
		data: entityList,
	} = useEntitiesBySourceIds(
		{
			clientIds,
			portfolioIds,
		},
	)
	const entitiesIds = analyticsFilter.entitiesIds?.map((portfolio,) => {
		return portfolio.value.id
	},)

	const {
		data: bankList,
	} = useGetBankListBySourceIds({
		entityIds: entitiesIds,
		clientIds,
		portfolioIds,
	},)
	const bankIds = analyticsFilter.bankIds?.map((bank,) => {
		return bank.value.id
	},)

	const {
		data: bankAccountList,
	} = useAccountsBySourceIds({
		entityIds:   entitiesIds,
		clientIds,
		portfolioIds,
		bankListIds: bankIds,
	},)

	const handleFilterApply = (filter: TAnalyticsFilter,): void => {
		setAnalyticsFilterOnClose(filter,)
		setClientsIds(filter.clientIds,)
		setPortfolioIds(filter.portfolioIds,)
		setEntitiesIds(filter.entitiesIds,)
		setBankIds(filter.bankIds,)
		setAccountIds(filter.accountIds,)
		setCurrencies(filter.currencies,)
		setISINs(filter.isins,)
		setSecurities(filter.securities,)
		setPairs(filter.pairs,)
		setLoanNames(filter.loanNames,)
		setInvestmentAssetNames(filter.investmentAssetNames,)
		setServiceProviders(filter.serviceProviders,)
		setMetals(filter.metals,)
		setOperations(filter.operations,)
		setProjectTransactions(filter.projectTransactions,)
		setCities(filter.cities,)
		setCountries(filter.countries,)
		setEquityTypes(filter.equityTypes,)
		setPrivateEquityTypes(filter.privateEquityTypes,)
		setPrivateEquityNames(filter.privateEquityNames,)
		setCryptoTypes(filter.cryptoTypes,)
		setWallets(filter.wallets,)
		setProductTypes(filter.productTypes,)
		setMetalProductTypes(filter.metalProductTypes,)
		setDate(filter.date,)
		setDateRange(undefined,)

		setTradeOperation(filter.tradeOperation,)
	}

	const {
		setAssetId,
	} = useBondStore()
	const {
		setAssetId: setDepositAssetIds,
	} = useDepositStore()
	const {
		setAssetId: setCryptoAssetIds,
	} = useCryptoStore()
	const {
		setAssetId: setEquityAssetIds,
	} = useEquityStore()
	const {
		setAssetId: setLoanAssetIds,
	} = useLoanStore()
	const {
		setAssetIds: setMetalAssetIds,
	} = useMetalsStore()
	const {
		setAssetIds: setOptionAssetIds,
	} = useOptionsStore()
	const {
		setAssetIds: setOtherAssetIds,
	} = useOtherInvestmentsStore()
	const {
		setAssetId: setPEAssetIds,
	} = usePrivateEquityStore()
	const {
		setAssetIds: setREAssetIds,
	} = useRealEstateStore()

	const clearAssetIds = (): void => {
		setAssetId(undefined,)
		setDepositAssetIds(undefined,)
		setEquityAssetIds(undefined,)
		setCryptoAssetIds(undefined,)
		setLoanAssetIds(undefined,)
		setMetalAssetIds(undefined,)
		setOptionAssetIds(undefined,)
		setOtherAssetIds(undefined,)
		setPEAssetIds(undefined,)
		setREAssetIds(undefined,)
	}
	const clientOptionsArray = React.useMemo(() => {
		return clientList?.map((client,) => {
			return {
				label: client.label,
				value: {
					id:   client.value,
					name: client.label,
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
		return bankAccountList?.map((account,) => {
			return {
				label: account.accountName,
				value: {
					id:   account.id,
					name: account.accountName,
				},
			}
		},) ?? []
	}, [bankAccountList,],)
	const {
		data: currencyList,
	} = useGetAllCurrencies()

	React.useEffect(() => {
		if (!locationState) {
			return
		}
		if (locationState.clientId) {
			const client = clientOptionsArray.find((client,) => {
				return client.value.id === locationState.clientId
			},)
			if (client) {
				setClientsIds([client,],)
				setAnalyticsFilterOnClose({
					...storeFilter,
					clientIds: [client,],
				},)
			}
		}
		if (locationState.portfolioId) {
			const portfolio = portfolioOptionsArray.find((portfolio,) => {
				return portfolio.value.id === locationState.portfolioId
			},)
			if (portfolio) {
				setPortfolioIds([portfolio,],)
				setAnalyticsFilterOnClose({
					...storeFilter,
					portfolioIds: [portfolio,],
				},)
			}
		}
		if (locationState.entityId) {
			const entity = entityOptionsArray.find((entity,) => {
				return entity.value.id === locationState.entityId
			},)
			if (entity) {
				setEntitiesIds([entity,],)
				setAnalyticsFilterOnClose({
					...storeFilter,
					entitiesIds: [entity,],
				},)
			}
		}
		if (locationState.bankId) {
			const bank = bankOptionsArray.find((bank,) => {
				return bank.value.id === locationState.bankId
			},)
			if (bank) {
				setBankIds([bank,],)
				setAnalyticsFilterOnClose({
					...storeFilter,
					bankIds: [bank,],
				},)
			}
		}
		if (locationState.accountId) {
			const account = bankAccountsOptionsArray.find((account,) => {
				return account.value.id === locationState.accountId
			},)
			if (account) {
				setAccountIds([account,],)
				setAnalyticsFilterOnClose({
					...storeFilter,
					accountIds: [account,],
				},)
			}
		}
		if (location.pathname === RouterKeys.ANALYTICS_CASH && locationState.currency && currencyList) {
			const currency = currencyList.find((currency,) => {
				return currency.currency === locationState.currency
			},)

			if (currency) {
				const currencyOption = {
					label: currency.currency,
					value: {
						id:   currency.id,
						name: currency.currency,
					},
				}
				setCurrencies([currencyOption,],)
				setAnalyticsFilterOnClose({
					...storeFilter,
					currencies: [currencyOption,],
				},)
			}
		}
	}, [locationState, currencyList,],)

	React.useEffect(() => {
		setTradeOperation(undefined,)
	}, [location.pathname,],)

	const content = (
		<div className={styles.filterDialogContainer}>
			<div className={styles.filterDialogWrapper}>
				{isAllowed && <SelectComponent<SelectOptionType>
					options={clientOptionsArray}
					key={analyticsFilter.clientIds?.map((item,) => {
						return item.value.id
					},).join(',',)}
					value={analyticsFilter.clientIds}
					leftIcon={<ClientsRoute width={18} height={18} />}
					placeholder='Select clients'
					isMulti
					onChange={(select,) => {
						if (select && Array.isArray(select,)) {
							clearAssetIds()
							setAnalyticsFilter({
								...analyticsFilter,
								bankIds:      undefined,
								portfolioIds: undefined,
								entitiesIds:  undefined,
								accountIds:   undefined,
								clientIds:    select.length === 0 ?
									undefined :
									select as MultiValue<IOptionType<SelectOptionType>>,
							},)
						}
					}}
				/>}
				<SelectComponent<SelectOptionType>
					options={portfolioOptionsArray}
					value={analyticsFilter.portfolioIds}
					key={analyticsFilter.portfolioIds?.map((item,) => {
						return item.value.id
					},).join(',',)}
					leftIcon={<Briefcase width={18} height={18} />}
					placeholder='Select portfolio or sub-portfolio'
					isMulti
					onChange={(select,) => {
						if (select && Array.isArray(select,)) {
							clearAssetIds()
							setAnalyticsFilter({
								...analyticsFilter,
								bankIds:      undefined,
								entitiesIds:  undefined,
								accountIds:   undefined,
								portfolioIds: select.length === 0 ?
									undefined :
									select as MultiValue<IOptionType<SelectOptionType>>,
							},)
						}
					}}
				/>
				<SelectComponent<SelectOptionType>
					options={entityOptionsArray}
					value={analyticsFilter.entitiesIds}
					key={analyticsFilter.entitiesIds?.map((item,) => {
						return item.value.id
					},).join(',',)}
					leftIcon={<EntitySelect width={18} height={18} />}
					placeholder='Select entity'
					isMulti
					onChange={(select,) => {
						if (select && Array.isArray(select,)) {
							clearAssetIds()
							setAnalyticsFilter({
								...analyticsFilter,
								bankIds:     undefined,
								accountIds:  undefined,
								entitiesIds: select.length === 0 ?
									undefined :
									select as MultiValue<IOptionType<SelectOptionType>>,
							},)
						}
					}}
				/>
				<SelectComponent<SelectOptionType>
					options={bankOptionsArray}
					value={analyticsFilter.bankIds}
					key={analyticsFilter.bankIds?.map((item,) => {
						return item.value.id
					},).join(',',)}
					leftIcon={<BankSelect width={18} height={18} />}
					placeholder='Select bank'
					isMulti
					onChange={(select,) => {
						if (select && Array.isArray(select,)) {
							clearAssetIds()
							setAnalyticsFilter({
								...analyticsFilter,
								accountIds: undefined,
								bankIds:    select.length === 0 ?
									undefined :
									select as MultiValue<IOptionType<SelectOptionType>>,
							},)
						}
					}}
				/>
				<SelectComponent<SelectOptionType>
					options={bankAccountsOptionsArray}
					value={analyticsFilter.accountIds}
					key={analyticsFilter.accountIds?.map((item,) => {
						return item.value.id
					},).join(',',)}
					leftIcon={<AccountIcon width={18} height={18} />}
					placeholder='Select bank account'
					isMulti
					onChange={(select,) => {
						if (select && Array.isArray(select,)) {
							clearAssetIds()
							setAnalyticsFilter({
								...analyticsFilter,
								accountIds: select.length === 0 ?
									undefined :
									select as MultiValue<IOptionType<SelectOptionType>>,
							},)
						}
					}}
				/>
				<AssetVariablesFilter
					analyticsFilter={analyticsFilter}
					setAnalyticsFilter={setAnalyticsFilter}
				/>
				<HistoryView
					analyticsFilter={analyticsFilter}
					setAnalyticsFilter={setAnalyticsFilter}
					clearAssetIds={clearAssetIds}
				/>
			</div>
			<div className={styles.filterBtnWrapper}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						setAnalyticsFilter(initialFilterValues,)
						setIsClearClicked(true,)
					}}
					disabled={(!isDeepEqual(storeFilter, analyticsFilter,) && isClearClicked) || (isDeepEqual(analyticsFilterOnClose, initialStoreValues.analyticsFilter,)) || isRefreshClicked}
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
						handleFilterApply(analyticsFilter,)
						setDialogOpen(false,)
						setIsClearClicked(false,)
						setIsRefreshClicked(false,)
					}}
					disabled={isDeepEqual(storeFilter, analyticsFilter,) && (!isClearClicked || !isRefreshClicked)}
					className={cx(styles.applyBtn, Classes.POPOVER_DISMISS,)}
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
			disabled={location.pathname.includes(RouterKeys.ANALYTICS_TRANSACTIONS,)}
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
