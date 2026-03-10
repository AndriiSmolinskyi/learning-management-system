import React from 'react'
import type {
	MultiValue,
} from 'react-select'
import {
	SelectComponent,
} from '../../../../../../shared/components'
import type {
	SelectOptionType,
	TAnalyticsFilter,
} from '../analytics-filter.types'
import type {
	IOptionType,
} from '../../../../../../shared/types'
import {
	useGetAllCurrencies,
} from '../../../../../../shared/hooks/cbonds'
import {
	useGetEncryptedServiceProvidersList,
} from '../../../../../../shared/hooks'

interface IProps {
	setAnalyticsFilter: React.Dispatch<React.SetStateAction<TAnalyticsFilter>>
	analyticsFilter: TAnalyticsFilter
	bankIds?: Array<string>
}

export const TransactionFilterSelects: React.FC<IProps> = ({
	setAnalyticsFilter,
	analyticsFilter,
	bankIds,
},) => {
	const {
		data: providerList,
	} = useGetEncryptedServiceProvidersList()

	const {
		data: currencyList,
	} = useGetAllCurrencies()

	const selectedProviderOptions = analyticsFilter.serviceProviders?.map((c,) => {
		return c.value.id
	},) ?? []

	const providerOptionsArray = React.useMemo(() => {
		return providerList?.filter((currency,) => {
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
			},) ?? []
	}, [providerList, selectedProviderOptions,],)

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
				options={providerOptionsArray}
				value={analyticsFilter.serviceProviders}
				key={analyticsFilter.serviceProviders?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select service provider'
				isMulti
				onChange={(select,) => {
					if (Array.isArray(select,) && select.length > 0) {
						setAnalyticsFilter({
							...analyticsFilter,
							serviceProviders:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					} else {
						setAnalyticsFilter({
							...analyticsFilter,
							serviceProviders:    undefined,
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
		</>
	)
}