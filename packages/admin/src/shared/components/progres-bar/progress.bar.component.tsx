import React from 'react'
import * as styles from './progress.bar.style'

interface IProgressBarProps {
  totalSteps: number
  currentStep: number
}

export const ProgressBar: React.FC<IProgressBarProps> = ({
	totalSteps,
	currentStep,
},) => {
	const progressPercentage = (currentStep / totalSteps) * 100

	return (
		<div className={styles.container}>
			<div className={styles.progressBarContainer}>
				<div className={styles.progress(progressPercentage,)} />
			</div>
			<div className={styles.stepInfo}>
				{currentStep}/{totalSteps}
			</div>
		</div>
	)
}
