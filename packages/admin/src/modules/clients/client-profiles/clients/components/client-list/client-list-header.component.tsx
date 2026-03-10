import * as React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	ArrowDownUp, ArrowDownUpFilled,
} from '../../../../../../assets/icons/'
import type {
	TClientTableFilter,
} from '../../clients.types'
import {
	TClientSortVariants,
} from '../../clients.types'
import {
	SortOrder,
} from '../../../../../../shared/types'
import * as styles from '../../clients.style'

interface IClientsTablHeaderProps {
	sortFilter: TClientTableFilter
	handleSetSortFilter: (value: TClientTableFilter) => void
}

export const ClientListHeader: React.FunctionComponent<IClientsTablHeaderProps> = ({
	sortFilter, handleSetSortFilter,
},) => {
	const renderSortArrows = (type: TClientSortVariants,): React.ReactElement => {
		return (
			<>
				{sortFilter.sortBy !== type && (
					<span
						className={styles.sortArrows()}
						onClick={() => {
							handleSetSortFilter({
								sortBy:    type,
								sortOrder: SortOrder.DESC,
							},)
						}}
					>
						<ArrowDownUp />
					</span>
				)}
				{sortFilter.sortBy === type && sortFilter.sortOrder === SortOrder.DESC && (
					<span
						className={styles.sortArrows()}
						onClick={() => {
							handleSetSortFilter({
								sortBy:    type,
								sortOrder: SortOrder.ASC,
							},)
						}}
					>
						<ArrowDownUpFilled />
					</span>
				)}
				{sortFilter.sortBy === type && sortFilter.sortOrder === SortOrder.ASC && (
					<span
						className={styles.sortArrows(true,)}
						onClick={() => {
							handleSetSortFilter({
								sortBy:    TClientSortVariants.DATE,
								sortOrder: SortOrder.DESC,
							},)
						}}
					>
						<ArrowDownUpFilled />
					</span>
				)}
			</>
		)
	}
	// todo: clear if good
	// const renderSortArrows = (type: TClientSortVariants,): React.ReactElement => {
	// 	const isCurrent = sortFilter.sortBy === type
	// 	const order = sortFilter.sortOrder

	// 	const handleClick = (): void => {
	// 		if (!isCurrent) {
	// 			handleSetSortFilter({
	// 				sortBy:    type,
	// 				sortOrder: SortOrder.ASC,
	// 			},)
	// 		} else if (order === SortOrder.ASC) {
	// 			handleSetSortFilter({
	// 				sortBy:    type,
	// 				sortOrder: SortOrder.DESC,
	// 			},)
	// 		} else if (order === SortOrder.DESC) {
	// 			handleSetSortFilter({
	// 				sortBy:    undefined,
	// 				sortOrder: undefined,
	// 			},)
	// 		}
	// 	}

	// 	return (
	// 		<span
	// 			className={styles.sortArrows(order === SortOrder.ASC,)}
	// 			onClick={handleClick}
	// 		>
	// 			{!isCurrent && <ArrowDownUp />}
	// 			{isCurrent && order === SortOrder.ASC && <ArrowDownUpFilled />}
	// 			{isCurrent && order === SortOrder.DESC && <ArrowDownUpFilled />}
	// 		</span>
	// 	)
	// }

	return (
		<div className={styles.headerClientList}>
			<div
				className={cx(
					styles.bodyClientListItem,
					styles.headerClientListItemPointer,
				)}
			>
				<p className={styles.clientHeaderListText}>Client</p>
				{renderSortArrows(TClientSortVariants.NAME,)}
			</div>
			<div className={styles.headerClientListItem}>
				<p className={styles.clientHeaderListText}>Email</p>
			</div>
			<div className={styles.headerClientListItem}>
				<p className={styles.clientHeaderListText}>Contact number</p>
			</div>
			<div
				className={cx(
					styles.bodyClientListItem,
					styles.headerClientListItemPointer,
				)}
			>
				<p className={styles.clientHeaderListText}>Total assets</p>
				{renderSortArrows(TClientSortVariants.TOTAL_ASSETS,)}
			</div>
			<div
				className={cx(
					styles.bodyClientListItem,
					styles.headerClientListItemPointer,
				)}
			>
				<p className={styles.clientHeaderListText}>Date added</p>
				{renderSortArrows(TClientSortVariants.DATE,)}
			</div>
			<div className={styles.headerClientListItem}></div>
		</div>
	)
}
