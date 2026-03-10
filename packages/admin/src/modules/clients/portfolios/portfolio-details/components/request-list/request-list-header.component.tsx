// todo: clear if good
// import React from 'react'

// import {
// 	ArrowDownUp,
// 	ArrowDownUpFilled,
// } from '../../../../../../assets/icons'

// import type {
// 	TRequestListFilter,
// } from './request-list.types'
// import {
// 	SortOrder,
// } from '../../../../../../shared/types'

// import * as styles from './request-list.styles'

// type Props = {
// 	filter: TRequestListFilter
// 	setFilter: React.Dispatch<React.SetStateAction<TRequestListFilter>>
// }

// export const RequestListHeader: React.FC<Props> = ({
// 	filter,
// 	setFilter,
// },) => {
// 	return (
// 		<div className={styles.tableHeader}>
// 			<div className={styles.idHeaderCell}>
// 				<p>Request ID</p>
// 				{filter.sortBy !== 'id' && (
// 					<span
// 						className={styles.orderArrow()}
// 						onClick={() => {
// 							setFilter({
// 								sortBy:    'id',
// 								sortOrder: SortOrder.DESC,
// 							},)
// 						}}
// 					>
// 						<ArrowDownUp
// 							width={16}
// 							height={16}
// 						/>
// 					</span>
// 				)}
// 				{filter.sortBy === 'id' && filter.sortOrder === SortOrder.DESC && (
// 					<span
// 						className={styles.orderArrow()}
// 						onClick={() => {
// 							setFilter((prev,) => {
// 								return {
// 									...prev,
// 									sortOrder: SortOrder.ASC,
// 								}
// 							},)
// 						}}
// 					>
// 						<ArrowDownUpFilled
// 							width={16}
// 							height={16}
// 						/>
// 					</span>
// 				)}
// 				{filter.sortBy === 'id' && filter.sortOrder === SortOrder.ASC && (
// 					<span
// 						className={styles.orderArrow(true,)}
// 						onClick={() => {
// 							setFilter((prev,) => {
// 								return {
// 									...prev,
// 									sortOrder: SortOrder.DESC,
// 								}
// 							},)
// 						}}
// 					>
// 						<ArrowDownUpFilled
// 							width={16}
// 							height={16}
// 						/>
// 					</span>
// 				)}
// 			</div>
// 			<p className={styles.headerCell}>Type</p>
// 			<p className={styles.headerCell}>Status</p>
// 			<div className={styles.updateCell}>
// 				<p>Last update</p>
// 				{filter.sortBy !== 'updatedAt' && (
// 					<span
// 						className={styles.orderArrow()}
// 						onClick={() => {
// 							setFilter({
// 								sortBy:    'updatedAt',
// 								sortOrder: SortOrder.DESC,
// 							},)
// 						}}
// 					>
// 						<ArrowDownUp
// 							width={16}
// 							height={16}
// 						/>
// 					</span>
// 				)}
// 				{filter.sortBy === 'updatedAt' && filter.sortOrder === SortOrder.DESC && (
// 					<span
// 						className={styles.orderArrow()}
// 						onClick={() => {
// 							setFilter((prev,) => {
// 								return {
// 									...prev,
// 									sortOrder: SortOrder.ASC,
// 								}
// 							},)
// 						}}
// 					>
// 						<ArrowDownUpFilled
// 							width={16}
// 							height={16}
// 						/>
// 					</span>
// 				)}
// 				{filter.sortBy === 'updatedAt' && filter.sortOrder === SortOrder.ASC && (
// 					<span
// 						className={styles.orderArrow(true,)}
// 						onClick={() => {
// 							setFilter((prev,) => {
// 								return {
// 									...prev,
// 									sortOrder: SortOrder.DESC,
// 								}
// 							},)
// 						}}
// 					>
// 						<ArrowDownUpFilled
// 							width={16}
// 							height={16}
// 						/>
// 					</span>
// 				)}
// 			</div>
// 			<div className={styles.menuCell}/>
// 		</div>
// 	)
// }
import * as React from 'react'
import {
	ArrowDownUp, ArrowDownUpFilled,
} from '../../../../../../assets/icons/'
import type {
	TRequestListFilter,
} from './request-list.types'
import {
	SortOrder,
} from '../../../../../../shared/types'
import * as styles from './request-list.styles'

type TRequestSortVariants = 'id' | 'updatedAt'

interface IRequestListHeaderProps {
	filter: TRequestListFilter
	setFilter: React.Dispatch<React.SetStateAction<TRequestListFilter>>
}

export const RequestListHeader: React.FunctionComponent<IRequestListHeaderProps> = ({
	filter, setFilter,
},) => {
	const renderSort = (type: TRequestSortVariants,): React.ReactElement => {
		const isCurrent = filter.sortBy === type
		const order = filter.sortOrder

		const handleClick = (): void => {
			if (!isCurrent) {
				setFilter((prev,) => {
					return {
						...prev, sortBy: type, sortOrder: SortOrder.DESC,
					}
				},)
			} else if (order === SortOrder.DESC) {
				setFilter((prev,) => {
					return {
						...prev, sortOrder: SortOrder.ASC,
					}
				},)
			} else {
				setFilter((prev,) => {
					return {
						...prev, sortBy: 'updatedAt', sortOrder: SortOrder.DESC,
					}
				},)
			}
		}

		return (
			<span
				className={styles.orderArrow(order === SortOrder.ASC,)}
				onClick={handleClick}
			>
				{isCurrent ?
					(
						<ArrowDownUpFilled width={16} height={16} />
					) :
					(
						<ArrowDownUp width={16} height={16} />
					)}
			</span>
		)
	}

	return (
		<div className={styles.tableHeader}>
			<div className={styles.idHeaderCell}>
				<p>Request ID</p>
				{renderSort('id',)}
			</div>
			<p className={styles.headerCell}>Type</p>
			<p className={styles.headerCell}>Status</p>
			<div className={styles.updateCell}>
				<p>Last update</p>
				{renderSort('updatedAt',)}
			</div>
			<div className={styles.menuCell} />
		</div>
	)
}
