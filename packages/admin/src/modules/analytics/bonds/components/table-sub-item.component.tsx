/* eslint-disable no-nested-ternary */
import React from 'react'
import {
	format,
} from 'date-fns'
import {
	cx,
} from '@emotion/css'
import {
	ItemDetails,
} from './item-details'
import {
	localeString,
	formatWithAllDecimals,
} from '../../../../shared/utils'
import {
	useBondStore,
} from '../bonds.store'
import {
	AssetOperationType,
} from '../../../../shared/types'
import type {
	IBondProperties,
} from '../../../../services/analytics/analytics.types'

import * as styles from '../bonds.styles'

type Props = {
	row: IBondProperties
	refetchData: () => void
	handleOpenDeleteModal: (assetId: string) => void
	isLast?: boolean
	isTableNamesShown: boolean
}

export const TableSubItem: React.FC<Props> = ({
	row,
	refetchData,
	handleOpenDeleteModal,
	isLast = false,
	isTableNamesShown,
},) => {
	const {
		filter,
		setBankId,
		setCurrency,
		setAssetId,
	} = useBondStore()

	const handleRowClick = React.useCallback((e: React.MouseEvent<HTMLTableRowElement>,): void => {
		const drawer = document.querySelector('.bp5-overlay',)
		if (drawer && drawer.contains(e.target as Node,)) {
			return
		}
		setBankId(undefined,)
		setCurrency(undefined,)
		setAssetId(filter.assetId?.includes(row.id,) ?
			filter.assetId.length === 1 ?
				undefined :
				filter.assetId.filter((item,) => {
					return item !== row.id
				},) :
			[...(filter.assetId ?? []), row.id,],)
	}, [filter,],)

	return (
		<tr
			className={styles.tableSubRow(Boolean(filter.assetId?.includes(row.id,),), isLast, false,)}
			onClick={handleRowClick}
		>
			<td className={styles.tableBtnCell}>
				{<ItemDetails row={row} refetchData={refetchData} handleOpenDeleteModal={handleOpenDeleteModal}/>}
			</td>
			{isTableNamesShown && <><td className={styles.tableCellMinimized}>
				<div className={styles.cellContent}>{row.portfolioName}</div>
			</td>
			<td className={styles.tableCellMinimized}>
				<div className={styles.cellContent}>{row.entityName}</div>
			</td>
			<td className={styles.tableCellMinimized}>
				<div className={styles.cellContent}>{row.bankName}</div>
			</td>
			<td className={styles.tableCellMinimized}>
				<div className={styles.cellContent}>{row.accountName}</div>
			</td></>}
			<td className={styles.tableSortCellMinimized}>{row.isin}</td>
			<td className={styles.tableCell}>{row.security}</td>
			<td className={styles.tableCellMinimized}>{row.currency}</td>
			<td className={cx(styles.tableCellMinimized, styles.amountColor(row.operation === AssetOperationType.BUY,), styles.tableNumberField,)}>{row.operation === AssetOperationType.BUY ?
				formatWithAllDecimals(row.units,) :
				`-${formatWithAllDecimals(row.units,)}`}</td>
			<td className={cx(styles.tableCellMinimized, styles.tableNumberField,)}>
				{formatWithAllDecimals(row.costPrice,)}
			</td>
			<td className={cx(styles.tableCellMinimized, styles.tableNumberField,)}>
				<span className={styles.empty}>- -</span>
			</td>
			<td className={cx(styles.tableProfitCellMinimized, styles.tableNumberField,)}>
				{localeString(row.costValueFC, '', 0, false,)}
			</td>
			<td className={cx(styles.tableProfitCellMinimized, styles.tableNumberField,)}>
				{localeString(row.costValueUsd, '', 0, false,)}
			</td>
			<td className={cx(styles.tableProfitCellMinimized, styles.tableNumberField,)}>
				<span className={styles.empty}>- -</span>
			</td>
			<td className={cx(styles.tableProfitCellMinimized, styles.tableNumberField,)}>
				<span className={styles.empty}>- -</span>
			</td>

			<td className={cx(styles.tableProfitCellMinimized, styles.tableNumberField,)}>
				<span className={styles.empty}>- -</span>
			</td>
			<td className={cx(styles.tableProfitCellMinimized, styles.tableNumberField,)}>
				<span className={styles.empty}>- -</span>
			</td>
			<td className={cx(styles.tableCellMinimized, styles.tableNumberField,)}>
				<span className={styles.empty}>- -</span>
			</td>
			{/* <td className={cx(styles.tableCell, styles.tableNumberField,)}>
				<span className={styles.empty}>- -</span>
			</td> */}

			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField, styles.dateMonoDisplay,)}>
				{row.valueDate ?
					format(row.valueDate, 'dd.MM.yyyy',) :
					<span className={styles.empty}>- -</span>}
			</td>
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
				<span className={styles.empty}>- -</span>
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				<div className={styles.cellContent}>
					<span className={styles.empty}>- -</span>
				</div>
			</td>
			<td className={styles.tableCell}>
				{/* <div className={styles.cellContent}>{row.issuer ?
					row.issuer :
					'<span className={styles.empty}>- -</span>'}</div> */}
				<span className={styles.empty}>- -</span>
			</td>

			<td className={styles.tableCell}>
				{/* <div className={styles.cellContent}>{row.sector ?
					row.sector :
					'- -'}</div> */}
				<span className={styles.empty}>- -</span>
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				<span className={styles.empty}>- -</span>
			</td>
			<td className={styles.tableCell}>
				{/* <div className={styles.cellContent}>{row.country ?
					row.country :
					'- -'}</div> */}
				<span className={styles.empty}>- -</span>
			</td>
		</tr>
	)
}
