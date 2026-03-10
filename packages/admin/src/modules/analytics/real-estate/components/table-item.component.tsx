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
} from '../../../../shared/utils'
import {
	useRealEstateStore,
} from '../real-estate.store'
import type {
	TRealEstateAssetAnalytics,
} from '../../../../services/analytics/analytics.types'
import {
	Redo,
} from '../../../../assets/icons'

import * as styles from '../real-estate.styles'

type Props = {
	row: TRealEstateAssetAnalytics
	refetchData: () => void
	handleOpenDeleteModal: (assetId: string) => void
	isTableNamesShown: boolean
}

export const TableItem: React.FC<Props> = ({
	row,
	refetchData,
	handleOpenDeleteModal,
	isTableNamesShown,
},) => {
	const {
		filter,
		setCity,
		setCurrency,
		setAssetIds,
	} = useRealEstateStore()

	const handleRowClick = React.useCallback((e: React.MouseEvent<HTMLTableRowElement>,): void => {
		const drawer = document.querySelector('.bp5-overlay',)
		if (drawer && drawer.contains(e.target as Node,)) {
			return
		}
		setCity(undefined,)
		setCurrency(undefined,)
		setAssetIds(filter.assetIds?.includes(row.id,) ?
			filter.assetIds.length === 1 ?
				undefined :
				filter.assetIds.filter((item,) => {
					return item !== row.id
				},) :
			[...(filter.assetIds ?? []), row.id,],)
	}, [filter,],)

	return (
		<tr
			className={styles.tableRow(Boolean(filter.assetIds?.includes(row.id,),), false,)}
			onClick={handleRowClick}
		>
			<td className={styles.tableBtnCell}>
				<ItemDetails row={row} refetchData={refetchData} handleOpenDeleteModal={handleOpenDeleteModal}/>
			</td>
			{isTableNamesShown && <><td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.portfolio}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.entity}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.bank}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.account}</div>
			</td></>}
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.country}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.city}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.projectTransaction}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>
					{row.operation ?
						row.operation :
						<span className={styles.empty}>- -</span>}
				</div>
			</td>
			<td className={styles.tableCell}>{row.isTransferred && <Redo width={16} height={16} className={styles.transferIcon}/>}{row.currency}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>{localeString(row.currencyValue, '', 0, false,)}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>{localeString(row.usdValue, 'USD', 0, false,)}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>{row.marketValueFC ?
				localeString(row.marketValueFC, '', 0, false,) :
				<span className={styles.empty}>- -</span>}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>{localeString(row.marketUsdValue, 'USD', 0, false,)}</td>
			<td className={cx(styles.tableCell, styles.amountColor(row.profitUsd >= 0,), styles.tableNumberField,)}>
				{localeString(row.profitUsd, 'USD', 0, false,)}
			</td>
			<td className={cx(styles.tableCell, styles.amountColor(row.profitPercentage >= 0,), styles.tableNumberField,)}>
				{localeString(row.profitPercentage, '', 2,)}%

			</td>
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
				{row.date ?
					format(row.date, 'dd.MM.yyyy',) :
					''}
			</td>
		</tr>
	)
}
