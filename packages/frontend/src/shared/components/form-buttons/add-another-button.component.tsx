import React from 'react'

import {
	Button, ButtonType, Color, Size,
} from '../button'
import {
	PlusBlue,
	PlusBlueLight,
} from '../../../assets/icons'

import * as styles from './form-buttons.styles'

type Props = {
	disabled: boolean
	handleAddAnother: () => void
}

export const AddAnotherButton: React.FC<Props> = ({
	handleAddAnother,
	disabled,
},) => {
	return (
		<div className={styles.addAnother}>
			<Button<ButtonType.TEXT>
				disabled={disabled}
				onClick={handleAddAnother}
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