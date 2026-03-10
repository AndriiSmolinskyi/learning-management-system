/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
import React from 'react'
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
	useEquityStore,
} from '../equities.store'
import type {
	IAnalyticsEquity,
} from '../../../../services/analytics/analytics.types'
import {
	Redo,
} from '../../../../assets/icons'
import {
	format,
} from 'date-fns'

import * as styles from '../equities.styles'

type Props = {
	row: IAnalyticsEquity
	refetchData: () => void
	handleOpenDeleteModal: (assetId: string) => void
	handleRowClicked: () => void
	isTableNamesShown: boolean
}

export const TableItem: React.FC<Props> = ({
	row,
	refetchData,
	handleRowClicked,
	handleOpenDeleteModal,
	isTableNamesShown,
},) => {
	const {
		filter,
		setBankId,
		setCurrency,
		setAssetId,
	} = useEquityStore()
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
					filter.assetId.length === 1 ?
						undefined :
						filter.assetId.filter((item,) => {
							return item !== row.id
						},) :
					[...(filter.assetId ?? []), row.id,],
			)
			return
		}

		setBankId(undefined,)
		setCurrency(undefined,)

		const allAssetIds = row.assets.map((asset,) => {
			return asset.id
		},)
		const currentSelected = filter.assetId ?? []

		const areAllSelected = allAssetIds.every((id,) => {
			return currentSelected.includes(id,)
		},)

		if (areAllSelected) {
			setAssetId(currentSelected.filter((id,) => {
				return !allAssetIds.includes(id,)
			},),)
		} else {
			const toAdd = allAssetIds.filter((id,) => {
				return !currentSelected.includes(id,)
			},)
			setAssetId([...currentSelected, ...toAdd,],)
		}
	}, [filter,],)

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
				className={styles.tableRow(isRowHighlighted, showSubItems, false,Boolean(row.assets,),)}
				onClick={handleRowClick}
			>
				<td className={styles.tableBtnCell}>
					{(row.assets ?
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
					<div className={styles.cellContent}>{row.equityType}</div>
				</td>
				<td className={styles.tableCellMinimized}>
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
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>{row.issuer}</div>
				</td>
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>{row.isTransferred && <Redo width={16} height={16} className={styles.transferIcon}/>}{row.isin}</div>
				</td>
				<td className={styles.tableCellMinimized}>
					<div className={styles.cellContent}>{row.security}</div>
				</td>
				<td className={styles.tableCellMinimized}>{row.assets ?
					row.assets[0]?.currency :
					row.currency}</td>
				<td className={cx(styles.tableCellMinimized, styles.tableNumberField,)}>{formatWithAllDecimals(row.units,)}</td>
				<td className={cx(styles.tableCellMinimized, styles.tableNumberField,)}>
					{row.costPrice % 1 === 0 ?
						localeString(row.costPrice, '', 2,) :
						localeString(row.costPrice, '', 2,)}
				</td>
				<td className={cx(styles.tableCellMinimized, styles.tableNumberField,)}>
					{localeString(row.currentStockPrice, '', 2,)}
				</td>
				<td className={cx(styles.tableProfitCellMinimized, styles.tableNumberField,)}>
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
					{localeString(row.profitPercentage, '', 2,)}%
				</td>
				<td className={styles.tableCellMinimized}>
					<div className={styles.cellContent}>{row.country ?
						row.country :
						<span className={styles.empty}>- -</span>}</div>
				</td>
				<td className={styles.tableCellMinimized}>
					<div className={styles.cellContent}>
						{(!row.sector || row.sector === 'Undefined' || row.sector === 'N/A') ?
							<span className={styles.empty}>- -</span> :
							row.sector
						}
					</div>
				</td>
				<td className={cx(styles.tableCellMinimized, styles.textNowrap, styles.tableNumberField,)}>
					{row.assets ?
						<span className={styles.empty}>- -</span> :
						row.valueDate ?
							format(row.valueDate, 'dd.MM.yyyy',) :
							sortedSubitems[0]?.valueDate ?
								format(sortedSubitems[0].valueDate, 'dd.MM.yyyy',) :
								<span className={styles.empty}>- -</span>}
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
