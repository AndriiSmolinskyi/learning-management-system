import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	Classes,
	Popover,
} from '@blueprintjs/core'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../../shared/components'
import {
	MoreVertical,
	PenSquare,
	Trash,
	XmarkMid,
} from '../../../../../assets/icons'

import {
	toggleState,
} from '../../../../../shared/utils'

import * as styles from '../../custom-report.styles'

type Props = {
	data: string
	handleDelete?: VoidFunction
	handleEdit?: VoidFunction
	isEditor?: boolean
}

export const TextMarkup: React.FC<Props> = ({
	data,
	handleDelete,
	handleEdit,
	isEditor = false,
},) => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)

	const content = (
		<div className={styles.dialogContainer}>
			<div className={styles.menuActions}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					onClick={handleEdit}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Edit text',
						leftIcon: <PenSquare width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					onClick={handleDelete}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Delete text',
						leftIcon: <Trash width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_RED,
					}}
				/>
			</div>
		</div>
	)

	return (
		<div className={styles.reportBlockContaliner}>
			<div className={styles.reportBlockWrapper(isEditor,)}>
				{!isEditor && (
					<div className={styles.markupPopoverWrapper}>
						<Popover
							usePortal={false}
							hasBackdrop={false}
							placement='bottom-end'
							content={content}
							popoverClassName={cx(
								styles.popoverContainer,
								Classes.POPOVER_DISMISS,
							)}
							onClose={() => {
								setIsPopoverShown(false,)
							}}
						>
							<Button<ButtonType.ICON>
								onClick={toggleState(setIsPopoverShown,)}
								className={cx(isPopoverShown && styles.closeBtn,)}
								additionalProps={{
									btnType: ButtonType.ICON,
									size:    Size.SMALL,
									color:   Color.BLUE,
									icon:    isPopoverShown ?
										<XmarkMid width={20} height={20} /> :
										<MoreVertical width={20} height={20} />,
								}}
							/>
						</Popover>
					</div>
				)}
				<div
					dangerouslySetInnerHTML={{
						__html: data,
					}}
				/>
			</div>
		</div>
	)
}