
import * as React from 'react'
import {
	Link,
	useLocation,
	useParams,
} from 'react-router-dom'

import {
	RouterKeys,
} from '../../../../../router/keys'
import {
	Button, ButtonType, Color, Size,
} from '../../../../../shared/components'
import {
	ChevronRight,
	Coins,
} from '../../../../../assets/icons'

import * as styles from './header.styles'

export const BudgetDetailsHeader: React.FC = () => {
	const location = useLocation()
	const {
		id,
	} = useParams()
	const isOnBudgetDetailsPage = location.pathname.includes(`${RouterKeys.BUDGET_MANAGMENT}/${id}`,)
	return (
		<div className={styles.pageHeader}>
			<Link to={RouterKeys.BUDGET_MANAGMENT} className={styles.linkHeader}>
				<Button<ButtonType.TEXT>
					className={styles.button}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Budget management',
						size:     Size.SMALL,
						color:    Color.NONE,
						leftIcon: <Coins width={20} height={20} />,
					}}
				/>
			</Link>
			<ChevronRight width={20} height={20} />
			<Link to={`${RouterKeys.BUDGET_MANAGMENT}/${id}`} className={styles.linkHeader}>
				<Button<ButtonType.TEXT>
					className={styles.button}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Budget plan details',
						size:     Size.SMALL,
						color:    isOnBudgetDetailsPage ?
							Color.NON_OUT_BLUE :
							Color.NONE,
					}}
				/>
			</Link>
		</div>
	)
}