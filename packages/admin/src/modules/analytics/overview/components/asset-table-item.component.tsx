/* eslint-disable no-nested-ternary */
import React from 'react'

import {
	useOverviewStore,
} from '../overview.store'
import type {
	TOverviewAssetAnalytics, TOverviewProps,
} from '../../../../services/analytics/analytics.types'
import {
	localeString,
} from '../../../../shared/utils'
import {
	AssetNamesType,
} from '../../../../shared/types'
import * as styles from '../overview.styles'

type Props = {
	data: TOverviewAssetAnalytics
	totalValue: number
	handleRowClick?: (data: TOverviewAssetAnalytics) => void
	assetCombinedFilter?: TOverviewProps
}

export const AssetTableItem: React.FC<Props> = ({
	data,
	totalValue,
	handleRowClick,
	assetCombinedFilter,
},) => {
	const {
		filter,
	} = useOverviewStore()
	return (
		<div
			className={styles.smallItemContainer(Boolean(filter.tableAssetNames?.includes(data.assetName,),),)}
			onClick={() => {
				handleRowClick?.(data,)
			}}
		>
			<p className={styles.smallTableCell}>
				{data.assetName === AssetNamesType.EQUITY_ASSET ?
					'Equity' :
					data.assetName === AssetNamesType.PRIVATE_EQUITY ?
						'PE' :
						data.assetName
				}
			</p>
			<p className={styles.smallTableCellNumber}>
				{assetCombinedFilter?.currencies?.length === 1 ?
					['BTC', 'ETH',].includes(String(assetCombinedFilter.currencies[0],),) ?
						(
							localeString(data.currencyValue, '', 2, true,)
						) :
						(
							localeString(data.currencyValue, '', 0, false,)
						) :
					null
				}
			</p>
			<p className={styles.smallTableCellNumber}>
				{localeString(data.usdValue, 'USD', 0, false,)}
			</p>
			<p className={styles.smallTableCellNumber}>
				{totalValue ?
					(data.usdValue / totalValue * 100).toFixed(2,) :
					0}%
			</p>
		</div>
	)
}
