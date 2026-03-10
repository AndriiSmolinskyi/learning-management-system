import React from 'react'
import {
	Classes,
} from '@blueprintjs/core'
import type {
	DragEndEvent,
} from '@dnd-kit/core'
import {
	DndContext,
	closestCenter,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import {
	SortableContext,
	arrayMove,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import {
	SortableItem,
} from './sortable-item.component'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'

import {
	useCustomReportStore,
} from '../custom-report.store'
import type {
	TCustomReportPayload,
} from '../custom-report.types'

import * as styles from '../custom-report.styles'

type Props = {
	toggleReorderDialog: VoidFunction
}

export const ReorderReportDialog: React.FC<Props> = ({
	toggleReorderDialog,
},) => {
	const {
		reportPayload,
		setReportPayload,
	} = useCustomReportStore()
	const [payload, setPayload,] = React.useState<TCustomReportPayload>(reportPayload,)

	const sensors = useSensors(useSensor(PointerSensor,),)

	const handleDragEnd = (event: DragEndEvent,): void => {
		const {
			active, over,
		} = event
		if (active.id !== over?.id) {
			setPayload((prevPayload,) => {
				const oldIndex = prevPayload.findIndex((item, index,) => {
					return index === active.id
				},)
				const newIndex = prevPayload.findIndex((item, index,) => {
					return index === over?.id
				},)
				return arrayMove(prevPayload, oldIndex, newIndex,)
			},)
		}
	}

	return (
		<div className={styles.modalWrapper}>
			<div className={styles.reorderHeader}>
				<h3>Reorder report</h3>
			</div>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext items={payload.map((item, index,) => {
					return index
				},)} strategy={verticalListSortingStrategy}>
					<div className={styles.reorderContentBlock}>
						{payload.map((item, index,) => {
							return (
								<SortableItem
									key={`${item.type}${index}`}
									id={index}
									item={item}
								/>
							)
						},)}
					</div>
				</SortableContext>
			</DndContext>
			<div className={styles.reorderButtonBlock}>
				<Button<ButtonType.TEXT>
					className={Classes.POPOVER_DISMISS}
					onClick={toggleReorderDialog}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Cancel',
						size:     Size.MEDIUM,
						color:    Color.SECONDRAY_GRAY,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={() => {
						setReportPayload(payload,)
						toggleReorderDialog()
					}}
					className={Classes.POPOVER_DISMISS}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Save new order',
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
				/>
			</div>
		</div>
	)
}
