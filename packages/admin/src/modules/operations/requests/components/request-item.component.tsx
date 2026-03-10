/* eslint-disable no-unused-vars */
/* eslint-disable complexity */
import React from 'react'
import {
	format,
} from 'date-fns'

import {
	BadgeDropdown,
	Button,
	ButtonType,
	Color,
	Size,
	Dialog,
} from '../../../../shared/components'
import {
	MoreVertical, XmarkMid,
} from '../../../../assets/icons'
import {
	RequestItemDialog,
} from './item-dialog.component'

import {
	RequestType,
	type IRequestExtended,
	type RequestStatusType,
} from '../../../../shared/types'
import {
	localeString,
	toggleState,
} from '../../../../shared/utils'
import {
	requestStatusOptions,
} from '../request.constants'
import {
	useUpdateRequest,
} from '../../../../shared/hooks/requests'
import {
	getRequestStatus,
} from '../request.utils'
import {
	useRequestStore,
} from '../request.store'
import {
	AddOrders,
	AddOrderSuccessful,
	EditOrders,
	OrdersDetails,
} from '../../orders'
import type {
	IOrder,
	IRequest,
	OrderType,
} from '../../../../shared/types'
import * as styles from '../requests.styles'

type Props = {
	request: IRequestExtended
	toggleUpdateVisible: (id: number) => void
	toggleDetailsVisible: (id: number) => void
	handleOpenDeleteModal: (requestId: number) => void
}

export const RequestItem: React.FC<Props> = ({
	request,
	toggleUpdateVisible,
	toggleDetailsVisible,
	handleOpenDeleteModal,
},) => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)

	const {
		filter: {
			type,
		},
	} = useRequestStore()
	const {
		mutateAsync: updateStatus,
	} = useUpdateRequest()

	const filteredStatusOptions = requestStatusOptions.filter((item,) => {
		return item !== request.status
	},)

	const [isDrawerOpen, setIsDrawerOpen,] = React.useState<boolean>(false,)
	const [isModalSuccessfulOpen, setIsModaSuccessfulOpen,] = React.useState<boolean>(false,)
	const [selectedRequests, setSelectedRequests,] = React.useState<IRequest | null>(null,)

	const toggleModalSuccessful = toggleState(setIsModaSuccessfulOpen,)

	const handleOpenDrawer = (): void => {
		setIsDrawerOpen(true,)
	}

	const handleCloseDrawer = (): void => {
		setIsDrawerOpen(false,)
		setSelectedRequests(null,)
	}

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
		<div className={styles.requestContainer}>
			<p className={styles.idTableCell}>{request.id}</p>
			<p className={styles.tableCell}>{request.portfolio?.name}</p>
			<p className={styles.tableCell}>{request.entity?.name}</p>
			<p className={styles.tableCell}>{ request.bank?.bankName}</p>
			{(type === RequestType.BUY || type === RequestType.SELL) && (
				<p className={styles.tableCell}>{request.asset?.assetName}</p>
			)}
			{type === RequestType.DEPOSIT && request.amount && (
				<p className={styles.tableCell}>{localeString(parseFloat(request.amount,), 'USD' , 2, true,)}</p>
			)}
			{type === RequestType.OTHER && (
				<p className={styles.tableCell}>{request.comment}</p>
			)}
			<div className={styles.badgeCell}>
				<BadgeDropdown<RequestStatusType>
					value={request.status}
					options={filteredStatusOptions}
					onChange={async(status,) => {
						await updateStatus({
							status,
							id: request.id,
						},)
					}}
					getLabelColor={getRequestStatus}
				/>
			</div>
			<p className={styles.updateTableCell}>{format(request.updatedAt, 'dd.MM.yyyy',)}</p>
			<div className={styles.menuCell}>
				<RequestItemDialog
					setDialogOpen={setIsPopoverShown}
					toggleDetailsVisible={toggleDetailsVisible}
					toggleUpdateVisible={toggleUpdateVisible}
					handleOpenDrawer={handleOpenDrawer}
					request={request}
					handleOpenDeleteModal={handleOpenDeleteModal}
				>
					<Button<ButtonType.ICON>
						onClick={toggleState(setIsPopoverShown,)}
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
				</RequestItemDialog>
			</div>
			<AddOrders
				isOpen={isDrawerOpen}
				onClose={handleCloseDrawer}
				requests={request}
				onSelectRequests={(request: IRequest | null,) => {
					setSelectedRequests(request,)
				}}
				orderType={request.type as unknown as OrderType}
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
	)
}
