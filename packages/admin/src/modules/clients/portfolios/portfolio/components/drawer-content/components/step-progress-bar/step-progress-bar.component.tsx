import React from 'react'
import {
	cx,
} from '@emotion/css'

import {
	ReactComponent as StepReadyIcon,
} from '../../../../../../../../assets/icons/step-ready.svg'
import {
	ReactComponent as StepCurrentIcon,
} from '../../../../../../../../assets/icons/step-dot.svg'
import {
	ReactComponent as StepConnector,
} from '../../../../../../../../assets/icons/connector.svg'

import type {
	IProgressBarStep,
} from '../../../../../../../../shared/types'

import * as styles from './step-progress-bar.styles'

interface IProps {
  currentStep: number
  steps: Array<IProgressBarStep>
  additionalStyles?: string
}

export const StepProgressBar: React.FC<IProps> = ({
	currentStep,
	steps,
	additionalStyles,
},) => {
	const currentStepRef = React.useRef<HTMLDivElement | null>(null,)

	React.useEffect(() => {
		if (currentStepRef.current) {
			currentStepRef.current.scrollIntoView({
				behavior: 'smooth',
				block:    'nearest',
			},)
		}
	}, [currentStep,],)
	return (
		<div
			className={cx(
				currentStep < 3 ?
					styles.lableProgress :
					styles.lableProgressSecond,
				additionalStyles,
			)}
		>
			{steps.map((step, index,) => {
				const stepNumber = index + 1

				if (stepNumber > currentStep) {
					return null
				}

				const isPrev = stepNumber < currentStep
				const isCurrent = stepNumber === currentStep

				const modifier = isPrev ?
					<StepReadyIcon width={24} height={24}/> :
					<div className={styles.currentIcon}>
						<StepCurrentIcon width={16} height={16}/>
					</div>

				const fontSize = isCurrent ?
					16 :
					12

				return (
					<div
						key={index}
						className={styles.lableBlock}
						ref={isCurrent ?
							currentStepRef :
							null}
					>
						{modifier}
						<div className={styles.lableTextBlock}>
							<h3 className={styles.labelTitle(fontSize,)}>{step.labelTitle}</h3>
							<p className={styles.lableDec}>{step.labelDesc}</p>
						</div>
						{
							isPrev && <StepConnector className={styles.StepConnector}/>
						}
					</div>
				)
			},)}
		</div>
	)
}

