import React, {
	forwardRef,
} from 'react'
import {
	format,
} from 'date-fns'
import type {
	IOrder,
} from '../../../../../shared/types'
import * as styles from './buy-content.style'

interface IBuyContentProps {
  order: IOrder;
}

export const SellContent = forwardRef<HTMLDivElement, IBuyContentProps>(({
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
			<h1 className={styles.title}>Sell Order</h1>
			<p className={styles.text}>Dear {order.request?.client?.firstName} {order.request?.client?.lastName},</p>
			<p className={styles.plsSell}>Please sell the assets from {order.request?.portfolio?.name}</p>
			<div>
				<h2 className={styles.tableName}>{order.request?.asset?.assetName}</h2>
				<div className={styles.table}>
					<p className={styles.tableTitle}>Security</p>
					<p className={styles.tableTitle}>Isin</p>
					<p className={styles.tableTitle}>Units</p>
					<p className={styles.tableTitle}>Price</p>
					<p className={styles.tableTitle}>Currency</p>
				</div>

				{order.details.map((detail,) => {
					return (
						<div className={styles.table} key={detail.id}>
							<p className={styles.tableText}>{detail.security || '-'}</p>
							<p className={styles.tableText}>{detail.isin || '-'}</p>
							<p className={styles.tableText}>{detail.units || '-'}</p>
							<p className={styles.tableText}>{detail.price || '-'}</p>
							<p className={styles.tableText}>{detail.currency || '-'}</p>
						</div>
					)
				},)}
			</div>
			<p className={styles.bestRegards}>Best regards,</p>
			<p className={styles.psClinet}>{order.request?.client?.firstName} {order.request?.client?.lastName}</p>
		</div>
	)
},)
