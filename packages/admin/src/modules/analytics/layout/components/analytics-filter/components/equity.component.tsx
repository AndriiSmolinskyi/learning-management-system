import React from 'react'
import type {
	MultiValue,
} from 'react-select'
import {
	SelectComponent,
} from '../../../../../../shared/components'
import type {
	OperationSelectOptionType,
	SelectOptionType,
	TAnalyticsFilter,
} from '../analytics-filter.types'
import {
	AssetNamesType,
	AssetOperationType,
	type IOptionType,
} from '../../../../../../shared/types'
import {
	useGetAnalyticsFilteredCurrencies,
} from '../../../../../../shared/hooks/cbonds'
import {
	useGetEquityFilterSelectsBySourceIds,
} from '../../../../../../shared/hooks/analytics'
interface IProps {
	setAnalyticsFilter: React.Dispatch<React.SetStateAction<TAnalyticsFilter>>
	analyticsFilter: TAnalyticsFilter
	bankIds?: Array<string>
}

export const EquityFilterSelects: React.FC<IProps> = ({
	setAnalyticsFilter,
	analyticsFilter,
	bankIds,
},) => {
	const equityFilter = {
		type:      AssetNamesType.EQUITY_ASSET,
		clientIds: analyticsFilter.clientIds?.map((client,) => {
			return client.value.id
		},),
		portfolioIds: analyticsFilter.portfolioIds?.map((portfolio,) => {
			return portfolio.value.id
		},),
		entityIds: analyticsFilter.entitiesIds?.map((entity,) => {
			return entity.value.id
		},),
		bankListIds: analyticsFilter.bankIds?.map((bank,) => {
			return bank.value.id
		},),
		accountIds: analyticsFilter.accountIds?.map((account,) => {
			return account.value.id
		},),
	}
	const {
		data: lists,
	} = useGetEquityFilterSelectsBySourceIds(equityFilter,)
	const {
		// eslint-disable-next-line no-unused-vars
		type, ...currencyFilter
	} = equityFilter
	const {
		data: currencyList,
	} = useGetAnalyticsFilteredCurrencies({
		...currencyFilter,
		assetName: AssetNamesType.EQUITY_ASSET,
	},)

	const selectedTypes = analyticsFilter.equityTypes?.map((c,) => {
		return c.value.id
	},) ?? []
	const typeOptionsArray = React.useMemo(() => {
		return lists?.equityTypes.filter((currency,) => {
			return !selectedTypes.includes(currency,)
		},)
			.map((currency,) => {
				return {
					label: currency,
					value: {
						id:   currency,
						name: currency,
					},
				}
			},) ?? []
	}, [lists?.equityTypes, selectedTypes,],)

	const selectedIsins = analyticsFilter.isins?.map((l,) => {
		return l.value.id
	},) ?? []

	const isinOptionsArray = React.useMemo(() => {
		return lists?.equityIsins.filter((name,) => {
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
			},) ?? []
	}, [lists?.equityIsins, selectedIsins,],)
	const tradeOperationOptionsArray = React.useMemo(() => {
		return Object.values(AssetOperationType,)
			.map((name,) => {
				return {
					label: name,
					value: {
						id: name,
						name,
					},
				}
			},)
	}, [AssetOperationType,],)
	const selectedOptions = analyticsFilter.securities?.map((l,) => {
		return l.value.id
	},) ?? []

	const securityOptionsArray = React.useMemo(() => {
		return lists?.equitySecurities.filter((security,) => {
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
			},) ?? []
	}, [lists?.equitySecurities, selectedOptions,],)

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

	return (
		<>
			<SelectComponent<SelectOptionType>
				options={typeOptionsArray}
				value={analyticsFilter.equityTypes}
				key={analyticsFilter.equityTypes?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select equity type'
				isMulti
				onChange={(select,) => {
					if (Array.isArray(select,) && select.length > 0) {
						setAnalyticsFilter({
							...analyticsFilter,
							equityTypes:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					} else {
						setAnalyticsFilter({
							...analyticsFilter,
							equityTypes:    undefined,
						},)
					}
				}}
			/>
			<SelectComponent<SelectOptionType>
				options={isinOptionsArray}
				value={analyticsFilter.isins}
				key={analyticsFilter.isins?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select ISIN'
				isMulti
				onChange={(select,) => {
					if (Array.isArray(select,) && select.length > 0) {
						setAnalyticsFilter({
							...analyticsFilter,
							isins:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					} else {
						setAnalyticsFilter({
							...analyticsFilter,
							isins:    undefined,
						},)
					}
				}}
			/>
			<SelectComponent<SelectOptionType>
				options={securityOptionsArray}
				value={analyticsFilter.securities}
				key={analyticsFilter.securities?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select security'
				isMulti
				onChange={(select,) => {
					if (Array.isArray(select,) && select.length > 0) {
						setAnalyticsFilter({
							...analyticsFilter,
							securities:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					} else {
						setAnalyticsFilter({
							...analyticsFilter,
							securities:    undefined,
						},)
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
						setAnalyticsFilter({
							...analyticsFilter,
							currencies:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					}
				}}
			/>
			<SelectComponent<OperationSelectOptionType>
				options={tradeOperationOptionsArray}
				value={analyticsFilter.tradeOperation}
				key={analyticsFilter.tradeOperation?.toString()}
				placeholder='Select operation'
				onChange={(select,) => {
					if (select && !Array.isArray(select,)) {
						setAnalyticsFilter({
							...analyticsFilter,
							tradeOperation:    select as IOptionType<OperationSelectOptionType>,
						},)
					}
				}}
			/>
		</>
	)
}