import React from 'react'
import {
	Button, ButtonType, Color, Size,
} from '../../../../../../shared/components'
import {
	PlusBlue,
	PlusBlueLight,
} from '../../../../../../assets/icons'

type Props = {
	disabled: boolean
	handleAddEnother: () => void
}

export const AddAnotherEdit: React.FC<Props> = ({
	handleAddEnother,
	disabled,
},) => {
	return (
		<div>
			<Button<ButtonType.TEXT>
				disabled={disabled}
				onClick={handleAddEnother}
				additionalProps={{
					btnType:  ButtonType.TEXT,
					text:     'Add another',
					size:     Size.SMALL,
					color:    Color.NON_OUT_BLUE,
					leftIcon: disabled ?
						<PlusBlueLight width={20} height={20}/> :
						<PlusBlue width={20} height={20}/>,
				}}
			/>
		</div>
	)
}