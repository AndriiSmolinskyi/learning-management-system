import * as React from 'react'
import {
	Classes,
} from '@blueprintjs/core'
import {
	cx,
} from '@emotion/css'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import {
	ReactComponent as WarningIcon,
} from '../../../../assets/icons/warning-yellow-icon.svg'

import * as styles from '../custom-lessons.styles'

type Props = {
	onExit: VoidFunction
	onClose: VoidFunction
}

export const ExitLessonUnsavedDialog: React.FC<Props> = ({
	onExit,
	onClose,
},) => {
	return (
		<div className={styles.modalWrapper}>
			<WarningIcon />

			<h4>Exit lesson creation</h4>
			<p>Are you sure you want to leave without saving? All unsaved progress will be lost.</p>

			<div className={styles.buttonBlock}>
				<Button<ButtonType.TEXT>
					onClick={onClose}
					className={cx(styles.button, Classes.POPOVER_DISMISS,)}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Stay',
						size:    Size.MEDIUM,
						color:   Color.TERTIARY_GREY,
					}}
				/>

				<Button<ButtonType.TEXT>
					onClick={onExit}
					className={cx(styles.button, Classes.POPOVER_DISMISS,)}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Exit',
						size:    Size.MEDIUM,
						color:   Color.SECONDARY_RED,
					}}
				/>
			</div>
		</div>
	)
}