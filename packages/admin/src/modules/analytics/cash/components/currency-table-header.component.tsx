// todo: clear if good
// import React from 'react'

// import {
// 	ArrowDownUp, ArrowDownUpFilled,
// } from '../../../../assets/icons'

// import {
// 	TCashCurrencyTableSortVariants,
// 	type TCashCurrencyTableFilter,
// } from '../cash.types'
// import {
// 	SortOrder,
// } from '../../../../shared/types'

// import * as styles from '../cash.styles'

// type Props = {
// 	filter: TCashCurrencyTableFilter
// 	setFilter: React.Dispatch<React.SetStateAction<TCashCurrencyTableFilter>>
// }

// export const CurrencyTableHeader: React.FC<Props> = ({
// 	filter,
// 	setFilter,
// },) => {
// 	return (
// 		<div className={styles.tableHead}>
// 			<p className={styles.headerCell}>Currency</p>
// 			<p className={styles.sortHeaderCellCash}>FC</p>
// 			<div className={styles.sortHeaderCellCash}>
// 				<p>USD</p>
// 				{filter.sortBy !== TCashCurrencyTableSortVariants.USD_VALUE && (
// 					<span
// 						className={styles.orderArrow()}
// 						onClick={() => {
// 							setFilter({
// 								sortBy:    TCashCurrencyTableSortVariants.USD_VALUE,
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
// 				{filter.sortBy === TCashCurrencyTableSortVariants.USD_VALUE && filter.sortOrder === SortOrder.DESC && (
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
// 				{filter.sortBy === TCashCurrencyTableSortVariants.USD_VALUE && filter.sortOrder === SortOrder.ASC && (
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
// 			<div className={styles.sortHeaderCellCash}>
// 				<p>%</p>
// 				{filter.sortBy !== TCashCurrencyTableSortVariants.PERCENTAGE && (
// 					<span
// 						className={styles.orderArrow()}
// 						onClick={() => {
// 							setFilter({
// 								sortBy:    TCashCurrencyTableSortVariants.PERCENTAGE,
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
// 				{filter.sortBy === TCashCurrencyTableSortVariants.PERCENTAGE && filter.sortOrder === SortOrder.DESC && (
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
// 				{filter.sortBy === TCashCurrencyTableSortVariants.PERCENTAGE && filter.sortOrder === SortOrder.ASC && (
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
// 		</div>
// 	)
// }
import React from 'react'

import {
	ArrowDownUp, ArrowDownUpFilled,
} from '../../../../assets/icons'

import {
	TCashCurrencyTableSortVariants,
	type TCashCurrencyTableFilter,
} from '../cash.types'
import {
	SortOrder,
} from '../../../../shared/types'

import * as styles from '../cash.styles'

type Props = {
  filter: TCashCurrencyTableFilter
  setFilter: React.Dispatch<React.SetStateAction<TCashCurrencyTableFilter>>
}

export const CurrencyTableHeader: React.FC<Props> = ({
	filter,
	setFilter,
},) => {
	const renderSort = (type: TCashCurrencyTableSortVariants,): React.ReactElement => {
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
						...prev, sortBy: TCashCurrencyTableSortVariants.USD_VALUE, sortOrder: SortOrder.DESC,
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
		<div className={styles.tableHead}>
			<p className={styles.headerCell}>Currency</p>
			<p className={styles.sortHeaderCellCash}>FC</p>
			<div className={styles.sortHeaderCellCash}>
				<p>USD</p>
				{renderSort(TCashCurrencyTableSortVariants.USD_VALUE,)}
			</div>
			<div className={styles.sortHeaderCellCash}>
				<p>%</p>
				{renderSort(TCashCurrencyTableSortVariants.PERCENTAGE,)}
			</div>
		</div>
	)
}
