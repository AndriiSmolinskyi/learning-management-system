/* eslint-disable complexity */
import React from 'react'

import {
	RequestEmpty,
} from './request-empty.component'
import {
	DraftItem,
} from './draft-item.component'
import {
	RequestItem,
} from './request-item.component'
import {
	FilterEmpty,
} from './filter-empty.component'
import {
	Loader,
} from '../../../../shared/components'
import {
	TableHeader,
} from './table-header.component'

import {
	useRequestDraftsList,
	useRequestsListFiltered,
} from '../../../../shared/hooks/requests'
import {
	useOperationsFilterStore,
} from '../../layout/components/filter/filter.store'
import {
	useRequestStore,
} from '../request.store'
import {
	useDebounce,
} from '../../../../shared/hooks'

import * as styles from '../requests.styles'

type Props = {
	toggleCreateVisible: () => void
	toggleUpdateVisible: (id: number) => void
	toggleDetailsVisible: (id: number) => void
	handleResume: (id: number) => void
	handleOpenDeleteModal: (requestId: number) => void
}

export const RequestTable: React.FC<Props> = ({
	toggleCreateVisible,
	toggleUpdateVisible,
	toggleDetailsVisible,
	handleResume,
	handleOpenDeleteModal,
},) => {
	const {
		filter,
	} = useRequestStore()
	const {
		operationsFilter,
	} = useOperationsFilterStore()

	const filterConfigured = {
		clientIds: operationsFilter.clientIds?.map((client,) => {
			return client.value.id
		},),
		portfolioIds: operationsFilter.portfolioIds?.map((portfolio,) => {
			return portfolio.value.id
		},),
		entityIds: operationsFilter.entitiesIds?.map((entity,) => {
			return entity.value.id
		},),
		bankListIds: operationsFilter.bankIds?.map((bank,) => {
			return bank.value.id
		},),
		accountIds: operationsFilter.accountIds?.map((bank,) => {
			return bank.value.id
		},),
		statuses: operationsFilter.requestStatuses?.map((status,) => {
			return status.value.id
		},),
		search: operationsFilter.search,
	}

	const finalFilter = useDebounce({
		...filter,
		...filterConfigured,
	}, 700,)

	const {
		data: requestList,
		isFetching,
	} = useRequestsListFiltered(finalFilter,)
	const {
		data: requestDraftList,
	} = useRequestDraftsList()

	const noRequest = requestDraftList?.length === 0 && requestList?.total === 0
	const noResult = !requestDraftList?.length && !requestList?.list.length

	const isFilterApplied = Object.keys(finalFilter,)
		.filter((key,) => {
			return key !== 'type' && key !== 'sortBy' && key !== 'sortOrder'
		},)
		.some((key,) => {
			const value = finalFilter[key as keyof typeof finalFilter]
			return value && (Array.isArray(value,) ?
				value.length > 0 :
				value)
		},)

	return (
		<div className={styles.tableContainer}>
			<TableHeader/>
			<div className={styles.requestListContainer}>
				{isFetching && (
					<Loader />
				)}
				{(!isFetching && noResult && !Boolean(isFilterApplied,)) && (
					<RequestEmpty toggleCreateVisible={toggleCreateVisible} />
				)}
				{(!isFetching && noResult && Boolean(isFilterApplied,)) && (
					<FilterEmpty />
				)}
				{!isFetching && !noRequest && !noResult &&
					<>
						{requestDraftList?.map((draft,) => {
							return (
								<DraftItem
									key={draft.id}
									draft={draft}
									handleResume={handleResume}
								/>
							)
						},)}
						{requestList?.list.map((request,) => {
							return (
								<RequestItem
									key={request.id}
									request={request}
									toggleUpdateVisible={toggleUpdateVisible}
									toggleDetailsVisible={toggleDetailsVisible}
									handleOpenDeleteModal={handleOpenDeleteModal}
								/>
							)
						},)}
					</>}
			</div>
		</div>
	)
}
