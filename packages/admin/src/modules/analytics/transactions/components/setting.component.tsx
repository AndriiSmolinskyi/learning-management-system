/* eslint-disable no-nested-ternary */
/* eslint-disable max-lines */
/* eslint-disable complexity */
import React from 'react'

import {
	Color,
	Button,
	ButtonType,
	SelectComponent,
	Size,
} from '../../../../shared/components'
import {
	useAccountsBySourceIds,
	useEntitiesBySourceIds,
	useGetAnalyticsFilteredCurrencies,
	useGetBankListBySourceIds,
	useGetPortfolioListByClientIds,
	useGetTransactionFilteredSelects,
} from '../../../../shared/hooks'
import type {
	IOptionType,
	SelectOptionType,
} from '../transactions.types'
import type {
	MultiValue,
} from 'react-select'
import {
	RangeFilter,
} from './date-range.component'
import type {
	TransactionFilter,
} from '../transactions.types'
import {
	Roles,
	type OperationTransactionFilter,
	AssetNamesType,
} from '../../../../shared/types'
import {
	DateRangeSlider,
} from '../../../../shared/components/range-slider/range-date-slider.component'
import type {
	TAnalyticsAction, TAnalyticsStoreFilter,
} from '../../analytics-store'
import {
	useUserStore,
} from '../../../../store/user.store'
import {
	useClientsListForSelect,
} from '../../../../modules/clients/client-profiles/clients/hooks'
import {
	AccountIcon, BankSelect, Briefcase, ClientsRoute, EntitySelect, HistoryClockIcon,
} from '../../../../assets/icons'
import HistoryDatePicker from '../../../../shared/components/datepicker-mui/history-datepicker.component'
import {
	formatToUTCISOString,
} from '../../../../shared/utils'
import * as styles from '../transactions.styles'

interface IProps {
	isinOptions: Array<IOptionType<SelectOptionType>>
	securityOptions: Array<IOptionType<SelectOptionType>>
	filter: TransactionFilter | OperationTransactionFilter
	setIsins: (value: Array<string> | undefined) => void
	setSecurities: (value: Array<string> | undefined) => void
	setTransactionTypes: (value: Array<string> | undefined) => void;
	setDateRange: (dateRange: [Date | null, Date | null] | undefined) => void
	setIsCalendarError: (isError: boolean) => void
	setCurrencies: TAnalyticsAction
	setServiceProviders: TAnalyticsAction
	setClientsIds: TAnalyticsAction
	setPortfolioIds: TAnalyticsAction
	setEntitiesIds: TAnalyticsAction
	setBankIds: TAnalyticsAction
	setAccountIds: TAnalyticsAction
	setDate: (date: string | undefined) => void
	analyticsFilter:TAnalyticsStoreFilter
	sliderStartDate: string | null
	plFetching?: boolean
}

