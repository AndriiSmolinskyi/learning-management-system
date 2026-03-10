/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	ItemDetails,
} from './item-details'
import {
	formatWithAllDecimals,
	localeString,
} from '../../../../shared/utils'
import {
	useCryptoStore,
} from '../crypto.store'
import {
	getProductTypeValue,
	getISINValue,
	getSecurityValue,
	getCurrencyValue,
	getCurrentStockPriceValue,
	getUnitsValue,
	getValueInCryptoValue,
	getValueDateValue,
} from '../crypto.utils'
import type {
	IAnalyticCrypto,
} from '../../../../services/analytics/analytics.types'
import {
	Button, ButtonType, Color, Size,
} from '../../../../shared/components'
import {
	ChevronDown, ChevronUpBlue,
} from '../../../../assets/icons'
import {
	TableSubItem,
} from './table-sub-item.component'
import {
	format,
} from 'date-fns'
import {
	CryptoType,
} from '../../../../shared/types'
import {
	Redo,
} from '../../../../assets/icons'

import * as styles from '../crypto.styles'

type Props = {
	row: IAnalyticCrypto
	refetchData: () => void
	handleOpenDeleteModal: (assetId: string) => void
	shouldShowEtfColumns: boolean
	shouldShowDirectColumns: boolean
	isTableNamesShown: boolean
}

export const TableItem: React.FC<Props> = ({
	row,
	refetchData,
	handleOpenDeleteModal,
	shouldShowEtfColumns,
	shouldShowDirectColumns,
	isTableNamesShown,
},) => {
	const [showSubItems, setShowSubItems,] = React.useState(false,)

	const {
		filter,
		setCryptoWallets,
		setCurrency,
		setAssetId,
	} = useCryptoStore()

	const handleRowClick = React.useCallback((e: React.MouseEvent<HTMLTableRowElement>,): void => {
		const drawer = document.querySelector('.bp5-overlay',)
		if (drawer && drawer.contains(e.target as Node,)) {
			return
		}

		if (!row.assets) {
			setCryptoWallets(undefined,)
			setCurrency(undefined,)

			const currentSelected = filter.assetId ?? []
			const isSelected = currentSelected.includes(row.id,)

			if (isSelected) {
				const next = currentSelected.filter((id,) => {
					return id !== row.id
				},)
				setAssetId(next.length ?
					next :
					undefined,)
			} else {
				setAssetId([...currentSelected, row.id,],)
			}

			return
		}

		setCryptoWallets(undefined,)
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
				className={styles.tableRow(isRowHighlighted, showSubItems, false, Boolean(row.assets,),)}
				onClick={handleRowClick}
			>
				<td className={styles.tableBtnCell}>
					{(row.assets ?
						(
							<Button<ButtonType.ICON>
								onClick={(e,) => {
									e.stopPropagation()
									setShowSubItems(!showSubItems,)
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
					<div className={styles.cellContent}>{getProductTypeValue(row,)}</div>
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
				{shouldShowEtfColumns && <td className={styles.tableCell}>
					<div className={styles.cellContent}>{row.issuer ?? <span className={styles.empty}>- -</span>}</div>
				</td>}
				{shouldShowEtfColumns && (
					<td className={styles.tableCell}>
						<div className={styles.cellContent}>{row.isTransferred && row.isin && <Redo width={16} height={16} className={styles.transferIcon}/>}{getISINValue(row,)}</div>
					</td>
				)}
				{shouldShowEtfColumns && (
					<td className={styles.tableCell}>
						<div className={styles.cellContent}>{getSecurityValue(row,)}</div>
					</td>
				)}
				{shouldShowDirectColumns && (
					<td className={styles.tableCell}>
						<div className={styles.cellContent}>{row.isTransferred && !row.isin && <Redo width={16} height={16} className={styles.transferIcon}/>}{row.cryptoCurrencyType ?
							row.cryptoCurrencyType :
							<span className={styles.empty}>- -</span>}</div>
					</td>
				)}
				{shouldShowEtfColumns && (
					<td className={styles.tableCell}>
						<div className={styles.cellContent}>{getCurrencyValue(row,)}</div>
					</td>
				)}
				<td className={cx(styles.tableCell, styles.tableNumberField,)}>
					<div className={styles.cellContent}>{row.productType === CryptoType.ETF ?
						getUnitsValue(row, row.operation,) :
						getValueInCryptoValue(row,)}</div>
				</td>
				<td className={cx(styles.tableCell, styles.tableNumberField,)}>
					<div className={styles.cellContent}>{row.costPrice ?
						localeString(Number(row.costPrice,), '', 2, true,) :
						row.purchasePrice ?
							formatWithAllDecimals(Number(row.purchasePrice,),) :
							<span className={styles.empty}>- -</span>}</div>
				</td>
				<td className={cx(styles.tableCell, styles.tableNumberField,)}>
					<div className={styles.cellContent}>
						{localeString(Number(getCurrentStockPriceValue(row,),), '', 2, true,)}
					</div>
				</td>
				<td className={cx(styles.tableCell, styles.tableNumberField,)}>
					<div className={styles.cellContent}>{localeString(row.costValueUsd, 'USD', 0, false,)}</div>
				</td>
				<td className={cx(styles.tableCell, styles.tableNumberField,)}>
					<div className={styles.cellContent}>{localeString(row.marketValueUsd, 'USD', 0, false,)}</div>
				</td>
				<td className={cx(styles.tableCell, styles.amountColor(row.profitUsd >= 0,), styles.tableNumberField,)}>
					{localeString(row.profitUsd, 'USD', 0, false,)}
				</td>
				<td className={cx(styles.tableCell, styles.amountColor(row.profitPercentage >= 0,), styles.tableNumberField,)}>
					{localeString(row.profitPercentage, '', 2,)}%
				</td>
				{shouldShowEtfColumns && (
					<td className={styles.tableCell}>
						<div className={styles.cellContent}>{row.country ?? 'Global'}</div>
					</td>
				)}
				{shouldShowDirectColumns && (
					<td className={styles.tableCell}>
						<div className={styles.cellContent}>
							{row.exchangeWallet && row.exchangeWallet !== 'N/A' ?
								row.exchangeWallet :
								<span className={styles.empty}>- -</span>
							}
						</div>
					</td>
				)}
				<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField, styles.paddingRight16px,)}>
					{row.assets ?
						<span className={styles.empty}>- -</span> :
						row.valueDate ?
							getValueDateValue(row,) :
							sortedSubitems[0]?.valueDate ?
								format(sortedSubitems[0].valueDate, 'dd.MM.yyyy',) :
								format(row.purchaseDate, 'dd.MM.yyyy',)}
				</td>
				<td className={styles.tableCell}>
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
