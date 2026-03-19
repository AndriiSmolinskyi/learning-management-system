import React from 'react'

import {
	ArrowDownUp,
	ArrowDownUpFilled,
} from '../../../../assets/icons'
import {
	LessonsSortBy,
	SortOrder,
} from '../../../../shared/types'
import {
	useLessonStore,
} from '../lessons.store'

import * as styles from '../lessons.styles'

type Column = LessonsSortBy

export const TableHeader: React.FC = () => {
	const {
		filter,
		setSortOrder,
		setSortBy,
	} = useLessonStore()

	const {
		sortBy,
		sortOrder,
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
				setSortBy(LessonsSortBy.CREATED_AT,)
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
				<p>Lesson title</p>
				{renderSortArrows(LessonsSortBy.TITLE,)}
			</div>

			<div className={styles.idHeaderCell}>
				<p>Comment</p>
				{renderSortArrows(LessonsSortBy.COMMENT,)}
			</div>

			<div className={styles.idHeaderCell}>
				<p>Date added</p>
				{renderSortArrows(LessonsSortBy.CREATED_AT,)}
			</div>

			<div className={styles.idHeaderCell}>
				<p>Last update</p>
				{renderSortArrows(LessonsSortBy.UPDATED_AT,)}
			</div>

			<div className={styles.menuCell} />
		</div>
	)
}