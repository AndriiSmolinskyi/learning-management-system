import React from 'react'
import {
	useLocation,
} from 'react-router-dom'
import {
	TransactionsFilterSelects,
	OrdersFilterSelects,
	RequestsFilterSelects,
} from './'
import type {
	TOperationsStoreFilter,
} from '../filter.store'
import {
	RouterKeys,
} from '../../../../../../router/keys'

interface IProps {
 setOperationsFilter: React.Dispatch<React.SetStateAction<TOperationsStoreFilter>>
	operationsFilter: TOperationsStoreFilter
}

export const OperationsVariablesFilter: React.FC<IProps> = ({
	operationsFilter,
	setOperationsFilter,
},) => {
	const location = useLocation()

	if (location.pathname.includes(RouterKeys.TRANSACTIONS,)) {
		return <TransactionsFilterSelects operationsFilter={operationsFilter} setOperationsFilter={setOperationsFilter} />
	}

	if (
		location.pathname.includes(RouterKeys.REQUESTS,)) {
		return <RequestsFilterSelects operationsFilter={operationsFilter} setOperationsFilter={setOperationsFilter} />
	}

	if (location.pathname.includes(RouterKeys.ORDERS,)) {
		return (
			<OrdersFilterSelects	operationsFilter={operationsFilter} setOperationsFilter={setOperationsFilter}
			/>
		)
	}
	return null
}
