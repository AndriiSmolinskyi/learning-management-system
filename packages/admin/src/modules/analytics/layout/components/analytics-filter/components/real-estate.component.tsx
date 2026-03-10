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
	useGetRealEstateFilterSelectsBySourceIds,
} from '../../../../../../shared/hooks'
import {
	Flag,
} from '../../../../../../assets/icons'
interface IProps {
	setAnalyticsFilter: React.Dispatch<React.SetStateAction<TAnalyticsFilter>>
	analyticsFilter: TAnalyticsFilter
	bankIds?: Array<string>
}

export const RealEstateFilterSelects: React.FC<IProps> = ({
	setAnalyticsFilter,
	analyticsFilter,
	bankIds,
},) => {
	const realEstateFilter = {
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
		data: realEstateFilters,
	} = useGetRealEstateFilterSelectsBySourceIds(realEstateFilter,)
	const selectedOperations = analyticsFilter.operations?.map((l,) => {
		return l.value.id
	},) ?? []

	const operationsOptionsArray = React.useMemo(() => {
		return realEstateFilters?.operations.filter((name,) => {
			return !selectedOperations.includes(name,)
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
	}, [realEstateFilters?.operations, selectedOperations,],)

	const selectedProjectTransactions = analyticsFilter.projectTransactions?.map((l,) => {
		return l.value.id
	},) ?? []

	const projectTransactionsArray = React.useMemo(() => {
		return realEstateFilters?.projectTransactions.filter((name,) => {
			return !selectedProjectTransactions.includes(name,)
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
	}, [realEstateFilters?.projectTransactions, selectedProjectTransactions,],)

	const selectedCountries = analyticsFilter.countries?.map((l,) => {
		return l.value.id
	},) ?? []

	const countriesArray = React.useMemo(() => {
		return realEstateFilters?.countries.filter((name,) => {
			return !selectedCountries.includes(name,)
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
	}, [realEstateFilters?.countries, selectedCountries,],)
	const selectedCities = analyticsFilter.cities?.map((l,) => {
		return l.value.id
	},) ?? []

	const citiesArray = React.useMemo(() => {
		return realEstateFilters?.cities.filter((name,) => {
			return !selectedCities.includes(name,)
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
	}, [realEstateFilters?.cities, selectedCities,],)

	return (
		<>
			<SelectComponent<SelectOptionType>
				options={operationsOptionsArray}
				value={analyticsFilter.operations}
				key={analyticsFilter.operations?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select operation'
				isMulti
				onChange={(select,) => {
					if (select && Array.isArray(select,)) {
						setAnalyticsFilter({
							...analyticsFilter,
							operations:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					}
				}}
			/>
			<SelectComponent<SelectOptionType>
				options={projectTransactionsArray}
				value={analyticsFilter.projectTransactions}
				key={analyticsFilter.projectTransactions?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select project transactions'
				isMulti
				onChange={(select,) => {
					if (Array.isArray(select,) && select.length > 0) {
						setAnalyticsFilter({
							...analyticsFilter,
							projectTransactions:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					} else {
						setAnalyticsFilter({
							...analyticsFilter,
							projectTransactions:    undefined,
						},)
					}
				}}
			/>
			<SelectComponent<SelectOptionType>
				options={countriesArray}
				value={analyticsFilter.countries}
				key={analyticsFilter.countries?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select country'
				isSearchable
				isMulti
				leftIcon={<Flag/>}
				onChange={(select,) => {
					if (Array.isArray(select,) && select.length > 0) {
						setAnalyticsFilter({
							...analyticsFilter,
							countries:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					} else {
						setAnalyticsFilter({
							...analyticsFilter,
							countries:    undefined,
						},)
					}
				}}
			/>
			<SelectComponent<SelectOptionType>
				options={citiesArray}
				value={analyticsFilter.cities}
				key={analyticsFilter.cities?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select city'
				isMulti
				onChange={(select,) => {
					if (Array.isArray(select,) && select.length > 0) {
						setAnalyticsFilter({
							...analyticsFilter,
							cities:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					} else {
						setAnalyticsFilter({
							...analyticsFilter,
							cities:    undefined,
						},)
					}
				}}
			/>
		</>

	)
}