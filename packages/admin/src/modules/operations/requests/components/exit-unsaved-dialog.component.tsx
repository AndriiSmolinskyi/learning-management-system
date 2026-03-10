import * as React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import {
	ReactComponent as WarningIcon,
} from '../../../../assets/icons/warning-yellow-icon.svg'

import * as styles from '../requests.styles'

type Props = {
   onExit: () => void
	onSaveDraft: () => Promise<void>
	disabled: boolean
}

export const ExitRequestUnsavedDialog: React.FC<Props> = ({
	onSaveDraft,
	onExit,
	disabled,
},) => {
	return (
		<div className={styles.modalWrapper}>
			<WarningIcon/>
			<h4>Exit request creation</h4>
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
				<Button<ButtonType.TEXT>
					onClick={onSaveDraft}
					className={styles.button}
					disabled={disabled}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Save as draft',
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
				/>
			</div>

		</div>
	)
}