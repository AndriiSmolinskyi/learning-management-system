/* eslint-disable complexity */
import * as React from 'react'
import {
	EmptyState,
	Plus,
	SearchEmptyState,
} from '../../../../../assets/icons'
import {
	Button, ButtonType, Size, Color, Dialog,
} from '../../../../../shared/components'
import {
	OrdersSelectReq,
} from '../add-orders/orders-select-req.component'
import {
	toggleState,
} from '../../../../../shared/utils'
import {
	AddOrders,
} from '../add-orders/add-orders.component'
import type {
	IRequest, IOrder,
} from '../../../../../shared/types'
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
	useOrderStore,
} from '../order.store'
import {
	useOperationsFilterStore,
} from '../../../layout/components/filter/filter.store'
import * as styles from './order-empty.style'

export const OrderEmpty: React.FC = () => {
	const [isModalOpen, setIsModalOpen,] = React.useState<boolean>(false,)
	const [isDrawerOpen, setIsDrawerOpen,] = React.useState<boolean>(false,)
	const [selectedRequests, setSelectedRequests,] = React.useState<IRequest | null>(null,)
	const [isViewOpen, setIsViewOpen,] = React.useState<boolean>(false,)
	const [isEditOpen, setIsEditOpen,] = React.useState<boolean>(false,)
	const [order, setOrder,] = React.useState<IOrder | null>(null,)
	const [isModalSuccessfulOpen, setIsModaSuccessfulOpen,] = React.useState<boolean>(false,)

	const toggleModalSuccessful = toggleState(setIsModaSuccessfulOpen,)

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

	const handleOpenDrawer = (): void => {
		setIsDrawerOpen(true,)
	}
	const handleCloseDrawer = (): void => {
		setIsDrawerOpen(false,)
		setSelectedRequests(null,)
	}

	const toggleModal = toggleState(setIsModalOpen,)

	const {
		filter, resetOrderStore,
	} = useOrderStore()
	const {
		operationsFilter, resetOperationsFilterStore,
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
		bankIds: operationsFilter.bankIds?.map((bank,) => {
			return bank.value.id
		},) ?? [],
		isins: operationsFilter.isins?.map((isin,) => {
			return isin.value.id
		},) ?? [],
		securities: operationsFilter.securities?.map((security,) => {
			return security.value.id
		},) ?? [],
		statuses: operationsFilter.orderStatuses?.map((status,) => {
			return status.value.id
		},) ?? [],
		search: operationsFilter.search,
	}

	const handleClearStore = (): void => {
		resetOrderStore()
		resetOperationsFilterStore()
	}

	return (
		<div className={styles.emptyContainer}>
			{
				(filterConfigured.clientIds.length || filterConfigured.portfolioIds.length || filterConfigured.entityIds.length ||
					filterConfigured.bankIds.length || filterConfigured.isins.length ||
					filterConfigured.securities.length || filterConfigured.statuses.length || filterConfigured.search) ?
					<>
						<SearchEmptyState width={164} height={164}/>
						<p className={styles.emptyText}>No results found. Try a different search or filter</p>
						<Button<ButtonType.TEXT>
							disabled={false}
							onClick={handleClearStore}
							additionalProps={{
								btnType: ButtonType.TEXT,
								text:    'Clear',
								size:    Size.SMALL,
								color:   Color.SECONDRAY_GRAY,
							}}
						/>
					</> :
					<>
						<EmptyState width={164} height={164}/>
						<p className={styles.emptyText}>Nothing here yet. Add order to get started</p>
						<Button<ButtonType.TEXT>
							disabled={false}
							onClick={toggleModal}
							additionalProps={{
								btnType:  ButtonType.TEXT,
								text:     'Add order',
								leftIcon: <Plus width={20} height={20} />,
								size:     Size.SMALL,
								color:    Color.BLUE,
							}}
						/>
						<Dialog open={isModalOpen} onClose={toggleModal}>
							<OrdersSelectReq
								onClose={toggleModal}
								handleOpenDrawer={handleOpenDrawer}
								onSelectRequests={(request: IRequest | null,) => {
									setSelectedRequests(request,)
								}}
								orderType={filter.type}
							/>
						</Dialog>
						<AddOrders
							isOpen={isDrawerOpen}
							onClose={handleCloseDrawer}
							requests={selectedRequests ?? {
							} as IRequest}
							onSelectRequests={(request: IRequest | null,) => {
								setSelectedRequests(request,)
							}}
							orderType={filter.type}
							toggleModalSuccessful={toggleModalSuccessful}
						/>
						<Dialog open={isModalSuccessfulOpen} onClose={toggleModalSuccessful}>
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
					</>
			}

		</div>
	)
}