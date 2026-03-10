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

import * as styles from '../requests.styles'

type Props = {
   handleViewDetails: () => void
}

export const SuccessCreateDialog: React.FC<Props> = ({
	handleViewDetails,
},) => {
	return (
		<div className={styles.successModalContainer}>
			<Check width={42} height={42}/>
			<h4>New request added!</h4>
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
	)
}