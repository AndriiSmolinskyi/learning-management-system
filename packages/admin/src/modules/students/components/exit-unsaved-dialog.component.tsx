import * as React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../shared/components'
import {
	ReactComponent as WarningIcon,
} from '../../../assets/icons/warning-yellow-icon.svg'
import * as styles from './add-students.style'

type Props = {
	onExit: () => void
	disabled: boolean
}

export const ExitStudentUnsavedDialog: React.FC<Props> = ({
	onExit,
},) => {
	return (
		<div className={styles.modalWrapper}>
			<WarningIcon/>
			<h4>Exit student creation</h4>
			<p>Are you sure you want to leave without saving? All unsaved progress will be lost.</p>
			<div className={styles.buttonBlock}>
				<Button<ButtonType.TEXT>
					onClick={onExit}
					className={styles.button}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Exit unsaved',
						size:     Size.MEDIUM,
						color:    Color.SECONDARY_RED,
					}}
				/>
			</div>

		</div>
	)
}