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
	ChevronUpBlue,
	ChevronDown,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import {
	TableSubItem,
} from './table-sub-item.component'
import {
	ItemDetails,
} from './item-details'
import {
	formatWithAllDecimals,
	localeString,
} from '../../../../shared/utils'
import {
	useBondStore,
} from '../bonds.store'
import type {
	IAnalyticsBond,
} from '../../../../services/analytics/analytics.types'
import {
	Redo,
} from '../../../../assets/icons'

import * as styles from '../bonds.styles'

type Props = {
	row: IAnalyticsBond
	refetchData: () => void
	handleOpenDeleteModal: (assetId: string) => void
	handleRowClicked: () => void
	isTableNamesShown: boolean
}

export const TableItem: React.FC<Props> = ({
	row,
	refetchData,
	handleOpenDeleteModal,
	handleRowClicked,
	isTableNamesShown,
},) => {
	const {
		filter,
		setBankId,
		setCurrency,
		setAssetId,
	} = useBondStore()
	const [showSubItems, setShowSubItems,] = React.useState(false,)

	const handleRowClick = React.useCallback((e: React.MouseEvent<HTMLTableRowElement>,): void => {
		const drawer = document.querySelector('.bp5-overlay',)
		if (drawer && drawer.contains(e.target as Node,)) {
			return
		}

		if (!row.assets) {
			setBankId(undefined,)
			setCurrency(undefined,)
			setAssetId(
				filter.assetId?.includes(row.id,) ?
					(filter.assetId.length === 1 ?
						undefined :
						filter.assetId.filter((item,) => {
							return item !== row.id
						},)
					) :
					[...(filter.assetId ?? []), row.id,],
			)
		}

		if (row.assets) {
			setBankId(undefined,)
			setCurrency(undefined,)

			const allAssetIds = row.assets.map((asset,) => {
				return asset.id
			},)

			const prevSelected = filter.assetId ?? []

			const areAllSelected = allAssetIds.every((id,) => {
				return prevSelected.includes(id,)
			},)

			if (areAllSelected) {
				setAssetId(
					prevSelected.filter((id,) => {
						return !allAssetIds.includes(id,)
					},),
				)
			} else {
				const merged = [...prevSelected,]

				allAssetIds.forEach((id,) => {
					if (!merged.includes(id,)) {
						merged.push(id,)
					}
				},)

				setAssetId(merged,)
			}
		}
	}, [filter.assetId, row, setAssetId, setBankId, setCurrency,],)

	const sortedSubitems = (row.assets ?? [])
		.slice()
		.sort((a, b,) => {
			const dateA = a.valueDate ?
				new Date(a.valueDate,).getTime() :
				0
			const dateB = b.valueDate ?
				new Date(b.valueDate,).getTime() :
				0
			return dateB - dateA
		},)
	const isRowHighlighted = React.useMemo(() => {
		if (row.assets?.length) {
			return row.assets.every((asset,) => {
				return filter.assetId?.includes(asset.id,)
			},)
		}
		return Boolean(filter.assetId?.includes(row.id,),)
	}, [row, filter.assetId,],)
	return (
		<>
			<tr
				className={styles.tableRow(isRowHighlighted, showSubItems, false, Boolean(row.assets,),)}
				onClick={handleRowClick}
			>
				<td className={styles.tableBtnCell}>
					{ (row.assets ?
						(
							<Button<ButtonType.ICON>
								onClick={(e,) => {
									e.stopPropagation()
									setShowSubItems(!showSubItems,)
									handleRowClicked()
								}}
								additionalProps={{
									btnType:  ButtonType.ICON,
									icon:     showSubItems ?
										<ChevronUpBlue width={20} height={20}/> :
										<ChevronDown width={20} height={20}/>,
									size:     Size.SMALL,
									color:    Color.NON_OUT_BLUE,
								}}
							/>
						) :
						(
							<ItemDetails row={row} refetchData={refetchData} handleOpenDeleteModal={handleOpenDeleteModal}/>
						))}
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
				<td className={styles.tableSortCellMinimized}>{row.isTransferred && <Redo width={16} height={16} className={styles.transferIcon}/>}{row.isin}</td>
				<td className={styles.tableCell}>{row.security}</td>
				<td className={styles.tableCellMinimized}>{row.assets ?
					row.assets[0]?.currency :
					row.currency}</td>
				<td className={cx(styles.tableCellMinimized, styles.tableNumberField,)}>{formatWithAllDecimals(row.units,)}</td>
				<td className={cx(styles.tableCellMinimized,styles.tableNumberField,)}>
					{row.costPrice % 1 === 0 ?
						localeString(row.costPrice, '', 2,) :
						localeString(row.costPrice, '', 2,)}
				</td>
				<td className={cx(styles.tableCellMinimized, styles.tableNumberField,)}>
					{localeString(row.marketPrice, '', 2,)}
				</td>
				<td className={cx(styles.tableProfitCellMinimized,styles.tableNumberField,)}>
					{localeString(row.costValueFC, '', 0, false,)}
				</td>
				<td className={cx(styles.tableProfitCellMinimized, styles.tableNumberField,)}>
					{localeString(row.costValueUsd, '', 0, false,)}
				</td>
				<td className={cx(styles.tableProfitCellMinimized, styles.tableNumberField,)}>
					{localeString(row.marketValueFC, '', 0, false,)}
				</td>
				<td className={cx(styles.tableProfitCellMinimized, styles.tableNumberField,)}>
					{localeString(row.marketValueUsd, '', 0, false,)}
				</td>
				<td className={cx(styles.tableProfitCellMinimized, styles.amountColor(row.profitUsd >= 0,), styles.tableNumberField,)}>
					{localeString(row.profitUsd, 'USD', 0, false,)}
				</td>
				<td className={cx(styles.tableProfitCellMinimized, styles.amountColor(row.profitPercentage >= 0,), styles.tableNumberField,)}>
					{localeString(row.profitPercentage, '', 2, true,)}%
				</td>
				<td className={cx(styles.tableCellMinimized, styles.tableNumberField,)}>
					{row.yield ?
						localeString(row.yield, '', 2,) :
						<span className={styles.empty}>- -</span>}
				</td>
				{/* <td className={cx(styles.tableCell, styles.tableNumberField,)}>
					{localeString(row.currentAccrued, '', 0, false,)}
				</td> */}

				<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
					{row.assets ?
						<span className={styles.empty}>- -</span> :
						row.valueDate ?
							format(row.valueDate, 'dd.MM.yyyy',) :
							sortedSubitems[0]?.valueDate ?
								format(sortedSubitems[0].valueDate, 'dd.MM.yyyy',) :
								<span className={styles.empty}>- -</span>}
				</td>
				<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
					{row.nextCouponDate ?
						format(row.nextCouponDate, 'dd.MM.yyyy',) :
						<span className={styles.empty}>- -</span>}
				</td>
				<td className={cx(styles.tableCell, styles.tableNumberField,)}>
					<div className={styles.cellContent}>
						{row.maturity ?
							format(row.maturity, 'dd.MM.yyyy',) :
							<span className={styles.empty}>- -</span>}
					</div>
				</td>
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>{row.issuer ?
						row.issuer :
						<span className={styles.empty}>- -</span>}</div>
				</td>

				<td className={styles.tableCell}>
					<div className={styles.cellContent}>{row.sector ?
						row.sector === 'N/A' ?
							<span className={styles.empty}>- -</span> :
							row.sector :
						<span className={styles.empty}>- -</span>}</div>
				</td>
				<td className={cx(styles.tableCell, styles.tableNumberField,)}>
					<div className={styles.cellContent}>{row.coupon ?
						localeString(Number(row.coupon,), '', 2,) :
						<span className={styles.empty}>- -</span>}</div>
				</td>
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>{row.country ?
						row.country :
						<span className={styles.empty}>- -</span>}</div>
				</td>
			</tr>
			{showSubItems && sortedSubitems.map((asset, index,) => {
				return <TableSubItem
					key={asset.id}
					row={asset}
					refetchData={refetchData}
					handleOpenDeleteModal={handleOpenDeleteModal}
					isLast={(((row.assets?.length ?? 0) - 1) === index)}
					isTableNamesShown={isTableNamesShown}
				/>
			},)}
		</>
	)
}
