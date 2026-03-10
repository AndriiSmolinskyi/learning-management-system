
import * as React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../../../shared/components'
import {
	NextButton,
	PrevButton,
} from '../../../../../../shared/components'
import type {
	BudgetPlanFormValues,
	StepType,
} from '../../../../budget/budget.types'
import {
	useBudgetStore,
} from '../../../budget.store'
import {
	localeString,
} from '../../../../../../shared/utils'

import * as styles from './styles'

interface IAddBudgetPlanFooterProps {
	handlePrev: () => void
	handleNext: () => void
	step: StepType
	isValid: boolean
	handleSaveDraft: () => void
	values: BudgetPlanFormValues
}

export const AddBudgetPlanFooter: React.FC<IAddBudgetPlanFooterProps> = ({
	handlePrev,
	handleNext,
	isValid,
	step,
	handleSaveDraft,
	values,
},) => {
	const {
		total,
	} = useBudgetStore()
	const isFooterExpanted = step === 3

	return (
		<div className={styles.addFooterWrapper(isFooterExpanted,)}>
			{isFooterExpanted && <div className={styles.footerTootalBlock}>
				<p className={styles.footerTotalText}>Total:</p>
				<p className={styles.footerTotalText}>{localeString(total, 'USD', 2, true,)}</p>
			</div>}
			<div className={styles.footerButtonsBlock(!Boolean(values.clientId?.value.id,),)}>
				{values.clientId && <Button<ButtonType.TEXT>
					className={styles.saveAsDraftBtn}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Save as draft',
						size:     Size.MEDIUM,
						color:    Color.NONE,
					}}
					onClick={handleSaveDraft}
				/>}
				<div className={styles.rightButtonsWrapper}>
					{step !== 1 && <PrevButton
						handlePrev={handlePrev}
					/>}
					{step === 3 ?
						<Button<ButtonType.TEXT>
							disabled={!isValid}
							type='submit'
							additionalProps={{
								btnType:  ButtonType.TEXT,
								text:     'Create account',
								size:     Size.MEDIUM,
								color:    Color.BLUE,
							}}
						/> :
						<NextButton
							disabled={!isValid}
							handleNext={handleNext}
						/>
					}
				</div>
			</div>
		</div>
	)
}
