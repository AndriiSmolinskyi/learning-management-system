/* eslint-disable no-nested-ternary */
import * as React from 'react'

import {
	StepUnactiveIcon,
	StepCheckedIcon,
} from '../../../../../../../../assets/icons'
import {
	ReactComponent as StepCurrentIcon,
} from '../../../../../../../../assets/icons/step-dot.svg'

import * as styles from './progress-button.styles'

interface IProgressButtonProps {
    id: string
    name: string
	step: number
}

export const ProgressButton: React.FC<IProgressButtonProps> = ({
	id,name,step,
},) => {
	return (
		<button type='button' className={styles.buttonWrapper(step === Number(id,),)}>
			{Number(id,) < step ?
				<StepCheckedIcon/> :
				step === Number(id,) ?
					<div className={styles.activeStepIcon}>
						<StepCurrentIcon />
					</div> :
					<StepUnactiveIcon/>}
			{name}
		</button>
	)
}