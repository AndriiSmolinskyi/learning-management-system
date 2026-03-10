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
import type {
	IOptionType,
} from '../../../../../../shared/types'
import {
	useGetAnalyticsFilteredCurrencies,
} from '../../../../../../shared/hooks/cbonds'
import {
	AssetNamesType,
	AssetOperationType,
} from '../../../../../../shared/types'
import {
	useGetBondIsinsByBanksIds, useGetBondSecuritiesByBanksIds,
} from '../../../../../../shared/hooks'

interface IProps {
	setAnalyticsFilter: React.Dispatch<React.SetStateAction<TAnalyticsFilter>>
	analyticsFilter: TAnalyticsFilter
}

export const BondsFilterSelects: React.FC<IProps> = ({
	setAnalyticsFilter,
	analyticsFilter,
},) => {
	const bondFilter = {
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
		data: isinList,
	} = useGetBondIsinsByBanksIds(bondFilter,)
	const {
		data: securityList,
	} = useGetBondSecuritiesByBanksIds(bondFilter,)
	const {
		data: currencyList,
	} = useGetAnalyticsFilteredCurrencies({
		...bondFilter,
		assetName: AssetNamesType.BONDS,
	},)

	const selectedIsins = analyticsFilter.isins?.map((l,) => {
		return l.value.id
	},) ?? []

	const isinOptionsArray = React.useMemo(() => {
		return isinList?.filter((name,) => {
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
	}, [isinList, selectedIsins,],)

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
	const selectedOptions = analyticsFilter.securities?.map((l,) => {
		return l.value.id
	},) ?? []

	const securityOptionsArray = React.useMemo(() => {
		return securityList?.filter((security,) => {
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
	}, [securityList, selectedOptions,],)

	return (
		<>
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
					if (Array.isArray(select,) && select.length > 0) {
						setAnalyticsFilter({
							...analyticsFilter,
							currencies:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					} else {
						setAnalyticsFilter({
							...analyticsFilter,
							currencies:    undefined,
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