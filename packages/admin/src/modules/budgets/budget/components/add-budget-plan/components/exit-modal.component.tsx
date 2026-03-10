import * as React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../../../shared/components'
import {
	ReactComponent as WarningIcon,
} from '../../../../../../assets/icons/warning-yellow-icon.svg'

import * as styles from './styles'

interface IExitModalProps {
	onExit: () => void
	onSaveDraft: () => Promise<void>
	disabled: boolean
}

export const ExitModal: React.FC<IExitModalProps> = ({
	onSaveDraft,
	onExit,
	disabled,
},) => {
	return (
		<div className={styles.exitModalWrapper}>
			<WarningIcon/>
			<h4>Exit budget plan creation</h4>
			<p>Are you sure you want to leave without saving? All unsaved progress will be lost.</p>
			<div className={styles.exitModalbuttonBlock}>
				<Button<ButtonType.TEXT>
					onClick={onExit}
					className={styles.exitModalButton}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Exit unsaved',
						size:     Size.MEDIUM,
						color:    Color.SECONDARY_RED,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={onSaveDraft}
					className={styles.exitModalButton}
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