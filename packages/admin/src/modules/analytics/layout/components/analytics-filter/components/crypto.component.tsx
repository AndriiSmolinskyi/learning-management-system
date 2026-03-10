/* eslint-disable no-unused-vars */
/* eslint-disable complexity */
import React from 'react'
import type {
	MultiValue,
} from 'react-select'
import {
	SelectComponent,
} from '../../../../../../shared/components'
import type {
	OperationSelectOptionType,
	ProductTypeSelectOptionType,
	SelectOptionType,
	TAnalyticsFilter,
} from '../analytics-filter.types'
import {
	AssetNamesType,
	AssetOperationType,
	CryptoType,
	type IOptionType,
} from '../../../../../../shared/types'
import {
	useGetEquityFilterSelectsBySourceIds,
} from '../../../../../../shared/hooks/analytics'
import {
	useGetAllCurrencies, useGetAnalyticsFilteredCurrencies,
} from '../../../../../../shared/hooks'

interface IProps {
	setAnalyticsFilter: React.Dispatch<React.SetStateAction<TAnalyticsFilter>>
	analyticsFilter: TAnalyticsFilter
	bankIds?: Array<string>
}

export const CryptoFilterSelects: React.FC<IProps> = ({
	setAnalyticsFilter,
	analyticsFilter,
	bankIds,
},) => {
	const equityFilter = {
		type:              AssetNamesType.CRYPTO,
		cryptoProductType: analyticsFilter.productTypes?.value.name,
		clientIds:         analyticsFilter.clientIds?.map((client,) => {
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
		type, ...currencyFilter
	} = equityFilter
	const {
		data: currencyList,
	} = useGetAnalyticsFilteredCurrencies({
		...currencyFilter,
		assetName: AssetNamesType.CRYPTO,
	},)

	const selectedCryptos = analyticsFilter.cryptoTypes?.map((l,) => {
		return l.value.id
	},) ?? []

	const cryptosOptionsArray = React.useMemo(() => {
		return lists?.cryptoCurrencies?.filter((name,) => {
			return !selectedCryptos.includes(name,)
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
	}, [lists?.cryptoCurrencies, selectedCryptos,],)

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

	const selectedWallets = analyticsFilter.wallets?.map((l,) => {
		return l.value.id
	},) ?? []

	const walletsOptionsArray = React.useMemo(() => {
		return lists?.wallets?.filter((name,) => {
			return !selectedWallets.includes(name,)
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
	}, [selectedWallets, lists?.wallets,],)

	const productTypesOptionsArray = React.useMemo(() => {
		return Object.values(CryptoType,)
			.map((name,) => {
				return {
					label: name,
					value: {
						id: name,
						name,
					},
				}
			},)
	}, [CryptoType,],)

	// todo: Remove after qa test
	// const filteredProductTypesOptions = productTypesOptionsArray.map((item,) => {
	// 	if (item.value.name === CryptoType.DIRECT_HOLD && productTypeFilter.isDirectHold) {
	// 		return item
	// 	}
	// 	if (item.value.name === CryptoType.ETF && productTypeFilter.isETF) {
	// 		return item
	// 	}
	// 	return null
	// },).filter((item,): item is NonNullable<typeof item> => {
	// 	return item !== null
	// },)
	// const isEtfShown = analyticsFilter.productTypes?.value.name === CryptoType.ETF && filteredProductTypesOptions.find((item,) => {
	// 	return item.value.name === CryptoType.ETF
	// },)

	// const isDirectShown = analyticsFilter.productTypes?.value.name === CryptoType.DIRECT_HOLD && filteredProductTypesOptions.find((item,) => {
	// 	return item.value.name === CryptoType.DIRECT_HOLD
	// },)
	return (
		<>
			<SelectComponent<ProductTypeSelectOptionType>
				options={productTypesOptionsArray}
				value={analyticsFilter.productTypes}
				key={analyticsFilter.productTypes?.value.id}
				placeholder='Select product type'
				isClearable
				onChange={(select,) => {
					if (select && !Array.isArray(select,)) {
						setAnalyticsFilter({
							...analyticsFilter,
							cryptoTypes:    undefined,
							wallets:        undefined,
							isins:          undefined,
							securities:     undefined,
							currencies:     undefined,
							tradeOperation:  undefined,
							productTypes:    select as IOptionType<ProductTypeSelectOptionType>,
						},)
					} else {
						setAnalyticsFilter({
							...analyticsFilter,
							cryptoTypes:    undefined,
							wallets:        undefined,
							isins:          undefined,
							securities:     undefined,
							currencies:     undefined,
							tradeOperation:  undefined,
							productTypes:   undefined,
						},)
					}
				}}
			/>
			{analyticsFilter.productTypes?.value.name === CryptoType.DIRECT_HOLD && <SelectComponent<SelectOptionType>
				options={cryptosOptionsArray}
				value={analyticsFilter.cryptoTypes}
				key={analyticsFilter.cryptoTypes?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select crypto currency type'
				isMulti
				onChange={(select,) => {
					if (select && Array.isArray(select,)) {
						setAnalyticsFilter({
							...analyticsFilter,
							cryptoTypes:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					}
				}}
			/>}
			{analyticsFilter.productTypes?.value.name === CryptoType.DIRECT_HOLD && <SelectComponent<SelectOptionType>
				options={walletsOptionsArray}
				value={analyticsFilter.wallets}
				key={analyticsFilter.wallets?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select wallet/exchange'
				isMulti
				onChange={(select,) => {
					if (Array.isArray(select,) && select.length > 0) {
						setAnalyticsFilter({
							...analyticsFilter,
							wallets:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					} else {
						setAnalyticsFilter({
							...analyticsFilter,
							wallets:    undefined,
						},)
					}
				}}
			/>}
			{analyticsFilter.productTypes?.value.name === CryptoType.ETF && <SelectComponent<SelectOptionType>
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
			{analyticsFilter.productTypes?.value.name === CryptoType.ETF && <SelectComponent<SelectOptionType>
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
			{analyticsFilter.productTypes?.value.name === CryptoType.ETF && <SelectComponent<SelectOptionType>
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
			/>}
			{analyticsFilter.productTypes?.value.name === CryptoType.ETF && <SelectComponent<OperationSelectOptionType>
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
		</>

	)
}