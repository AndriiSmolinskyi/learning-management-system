import React from 'react'

import {
	SearchEmptyState,
} from '../../../assets/icons'
import * as styles from './list.styles'

export const FilterEmpty: React.FC = () => {
	return (
		<div className={styles.emptyContainer}>
			<SearchEmptyState width={164} height={164} />
			<p className={styles.emptyText}>No results found.</p>
		</div>
	)
}