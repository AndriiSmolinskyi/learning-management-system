import React from 'react'
import type {
	MultiValue,
} from 'react-select'
import {
	SelectComponent,
} from '../../../../../../shared/components'
import type {
	TOperationsOrderRequestOption,
	TOperationsStoreFilter,
} from '../filter.store'
import type {
	IOptionType,
} from '../../../../../../shared/types'
import {
	requestFilterTypeOptions,
} from '../filter.constants'

interface IProps {
	setOperationsFilter: React.Dispatch<React.SetStateAction<TOperationsStoreFilter>>
	operationsFilter: TOperationsStoreFilter
}

export const RequestsFilterSelects: React.FC<IProps> = ({
	setOperationsFilter,
	operationsFilter,
},) => {
	return (
		<>
			<SelectComponent<TOperationsOrderRequestOption>
				options={requestFilterTypeOptions}
				value={operationsFilter.requestStatuses}
				key={operationsFilter.requestStatuses?.map((item,) => {
					return item.value.id
				},).join(',',)}
				placeholder='Select status'
				isMulti
				onChange={(select,) => {
					if (select && Array.isArray(select,)) {
						setOperationsFilter({
							...operationsFilter,
							requestStatuses:    select as MultiValue<IOptionType<TOperationsOrderRequestOption>>,
						},)
					}
				}}
			/>
		</>
	)
}