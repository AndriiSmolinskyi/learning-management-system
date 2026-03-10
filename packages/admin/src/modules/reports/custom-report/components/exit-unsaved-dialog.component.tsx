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

import * as styles from '../custom-report.styles'

type Props = {
	onSaveDraft: () => Promise<void>
	onClose: VoidFunction
}

export const ExitReportUnsavedDialog: React.FC<Props> = ({
	onSaveDraft,
	onClose,
},) => {
	return (
		<div className={styles.modalWrapper}>
			<WarningIcon/>
			<h4>Exit custom report creation</h4>
			<p>Are you sure you want to leave without saving? All unsaved progress will be lost.</p>
			<div className={styles.buttonBlock}>
				<Button<ButtonType.TEXT>
					onClick={onClose}
					className={cx(styles.button, Classes.POPOVER_DISMISS,)}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Exit unsaved',
						size:     Size.MEDIUM,
						color:    Color.SECONDARY_RED,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={onSaveDraft}
					className={cx(styles.button, Classes.POPOVER_DISMISS,)}
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