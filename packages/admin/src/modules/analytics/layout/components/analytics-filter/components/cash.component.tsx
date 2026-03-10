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

interface IProps {
	setAnalyticsFilter: React.Dispatch<React.SetStateAction<TAnalyticsFilter>>
	analyticsFilter: TAnalyticsFilter
}

export const CashFilterSelects: React.FC<IProps> = ({
	setAnalyticsFilter,
	analyticsFilter,
},) => {
	const cashFilter = {
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
		data: currencyList,
	} = useGetAnalyticsFilteredCurrencies({
		...cashFilter,
		assetName: AssetNamesType.CASH,
	},)

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
	)
}