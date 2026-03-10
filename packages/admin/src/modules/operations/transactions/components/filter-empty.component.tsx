import React from 'react'

import {
	SearchEmptyState,
} from '../../../../assets/icons'
import {
	Button, ButtonType, Color, Size,
} from '../../../../shared/components'

import {
	useTransactionStore,
} from '../transaction.store'
import {
	useOperationsFilterStore,
} from '../../layout/components/filter/filter.store'
import * as styles from '../transactions.styles'

export const FilterEmpty: React.FC = () => {
	const {
		resetTransactionStore,
	} = useTransactionStore()
	const {
		resetOperationsFilterStore,
	} = useOperationsFilterStore()

	const handleClearStore = (): void => {
		resetTransactionStore()
		resetOperationsFilterStore()
	}

	return (
		<div className={styles.emptyContainer}>
			<SearchEmptyState width={164} height={164}/>
			<p className={styles.emptyText}>No results found. Try a different search or filter</p>
			<Button<ButtonType.TEXT>
				onClick={handleClearStore}
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
