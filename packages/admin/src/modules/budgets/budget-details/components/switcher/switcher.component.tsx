
import * as React from 'react'

import {
	Button, ButtonType,
	Color,
	Size,
} from '../../../../../shared/components'

import * as styles from './switcher.styles'
import {
	useBudgetDetailsStore,
} from '../../budget-details.store'

enum BudgetSwitcherEnum {
	MONTHLY = 'Monthly',
	ANNUALLY = 'Annually',
}

export const BudgetAnnualSwitcher: React.FC = () => {
	const {
		isYearly, setIsYearly,
	} = useBudgetDetailsStore()

	const handleClick = (id: string,): void => {
		setIsYearly(id === BudgetSwitcherEnum.ANNUALLY,)
	}
	return (
		<div className={styles.container}>
			<div className={styles.buttonsWrapper}>
				{[
					{
						id: BudgetSwitcherEnum.MONTHLY, label: BudgetSwitcherEnum.MONTHLY,
					},
					{
						id: BudgetSwitcherEnum.ANNUALLY, label: BudgetSwitcherEnum.ANNUALLY,
					},
				].map(({
					id, label,
				},) => {
					return (
						<Button<ButtonType.TEXT>
							key={id}
							onClick={() => {
								handleClick(id,)
							}}
							className={styles.filterButton(isYearly === (id === BudgetSwitcherEnum.ANNUALLY),)}
							additionalProps={{
								btnType:   ButtonType.TEXT,
								text:      label,
								size:      Size.SMALL,
								color:   isYearly === (id === BudgetSwitcherEnum.ANNUALLY) ?
									Color.BLUE :
									Color.NONE,
							}}
						/>
					)
				},)}
			</div>
		</div>
	)
}