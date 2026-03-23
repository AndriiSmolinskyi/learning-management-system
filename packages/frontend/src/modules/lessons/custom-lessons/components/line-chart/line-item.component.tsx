import React from 'react'

import {
	Button, ButtonType, Color, Size,
} from '../../../../../shared/components'
import {
	PenSquare, Trash,
} from '../../../../../assets/icons'

import type {
	TLineSetup,
} from '../../custom-lessons.types'

import * as styles from '../../custom-lessons.styles'

type Props = {
	handleEdit: VoidFunction
	handleDelete: VoidFunction
	lineSetup: TLineSetup
}

export const LineItem: React.FC<Props> = ({
	handleDelete,
	handleEdit,
	lineSetup,
},) => {
	return (
		<div className={styles.lineItemWrapper}>
			<p>{lineSetup.line}</p>
			<div>
				<Button<ButtonType.ICON>
					onClick={handleEdit}
					additionalProps={{
						icon:    <PenSquare width={20} height={20}/>,
						btnType:  ButtonType.ICON,
						size:     Size.MEDIUM,
						color:    Color.TERTIARY_GREY,
					}}
				/>
				<Button<ButtonType.ICON>
					onClick={handleDelete}
					additionalProps={{
						icon:    <Trash width={20} height={20}/>,
						btnType:  ButtonType.ICON,
						size:     Size.MEDIUM,
						color:    Color.TERTIARY_GREY,
					}}
				/>
			</div>
		</div>
	)
}