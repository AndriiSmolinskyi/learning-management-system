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
	useMetalsStore,
} from '../metals.store'
import type {
	IMetalAssetExtended,
} from '../../../../services/analytics/analytics.types'
import {
	MetalType,
} from '../../../../shared/types'
import {
	Redo,
} from '../../../../assets/icons'

import * as styles from '../metals.styles'

type Props = {
	row: IMetalAssetExtended
	refetchData: () => void
	handleRowClicked: () => void
	handleOpenDeleteModal: (assetId: string) => void
	shouldShowEtfColumns: boolean
	shouldShowDirectColumns: boolean
	isTableNamesShown: boolean
}

export const TableItem: React.FC<Props> = ({
	row,
	refetchData,
	handleRowClicked,
	handleOpenDeleteModal,
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
	const [showSubItems, setShowSubItems,] = React.useState(false,)

	const handleRowClick = React.useCallback((e: React.MouseEvent<HTMLTableRowElement>,): void => {
		const drawer = document.querySelector('.bp5-overlay',)
		if (drawer && drawer.contains(e.target as Node,)) {
			return
		}

		if (!row.assets) {
			setBankId(undefined,)
			setCurrency(undefined,)

			const currentSelected = filter.assetIds ?? []
			const isSelected = currentSelected.includes(row.id,)

			if (isSelected) {
				const next = currentSelected.filter((id,) => {
					return id !== row.id
				},)
				setAssetIds(next.length ?
					next :
					undefined,)
			} else {
				setAssetIds([...currentSelected, row.id,],)
			}

			return
		}

		setBankId(undefined,)
		setCurrency(undefined,)

		const allAssetIds = row.assets.map((asset,) => {
			return asset.id
		},)
		const currentSelected = filter.assetIds ?? []

		const areAllSelected = allAssetIds.every((id,) => {
			return currentSelected.includes(id,)
		},)

		if (areAllSelected) {
			setAssetIds(currentSelected.filter((id,) => {
				return !allAssetIds.includes(id,)
			},),)
		} else {
			const toAdd = allAssetIds.filter((id,) => {
				return !currentSelected.includes(id,)
			},)
			setAssetIds([...currentSelected, ...toAdd,],)
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
				return filter.assetIds?.includes(asset.id,)
			},)
		}
		return Boolean(filter.assetIds?.includes(row.id,),)
	}, [row, filter.assetIds,],)
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
						<div className={styles.cellContent}>{row.issuer ?
							row.issuer === 'N/A' ?
								<span className={styles.empty}>- -</span> :
								row.issuer :
							<span className={styles.empty}>- -</span>}</div>
					</td>
				)}
				{shouldShowEtfColumns && (
					<td className={styles.tableCell}>
						<div className={styles.cellContent}>
							{row.isTransferred && row.productType === MetalType.ETF && <Redo width={16} height={16} className={styles.transferIcon}/>}
							{row.isin ?? <span className={styles.empty}>- -</span>}
						</div>
					</td>
				)}
				{shouldShowEtfColumns && (
					<td className={styles.tableCell}>
						<div className={styles.cellContent}>{row.security ?? <span className={styles.empty}>- -</span>}</div>
					</td>
				)}
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>{row.assets ?
						row.assets[0]?.currency :
						row.currency}</div>
				</td>
				<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
					<div className={styles.cellContent}>{row.units ?
						formatWithAllDecimals(row.units,) :
						<span className={styles.empty}>- -</span>}</div>
				</td>
				{shouldShowDirectColumns && (<td className={styles.tableCell}>{row.isTransferred && row.productType === MetalType.DIRECT_HOLD && <Redo width={16} height={16} className={styles.transferIcon}/>}{row.metalType ?
					row.metalType :
					<span className={styles.empty}>- -</span>}</td>)}
				{shouldShowDirectColumns && (<td className={styles.tableCell}>{row.metalName ?
					row.metalName :
					<span className={styles.empty}>- -</span>}</td>)}
				<td className={cx(styles.tableCell, styles.tableNumberField,)}>
					{row.costPrice ?
						row.costPrice % 1 === 0 ?
							localeString(row.costPrice, '', 2,) :
							localeString(row.costPrice, '', 2,) :
						<span className={styles.empty}>- -</span>}
				</td>
				<td className={cx(styles.tableCell, styles.tableNumberField,)}>{
					row.currentStockPrice ?
						localeString(row.currentStockPrice, 'USD', 2, true,) :
						<span className={styles.empty}>- -</span>}
				</td>
				<td className={cx(styles.tableCell, styles.tableNumberField,)}>{row.costValueFC ?
					localeString(row.costValueFC, '', 0, false,) :
					<span className={styles.empty}>- -</span>}</td>
				<td className={cx(styles.tableCell, styles.tableNumberField,)}>{row.costValueUsd ?
					localeString(row.costValueUsd, 'USD', 0, false,) :
					<span className={styles.empty}>- -</span>}</td>
				<td className={cx(styles.tableCell, styles.tableNumberField,)}>{row.marketValueFC ?
					localeString(row.marketValueFC, '', 0, false,) :
					<span className={styles.empty}>- -</span>}</td>
				<td className={cx(styles.tableCell, styles.tableNumberField,)}>{row.marketValueUsd ?
					localeString(row.marketValueUsd, 'USD', 0, false,) :
					<span className={styles.empty}>- -</span>}</td>
				<td className={cx(styles.tableCell, styles.amountColor(row.profitUsd ?
					row.profitUsd >= 0 :
					false,), styles.tableNumberField,)}>
					{row.profitUsd ?
						localeString(row.profitUsd, 'USD', 0, false,) :
						'0'}
				</td>
				<td className={cx(styles.tableCell, styles.amountColor(row.profitPercentage ?
					row.profitPercentage >= 0 :
					false,), styles.tableNumberField,)}>
					{row.profitPercentage ?
						localeString(row.profitPercentage, '', 2,) :
						'0'}%
				</td>
				<td className={cx(styles.tableCell,)}>{row.productType === MetalType.ETF ?
					row.country ?
						row.country :
						'Global' :
					'Global'}
				</td>
				<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
					<div className={styles.cellContent}>{row.assets ?
						<span className={styles.empty}>- -</span> :
						row.valueDate ?
							format(row.valueDate, 'dd.MM.yyyy',) :
							sortedSubitems[0]?.valueDate ?
								format(sortedSubitems[0].valueDate, 'dd.MM.yyyy',) :
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
					shouldShowDirectColumns={shouldShowDirectColumns}
					shouldShowEtfColumns={shouldShowEtfColumns}
					isTableNamesShown={isTableNamesShown}
				/>
			},)}
		</>
	)
}
