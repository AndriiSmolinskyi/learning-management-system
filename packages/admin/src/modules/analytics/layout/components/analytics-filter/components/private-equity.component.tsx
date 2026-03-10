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
	useGetAnalyticsFilteredCurrencies,
} from '../../../../../../shared/hooks/cbonds'
import {
	useGetPrivateEquityFilterSelectBySourceIds,
} from '../../../../../../shared/hooks/analytics'

interface IProps {
	setAnalyticsFilter: React.Dispatch<React.SetStateAction<TAnalyticsFilter>>
	analyticsFilter: TAnalyticsFilter
	bankIds?: Array<string>
}

export const PrivateEquityFilterSelects: React.FC<IProps> = ({
	setAnalyticsFilter,
	analyticsFilter,
	bankIds,
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
		data: typeList,
	} = useGetPrivateEquityFilterSelectBySourceIds(bondFilter,)
	const {
		data: currencyList,
	} = useGetAnalyticsFilteredCurrencies({
		...bondFilter,
		assetName: AssetNamesType.PRIVATE_EQUITY,
	},)

	const selectedPrivateTypes = analyticsFilter.privateEquityTypes?.map((l,) => {
		return l.value.id
	},) ?? []

	const typeOptionsArray = React.useMemo(() => {
		return typeList?.peFundTyped.filter((name,) => {
			return !selectedPrivateTypes.includes(name,)
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
	}, [typeList?.peFundTyped, selectedPrivateTypes,],)

	const selectedPrivateNames = analyticsFilter.privateEquityNames?.map((l,) => {
		return l.value.id
	},) ?? []

	const nameOptionsArray = React.useMemo(() => {
		return typeList?.peFundNames.filter((name,) => {
			return !selectedPrivateNames.includes(name,)
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
	}, [typeList?.peFundNames, selectedPrivateNames,],)
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
				value={analyticsFilter.privateEquityTypes}
				key={analyticsFilter.privateEquityTypes?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select PE type'
				isMulti
				onChange={(select,) => {
					if (Array.isArray(select,) && select.length > 0) {
						setAnalyticsFilter({
							...analyticsFilter,
							privateEquityTypes:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					} else {
						setAnalyticsFilter({
							...analyticsFilter,
							privateEquityTypes:    undefined,
						},)
					}
				}}
			/>
			<SelectComponent<SelectOptionType>
				options={nameOptionsArray}
				value={analyticsFilter.privateEquityNames}
				key={analyticsFilter.privateEquityNames?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select name'
				isMulti
				onChange={(select,) => {
					if (Array.isArray(select,) && select.length > 0) {
						setAnalyticsFilter({
							...analyticsFilter,
							privateEquityNames:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					} else {
						setAnalyticsFilter({
							...analyticsFilter,
							privateEquityNames:    undefined,
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