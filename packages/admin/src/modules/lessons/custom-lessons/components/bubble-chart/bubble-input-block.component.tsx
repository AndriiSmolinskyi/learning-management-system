import React from 'react'

import {
	Trash,
} from '../../../../../assets/icons'

import type {
	TBubbleForm,
} from '../../custom-lessons.types'
import {
	useCustomLessonStore,
} from '../../custom-lessons.store'

import * as styles from '../../custom-lessons.styles'

type Props = {
	index: number
	bubbleForm: TBubbleForm
	setBubbleForm: React.Dispatch<React.SetStateAction<TBubbleForm>>
}

export const BubbleInputBlock: React.FC<Props> = ({
	index,
	bubbleForm,
	setBubbleForm,
},) => {
	const {
		bubbleContent,
		setBubbleContent,
	} = useCustomLessonStore()

	React.useEffect(() => {
		const filteredContent = bubbleForm.content
			.filter((item,) => {
				return item.label.trim() &&
					parseFloat(item.xAxisValue,) &&
					parseFloat(item.yAxisValue,) &&
					parseFloat(item.size,)
			},)
			.map((item,) => {
				const xAxisValue = parseFloat(item.xAxisValue.trim(),)
				const yAxisValue = parseFloat(item.yAxisValue.trim(),)
				const size = parseFloat(item.size.trim(),)

				return {
					label: item.label,
					xAxisValue,
					yAxisValue,
					size,
				}
			},)

		setBubbleContent({
			...bubbleContent,
			content: filteredContent,
		},)
	}, [bubbleForm,],)

	return (
		<div className={styles.bubbleInputWrapper}>
			<span
				className={styles.trashBtn}
				onClick={() => {
					setBubbleContent({
						...bubbleContent,
						content: bubbleContent.content.filter((item, idx,) => {
							return idx !== index
						},),
					},)

					setBubbleForm({
						...bubbleForm,
						content: bubbleForm.content.filter((item, idx,) => {
							return idx !== index
						},),
					},)
				}}
			>
				<Trash height={20} width={20} />
			</span>

			<div>
				<input
					type='text'
					placeholder='Enter'
					value={bubbleForm.content[index]?.label}
					onChange={(e,) => {
						setBubbleForm((prev,) => {
							return {
								...prev,
								content: prev.content.map((item, idx,) => {
									return idx === index ?
										{
											...item,
											label: e.target.value,
										} :
										item
								},),
							}
						},)
					}}
				/>
			</div>

			<div>
				<input
					type='text'
					value={bubbleForm.content[index]?.yAxisValue}
					onChange={(e,) => {
						setBubbleForm((prev,) => {
							return {
								...prev,
								content: prev.content.map((item, idx,) => {
									return idx === index ?
										{
											...item,
											yAxisValue: e.target.value,
										} :
										item
								},),
							}
						},)
					}}
				/>
			</div>

			<div>
				<input
					type='text'
					value={bubbleForm.content[index]?.xAxisValue}
					onChange={(e,) => {
						setBubbleForm((prev,) => {
							return {
								...prev,
								content: prev.content.map((item, idx,) => {
									return idx === index ?
										{
											...item,
											xAxisValue: e.target.value,
										} :
										item
								},),
							}
						},)
					}}
				/>
			</div>

			<div>
				<input
					type='text'
					value={bubbleForm.content[index]?.size}
					onChange={(e,) => {
						setBubbleForm((prev,) => {
							return {
								...prev,
								content: prev.content.map((item, idx,) => {
									return idx === index ?
										{
											...item,
											size: e.target.value,
										} :
										item
								},),
							}
						},)
					}}
				/>
			</div>
		</div>
	)
}