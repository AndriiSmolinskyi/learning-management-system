import React from 'react'

import {
	ArrowDownUp, ArrowDownUpFilled,
} from '../../../../assets/icons'

import {
	TOverviewSortVariants,
	type TOverviewTableFilter,
} from '../overview.types'
import {
	SortOrder,
} from '../../../../shared/types'

import * as styles from '../overview.styles'

type Props = {
  filter: TOverviewTableFilter
  isTbodyEmpty: boolean
  setFilter: React.Dispatch<React.SetStateAction<TOverviewTableFilter>>
}

export const BankTableHeader: React.FC<Props> = ({
	filter,
	isTbodyEmpty,
	setFilter,
},) => {
	const renderSort = (type: TOverviewSortVariants,): React.ReactElement => {
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
						...prev, sortBy: TOverviewSortVariants.USD_VALUE, sortOrder: SortOrder.DESC,
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
					<ArrowDownUpFilled width={16} height={16} /> :
					<ArrowDownUp width={16} height={16} />}
			</span>
		)
	}

	return (
		// <div className={styles.currencyTableHead(isTbodyEmpty,)}>
		// 	<div className={styles.bankButtonTableCell()} />
		// 	<p className={styles.bigHeaderCell}>Bank</p>
		// 	<div className={styles.bigHeaderCellNumber}>
		// 		<p>USD</p>
		// 		{renderSort(TOverviewSortVariants.USD_VALUE,)}
		// 	</div>
		// 	<div className={styles.bigHeaderCellNumber}>
		// 		<p>%</p>
		// 		{renderSort(TOverviewSortVariants.PERCENTAGE,)}
		// 	</div>
		// </div>
		<div className={styles.currencyTableHead(isTbodyEmpty,)}>
			<div className={styles.bankButtonTableCell()} />
			<p className={styles.bigHeaderCell}>Bank</p>
			<p className={styles.bigHeaderCell}></p>
			<div className={styles.bigHeaderCellNumber}>
				<p>USD</p>
				{renderSort(TOverviewSortVariants.USD_VALUE,)}
			</div>
			<div className={styles.bigHeaderCellNumber}>
				<p>%</p>
				{renderSort(TOverviewSortVariants.PERCENTAGE,)}
			</div>
		</div>
	)
}
