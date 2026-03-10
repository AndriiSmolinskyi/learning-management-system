
import * as React from 'react'

import {
	Button, ButtonType, Color, Size,
} from '../../../../../shared/components'
import {
	MoreVertical,
	XmarkMid,
} from '../../../../../assets/icons'
import type {
	IExpenseCategory,
} from '../../../../../shared/types'
import {
	BudgetExpenseCardDialog,
} from '../card-dialog/card-dialog.component'
import {
	getExpenseCategoryIcon,
} from '../../budget-details.utils'
import {
	formatBigNumber,
} from '../../../../../shared/utils'
import {
	useBudgetDetailsStore,
} from '../../budget-details.store'

import * as styles from './category-card.styles'

interface IProps {
	category: IExpenseCategory
	available: number | undefined
	toggleDeleteVisible: (id?: string) => void
	toggleAddTransaction: (expenseCategory: IExpenseCategory) => void
	toggleCategoryViewDetails: (expenseCategory: IExpenseCategory) => void
}
export const BudgetCategoryCard: React.FC<IProps> = ({
	category,
	available,
	toggleDeleteVisible,
	toggleAddTransaction,
	toggleCategoryViewDetails,
},): React.JSX.Element => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)
	const handlePopoverCondition = (): void => {
		setIsPopoverShown(!isPopoverShown,)
	}
	const {
		isYearly,
	} = useBudgetDetailsStore()

	const allocatedValue = isYearly ?
		category.budget * 12 :
		category.budget
	const actualValue = category.available === 0 ?
		0 :
		category.available + allocatedValue

	return (
		<div className={styles.cardWrapper}>
			<div className={styles.buttonWrapper}>
				<BudgetExpenseCardDialog
					id={category.id}
					toggleDeleteVisible={toggleDeleteVisible}
					handlePopoverCondition={handlePopoverCondition}
					toggleAddTransaction={toggleAddTransaction}
					toggleCategoryViewDetails={toggleCategoryViewDetails}
					category={category}
				>
					<Button<ButtonType.ICON>
						onClick={handlePopoverCondition}
						className={styles.dotsButton}
						additionalProps={{
							btnType: ButtonType.ICON,
							size:    Size.SMALL,
							color:   Color.SECONDRAY_GRAY,
							icon:    isPopoverShown ?
								<XmarkMid width={20} height={20} />			:
								<MoreVertical width={20} height={20} />	,
						}}
					/>
				</BudgetExpenseCardDialog>
			</div>
			{getExpenseCategoryIcon(category.name,)}
			<p className={styles.categoryName}>{category.name}</p>
			<div className={styles.infoWrapper}>
				<div className={styles.infoBlock}>
					<p className={styles.infoText}>Allocated:</p>
					<p className={styles.allocatedNumber}>${formatBigNumber(allocatedValue,)}</p>
				</div>
				<div className={styles.infoBlock}>
					<p className={styles.infoText}>Actual:</p>
					<p className={styles.availableNumber(actualValue >= allocatedValue,)}>
						${formatBigNumber(actualValue,)}
					</p>
				</div>
			</div>
		</div>
	)
}