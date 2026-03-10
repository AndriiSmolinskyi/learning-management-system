import React from 'react'

import {
	Plus,
	RequestTitleIcon,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'

import {
	useRequestStore,
} from '../request.store'
import type {
	IRequest,
} from '../../../../shared/types'
import {
	RequestType,
} from '../../../../shared/types'
import {
	OperationsFilter,
} from '../../layout/components/filter/filter.component'
import {
	useOperationsFilterStore,
} from '../../layout/components/filter/filter.store'
import {
	useRequestsListFiltered,
} from '../../../../shared/hooks/requests'
import {
	useDebounce,
} from '../../../../shared/hooks'

import * as styles from '../requests.styles'

type Props = {
	toggleCreateVisible: () => void
}

export const RequestFilter: React.FC<Props> = ({
	toggleCreateVisible,
},) => {
	const {
		filter,
		setType,
	} = useRequestStore()
	const {
		operationsFilter,
	} = useOperationsFilterStore()
	const filterConfigured = {
		clientIds: operationsFilter.clientIds?.map((client,) => {
			return client.value.id
		},) ?? [],
		portfolioIds: operationsFilter.portfolioIds?.map((portfolio,) => {
			return portfolio.value.id
		},) ?? [],
		entityIds: operationsFilter.entitiesIds?.map((entity,) => {
			return entity.value.id
		},) ?? [],
		bankListIds: operationsFilter.bankIds?.map((bank,) => {
			return bank.value.id
		},) ?? [],
		statuses: operationsFilter.requestStatuses?.map((status,) => {
			return status.value.id
		},) ?? [],
		search: operationsFilter.search,
	}
	const {
		type,
	} = filter

	const finalFilter = useDebounce(filterConfigured, 700,)

	const {
		data: requestList,
	} = useRequestsListFiltered(finalFilter,)

	const getRequestCount = (requestType: RequestType,): number => {
		return requestList?.list.filter((request: IRequest,) => {
			return request.type === requestType
		},).length ?? 0
	}

	return (
		<div className={styles.filterWrapper}>
			<div className={styles.filterTitle}>
				<RequestTitleIcon width={32} height={32}/>
				<h2>Requests</h2>
			</div>
			<div className={styles.filterActions}>
				<OperationsFilter/>
				<div className={styles.typeWrapper}>
					<div>
						<button
							className={styles.typeBtn(type === RequestType.SELL,)}
							type='button'
							onClick={() => {
								setType(RequestType.SELL,)
							}}
						>
							Sell ({getRequestCount(RequestType.SELL,)})
						</button>
					</div>
					<div>
						<button
							className={styles.typeBtn(type === RequestType.BUY,)}
							type='button'
							onClick={() => {
								setType(RequestType.BUY,)
							}}
						>
							Buy ({getRequestCount(RequestType.BUY,)})
						</button>
					</div>
					<div>
						<button
							className={styles.typeBtn(type === RequestType.DEPOSIT,)}
							type='button'
							onClick={() => {
								setType(RequestType.DEPOSIT,)
							}}
						>
							Deposit ({getRequestCount(RequestType.DEPOSIT,)})
						</button>
					</div>
					<div>
						<button
							className={styles.typeBtn(type === RequestType.OTHER,)}
							type='button'
							onClick={() => {
								setType(RequestType.OTHER,)
							}}
						>
							Other ({getRequestCount(RequestType.OTHER,)})
						</button>
					</div>
				</div>
				<Button<ButtonType.TEXT>
					onClick={toggleCreateVisible}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Add request',
						leftIcon: <Plus width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
				/>
			</div>
		</div>
	)
}
