/* eslint-disable complexity */
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
	useMetalsStore,
} from '../metals.store'
import type {
	IMetalProperties,
} from '../../../../services/analytics/analytics.types'
import {
	AssetOperationType,
} from '../../../../shared/types'

import * as styles from '../metals.styles'

type Props = {
	row: IMetalProperties
	refetchData: () => void
	handleOpenDeleteModal: (assetId: string) => void
	isLast?: boolean
	shouldShowEtfColumns: boolean
	shouldShowDirectColumns: boolean
	isTableNamesShown: boolean
}

export const TableSubItem: React.FC<Props> = ({
	row,
	refetchData,
	handleOpenDeleteModal,
	isLast = false,
	shouldShowEtfColumns,
	shouldShowDirectColumns,
	isTableNamesShown,
},) => {
	const {
		filter,
		setBankId,
		setCurrency,
		setAssetIds,
	} = useMetalsStore()

	const handleRowClick = React.useCallback((e: React.MouseEvent<HTMLTableRowElement>,): void => {
		const drawer = document.querySelector('.bp5-overlay',)
		if (drawer && drawer.contains(e.target as Node,)) {
			return
		}
		setBankId(undefined,)
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
			className={styles.tableSubRow(Boolean(filter.assetIds?.includes(row.id,),), isLast, false,)}
			onClick={handleRowClick}
		>
			<td className={styles.tableBtnCell}>
				<ItemDetails row={row} refetchData={refetchData} handleOpenDeleteModal={handleOpenDeleteModal}/>
			</td>
			{isTableNamesShown && <><td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.productType}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.portfolioName}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.entityName}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.bankName}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.accountName}</div>
			</td></>}
			{shouldShowEtfColumns && (
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>{row.issuer ?? <span className={styles.empty}>- -</span>}</div>
				</td>
			)}
			{shouldShowEtfColumns && (
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>{row.isin ?? <span className={styles.empty}>- -</span>}</div>
				</td>
			)}
			{shouldShowEtfColumns && (
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>{row.security ?? <span className={styles.empty}>- -</span>}</div>
				</td>
			)}
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.currency}</div>
			</td>
			<td className={cx(styles.tableCell, styles.amountColor(row.operation === AssetOperationType.BUY,), styles.textNowrap, styles.tableNumberField,)}>
				<div className={styles.cellContent}>{row.units ?
					row.operation === AssetOperationType.BUY ?
						formatWithAllDecimals(row.units,) :
						`-${formatWithAllDecimals(row.units,)}` :
					<span className={styles.empty}>- -</span>}</div>
			</td>
			{shouldShowDirectColumns && (<td className={styles.tableCell}>{row.metalType ?
				row.metalType :
				<span className={styles.empty}>- -</span>}</td>)}
			{shouldShowDirectColumns && (<td className={styles.tableCell}>{row.metalName ?
				row.metalName :
				<span className={styles.empty}>- -</span>}</td>)}
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				{row.costPrice ?
					formatWithAllDecimals(row.costPrice,) :
					<span className={styles.empty}>- -</span>}
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				<span className={styles.empty}>- -</span>
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>{row.costValueFC ?
				localeString(row.costValueFC, '', 0, false,) :
				<span className={styles.empty}>- -</span>}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>{localeString(row.costValueUsd, 'USD', 0, false,)}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}><span className={styles.empty}>- -</span></td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}><span className={styles.empty}>- -</span></td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}><span className={styles.empty}>- -</span></td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}><span className={styles.empty}>- -</span></td>
			<td className={cx(styles.tableCell,)}>
				{/* {row.productType === MetalType.ETF ?
					row.country ?
						row.country :
						'Global' :
					'Global'} */}
				<span className={styles.empty}>- -</span>
			</td>
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
				{row.valueDate ?
					format(row.valueDate, 'dd.MM.yyyy',) :
					<span className={styles.empty}>- -</span>}
			</td>
		</tr>
	)
}
