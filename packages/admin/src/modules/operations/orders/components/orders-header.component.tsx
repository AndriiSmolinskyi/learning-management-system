import React from 'react'
import classNames from 'classnames'
import {
	useLocation,
} from 'react-router-dom'
import {
	Orders,
	Plus,
} from '../../../../assets/icons'
import {
	Button, ButtonType, Size, Color, Dialog,
} from '../../../../shared/components'
import {
	OrdersSelectReq,
} from './add-orders/orders-select-req.component'
import {
	toggleState,
} from '../../../../shared/utils'
import {
	AddOrders,
} from './add-orders/add-orders.component'
import {
	useOrderStore,
} from './order.store'
import * as styles from './orders-header.style'
import type {
	IRequest, IOrder,
} from '../../../../shared/types'
import {
	AddOrderSuccessful,
} from './add-orders/add-orders-successful.component'
import {
	OrdersDetails,
} from './orders-details/orders-details.component'
import {
	EditOrders,
} from './edit-orders/edit-orders.component'
import {
	OperationsFilter,
} from '../../layout/components/filter/filter.component'
import {
	useOperationsFilterStore,
} from '../../layout/components/filter/filter.store'
import {
	useDebounce,
	useOrdersListFiltered,
} from '../../../../shared/hooks'

enum OrderType {
    SELL = 'Sell',
    BUY = 'Buy',
}

export const OrdersHeader: React.FC = () => {
	const location = useLocation()
	const initialRequest = location.state?.request
	const initialOrderType = location.state?.orderType

	React.useEffect(() => {
		if (initialRequest) {
			setSelectedRequests(initialRequest,)
			setSelectedButton(initialOrderType || OrderType.SELL,)
			setIsDrawerOpen(true,)
		}
	}, [initialRequest, initialOrderType,],)

	const [selectedButton, setSelectedButton,] = React.useState<OrderType>(OrderType.SELL,)
	const [isModalOpen, setIsModalOpen,] = React.useState<boolean>(false,)
	const [isDrawerOpen, setIsDrawerOpen,] = React.useState<boolean>(false,)
	const [isModalSuccessfulOpen, setIsModaSuccessfulOpen,] = React.useState<boolean>(false,)
	const [selectedRequests, setSelectedRequests,] = React.useState<IRequest | null>(null,)

	const toggleModalSuccessful = toggleState(setIsModaSuccessfulOpen,)

	React.useEffect(() => {
		if (filter.type) {
			setSelectedButton(filter.type,)
		}
	},[],)

	const handleOpenDrawer = (): void => {
		setIsDrawerOpen(true,)
	}
	const handleCloseDrawer = (): void => {
		setIsDrawerOpen(false,)
		setSelectedRequests(null,)
	}
	const handleButtonClick = (button: OrderType,): void => {
		setSelectedButton(button,)
	}
	const toggleModal = toggleState(setIsModalOpen,)
	const {
		setType, filter,
	} = useOrderStore()

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

	const finalFilter = useDebounce(filterConfigured, 700,)

	const {
		data: ordersList,
	} = useOrdersListFiltered(finalFilter,)

	const getOrderCount = (orderType: OrderType,): number => {
		return ordersList?.list.filter((order: IOrder,) => {
			return order.type === orderType
		},).length ?? 0
	}

	return (
		<div className={styles.OrderHeader}>
			<div className={styles.orderHeaderLeft}>
				<Orders width={32} height={32} />
				<h2 className={styles.orderTitle}>Orders</h2>
			</div>
			<div className={styles.headerBtnBlock}>
				<OperationsFilter/>
				<div className={styles.TableHeaderBtnBlock}>
					<p
						className={classNames(styles.TableHeaderBtn, {
							[styles.TableHeaderBtnSelected]: selectedButton === OrderType.SELL,
						},)}
						onClick={() => {
							handleButtonClick(OrderType.SELL,)
							setType(OrderType.SELL,)
						}}
					>
                  Sell  ({getOrderCount(OrderType.SELL,)})
					</p>
					<span className={styles.TableHeaderBtnBlockLine}></span>
					<p
						className={classNames(styles.TableHeaderBtn, {
							[styles.TableHeaderBtnSelected]: selectedButton === OrderType.BUY,
						},)}
						onClick={() => {
							handleButtonClick(OrderType.BUY,)
							setType(OrderType.BUY,)
						}}
					>
                  Buy ({getOrderCount(OrderType.BUY,)})
					</p>
				</div>
				<Button<ButtonType.TEXT>
					onClick={toggleModal}
					disabled={false}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Add order',
						leftIcon: <Plus width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
				/>
				<Dialog
					open={isModalOpen}
					onClose={toggleModal}
				>
					<OrdersSelectReq
						onClose={toggleModal}
						handleOpenDrawer={handleOpenDrawer}
						onSelectRequests={(request: IRequest | null,) => {
							setSelectedRequests(request,)
						}}
						orderType={selectedButton}
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
					orderType={selectedButton}
					toggleModalSuccessful={toggleModalSuccessful}
				/>
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
			</div>
		</div>
	)
}
