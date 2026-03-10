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
import * as styles from './add-transaction.style'

type Props = {
	onExit: () => void
	onSaveDraft: () => void
	disabled: boolean
}

export const ExitTransactionTypeUnsavedDialog: React.FC<Props> = ({
	onExit,
	onSaveDraft,
	disabled,
},) => {
	return (
		<div className={styles.modalWrapper}>
			<WarningIcon/>
			<h4>Exit transaction creation</h4>
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
					disabled={disabled}
					className={styles.button}
					onClick={onSaveDraft}
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