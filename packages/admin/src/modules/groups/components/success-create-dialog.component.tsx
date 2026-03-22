import * as React from 'react'

import {
	Check,
} from '../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../shared/components'
import * as styles from './add-groups.style'

type Props = {
	onExit: () => void
}

export const SuccessCreateDialog: React.FC<Props> = ({
	onExit,
},) => {
	return (
		<div className={styles.successModalContainer}>
			<Check width={42} height={42} />
			<h4>New group added!</h4>
			<Button<ButtonType.TEXT>
				onClick={onExit}
				className={styles.buttonOk}
				additionalProps={{
					btnType: ButtonType.TEXT,
					text:    'OK',
					size:    Size.MEDIUM,
					color:   Color.SECONDRAY_GRAY,
				}}
			/>
		</div>
	)
}