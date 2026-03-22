import React from 'react'
import {
	SortOrder,
	GroupsSortBy,
} from '../../../shared/types'
import {
	ArrowDownUpFilled,
	ArrowDownUp,
} from '../../../assets/icons'
import {
	FilterEmpty,
} from './filter-empty.component'
import type {
	GroupItem,
} from '../../../shared/types'
import {
	useGroupsStore,
} from '../groups.store'
import {
	GroupEmpty,
} from './empty.component'
import {
	TableItem,
} from './item.component'
import type {
	TEditableGroup,
} from '../groups.types'
import * as styles from './table.style'

type Props = {
	groupList: Array<GroupItem> | undefined
	onAddGroup: () => void
	toggleUpdateVisible: (group: TEditableGroup) => void
	handleOpenDeleteModal: (groupId: string) => void
}

export const Table: React.FC<Props> = ({
	groupList,
	onAddGroup,
	toggleUpdateVisible,
	handleOpenDeleteModal,
},) => {
	const {
		filter,
		setSortOrder,
		setSortBy,
	} = useGroupsStore()

	const {
		sortBy,
		sortOrder,
	} = filter

	const renderSortArrows = (type: GroupsSortBy,): React.ReactElement => {
		const isCurrent = sortBy === type
		const order = sortOrder

		const handleClick = (): void => {
			if (!isCurrent) {
				setSortBy(type,)
				setSortOrder(SortOrder.DESC,)
			} else if (order === SortOrder.DESC) {
				setSortOrder(SortOrder.ASC,)
			} else {
				setSortBy(GroupsSortBy.CREATED_AT,)
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

	const noGroups = groupList?.length === 0
	const noResult = !groupList?.length && filter.search?.length

	return (
		<div className={styles.tableWrapper}>
			<div className={styles.scrollPadding} />
			<table className={styles.tableContainer}>
				<thead>
					<tr>
						<th className={styles.smallHeaderCell}></th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>
								Group name
								{renderSortArrows(GroupsSortBy.GROUP_NAME,)}
							</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>
								Course name
								{renderSortArrows(GroupsSortBy.COURSE_NAME,)}
							</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>
								Start date
								{renderSortArrows(GroupsSortBy.START_DATE,)}
							</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>
								Created at
								{renderSortArrows(GroupsSortBy.CREATED_AT,)}
							</p>
						</th>
					</tr>
				</thead>

				<tbody>
					{groupList?.map((group,) => {
						return (
							<TableItem
								key={group.id}
								group={group}
								handleOpenDeleteModal={handleOpenDeleteModal}
								toggleUpdateVisible={toggleUpdateVisible}
							/>
						)
					},)}

					{noGroups && !noResult && (
						<GroupEmpty
							toggleCreateVisible={onAddGroup}
						/>
					)}

					{noResult && (
						<FilterEmpty />
					)}
				</tbody>
			</table>
		</div>
	)
}