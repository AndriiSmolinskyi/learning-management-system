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
import {
	AssetNamesType,
	type IOptionType,
} from '../../../../../../shared/types'
import {
	getAssetOtherNamesBySourceIds,
} from '../../../../../../shared/hooks'
import {
	useGetAnalyticsFilteredCurrencies,
} from '../../../../../../shared/hooks/cbonds'

interface IProps {
	setAnalyticsFilter: React.Dispatch<React.SetStateAction<TAnalyticsFilter>>
	analyticsFilter: TAnalyticsFilter
	bankIds?: Array<string>
}

export const OtherFilterSelects: React.FC<IProps> = ({
	setAnalyticsFilter,
	analyticsFilter,
	bankIds,
},) => {
	const otherInvestFilter = {
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
		data: otherData,
	} = getAssetOtherNamesBySourceIds(otherInvestFilter,)
	const {
		investmentAssetNames,
		serviceProviders,
	} = otherData ?? {
		investmentAssetNamesList: [],
		serviceProviders:         [],
	}
	const {
		data: currencyList,
	} = useGetAnalyticsFilteredCurrencies({
		...otherInvestFilter,
		assetName: AssetNamesType.OTHER,
	},)

	const selectedOtherHames = analyticsFilter.investmentAssetNames?.map((c,) => {
		return c.value.id
	},) ?? []
	const investmentAssetNamesOptionsArray = React.useMemo(() => {
		return investmentAssetNames?.filter((currency,) => {
			return !selectedOtherHames.includes(currency,)
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
	}, [selectedOtherHames, investmentAssetNames,],)

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

	const selectedServices = analyticsFilter.serviceProviders?.map((c,) => {
		return c.value.name
	},) ?? []

	const serviceOptionsArray = React.useMemo(() => {
		return serviceProviders.filter((name,) => {
			return !selectedServices.includes(name,)
		},)
			.map((name,) => {
				return {
					label: name,
					value: {
						id:   name,
						name,
					},
				}
			},)
	}, [selectedServices, serviceProviders,],)

	return (
		<>
			<SelectComponent<SelectOptionType>
				options={investmentAssetNamesOptionsArray}
				value={analyticsFilter.investmentAssetNames}
				key={analyticsFilter.investmentAssetNames?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select asset name'
				isMulti
				onChange={(select,) => {
					if (select && Array.isArray(select,)) {
						setAnalyticsFilter({
							...analyticsFilter,
							investmentAssetNames:    select as MultiValue<IOptionType<SelectOptionType>>,
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
			<SelectComponent<SelectOptionType>
				options={serviceOptionsArray}
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
		</>

	)
}