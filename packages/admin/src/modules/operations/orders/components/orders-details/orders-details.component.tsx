/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	Button,
	ButtonType,
	Size,
	Color,
	BadgeDropdown,
	Drawer,
} from '../../../../../shared/components'
import {
	PenSquare,
	XmarkSecond,
	DownloadIcon,
	ChevronUpBlue,
	ChevronDown,
} from '../../../../../assets/icons'
import type {
	IOrder, OrderStatus,
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
	pdfService,
} from '../../../../../services/downoload-pdf/downoload-pdf.service'
import {
	BuyContent,
} from './buy-content.component'
import {
	SellContent,
} from './sell-content.component'
import {
	localeString,
} from '../../../../../shared/utils'
import * as styles from './orders-details.style'

interface IOrdersDetailsProps {
	isOpen: boolean;
	onClose: () => void;
	order: IOrder;
	handleOpenEdit: () => void
}

export const OrdersDetails: React.FC<IOrdersDetailsProps> = ({
	isOpen,
	onClose,
	order,
	handleOpenEdit,
},) => {
	const {
		mutateAsync: updateStatus,
	} = useUpdateOrderStatus()
	const [isOpenDetails, setIsOpenDetails,] = React.useState<Record<string, boolean>>({
	},)

	const handleToggle = (detailId: string,): void => {
		setIsOpenDetails((prevState,) => {
			return {
				...prevState,
				[detailId]: !prevState[detailId],
			}
		},)
	}

	const filteredStatusOptions = orderStatusOptions.filter((item,) => {
		return item !== order.status
	},)

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

	const handleEdit = (): void => {
		handleOpenEdit()
		onClose()
	}

	return (
		<Drawer
			isOpen={isOpen}
			onClose={onClose}
		>
			<div className={styles.drawerWrapper}>
				<div className={styles.drawerHeader}>
					<h2 className={styles.drawerHeaderTitle}>Order details</h2>
					<Button<ButtonType.ICON>
						onClick={onClose}
						additionalProps={{
							btnType: ButtonType.ICON,
							icon:    <XmarkSecond width={20} height={20} />,
							size:    Size.SMALL,
							color:   Color.NONE,
						}}
					/>
				</div>
				<div className={styles.drawerContent}>
					<div className={styles.drawerItem}>
						<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
							<p className={styles.drawerTypeText}>Order ID</p>
							<p className={styles.drawerText}>{order.id}</p>
						</div>
						<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
							<p className={styles.drawerTypeText}>Type</p>
							<p className={styles.drawerText}>{order.type}</p>
						</div>
						<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
							<p className={styles.drawerTypeText}>Status</p>
							<BadgeDropdown<OrderStatus>
								value={order.status}
								options={filteredStatusOptions}
								onChange={async(status,) => {
									await updateStatus({
										status, orderId: order.id,
									},)
								}}
								getLabelColor={getoOrderStatus}
							/>
						</div>
						<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
							<p className={styles.drawerTypeText}>Bank</p>
							<p className={styles.drawerText}>
								{order.request?.bank?.bankName}
							</p>
						</div>
						<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
							<p className={styles.drawerTypeText}>Cash value in currency</p>
							<p className={styles.drawerText}>
								{order.cashValue ?
									localeString(order.cashValue, '', 0, false,) :
									0}
							</p>
						</div>
						<div className={styles.drawerTextBlock}>
							<p className={styles.drawerTypeText}>Last update</p>
							<p className={styles.drawerText}>
								{new Date(order.updatedAt,).toLocaleDateString('en-US', {
									year:  'numeric',
									month: 'short',
									day:   'numeric',
								},)}
							</p>
						</div>
					</div>
					{order.details.map((detail, index,) => {
						return (
							<div key={detail.id} className={styles.drawerItem}>
								<div className={styles.orderDetailsHeader}>
									<div>
										<div>
											<p className={styles.orderDetailsHeaderTitle}>
												{detail.security}
											</p>
										</div>
									</div>
									<Button<ButtonType.ICON>
										onClick={() => {
											if (detail.id) {
												handleToggle(detail.id,)
											}
										}}
										additionalProps={{
											btnType: ButtonType.ICON,
											size:    Size.SMALL,
											icon:    detail.id && isOpenDetails[detail.id] ?
												(
													<ChevronUpBlue width={20} height={20} />
												) :
												(
													<ChevronDown width={20} height={20} />
												),
											color: Color.NONE,
										}}
									/>
								</div>
								{detail.id && isOpenDetails[detail.id] && (
									<>
										<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
											<p className={styles.drawerTypeText}>Security</p>
											<p className={styles.drawerText}>{detail.security}</p>
										</div>
										<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
											<p className={styles.drawerTypeText}>ISIN</p>
											<p className={styles.drawerText}>{detail.isin}</p>
										</div>
										<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
											<p className={styles.drawerTypeText}>Units</p>
											<p className={styles.drawerText}>{detail.units}</p>
										</div>
										<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
											<p className={styles.drawerTypeText}>Price type</p>
											<p className={styles.drawerText}>{detail.priceType}</p>
										</div>
										<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
											<p className={styles.drawerTypeText}>Price</p>
											<p className={styles.drawerText}>{detail.price}</p>
										</div>
										<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
											<p className={styles.drawerTypeText}>Currency</p>
											<p className={styles.drawerText}>{detail.currency}</p>
										</div>
										<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
											<p className={styles.drawerTypeText}>Yield</p>
											<p className={styles.drawerText}>{detail.yield || 'N/A'}</p>
										</div>
										<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
											<p className={styles.drawerTypeText}>Unit executed</p>
											<p className={styles.drawerText}>{detail.unitExecuted || 'N/A'}</p>
										</div>
										<div className={styles.drawerTextBlock}>
											<p className={styles.drawerTypeText}>Price executed</p>
											<p className={styles.drawerText}>{detail.priceExecuted || 'N/A'}</p>
										</div>
									</>
								)}
							</div>
						)
					},)}
				</div>
				<div className={styles.drawerFooter}>
					<Button
						onClick={handleDownload}
						additionalProps={{
							btnType: ButtonType.ICON,
							size:    Size.MEDIUM,
							icon:    <DownloadIcon width={20} height={20} />,
							color:   Color.SECONDRAY_COLOR,
						}}
					/>
					<Button
						onClick={handleEdit}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							size:     Size.MEDIUM,
							text:     'Edit',
							color:    Color.SECONDRAY_COLOR,
							leftIcon: <PenSquare width={20} height={20} />,
						}}
					/>
				</div>
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
		</Drawer>
	)
}
