import React from 'react'
import {
	Button, ButtonType, Size, Color,
} from '../../../../../../shared/components'
import {
	SaveDraftButton,
} from './save-draft-button.component'
import {
	AlertImg,
	XmarkSecond,
} from '../../../../../../assets/icons'
import * as styles from './add-client.styles'

interface IAddClientExitProps {
	onExit: () => void
	onCancel: () => void
	onClose: () => void
}

export const AddClientExit: React.FC<IAddClientExitProps> = ({
	onExit, onCancel,
},) => {
	return (
		<div>
			<div className={styles.addModalBlock}>
				<div className={styles.addModalCancel}>
					<Button<ButtonType.ICON>
						onClick={onCancel}
						additionalProps={{
							btnType:  ButtonType.ICON,
							icon:     <XmarkSecond width={24} height={24}/>,
							size:     Size.MEDIUM,
							color:    Color.NONE,
						}}
					/>
				</div>
				<AlertImg width={42} height={42} className={styles.addModalImg}/>
				<h3 className={styles.addModalTitle}>Exit client creation</h3>
				<p className={styles.addModalText}>Are you sure you want to leave without saving? All unsaved progress will be lost.</p>
				<div className={styles.addModalBtns}>
					<Button<ButtonType.TEXT>
						onClick={onExit}
						additionalProps={{
							btnType: ButtonType.TEXT,
							text:    'Exit Unsaved',
							size:    Size.MEDIUM,
							color:   Color.SECONDARY_RED,
						}}
					/>
					<SaveDraftButton buttonColor={Color.BLUE} onClose={onExit}/>
				</div>
			</div>
		</div>
	)
}
