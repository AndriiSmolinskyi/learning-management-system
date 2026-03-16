import React from 'react'

import {
	ReactComponent as ArrowRight,
} from '../../../assets/icons/arrow-right.svg'

import {
	Button, ButtonType, Size,
} from '../button'

type Props = {
	disabled?: boolean
	tabIndex?: number
	handleNext: () => void
}

export const NextButton: React.FC<Props> = ({
	disabled,
	tabIndex,
	handleNext,
},) => {
	return (
		<Button<ButtonType.TEXT>
			type='button'
			disabled={disabled}
			onClick={handleNext}
			tabIndex={tabIndex}
			additionalProps={{
				btnType:   ButtonType.TEXT,
				text:      'Next',
				size:      Size.MEDIUM,
				rightIcon: <ArrowRight width={20} height={20} />,
			}}
		/>
	)
}