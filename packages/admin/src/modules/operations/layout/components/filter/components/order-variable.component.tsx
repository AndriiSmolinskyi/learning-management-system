import React from 'react'
import type {
	MultiValue,
} from 'react-select'
import {
	SelectComponent,
} from '../../../../../../shared/components'
import type {
	SelectOptionType,
	TOperationsOrderStatusOption,
	TOperationsStoreFilter,
} from '../filter.store'
import type {
	IOptionType,
} from '../../../../../../shared/types'
import {
	useGetEmissionsIsins,
	useGetEmissionsSecurities,
} from '../../../../../../shared/hooks/cbonds'
import {
	orderTypeOptions,
} from '../filter.constants'

interface IProps {
	setOperationsFilter: React.Dispatch<React.SetStateAction<TOperationsStoreFilter>>
	operationsFilter: TOperationsStoreFilter
}

export const OrdersFilterSelects: React.FC<IProps> = ({
	setOperationsFilter,
	operationsFilter,
},) => {
	const {
		data: isinList,
	} = useGetEmissionsIsins()
	const {
		data: securityList,
	} = useGetEmissionsSecurities()

	const selectedIsins = operationsFilter.isins?.map((l,) => {
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

	const selectedOptions = operationsFilter.securities?.map((l,) => {
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
				value={operationsFilter.isins}
				key={operationsFilter.isins?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select ISIN'
				isMulti
				onChange={(select,) => {
					if (select && Array.isArray(select,)) {
						setOperationsFilter({
							...operationsFilter,
							isins:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					}
				}}
			/>
			<SelectComponent<SelectOptionType>
				options={securityOptionsArray}
				value={operationsFilter.securities}
				key={operationsFilter.securities?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select security'
				isMulti
				onChange={(select,) => {
					if (select && Array.isArray(select,)) {
						setOperationsFilter({
							...operationsFilter,
							securities:    select as MultiValue<IOptionType<SelectOptionType>>,
						},)
					}
				}}
			/>
			<SelectComponent<TOperationsOrderStatusOption>
				options={orderTypeOptions}
				value={operationsFilter.orderStatuses}
				key={operationsFilter.orderStatuses?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select status'
				isMulti
				onChange={(select,) => {
					if (select && Array.isArray(select,)) {
						setOperationsFilter({
							...operationsFilter,
							orderStatuses:    select as MultiValue<IOptionType<TOperationsOrderStatusOption>>,
						},)
					}
				}}
			/>
		</>
	)
}