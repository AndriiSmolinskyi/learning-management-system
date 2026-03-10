
import * as React from 'react'

import * as styles from './styles'

export const AddBudgetPlanHeader: React.FC = () => {
	return (
		<div className={styles.addBudgetHeader}>
			<p className={styles.addHeaderTitle}>Create new budget plan</p>
		</div>
	)
}