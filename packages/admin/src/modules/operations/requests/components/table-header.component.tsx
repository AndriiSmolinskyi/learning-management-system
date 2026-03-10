/* eslint-disable complexity */
import React from 'react'

import {
	ArrowDownUp, ArrowDownUpFilled,
} from '../../../../assets/icons'

import {
	RequestType,
	SortOrder,
} from '../../../../shared/types'
import {
	useRequestStore,
} from '../request.store'

import * as styles from '../requests.styles'

export const TableHeader: React.FC = () => {
	const {
		filter,
		setSortOrder,
		setSortBy,
	} = useRequestStore()
	const {
		sortBy,
		sortOrder,
		type,
	} = filter

	return (
		<div className={styles.tableHeader}>
			<div className={styles.idHeaderCell}>
				<p>Request ID</p>
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
			<p className={styles.headerCell}>Portfolio</p>
			<p className={styles.headerCell}>Entity</p>
			<p className={styles.headerCell}>Bank</p>
			{(type === RequestType.BUY || type === RequestType.SELL) && <p className={styles.headerCell}>Asset</p>}
			{type === RequestType.DEPOSIT && <p className={styles.headerCell}>Amount</p>}
			{type === RequestType.OTHER && <p className={styles.headerCell}>Transaction type</p>}
			<p className={styles.headerCell}>Status</p>
			<div className={styles.updateCell}>
				<p>Last update</p>
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
			<div className={styles.menuCell}>
			</div>
		</div>
	)
}
