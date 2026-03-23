import React from 'react'
import {
	useSortable,
} from '@dnd-kit/sortable'
import {
	CSS,
} from '@dnd-kit/utilities'

import {
	GripIcon,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'

import type {
	TLessonData,
} from '../custom-lessons.types'
import {
	getReorderData,
} from '../custom-lessons.utils'

import * as styles from '../custom-lessons.styles'

type Props = {
	id: number
	item: TLessonData
}

export const SortableItem: React.FC<Props> = ({
	id,
	item,
},) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id,
	},)

	const style = {
		transform: CSS.Transform.toString(transform,),
		transition,
		zIndex:    isDragging ?
			10 :
			1,
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className={styles.cursor}
		>
			<div>
				<Button<ButtonType.ICON>
					additionalProps={{
						btnType: ButtonType.ICON,
						icon:    <GripIcon width={20} height={20} />,
						size:    Size.SMALL,
						color:   Color.TERTIARY_GREY,
					}}
				/>
				<Button<ButtonType.ICON>
					additionalProps={{
						btnType: ButtonType.ICON,
						icon:    getReorderData(item.type,).icon,
						size:    Size.SMALL,
						color:   Color.SECONDRAY_COLOR,
					}}
				/>
			</div>
			<p>{getReorderData(item.type,).text}</p>
		</div>
	)
}