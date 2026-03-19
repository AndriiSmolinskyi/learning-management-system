import * as React from 'react'

import {
	Check,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'

import * as styles from '../lessons.styles'

type Props = {
	handleViewDetails: VoidFunction
}

export const SuccessCreateDialog: React.FC<Props> = ({
	handleViewDetails,
},) => {
	return (
		<div className={styles.successModalContainer}>
			<Check width={42} height={42} />
			<h4>New lesson added!</h4>

			<div className={styles.buttonBlock}>
				<Button<ButtonType.TEXT>
					onClick={handleViewDetails}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'View details',
						size:    Size.MEDIUM,
						color:   Color.SECONDRAY_GRAY,
					}}
				/>
			</div>
		</div>
	)
}