export const TransactionsSettings: React.FunctionComponent<IProps> = ({
	isinOptions,
	securityOptions,
	filter,
	setIsCalendarError,
	setIsins,
	setSecurities,
	setTransactionTypes,
	setDateRange,
	sliderStartDate,
	analyticsFilter,
	setCurrencies,
	setServiceProviders,
	setClientsIds,
	setPortfolioIds,
	setEntitiesIds,
	setBankIds,
	setAccountIds,
	setDate,
	plFetching,
},) => {
	const [isAllowed, setIsAllowed,] = React.useState<boolean>(false,)
	const switcherCircleRef = React.useRef<HTMLDivElement | null>(null,)

	const isValidDate = (d: unknown,): d is Date => {
		return d instanceof Date && !isNaN(d.getTime(),)
	}

	const combinedFilter = React.useMemo(() => {
		return {
			clientIds:    analyticsFilter.clientIds?.map((client,) => {
				return client.value.id
			},),
			portfolioIds:	analyticsFilter.portfolioIds?.map((portfolio,) => {
				return portfolio.value.id
			},),
			entityIds:	analyticsFilter.entitiesIds?.map((entity,) => {
				return entity.value.id
			},),
			bankListIds:			analyticsFilter.bankIds?.map((bank,) => {
				return bank.value.id
			},),
			accountIds:			analyticsFilter.accountIds?.map((account,) => {
				return account.value.id
			},),
			date:             analyticsFilter.date,
			dateRange: filter.isError ?
				undefined :
				isValidDate(filter.dateRange?.[0],) && isValidDate(filter.dateRange[1],) ?
					([
						formatToUTCISOString(filter.dateRange[0],),
						formatToUTCISOString(filter.dateRange[1],),
					] as [string, string]) :
					undefined,

		}
	}, [analyticsFilter, filter,],)

	const {
		data: filteredSelects,
	} = useGetTransactionFilteredSelects(combinedFilter,)

	const {
		data: currencyList,
	} = useGetAnalyticsFilteredCurrencies({
		...combinedFilter,
		assetName: AssetNamesType.CASH,
	},)

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
	const {
		isins,
		securities,
		transactionNames,
		serviceProviders,
	} = filteredSelects ?? {
		isins:            [],
		securities:       [],
		transactionNames: [],
		serviceProviders: [],
	}
	const selectedIsins = filter.isins?.map((l,) => {
		return l
	},) ?? []

	const isinOptionsArray = React.useMemo(() => {
		return isins.filter((name,) => {
			return !selectedIsins.includes(name,)
		},)
			.map((name,) => {
				return {
					label: name,
					value: {
						id: name,
						name,
					},
				}
			},)
	}, [isins, selectedIsins,],)

	const selectedOptions = filter.securities?.map((l,) => {
		return l
	},) ?? []
	const securityOptionsArray = React.useMemo(() => {
		return securities.filter((security,) => {
			return !selectedOptions.includes(security,)
		},)
			.map((name,) => {
				return {
					label: name,
					value: {
						id: name,
						name,
					},
				}
			},)
	}, [securities, selectedOptions,],)

	const selectedTransactionNames = filter.transactionTypes?.map((l,) => {
		return l
	},) ?? []

	const transactionNamesOptionsArray = React.useMemo(() => {
		return transactionNames.filter((type,) => {
			return !selectedTransactionNames.includes(type.name,)
		},)
			.map((type,) => {
				return {
					label: type.name,
					value: {
						id:   type.id,
						name: type.name,
					},
				}
			},)
	}, [transactionNames, selectedTransactionNames,],)

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
	const selectedProviderOptions = analyticsFilter.serviceProviders?.map((c,) => {
		return c.value.id
	},) ?? []

	const providerOptionsArray = React.useMemo(() => {
		return serviceProviders.filter((currency,) => {
			return !selectedProviderOptions.includes(currency.label,)
		},)
			.map((currency,) => {
				return {
					label: currency.label,
					value: {
						id:   currency.value,
						name: currency.value,
					},
				}
			},)
	}, [serviceProviders, selectedProviderOptions,],)

	const selectedCurrencyValues = analyticsFilter.currencies?.map((c,) => {
		return c.value.id
	},) ?? []
	const currencyOptionsArray = React.useMemo(() => {
		return currencyList?.filter((currency,) => {
			return !selectedCurrencyValues.includes(currency.id,)
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
	}, [currencyList, selectedCurrencyValues,],)

	// const transactionTypeOptions = transactionTypeList?.map((type,) => {
	// 	return {
	// 		label: type.name,
	// 		value: {
	// 			id:   type.id,
	// 			name: type.name,
	// 		},
	// 	}
	// },) ?? []

	// const transactionOptions: Array<IOptionType<SelectOptionType>> = transactionTypeOptions.filter((opt,) => {
	// 	return !filter.transactionTypes?.includes(opt.value.id,)
	// },)

	const isinValues = filter.isins
		?.map((isin,) => {
			return {
				label: isin,
				value: {
					id: isin, name: isin,
				},
			}
		},) ??
	[]
	const securityValues = filter.securities
		?.map((security,) => {
			return {
				label: security,
				value: {
					id: security, name: security,
				},
			}
		},) ??
	[]

	const handleClick = (): void => {
		setIsins(undefined,)
		setSecurities(undefined,)
		setTransactionTypes(undefined,)
		setDateRange(undefined,)
		setClientsIds(undefined,)
		setPortfolioIds(undefined,)
		setEntitiesIds(undefined,)
		setBankIds(undefined,)
		setAccountIds(undefined,)
		setCurrencies(undefined,)
		setServiceProviders(undefined,)
		setDate(undefined,)
	}
	const getUniqueOptions = (
		options: Array<IOptionType<SelectOptionType>>,
	): Array<IOptionType<SelectOptionType>> => {
		const seen = new Set<string>()
		return options.filter((option,) => {
			if (seen.has(option.value.id,)) {
				return false
			}
			seen.add(option.value.id,)
			return true
		},)
	}
	const isinOptionsFiltered = getUniqueOptions(isinOptions,)
	// const securityOptionsFiltered = getUniqueOptions(securityOptions,)

	const getCurrentValues = (
		options: MultiValue<IOptionType<SelectOptionType>>,
		type: 'transactionTypes' | 'isins' | 'securities',
	): Array<IOptionType<SelectOptionType>> => {
		const values: Array<IOptionType<SelectOptionType>> = []
		if (options.length && filter[type]?.length) {
			filter[type]?.forEach((type,) => {
				const currentValue = options.find((options,) => {
					return options.value.id === type
				},)
				if (currentValue) {
					values.push(currentValue,)
				}
			},)
		}
		return values
	}

	const [isActive, setIsActive,] = React.useState<boolean>(false,)

	const handleSwitcherClick = (): void => {
		setIsActive(!isActive,)
	}

	const handleDateChange = (date: string | undefined,):void => {
		setDateRange(undefined,)
		setDate(date,)
	}
	const handleDateRangeChange = (dateRange: [Date | null, Date | null] | undefined,):void => {
		setDateRange(dateRange,)
		setDate(undefined,)
	}
	const dateValue = analyticsFilter.date ?
		new Date(analyticsFilter.date,) :
		undefined

	const isDisabled = !filter.transactionTypes &&
			!filter.isins &&
			!filter.securities &&
			!filter.dateRange &&
			!analyticsFilter.clientIds &&
			!analyticsFilter.portfolioIds &&
			!analyticsFilter.entitiesIds &&
			!analyticsFilter.bankIds &&
			!analyticsFilter.accountIds &&
			!analyticsFilter.currencies &&
			!analyticsFilter.serviceProviders &&
			!analyticsFilter.date

	return (
		<div className={styles.settingsContainer}>
			<div className={styles.settingsTitleBox}>
				<p className={styles.settingsTitle}>Transactions Filter</p>
			</div>
			<div className={styles.settingsFlex}>
				<div className={styles.selectsContainer}>
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
								setClientsIds(select.length === 0 ?
									undefined :
									select,)
								setPortfolioIds(undefined,)
								setEntitiesIds(undefined,)
								setBankIds(undefined,)
								setAccountIds(undefined,)
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
								setPortfolioIds(select.length === 0 ?
									undefined :
									select,)
								setEntitiesIds(undefined,)
								setBankIds(undefined,)
								setAccountIds(undefined,)
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
								setEntitiesIds(select.length === 0 ?
									undefined :
									select,)
								setBankIds(undefined,)
								setAccountIds(undefined,)
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
								setBankIds(select.length === 0 ?
									undefined :
									select,)
								setAccountIds(undefined,)
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
								setAccountIds(select.length === 0 ?
									undefined :
									select,)
							}
						}}
					/>
					<SelectComponent<SelectOptionType>
						options={providerOptionsArray}
						value={analyticsFilter.serviceProviders}
						key={analyticsFilter.serviceProviders?.map((item,) => {
							return item.value.id
						},).join(',',)}
						placeholder='Select service provider'
						isMulti
						onChange={(select,) => {
							if (select && Array.isArray(select,)) {
								setServiceProviders(select.length === 0 ?
									undefined :
									select,)
							}
						}}
					/>
					<SelectComponent<SelectOptionType>
						options={currencyOptionsArray}
						value={analyticsFilter.currencies}
						key={analyticsFilter.currencies?.map((item,) => {
							return item.value.id
						},).join(',',)}
						placeholder='Select currency'
						isMulti
						onChange={(select,) => {
							if (select && Array.isArray(select,)) {
								setCurrencies(select.length === 0 ?
									undefined :
									select,)
							}
						}}
					/>
					<SelectComponent<SelectOptionType>
						options={transactionNamesOptionsArray}
						value={getCurrentValues(transactionNamesOptionsArray, 'transactionTypes',)}
						placeholder='Select transaction'
						isMulti
						onChange={(select,) => {
							if (select && Array.isArray(select,)) {
								setTransactionTypes(
									select.length === 0 ?
										undefined :
										select.map((transactionType,) => {
											return transactionType.value.id
										},),
								)
							}
						}}
					/>
					<SelectComponent<SelectOptionType>
						options={isinOptionsArray}
						value={isinValues}
						placeholder='Select ISIN'
						isMulti
						key={isinOptionsFiltered.map((item,) => {
							return item.value.id
						},).join(',',)}
						onChange={(select,) => {
							if (select && Array.isArray(select,)) {
								setIsins(select.length === 0 ?
									undefined :
									select.map((isin,) => {
										return isin.value.id
									},),)
							}
						}}
						isDisabled={plFetching}
					/>
					<SelectComponent<SelectOptionType>
						options={securityOptionsArray}
						value={securityValues}
						placeholder='Select ticker'
						isMulti
						onChange={(select,) => {
							if (select && Array.isArray(select,)) {
								setSecurities(select.length === 0 ?
									undefined :
									select.map((security,) => {
										return security.value.id
									},),)
							}
						}}
					/>
				</div>
				<RangeFilter
					filter={filter}
					setDateRange={handleDateRangeChange}
					setIsCalendarError={setIsCalendarError}
				>
					<div className={styles.rangeButtonsWrapper}>
						{sliderStartDate && <DateRangeSlider startDate={sliderStartDate} setDateRange={handleDateRangeChange} isCleared={filter.dateRange === undefined}/>}
					</div>
				</RangeFilter>
			</div>
			<div className={styles.clearBlock}>
				<Button<ButtonType.TEXT>
					type='button'
					className={styles.settingsClearButton}
					disabled={isDisabled}
					onClick={handleClick}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Clear',
						size:    Size.SMALL,
						color:   Color.SECONDRAY_GRAY,
					}}
				/>
				<div className={styles.historyWrapper}>
					<div className={styles.iconBlock}>
						<HistoryClockIcon width={18} height={18}/>
						<p className={styles.iconText}>History view</p>
					</div>
					<div className={styles.historyRightBlock(isActive || Boolean(analyticsFilter.date,),)} onClick={() => {
						if (analyticsFilter.date) {
							setDate(undefined,)
						} else {
							handleSwitcherClick()
						}
					}}>
						<div ref={switcherCircleRef} className={styles.historySwitcherItem(isActive || Boolean(analyticsFilter.date,),)} onClick={(e,) => {
							if (switcherCircleRef.current && analyticsFilter.date) {
								e.stopPropagation()
								handleSwitcherClick()
							}
						}}/>
					</div>
					<HistoryDatePicker isOpen={isActive} toggleIsOpen={handleSwitcherClick} onChange={handleDateChange} value={dateValue}/>
				</div>
			</div>
		</div>
	)
}