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
	useGetAssetsPairsBySourceIds,
} from '../../../../../../shared/hooks/assets'

interface IProps {
	setAnalyticsFilter: React.Dispatch<React.SetStateAction<TAnalyticsFilter>>
	analyticsFilter: TAnalyticsFilter
	bankIds?: Array<string>
}

export const OptionFilterSelects: React.FC<IProps> = ({
	setAnalyticsFilter,
	analyticsFilter,
	bankIds,
},) => {
	const optionFilter = {
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
		data: pairList,
	} = useGetAssetsPairsBySourceIds(optionFilter,)

	const selectedPairs = analyticsFilter.pairs?.map((c,) => {
		return c.value.id
	},) ?? []
	const pairOptionsArray = React.useMemo(() => {
		return pairList?.filter((pair,) => {
			return !selectedPairs.includes(pair,)
		},)
			.map((pair,) => {
				return {
					label: pair,
					value: {
						id:   pair,
						name: pair,
					},
				}
			},) ?? []
	}, [pairList, selectedPairs,],)

	return (
		<SelectComponent<SelectOptionType>
			options={pairOptionsArray}
			value={analyticsFilter.pairs}
			key={analyticsFilter.pairs?.map((item,) => {
				return item.value.id
			},).join(',',)}
			placeholder='Select pair'
			isMulti
			onChange={(select,) => {
				if (Array.isArray(select,) && select.length > 0) {
					setAnalyticsFilter({
						...analyticsFilter,
						pairs:    select as MultiValue<IOptionType<SelectOptionType>>,
					},)
				} else {
					setAnalyticsFilter({
						...analyticsFilter,
						pairs:    undefined,
					},)
				}
			}}
		/>
	)
}