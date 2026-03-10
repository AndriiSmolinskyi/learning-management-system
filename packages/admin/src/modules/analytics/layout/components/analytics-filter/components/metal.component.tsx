/* eslint-disable complexity */
import React from 'react'
import type {
	MultiValue,
} from 'react-select'
import {
	SelectComponent,
} from '../../../../../../shared/components'
import type {
	MetalProductTypeSelectOptionType,
	OperationSelectOptionType,
	SelectOptionType,
	TAnalyticsFilter,
} from '../analytics-filter.types'
import {
	AssetOperationType,
	MetalType,
	type IOptionType,
	AssetNamesType,
} from '../../../../../../shared/types'
import {
	useGetAllMetals,
	useGetAnalyticsFilteredCurrencies,
	useGetEquityFilterSelectsBySourceIds,
} from '../../../../../../shared/hooks'

interface IProps {
	setAnalyticsFilter: React.Dispatch<React.SetStateAction<TAnalyticsFilter>>
	analyticsFilter: TAnalyticsFilter
}

export const MetalFilterSelects: React.FC<IProps> = ({
	setAnalyticsFilter,
	analyticsFilter,
},) => {
	const {
		data: metalList,
	} = useGetAllMetals()
	const equityFilter = {
		type:             AssetNamesType.METALS,
		metalProductType: analyticsFilter.metalProductTypes?.value.name,
		clientIds:        analyticsFilter.clientIds?.map((client,) => {
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
		assetName: AssetNamesType.METALS,
	},)
	const selectedMetals = analyticsFilter.metals?.map((c,) => {
		return c.value.name
	},) ?? []

	const metalOptionsArray = React.useMemo(() => {
		return lists?.metalCurrencies?.filter((currency,) => {
			return !selectedMetals.includes(currency,)
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
	}, [metalList, selectedMetals,],)
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

	const productTypesOptionsArray = React.useMemo(() => {
		return Object.values(MetalType,)
			.map((name,) => {
				return {
					label: name,
					value: {
						id: name,
						name,
					},
				}
			},)
	}, [MetalType,],)

	// todo: Remove after qa test
	// const filteredProductTypesOptions = productTypesOptionsArray.map((item,) => {
	// 	if (item.value.name === MetalType.DIRECT_HOLD && productTypeFilter.isDirectHold) {
	// 		return item
	// 	}
	// 	if (item.value.name === MetalType.ETF && productTypeFilter.isETF) {
	// 		return item
	// 	}
	// 	return null
	// },).filter((item,): item is NonNullable<typeof item> => {
	// 	return item !== null
	// },)
	// const isEtfShown = analyticsFilter.metalProductTypes?.value.name === MetalType.ETF && filteredProductTypesOptions.find((item,) => {
	// 	return item.value.name === MetalType.ETF
	// },)

	// const isDirectShown = analyticsFilter.metalProductTypes?.value.name === MetalType.DIRECT_HOLD && filteredProductTypesOptions.find((item,) => {
	// 	return item.value.name === MetalType.DIRECT_HOLD
	// },)
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
			<SelectComponent<MetalProductTypeSelectOptionType>
				options={productTypesOptionsArray}
				value={analyticsFilter.metalProductTypes}
				key={analyticsFilter.metalProductTypes?.value.id}
				placeholder='Select product type'
				isClearable
				onChange={(select,) => {
					if (select && !Array.isArray(select,)) {
						setAnalyticsFilter({
							...analyticsFilter,
							metals:            undefined,
							isins:             undefined,
							securities:        undefined,
							currencies:        undefined,
							tradeOperation:    undefined,
							metalProductTypes:    select as IOptionType<MetalProductTypeSelectOptionType>,
						},)
					} else {
						setAnalyticsFilter({
							...analyticsFilter,
							metals:            undefined,
							isins:             undefined,
							securities:        undefined,
							currencies:        undefined,
							tradeOperation:    undefined,
							metalProductTypes:   undefined,
						},)
					}
				}}
			/>
			{analyticsFilter.metalProductTypes?.value.name === MetalType.DIRECT_HOLD && <SelectComponent<SelectOptionType>
				options={metalOptionsArray}
				value={analyticsFilter.metals}
				key={analyticsFilter.metals?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select metal'
				isMulti
				onChange={(select,) => {
					if (Array.isArray(select,) && select.length > 0) {
						setAnalyticsFilter({
							...analyticsFilter,
							metals:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					} else {
						setAnalyticsFilter({
							...analyticsFilter,
							metals:    undefined,
						},)
					}
				}}
			/>}
			{analyticsFilter.metalProductTypes?.value.name === MetalType.DIRECT_HOLD && <SelectComponent<OperationSelectOptionType>
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
			/>}
			{analyticsFilter.metalProductTypes?.value.name === MetalType.ETF && <SelectComponent<SelectOptionType>
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
			/>}
			{analyticsFilter.metalProductTypes?.value.name === MetalType.ETF && <SelectComponent<SelectOptionType>
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
			/>}

			{analyticsFilter.metalProductTypes?.value.name === MetalType.ETF && <SelectComponent<OperationSelectOptionType>
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
			/>}
			{analyticsFilter.metalProductTypes?.value.name === MetalType.ETF && <SelectComponent<SelectOptionType>
				options={currencyOptionsArray}
				value={analyticsFilter.currencies}
				key={analyticsFilter.currencies?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select ETF currency'
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
			/>}
		</>

	)
}