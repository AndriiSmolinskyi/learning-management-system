/* eslint-disable complexity */
import React from 'react'
import {
	ArrowDownUp,
	ArrowDownUpFilled,
} from '../../../../../assets/icons/'
import {
	useOrderStore,
} from '../order.store'
import {
	SortOrder,
} from '../../../../../shared/types'
import * as styles from './order-list-header.style'

export const OrdersListHeader: React.FC = () => {
	const {
		filter,
		setSortOrder,
		setSortBy,
	} = useOrderStore()
	const {
		sortBy,
		sortOrder,
	} = filter
	return (
		<div className={styles.headerClientList}>
			<div className={styles.bodyClientListItem}>
				<p className={styles.clientHeaderListText}>Order ID</p>
				{sortBy !== 'id' && (
					<span
						className={styles.orderArrow()}
						onClick={() => {
							setSortBy('id',)
							setSortOrder(SortOrder.DESC,)
						}}
					>
						<ArrowDownUp
							width={16}
							height={16}
						/>
					</span>
				)}
				{sortBy === 'id' && sortOrder === SortOrder.DESC && (
					<span
						className={styles.orderArrow()}
						onClick={() => {
							setSortOrder(SortOrder.ASC,)
						}}
					>
						<ArrowDownUpFilled
							width={16}
							height={16}
						/>
					</span>
				)}
				{sortBy === 'id' && sortOrder === SortOrder.ASC && (
					<span
						className={styles.orderArrow(true,)}
						onClick={() => {
							setSortOrder(SortOrder.DESC,)
							setSortBy('updatedAt',)
						}}
					>
						<ArrowDownUpFilled
							width={16}
							height={16}
						/>
					</span>
				)}
			</div>
			<div className={styles.headerClientListItem}>
				<p className={styles.clientHeaderListText}>Portfolio</p>
			</div>
			<div className={styles.headerClientListItem}>
				<p className={styles.clientHeaderListText}>Bank</p>
			</div>
			<div className={styles.headerClientListItem}>
				<p className={styles.clientHeaderListText}>Cash Value in Currency</p>
			</div>
			<div className={styles.headerClientListItem}>
				<p className={styles.clientHeaderListText}>Status</p>
			</div>
			<div className={styles.bodyClientListItem}>
				<p className={styles.clientHeaderListText}>Last update</p>
				{sortBy !== 'updatedAt' && (
					<span
						className={styles.orderArrow()}
						onClick={() => {
							setSortBy('updatedAt',)
							setSortOrder(SortOrder.DESC,)
						}}
					>
						<ArrowDownUp
							width={16}
							height={16}
						/>
					</span>
				)}
				{sortBy === 'updatedAt' && sortOrder === SortOrder.DESC && (
					<span
						className={styles.orderArrow()}
						onClick={() => {
							setSortOrder(SortOrder.ASC,)
						}}
					>
						<ArrowDownUpFilled
							width={16}
							height={16}
						/>
					</span>
				)}
				{sortBy === 'updatedAt' && sortOrder === SortOrder.ASC && (
					<span
						className={styles.orderArrow(true,)}
						onClick={() => {
							setSortOrder(SortOrder.DESC,)
						}}
					>
						<ArrowDownUpFilled
							width={16}
							height={16}
						/>
					</span>
				)}
			</div>
			<div className={styles.headerClientListItem}></div>
		</div>
	)
}
