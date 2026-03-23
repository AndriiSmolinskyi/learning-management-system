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
	GroupItem,
} from '../../../shared/types'
import {
	toggleState,
} from '../../../shared/utils'
import {
	ItemDialog,
} from './item-dialog.component'
import type {
	TEditableGroup,
} from '../groups.types'
import * as styles from './table.style'

type Props = {
	group: GroupItem
	toggleLessonsVisible: (id?: string) => void
	toggleDetailsVisible: (id?: string) => void
	toggleStudentsVisible: (id?: string) => void
	handleOpenDeleteModal: (groupId: string) => void
	toggleUpdateVisible: (group: TEditableGroup) => void
}

export const TableItem: React.FC<Props> = ({
	group,
	toggleUpdateVisible,
	toggleLessonsVisible,
	toggleDetailsVisible,
	handleOpenDeleteModal,
	toggleStudentsVisible,
},) => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)

	return (
		<tr>
			<td className={styles.smallTableCell}>
				<div className={styles.menuCell}>
					<ItemDialog
						group={group}
						setDialogOpen={setIsPopoverShown}
						toggleUpdateVisible={toggleUpdateVisible}
						toggleLessonsVisible={toggleLessonsVisible}
						toggleDetailsVisible={toggleDetailsVisible}
						handleOpenDeleteModal={handleOpenDeleteModal}
						toggleStudentsVisible={toggleStudentsVisible}
					>
						<Button<ButtonType.ICON>
							onClick={toggleState(setIsPopoverShown,)}
							className={styles.dotsButton(isPopoverShown,)}
							additionalProps={{
								btnType: ButtonType.ICON,
								size:    Size.SMALL,
								color:   Color.SECONDRAY_GRAY,
								icon:    isPopoverShown ?
									<XmarkMid width={20} height={20} /> :
									<MoreVertical width={20} height={20} />,
							}}
						/>
					</ItemDialog>
				</div>
			</td>

			<td className={styles.tableCell}>{group.groupName}</td>
			<td className={styles.tableCell}>{group.courseName}</td>
			<td className={styles.tableCell}>
				{new Date(group.startDate,).toLocaleDateString('en-GB', {
					year:  'numeric',
					month: '2-digit',
					day:   '2-digit',
				},)
					.replace(/\//g, '.',)}
			</td>
			<td className={styles.tableCell}>
				{new Date(group.createdAt,).toLocaleDateString('en-GB', {
					year:  'numeric',
					month: '2-digit',
					day:   '2-digit',
				},)
					.replace(/\//g, '.',)}
			</td>
		</tr>
	)
}