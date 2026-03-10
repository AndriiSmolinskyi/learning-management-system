/* eslint-disable complexity */
import React from 'react'

import {
	useOverviewStore,
} from '../overview.store'
import type {
	TBankAnalytics,
} from '../../../../services/analytics/analytics.types'
import {
	localeString, toggleState,
} from '../../../../shared/utils'
import {
	Button, ButtonType, Color, Size,
} from '../../../../shared/components'
import {
	ChevronDown, ChevronUpBlue,
} from '../../../../assets/icons'

import * as styles from '../overview.styles'

type Props = {
	dataList: Array<TBankAnalytics>
	initialTotalUsdValue: number
	handleRowClick?: (data: TBankAnalytics) => void
	children: React.ReactNode
}

export const BankTableSubItem: React.FC<Props> = ({
	dataList,
	initialTotalUsdValue,
	handleRowClick,
	children,
},) => {
	const [showSubItems, setShowSubItems,] = React.useState(false,)

	const toggleSubItems = toggleState(setShowSubItems,)

	const {
		filter,
		setPieBankIds,
	} = useOverviewStore()
	const usdValue = dataList.reduce((acc, item,) => {
		return acc + item.usdValue
	}, 0,)
	const [data,] = dataList
	const hasMoreThenOne = dataList.length > 1

	const handleBankLevelClick = React.useCallback(() => {
		if (data && handleRowClick) {
			const bankLevelData: TBankAnalytics = {
				...data,
				accountId:   undefined,
				accountName: hasMoreThenOne ?
					'Accounts group' :
					data.accountName,
			}
			handleRowClick(bankLevelData,)
			setPieBankIds([bankLevelData.id,],)
		}
	}, [data, handleRowClick, hasMoreThenOne,],)

	const handleToggleClick = React.useCallback((e: React.MouseEvent,) => {
		e.stopPropagation()
		toggleSubItems()
	}, [toggleSubItems,],)

	const hasSelectedAccounts = React.useMemo(() => {
		if (!filter.tableAccountIds) {
			return false
		}
		return filter.tableAccountIds.some((accountId,) => {
			return dataList.some((item,) => {
				return item.accountId === accountId
			},)
		},
		)
	}, [filter.tableAccountIds, dataList,],)

	const isBankSelected = Boolean(filter.tableBankIds?.includes(data?.id ?? '',),)
	const isHighlighted = isBankSelected || hasSelectedAccounts

	return (
		<>
			<div
				className={styles.currencyItemContainer(isHighlighted,)}
				onClick={handleBankLevelClick}
			>
				<div className={styles.bankButtonTableCell(showSubItems,)}>
					{hasMoreThenOne &&
						(
							<Button<ButtonType.ICON>
								onClick={handleToggleClick}
								className={styles.toggleBtn}
								additionalProps={{
									btnType: ButtonType.ICON,
									icon:    showSubItems ?
										<ChevronUpBlue width={20} height={20} /> :
										<ChevronDown width={20} height={20} />,
									size:  Size.SMALL,
									color: Color.NON_OUT_BLUE,
								}}
							/>)
					}
				</div>
				<p className={styles.bigTableCell(showSubItems,)}>
					{data?.bankName}
				</p>
				<p className={styles.bigTableCellNumber(showSubItems,)}>
					{localeString(usdValue, 'USD', 0, false,)}
				</p>
				<p className={styles.bigTableCellNumber(showSubItems,)}>
					{initialTotalUsdValue ?
						(usdValue / initialTotalUsdValue * 100).toFixed(2,) :
						0}%
				</p>
			</div>
			{showSubItems && hasMoreThenOne && children}
		</>
	)
}
