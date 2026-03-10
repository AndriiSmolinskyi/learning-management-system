import React from 'react'
import {
	format,
} from 'date-fns'
import {
	XmarkMid,
	MoreVertical,
} from '../../../../../assets/icons/'
import {
	Button, ButtonType, Size, Color,
} from '../../../../../shared/components'
import {
	OrderListItemModal,
} from './order-list-item-modal.component'
import {
	toggleState,
} from '../../../../../shared/utils'
import {
	BadgeDropdown,
} from '../../../../../shared/components'
import type {
	OrderStatus,
} from '../../../../../shared/types'
import {
	useUpdateOrderStatus,
} from '../../../../../shared/hooks/orders/orders.hook'
import {
	getoOrderStatus,
} from '../orders-utils'
import {
	orderStatusOptions,
} from '../../orders.constants'
import {
	OrdersDetails,
} from '../orders-details/orders-details.component'
import {
	EditOrders,
} from '../edit-orders/edit-orders.component'
import {
	pdfService,
} from '../../../../../services/downoload-pdf/downoload-pdf.service'
import {
	SellContent,
} from '../orders-details/sell-content.component'
import {
	BuyContent,
} from '../orders-details/buy-content.component'
import {
	useCreatedOrderStore,
} from '../create-order.store'
import type {
	IOrder,
} from '../../../../../shared/types'
import {
	localeString,
} from '../../../../../shared/utils'
import * as styles from './order-list-item.style'

interface IOrderListItemProps {
	order: IOrder
	index: number
	handleOpenDeleteModal: (orderId: number) => void
}

export const OrderListItem: React.FC<IOrderListItemProps> = ({
	order,
	handleOpenDeleteModal,
},) => {
	const {
		mutateAsync: updateStatus,
	} = useUpdateOrderStatus()
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)
	const [isDrawerOpen, setIsDrawerOpen,] = React.useState<boolean>(false,)
	const [isEditOpen, setIsEditOpen,] = React.useState<boolean>(false,)

	const pdfRef = React.useRef<HTMLDivElement>(null,)

	const handleDownload = (): void => {
		if (pdfRef.current) {
			let fileName = ''

			const bankName = order.request?.bank?.bankName ?? 'Unknown Bank'
			const bankInitials = bankName
				.split(' ',)
				.map((word,) => {
					return word.charAt(0,).toUpperCase()
				},)
				.join('',)

			if (order.type === 'Sell') {
				fileName = `My_${bankInitials}_SELL.pdf`
			} else {
				fileName = `${order.request?.asset?.assetName}_Purchase_Order_${bankInitials}.pdf`
			}

			pdfService.getPDF(pdfRef.current, fileName,)
		}
	}

	const filteredStatusOptions = orderStatusOptions.filter((item,) => {
		return item !== order.status
	},)

	const handleOpenDrawer = (): void => {
		setIsDrawerOpen(true,)
	}

	const handleCloseDrawer = (): void => {
		setIsDrawerOpen(false,)
	}

	const handleOpenEdit = (): void => {
		setIsEditOpen(true,)
	}

	const handleCloseEdit = (): void => {
		setIsEditOpen(false,)
	}

	const {
		createdOrder, openCreatedOrder, resetCreatedOrder,
	} = useCreatedOrderStore()

	React.useEffect(() => {
		if (createdOrder?.id === order.id && openCreatedOrder) {
			setIsDrawerOpen(true,)
			resetCreatedOrder()
		}
	}, [createdOrder, openCreatedOrder, resetCreatedOrder, order.id,],)

	return (
		<div className={styles.bodyOrderList}>
			<div className={styles.bodyOrderListItem}>
				<p className={styles.bodyOrderListItemText}>
					{order.id}
				</p>
			</div>
			<div className={styles.bodyOrderListItem}>
				<p className={styles.bodyOrderListItemText}>
					{order.request?.portfolio?.name}
				</p>
			</div>
			<div className={styles.bodyOrderListItem}>
				<p className={styles.bodyOrderListItemText}>
					{order.request?.bank?.bankName}
				</p>
			</div>
			<div className={styles.bodyOrderListItem}>
				<p className={styles.bodyOrderListItemText}>
					{order.cashValue ?
						localeString(order.cashValue, '', 0, false,) :
						0}
				</p>
			</div>
			<div className={styles.bodyOrderListItem}>
				<BadgeDropdown<OrderStatus>
					value={order.status}
					options={filteredStatusOptions}
					onChange={async(status,) => {
						await updateStatus({
							status,
							orderId: order.id,
						},)
					}}
					getLabelColor={getoOrderStatus}
				/>
			</div>
			<div className={styles.bodyOrderListItem}>
				<p className={styles.bodyOrderListItemText}>
					{format(order.updatedAt, 'dd.MM.yyyy',)}
				</p>
			</div>

			<div className={styles.menuCell}>
				<OrderListItemModal
					handleOpenDrawer={handleOpenDrawer}
					setDialogOpen={setIsPopoverShown}
					handleOpenEdit={handleOpenEdit}
					handleDownload={handleDownload}
					handleOpenDeleteModal={handleOpenDeleteModal}
					orderId={order.id}
				>
					<Button<ButtonType.ICON>
						disabled={false}
						onClick={() => {
							toggleState(setIsPopoverShown,)()
						}}
						className={styles.dotsButton(isPopoverShown,)}
						additionalProps={{
							btnType: ButtonType.ICON,
							size:    Size.SMALL,
							color:   Color.SECONDRAY_GRAY,
							icon:    isPopoverShown ?
								<XmarkMid width={20} height={20} />			:
								<MoreVertical width={20} height={20} />	,
						}}
					/>
				</OrderListItemModal>
			</div>
			{isDrawerOpen && (
				<OrdersDetails
					isOpen={isDrawerOpen}
					onClose={handleCloseDrawer}
					order={order}
					handleOpenEdit={handleOpenEdit}
				/>
			)}

			{isEditOpen && (
				<EditOrders
					isOpen={isEditOpen}
					onClose={handleCloseEdit}
					orderId={order.id}
				/>
			)}
			<div className={styles.orderPDF}>
				{order.type === 'Sell' ?
					(
						<SellContent ref={pdfRef} order={order} />
					) :
					(
						<BuyContent ref={pdfRef} order={order} />
					)}
			</div>
		</div>
	)
}
