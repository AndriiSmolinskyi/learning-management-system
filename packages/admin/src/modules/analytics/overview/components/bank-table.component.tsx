/* eslint-disable no-nested-ternary */
import React from 'react'

import {
	BankTableHeader,
} from './bank-table-header.component'
import {
	BankTableItem,
} from './bank-table-item.component'

import {
	useOverviewStore,
} from '../overview.store'
import {
	SortOrder,
} from '../../../../shared/types'
import type {
	TOverviewTableFilter,
} from '../overview.types'
import {
	TOverviewSortVariants,
} from '../overview.types'
import {
	sortOverviewList,
} from '../overview.utils'
import type {
	TBankAnalytics,
} from '../../../../services/analytics/analytics.types'
import {
	localeString,
} from '../../../../shared/utils'

import * as styles from '../overview.styles'

type Props = {
	data: Array<TBankAnalytics>
	handleRowClick?: (data: TBankAnalytics) => void
}

export const BankTable: React.FC<Props> = ({
	data,
	handleRowClick,
},) => {
	const {
		filter: filterStore,
	} = useOverviewStore()
	const tableRef = React.useRef<HTMLTableElement>(null,)
	const tbodyRef = React.useRef<HTMLTableSectionElement>(null,)
	const [isTbodyEmpty, setIsTbodyEmpty,] = React.useState(true,)
	const [filter, setFilter,] = React.useState<TOverviewTableFilter>({
		sortBy:    TOverviewSortVariants.USD_VALUE,
		sortOrder: SortOrder.DESC,
	},)
	const totalUsdValue = data.filter((item,) => {
		return isItemSelected(item, filterStore.tableBankIds, filterStore.tableAccountIds,)
	},).reduce<number>((acc, item,) => {
		return item.usdValue + acc
	}, 0,)

	const initialTotalUsdValue = data.reduce<number>((acc, item,) => {
		return item.usdValue + acc
	}, 0,)

	const mergeBanks = (data: Array<TBankAnalytics>,): Array<TBankAnalytics> => {
		return Object.values(
			data.reduce<Record<string, TBankAnalytics>>((acc, item,) => {
				const existing = acc[item.id]

				if (existing) {
					existing.usdValue = existing.usdValue + item.usdValue
				} else {
					acc[item.id] = {
						id:       item.id,
						bankName: item.bankName,
						usdValue: item.usdValue,
					}
				}
				return acc
			}, {
			},),
		).sort((a, b,) => {
			return b.usdValue - a.usdValue
		},)
	}

	const merged = mergeBanks(data,)
	const sortedList = sortOverviewList(merged, filter,)

	const checkTbodyHeight = (): void => {
		if (tbodyRef.current && tableRef.current) {
			const tableHeight = tableRef.current.offsetHeight
			const tbodyScrollHeight = tbodyRef.current.scrollHeight
			setIsTbodyEmpty((tableHeight - tbodyScrollHeight - 43.99 - 43.99) > 0,)
		}
	}
	const usdValue = sortedList.reduce((acc, item,) => {
		return acc + item.usdValue
	}, 0,)

	React.useEffect(() => {
		checkTbodyHeight()
		const handleResize = (): void => {
			checkTbodyHeight()
		}
		window.addEventListener('resize', handleResize,)
		return () => {
			window.removeEventListener('resize', handleResize,)
		}
	}, [sortedList,],)
	const rowHeight = 44
	React.useEffect(() => {
		const table = tbodyRef.current
		if (!table) {
			return undefined
		}
		const onWheel: (e: WheelEvent) => void = (e,) => {
			e.preventDefault()
			table.scrollTop = table.scrollTop + (Math.sign(e.deltaY,) * rowHeight)
		}
		table.addEventListener('wheel', onWheel, {
			passive: false,
		},)
		return (): void => {
			table.removeEventListener('wheel', onWheel,)
		}
	}, [],)
	const uniqueBanksCount = data.filter(
		(item, index, self,) => {
			return index === self.findIndex((t,) => {
				return t.id === item.id
			},)
		},
	).length
	return (
		<div className={styles.bankTableWrapper} ref={tableRef}>
			<BankTableHeader
				filter={filter}
				setFilter={setFilter}
				isTbodyEmpty={isTbodyEmpty}
			/>
			<div className={styles.bankTable} ref={tbodyRef}>
				{sortedList.map((item, index,) => {
					return <BankTableItem
						key={item.id}
						data={item}
						initialTotalUsdValue={initialTotalUsdValue}
						handleRowClick={handleRowClick}
						isLast={((sortedList.length - 1) === index)}
					/>
				},)
				}
			</div>
			<div className={styles.entityTableFooter}>
				<p className={styles.entityTotalCell}>Total: {uniqueBanksCount}</p>
				<p className={styles.entityTableValueCell(isTbodyEmpty,)}>
					{Boolean(sortedList.length === 1,) ?
						localeString((usdValue), 'USD', 0, false,) :
						totalUsdValue ?
							localeString((totalUsdValue), 'USD', 0, false,) :
							'$0'}
				</p>
			</div>
		</div>
	)
}

const isItemSelected = (
	item: TBankAnalytics,
	tableBankIds?: Array<string>,
	tableAccountIds?: Array<string>,
): boolean => {
	if (!tableBankIds && !tableAccountIds) {
		return true
	}

	const matchesBank = Boolean(tableBankIds?.includes(item.id,),)
	const matchesAccount = Boolean(tableAccountIds?.includes(item.accountId ?? '',),)
	return matchesBank || matchesAccount
}
