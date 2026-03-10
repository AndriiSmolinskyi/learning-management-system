import React from 'react'

import {
	ArrowDownUp, ArrowDownUpFilled,
} from '../../../../assets/icons'
import {
	SortOrder,
} from '../../../../shared/types'
import {
	useReportStore,
} from '../reports.store'
import * as styles from '../reports.styles'

type Props = {
  isClient?: boolean
}

type Column = 'id' | 'name' | 'createdAt' | 'updatedAt'

export const TableHeader: React.FC<Props> = ({
	isClient,
},) => {
	const {
		filter, setSortOrder, setSortBy,
	} = useReportStore()
	const {
		sortBy, sortOrder,
	} = filter

	const renderSortArrows = (type: Column,): React.ReactElement => {
		const isCurrent = sortBy === type
		const order = sortOrder

		const handleClick = (): void => {
			if (!isCurrent) {
				setSortBy(type,)
				setSortOrder(SortOrder.DESC,)
			} else if (order === SortOrder.DESC) {
				setSortOrder(SortOrder.ASC,)
			} else {
				setSortBy('id',)
				setSortOrder(SortOrder.DESC,)
			}
		}

		return (
			<span
				className={styles.orderArrow(order === SortOrder.ASC,)}
				onClick={handleClick}
			>
				{isCurrent ?
					<ArrowDownUpFilled width={16} height={16} /> :
					<ArrowDownUp width={16} height={16} />}
			</span>
		)
	}

	return (
		<div className={styles.tableHeader}>
			<div className={styles.idHeaderCell}>
				<p>Report ID</p>
				{renderSortArrows('id',)}
			</div>

			{!isClient && (
				<div className={styles.idHeaderCell}>
					<p>Report name</p>
					{renderSortArrows('name',)}
				</div>
			)}

			<p className={styles.headerCell}>Type</p>
			<p className={styles.headerCell}>Category</p>
			<p className={styles.headerCell}>Created by</p>

			<div className={styles.idHeaderCell}>
				<p>Date added</p>
				{renderSortArrows('createdAt',)}
			</div>

			<div className={styles.idHeaderCell}>
				<p>Last update</p>
				{renderSortArrows('updatedAt',)}
			</div>

			<div className={styles.menuCell} />
		</div>
	)
}
