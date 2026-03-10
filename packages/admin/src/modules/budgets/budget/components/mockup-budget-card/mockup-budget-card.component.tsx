
import * as React from 'react'
import {
	ClientsRoute,
} from '../../../../../assets/icons'
import type {
	IBudgetPlan,
} from '../../../../../shared/types'
import {
	formatBigNumber,
} from '../../../../../shared/utils'

import * as styles from './mockup-budget-card.styles'

interface IBudgetCardProps {
	budget: IBudgetPlan
}

export const MockupBudgetCard: React.FC<IBudgetCardProps> = ({
	budget,
},) => {
	return (
		<div className={styles.cardWrapper()}>
			<div className={styles.cardHeader(budget.isActivated,)}>
				<p>
					Creating<span className={styles.dotAnimation()}/>
				</p>
				<p>
					{budget.name}
				</p>
			</div>
			<div className={styles.clientBlock}>
				<ClientsRoute/>
				<p>
					{budget.clientName}
				</p>
			</div>
			<div className={styles.footerBlock}>
				<div className={styles.totalBlock}>
					<p className={styles.totalTitle}>Total in banks:</p>
					<p className={styles.totalBanks(budget.isActivated,)}>${formatBigNumber(budget.totalBanks,)	}</p>
				</div>
				<div className={styles.totalBlock}>
					<p className={styles.totalTitle}>Expected Monthly Income:</p>
					<p className={styles.totalManage(Boolean(budget.totalManage > 0,), budget.isActivated,)}>${budget.isActivated ?
						formatBigNumber(budget.totalManage,)			 :
						0}</p>
				</div>
			</div>
		</div>
	)
}