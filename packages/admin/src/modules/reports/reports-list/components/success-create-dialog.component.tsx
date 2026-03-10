import * as React from 'react'

import {
	Check, Download,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import * as styles from '../reports.styles'

type Props = {
	handleViewDetails: VoidFunction
	handleDownloadReport: VoidFunction
}

export const SuccessCreateDialog: React.FC<Props> = ({
	handleViewDetails,
	handleDownloadReport,
},) => {
	return (
		<div className={styles.successModalContainer}>
			<Check width={42} height={42}/>
			<h4>New report added!</h4>
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
				<Button<ButtonType.TEXT>
					onClick={handleDownloadReport}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Download',
						size:     Size.MEDIUM,
						color:    Color.SECONDRAY_COLOR,
						leftIcon: <Download width={20} height={20}/>,
					}}
				/>
			</div>
		</div>
	)
}