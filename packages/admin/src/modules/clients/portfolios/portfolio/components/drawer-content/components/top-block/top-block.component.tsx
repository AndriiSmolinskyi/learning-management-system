/* eslint-disable complexity */
import * as React from 'react'

import {
	useAddPortfolioStore,
	getMaxSubSteps,
} from '../../../../store/step.store'
import {
	ProgressBar,
} from '../../../../../../../../shared/components'

import * as styles from './top-block.styles'

interface ITopBlockProps{
	mainPortfolioId: string | undefined
}

export const TopBlock: React.FC<ITopBlockProps> = ({
	mainPortfolioId,
},) => {
	const {
		step, subStep,
	} = useAddPortfolioStore()
	const steps = getMaxSubSteps(step,)
	const getStepText = (currentStep: number,): string => {
		switch (currentStep) {
		case 1:
			return mainPortfolioId ?
				'Add sub-portfolio' :
				'Add portfolio'
		case 2:
			return 'Add entity'
		case 3:
			return 'Add bank'
		case 4:
			return 'Add bank account'
		case 5:
			return 'Add asset'
		default:
			return 'Add portfolio'
		}
	}
	return (
		<div className={styles.topBlockWrapper}>
			<p className={styles.addPortfolioText}>{getStepText(step,)}</p>
			<ProgressBar totalSteps={steps} currentStep={subStep}/>
		</div>
	)
}