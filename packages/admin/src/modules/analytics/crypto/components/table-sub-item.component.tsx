/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
import React from 'react'
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
	AssetOperationType, CryptoType,
} from '../../../../shared/types'
import type {
	IAnalyticCrypto,
} from '../../../../services/analytics/analytics.types'
import {
	format,
} from 'date-fns'
import {
	useCryptoStore,
} from '../crypto.store'

import * as styles from '../crypto.styles'
import {
	getUnitsValue, getValueInCryptoValue,
} from '../crypto.utils'

type Props = {
	row: IAnalyticCrypto
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
		setCryptoWallets,
		setCurrency,
		setAssetId,
		productType,
	} = useCryptoStore()

	const handleRowClick = React.useCallback((e: React.MouseEvent<HTMLTableRowElement>,): void => {
		const drawer = document.querySelector('.bp5-overlay',)
		if (drawer && drawer.contains(e.target as Node,)) {
			return
		}
		setCryptoWallets(undefined,)
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
			{productType.isETF && <td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.issuer ?? <span className={styles.empty}>- -</span>}</div>
			</td>}
			{productType.isETF && <td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.isin ?? <span className={styles.empty}>- -</span>}</div>
			</td>}
			{productType.isETF && <td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.security ?? <span className={styles.empty}>- -</span>}</div>
			</td>}
			{productType.isDirectHold && (
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>{row.cryptoCurrencyType ?
						row.cryptoCurrencyType :
						<span className={styles.empty}>- -</span>}</div>
				</td>
			)}
			{productType.isETF && <td className={styles.tableCell}>{row.currency}</td>}

			<td className={cx(styles.tableCell, styles.amountColor(row.operation === AssetOperationType.BUY,), styles.tableNumberField,)}>{row.productType === CryptoType.ETF ?
				getUnitsValue(row, row.operation,) :
				getValueInCryptoValue(row,)}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				{row.costPrice && formatWithAllDecimals(row.costPrice,)}
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				<span className={styles.empty}>- -</span>
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				{localeString(row.costValueUsd, '', 0,false,)}
			</td>
			<td className={cx(styles.tableCell,styles.tableNumberField,)}>
				<span className={styles.empty}>- -</span>
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				<span className={styles.empty}>- -</span>
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				<span className={styles.empty}>- -</span>
			</td>
			{productType.isETF && <td className={styles.tableCell}>
				<span className={styles.empty}>- -</span>
			</td>}
			{productType.isDirectHold && (
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>
						{row.exchangeWallet && row.exchangeWallet !== 'N/A' ?
							row.exchangeWallet :
							<span className={styles.empty}>- -</span>
						}
					</div>
				</td>
			)}
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,styles.paddingRight16px,)}>
				{row.valueDate ?
					format(row.valueDate, 'dd.MM.yyyy',) :
					<span className={styles.empty}>- -</span>}
			</td>
			<td className={styles.tableCell}></td>
		</tr>
	)
}
