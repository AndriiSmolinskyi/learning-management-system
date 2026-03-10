/* eslint-disable complexity */
import React from 'react'
import {
	OrdersListHeader,
} from './order-list-header.component'
import {
	OrderListItem,
} from './order-list-item.component'
import {
	useOrderStore,
} from '../order.store'
import {
	useOrdersListFiltered,
	useOrderDrafts,
} from '../../../../../shared/hooks/orders/orders.hook'
import {
	OrderDraftItem,
} from './order-draft-item.component'
import type {
	IOrderDraft, IRequest,
} from '../../../../../shared/types'
import {
	AddOrders,
} from '../add-orders/add-orders.component'
import {
	OrderEmpty,
} from './order-empty.component'
import {
	OrderType,
} from '../../../../../shared/types'
import {
	useOperationsFilterStore,
} from '../../../layout/components/filter/filter.store'
import {
	Dialog,
} from '../../../../../shared/components'
import {
	AddOrderSuccessful,
} from '../add-orders/add-orders-successful.component'
import {
	OrdersDetails,
} from '../orders-details/orders-details.component'
import {
	EditOrders,
} from '../edit-orders/edit-orders.component'
import {
	toggleState,
} from '../../../../../shared/utils'
import type {
	IOrder,
} from '../../../../../shared/types'
import {
	DeleteOrderModal,
} from '../delete-order-modal/delete-order-modal.component'
import {
	useDebounce,
} from '../../../../../shared/hooks'

import * as styles from './order-list.style'

export const OrdersList: React.FC = () => {
	const {
		filter,
	} = useOrderStore()
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
		accountIds: operationsFilter.accountIds?.map((account,) => {
			return account.value.id
		},),
		isins: operationsFilter.isins?.map((isin,) => {
			return isin.value.id
		},),
		securities: operationsFilter.securities?.map((security,) => {
			return security.value.id
		},),
		statuses: operationsFilter.orderStatuses?.map((status,) => {
			return status.value.id
		},),
		search: operationsFilter.search,
	}

	const finalFilter = useDebounce({
		...filter,
		...filterConfigured,
	}, 700,)

	const {
		data: ordersList,
	} = useOrdersListFiltered(finalFilter,)

	const {
		data: draftList,
	} = useOrderDrafts()
	const [selectedDraft, setSelectedDraft,] = React.useState<IOrderDraft | null>(null,)
	const [isAddOrdersOpen, setIsAddOrdersOpen,] = React.useState(false,)
	const [selectedRequests, setSelectedRequests,] = React.useState<IRequest | null>(null,)
	const [isDeleteModalShowed, setIsDeleteModalShown,] = React.useState(false,)
	const [deleteOrderId, setDeleteOrderId,] = React.useState<number | undefined>(undefined,)
	const toggleDeleteDialog = toggleState(setIsDeleteModalShown,)
	const handleOpenDeleteModal = (orderId: number,): void => {
		setDeleteOrderId(orderId,)
		toggleDeleteDialog()
	}

	const handleResume = (draft: IOrderDraft,): void => {
		setSelectedDraft(draft,)
		if (draft.request) {
			setSelectedRequests(draft.request,)
		}
		setIsAddOrdersOpen(true,)
	}

	const handleCloseAddOrders = (): void => {
		setSelectedDraft(null,)
		setIsAddOrdersOpen(false,)
	}

	const [isModalSuccessfulOpen, setIsModaSuccessfulOpen,] = React.useState<boolean>(false,)

	const toggleModalSuccessful = toggleState(setIsModaSuccessfulOpen,)

	const [isViewOpen, setIsViewOpen,] = React.useState<boolean>(false,)
	const [isEditOpen, setIsEditOpen,] = React.useState<boolean>(false,)
	const [order, setOrder,] = React.useState<IOrder | null>(null,)

	const handleSetOrder = (order: IOrder,): void => {
		setOrder(order,)
	}

	const handleViewDrawer = (): void => {
		setIsViewOpen(true,)
	}

	const handleCloseView = (): void => {
		setIsViewOpen(false,)
	}

	const handleOpenEdit = (): void => {
		setIsEditOpen(true,)
	}

	const handleCloseEdit = (): void => {
		setIsEditOpen(false,)
	}

	return (
		<div>
			<OrdersListHeader />
			<div className={styles.listBlock}>
				{!draftList?.length && !ordersList?.list.length ?
					(
						<OrderEmpty />
					) :
					(
						<>
							{draftList?.length ?
								(
									<div>
										{draftList.map((draft,) => {
											return (
												<OrderDraftItem
													key={draft.id}
													draft={draft}
													onResume={handleResume}
												/>
											)
										},)}
									</div>
								) :
								null}
							{ordersList?.list.length ?
								(
									<div>
										{ordersList.list.map((order, index,) => {
											return (
												<OrderListItem
													key={order.id}
													order={order}
													index={index}
													handleOpenDeleteModal={handleOpenDeleteModal}
												/>
											)
										},)}
									</div>
								) :
								null}
						</>
					)}
			</div>
			{isAddOrdersOpen && selectedDraft && (
				<AddOrders
					isOpen={isAddOrdersOpen}
					onClose={handleCloseAddOrders}
					onSelectRequests={(request: IRequest | null,) => {
						setSelectedRequests(request,)
					}}
					orderType={selectedDraft.type ?? OrderType.SELL}
					isDraft={true}
					requests={selectedRequests ?? {
					} as IRequest}
					draftValues={selectedDraft.details}
					draftId={selectedDraft.id}
					toggleModalSuccessful={toggleModalSuccessful}
				/>
			)}
			<Dialog
				open={isModalSuccessfulOpen}
				onClose={toggleModalSuccessful}
			>
				<AddOrderSuccessful
					onClose={toggleModalSuccessful}
					handleViewDrawer={handleViewDrawer}
					handleSetOrder={handleSetOrder}
				/>
			</Dialog>
			{order && (
				<OrdersDetails
					isOpen={isViewOpen}
					onClose={handleCloseView}
					order={order}
					handleOpenEdit={handleOpenEdit}
				/>
			)}
			{order && (
				<EditOrders
					isOpen={isEditOpen}
					onClose={handleCloseEdit}
					orderId={order.id}
				/>
			)}
			<Dialog
				onClose={() => {
					setIsDeleteModalShown(false,)
				}}
				open={isDeleteModalShowed}
				isCloseButtonShown
			>
				<DeleteOrderModal
					onClose={toggleDeleteDialog}
					orderId={deleteOrderId}
				/>
			</Dialog>
		</div>
	)
}