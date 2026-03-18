/* eslint-disable complexity */
import React from 'react'
import {
	MoreVertical,
	XmarkMid,
} from '../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../shared/components'
import type {
	StudentItem,
} from '../../../shared/types'
import {
	toggleState,
} from '../../../shared/utils'
import * as styles from './table.style'

type Props = {
	student: StudentItem
	toggleUpdateVisible: (id: string) => void
	handleOpenDeleteModal: (transactionTypeId: string) => void
}

export const TableItem: React.FC<Props> = ({
	student,
	toggleUpdateVisible,
	handleOpenDeleteModal,
},) => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)

	return (
		<tr >
			<td className={styles.smallTableCell}>
				<div className={styles.menuCell}>
					{/* <ItemDialog
						transactionType={transaction}
						setDialogOpen={setIsPopoverShown}
						toggleRelationsVisible={toggleRelationsVisible}
						handleOpenDeleteModal={handleOpenDeleteModal}
						toggleUpdateVisible={toggleUpdateVisible}
					>
						<Button<ButtonType.ICON>
							onClick={toggleState(setIsPopoverShown,)}
							className={styles.dotsButton(isPopoverShown,)}
							additionalProps={{
								btnType: ButtonType.ICON,
								size:    Size.SMALL,
								color:   Color.SECONDRAY_GRAY,
								icon:    isPopoverShown ?
									<XmarkMid width={20} height={20} />			:
									<MoreVertical width={20} height={20} />	,
							}}
						/>
					</ItemDialog> */}
					<Button<ButtonType.ICON>
						onClick={toggleState(setIsPopoverShown,)}
						className={styles.dotsButton(isPopoverShown,)}
						additionalProps={{
							btnType: ButtonType.ICON,
							size:    Size.SMALL,
							color:   Color.SECONDRAY_GRAY,
							icon:    isPopoverShown ?
								<XmarkMid width={20} height={20} />			:
								<MoreVertical width={20} height={20} />	,
						}}
					/>
				</div>
			</td>
			<td className={styles.tableCell}>{student.firstName} {student.lastName}</td>
			<td className={styles.tableCell}>{student.email}</td>
			<td className={styles.tableCell}>{student.phoneNumber ?
				student.phoneNumber :
				'N/A'}</td>
			<td className={styles.tableCell}>
				{new Date(student.createdAt,).toLocaleDateString('en-GB', {
					year:  'numeric',
					month: '2-digit',
					day:   '2-digit',
				},)
					.replace(/\//g, '.',)}
			</td>
		</tr>
	)
}
