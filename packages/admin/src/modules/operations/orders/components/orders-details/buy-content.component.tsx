/* eslint-disable complexity */
import React, {
	forwardRef,
} from 'react'
import {
	format,
} from 'date-fns'
import {
	AssetNamesType, OrderType,
} from '../../../../../shared/types'
import type {
	IOrder,
} from '../../../../../shared/types'
import * as styles from './buy-content.style'

interface IBuyContentProps {
	order: IOrder;
}

export const BuyContent = forwardRef<HTMLDivElement, IBuyContentProps>(({
	order,
}, ref,) => {
	return (
		<div ref={ref} className={styles.container}>
			<div className={styles.header}>
				<p className={styles.headerText}>
					{format(order.updatedAt, 'dd.MM.yyyy',)}
				</p>
				<p className={styles.headerText}>{order.id}</p>
			</div>
			<h1 className={styles.title}>{order.request?.asset?.assetName} Purchase Order</h1>
			<p className={styles.text}>Dear {order.request?.client?.firstName} {order.request?.client?.lastName},</p>
			<p className={styles.plsSell}>
				Please purchase the assets to {order.request?.entity?.name}'s portfolio:
			</p>
			<div>
				<div className={styles.tableSellHeader}>
					<p className={styles.tableTitle}>Security</p>
					<p className={styles.tableTitle}>Isin</p>
					<p className={styles.tableTitle}>Units</p>
					<p className={styles.tableTitle}>Price</p>
					<p className={styles.tableTitle}>Currency</p>
					{order.request?.asset?.assetName === AssetNamesType.BONDS && order.type === OrderType.BUY &&
						<p className={styles.tableTitle}>Yield</p>
					}
				</div>
				{order.details.map((details,) => {
					return (
						<div className={styles.tableSell} key={details.id}>
							<p className={styles.tableText}>{details.security || '-'}</p>
							<p className={styles.tableText}>{details.isin || '-'}</p>
							<p className={styles.tableText}>{details.units || '-'}</p>
							<p className={styles.tableText}>{details.price || '-'}</p>
							<p className={styles.tableText}>{details.currency || '-'}</p>
							{order.request?.asset?.assetName === AssetNamesType.BONDS && order.type === OrderType.BUY &&
								<p className={styles.tableText}>{details.yield ?? '-'}</p>
							}
						</div>
					)
				},)}
			</div>
			<p className={styles.bestRegards}>Best regards,</p>
			<p className={styles.psClinet}>{order.request?.client?.firstName} {order.request?.client?.lastName}</p>
		</div>
	)
},)
