import * as React from 'react'

import {
	Check,
} from '../../../../../../assets/icons'
import {
	Button, ButtonType, Color, Size,
} from '../../../../../../shared/components'

import * as styles from './asset.styles'

interface IExitModalProps {
	onClose: () => void
}

export const TransferSuccessModal: React.FC<IExitModalProps> = ({
	onClose,
},) => {
	return (
		<div className={styles.exitModalWrapper} onClick={(e,) => {
			e.stopPropagation()
		}}>
			<Check width={42} height={42}/>
			<h4>Asset has been successfully transfered!</h4>
			<Button<ButtonType.TEXT>
				onClick={onClose}
				className={styles.successTransferButton}
				additionalProps={{
					btnType:  ButtonType.TEXT,
					text:     'Ok',
					size:     Size.MEDIUM,
					color:    Color.BLUE,
				}}
			/>
		</div>
	)
}