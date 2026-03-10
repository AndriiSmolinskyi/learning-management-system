import React from 'react'
import {
	format,
} from 'date-fns'

import {
	BadgeDropdown,
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../../../shared/components'
import {
	MoreVertical, XmarkMid,
} from '../../../../../../assets/icons'
import {
	RequestItemDialog,
} from './item-dialog.component'

import type {
	IRequest,
	RequestStatusType,
} from '../../../../../../shared/types'
import {
	toggleState,
} from '../../../../../../shared/utils'
import {
	useUpdateRequest,
} from '../../../../../../shared/hooks/requests'
import {
	getRequestStatus,
} from '../../../../../operations/requests/request.utils'
import {
	requestStatusOptions,
} from '../../../../../operations/requests/request.constants'

import * as styles from './request-list.styles'

type Props = {
	request: IRequest
}

export const RequestItem: React.FC<Props> = ({
	request,
},) => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)

	const {
		mutateAsync: updateStatus,
	} = useUpdateRequest()

	const filteredStatusOptions = requestStatusOptions.filter((item,) => {
		return item !== request.status
	},)

	return (
		<div className={styles.requestContainer}>
			<p className={styles.tableCell}>{request.id}</p>
			<p className={styles.tableCell}>{request.type}</p>

			<div className={styles.badgeCell}>
				<BadgeDropdown<RequestStatusType>
					value={request.status}
					options={filteredStatusOptions}
					onChange={async(status,) => {
						await updateStatus({
							status,
							id: request.id,
						},)
					}}
					getLabelColor={getRequestStatus}
				/>
			</div>
			<p className={styles.tableCell}>{format(request.updatedAt, 'dd.MM.yyyy',)}</p>
			<div className={styles.menuCell}>
				<RequestItemDialog
					setDialogOpen={setIsPopoverShown}
					request={request}
				>
					<Button<ButtonType.ICON>
						onClick={toggleState(setIsPopoverShown,)}
						className={styles.dotsButton}
						additionalProps={{
							btnType: ButtonType.ICON,
							size:    Size.SMALL,
							color:   Color.SECONDRAY_GRAY,
							icon:    isPopoverShown ?
								<XmarkMid width={20} height={20} />			:
								<MoreVertical width={20} height={20} />	,
						}}
					/>
				</RequestItemDialog>
			</div>
		</div>
	)
}
