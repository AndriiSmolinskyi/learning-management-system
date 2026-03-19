import React from 'react'
import {
	format,
} from 'date-fns'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import {
	MoreVertical,
	XmarkMid,
} from '../../../../assets/icons'
import {
	ItemDialog,
} from './item-dialog.component'
import type {
	LessonItem as TLessonItem,
} from '../../../../shared/types'
import {
	toggleState,
} from '../../../../shared/utils'

import * as styles from '../lessons.styles'

type Props = {
	lesson: TLessonItem
	toggleDetailsVisible: (id: string) => void
}

export const LessonItem: React.FC<Props> = ({
	lesson,
	toggleDetailsVisible,
},) => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)

	return (
		<div className={styles.reportContainer}>
			<p className={styles.tableCell}>{lesson.title}</p>
			<p className={styles.tableCell}>{lesson.comment ?? '-'}</p>
			<p className={styles.tableCell}>{format(new Date(lesson.createdAt,), 'dd.MM.yyyy',)}</p>
			<p className={styles.tableCell}>{format(new Date(lesson.updatedAt,), 'dd.MM.yyyy',)}</p>

			<div className={styles.menuCell}>
				<ItemDialog
					setDialogOpen={setIsPopoverShown}
					toggleDetailsVisible={toggleDetailsVisible}
					lesson={lesson}
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
		</div>
	)
}