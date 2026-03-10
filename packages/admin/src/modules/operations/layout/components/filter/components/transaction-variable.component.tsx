import React from 'react'
import type {
	MultiValue,
} from 'react-select'
import {
	SelectComponent,
} from '../../../../../../shared/components'
import type {
	SelectOptionType,
	TOperationsStoreFilter,
} from '../filter.store'
import type {
	IOptionType,
} from '../../../../../../shared/types'
import {
	useGetAllCurrencies,
} from '../../../../../../shared/hooks/cbonds'
import {
	HistoryView,
} from '../../../../../../modules/analytics/layout/components/analytics-filter/history-view.component'
import {
	useGetEncryptedServiceProvidersList,
} from '../../../../../../shared/hooks'

interface IProps {
	setOperationsFilter: React.Dispatch<React.SetStateAction<TOperationsStoreFilter>>
	operationsFilter: TOperationsStoreFilter
}

export const TransactionsFilterSelects: React.FC<IProps> = ({
	setOperationsFilter,
	operationsFilter,
},) => {
	const {
		data: currencyList,
	} = useGetAllCurrencies()
	const {
		data: providerList,
	} = useGetEncryptedServiceProvidersList()

	const selectedCurrencyValues = operationsFilter.currencies?.map((c,) => {
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
						id:   currency.currency,
						name: currency.currency,
					},
				}
			},) ?? []
	}, [currencyList, selectedCurrencyValues,],)

	const selectedProviderOptions = operationsFilter.serviceProviders?.map((c,) => {
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

	return (
		<>
			<SelectComponent<SelectOptionType>
				options={providerOptionsArray}
				value={operationsFilter.serviceProviders}
				key={operationsFilter.serviceProviders?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select service provider'
				isMulti
				onChange={(select,) => {
					if (select && Array.isArray(select,)) {
						setOperationsFilter({
							...operationsFilter,
							serviceProviders:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					}
				}}
			/>
			<SelectComponent<SelectOptionType>
				options={currencyOptionsArray}
				value={operationsFilter.currencies}
				key={operationsFilter.currencies?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select currency'
				isMulti
				onChange={(select,) => {
					if (select && Array.isArray(select,)) {
						setOperationsFilter({
							...operationsFilter,
							currencies:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					}
				}}
			/>
			<HistoryView
				analyticsFilter={operationsFilter}
				setAnalyticsFilter={setOperationsFilter}
			/>
		</>
	)
}