import React from 'react'

import {
	ReactComponent as ArrowLeft,
} from '../../../assets/icons/arrow-left.svg'
import {
	Button, ButtonType, Color, Size,
} from '..'

type Props = {
	tabIndex?: number
	handlePrev: () => void
}

export const PrevButton:React.FC<Props> = ({
	handlePrev, tabIndex,
},) => {
	return (
		<Button<ButtonType.ICON>
			type='button'
			onClick={handlePrev}
			tabIndex={tabIndex}
			additionalProps={{
				btnType: ButtonType.ICON,
				icon:    <ArrowLeft width={20} height={20} />,
				size:    Size.MEDIUM,
				color:   Color.SECONDRAY_GRAY,
			}}
		/>
	)
}