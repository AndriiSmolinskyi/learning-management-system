import React from 'react'

import {
	SearchEmptyState,
} from '../../../../assets/icons'
import {
	Button, ButtonType, Color, Size,
} from '../../../../shared/components'

import {
	useReportStore,
} from '../reports.store'
import type {
	TReportSearch,
} from '../reports.types'

import * as styles from '../../../operations/requests/requests.styles'

type Props = {
	setReportFilter: React.Dispatch<React.SetStateAction<TReportSearch | undefined>>
}

export const EmptyFilter: React.FC<Props> = ({
	setReportFilter,
},) => {
	const {
		resetReportStore,
	} = useReportStore()

	return (
		<div className={styles.emptyContainer}>
			<SearchEmptyState width={164} height={164}/>
			<p className={styles.emptyText}>No results found. Try a different search or filter</p>
			<Button<ButtonType.TEXT>
				onClick={() =>	{
					resetReportStore()
					setReportFilter(undefined,)
				}}
				additionalProps={{
					btnType:  ButtonType.TEXT,
					text:     'Clear',
					size:     Size.SMALL,
					color:    Color.SECONDRAY_GRAY,
				}}
			/>
		</div>
	)
}
