/* eslint-disable complexity */
import React from 'react'
import {
	SortOrder,

	StudentsSortBy,
} from '../../../shared/types'
import {
	ArrowDownUpFilled,
	ArrowDownUp,
} from '../../../assets/icons'
import {
	FilterEmpty,
} from './filter-empty.component'
import type {
	StudentItem,
} from '../../../shared/types'
import {
	useStudentsStore,
} from '../students.store'
import {
	StudentEmpty,
} from './empty.component'
import {
	TableItem,
} from './item.component'
import * as styles from './table.style'

type Props = {
	studentList: Array<StudentItem> | undefined
	onAddStudent: () => void
	toggleUpdateVisible: (id: string) => void
	handleOpenDeleteModal: (transactionTypeId: string) => void
}

export const Table: React.FC<Props> = ({
	studentList,
	onAddStudent,
	toggleUpdateVisible,
	handleOpenDeleteModal,
},) => {
	const {
		filter, setSortOrder, setSortBy,
	} = useStudentsStore()
	const {
		sortBy, sortOrder,
	} = filter

	const renderSortArrows = (type: StudentsSortBy,): React.ReactElement => {
		const isCurrent = sortBy === type
		const order = sortOrder

		const handleClick = (): void => {
			if (!isCurrent) {
				setSortBy(type,)
				setSortOrder(SortOrder.DESC,)
			} else if (order === SortOrder.DESC) {
				setSortOrder(SortOrder.ASC,)
			} else {
				setSortBy(StudentsSortBy.FIRST_NAME,)
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

	const noStudent = studentList?.length === 0

	const noResult = !studentList?.length && (
		filter.search?.length
	)

	return (
		<div className={styles.tableWrapper}>
			<div className={styles.scrollPadding} />
			<table className={styles.tableContainer}>
				<thead>
					<tr>
						<th className={styles.smallHeaderCell}>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>
								Name
								{renderSortArrows(StudentsSortBy.FIRST_NAME,)}
							</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>
								Email
								{renderSortArrows(StudentsSortBy.EMAIL,)}
							</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>
								Phone number
							</p>
						</th>
						<th className={styles.headerCell}>
							<p className={styles.tableTitle}>
								Created at
								{renderSortArrows(StudentsSortBy.CREATED_AT,)}
							</p>
						</th>
					</tr>
				</thead>
				<tbody>

					{studentList?.map((student, idx,) => {
						return (
							<TableItem
								key={student.id}
								student={student}
								handleOpenDeleteModal={handleOpenDeleteModal}
								toggleUpdateVisible={toggleUpdateVisible}
							/>
						)
					},
					)}

					{noStudent && !noResult && (
						<StudentEmpty
							toggleCreateVisible={onAddStudent}
						/>
					)}

					{noResult &&
                <FilterEmpty />
					}
				</tbody>
			</table>
		</div>
	)
}