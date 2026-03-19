import React from 'react'

import {
	Trash,
} from '../../../../../assets/icons'

import type {
	TBarForm,
	TBarInputRaw,
} from '../../custom-lessons.types'
import {
	useCustomLessonStore,
} from '../../custom-lessons.store'

import * as styles from '../../custom-lessons.styles'

type Props = {
	index: number
	barForm: TBarForm
	setBarForm: React.Dispatch<React.SetStateAction<TBarForm>>
}

export const BarInputBlock: React.FC<Props> = ({
	index,
	barForm,
	setBarForm,
},) => {
	const {
		barContent,
		setBarContent,
	} = useCustomLessonStore()

	React.useEffect(() => {
		const filteredContent = barForm.content
			.filter((item,) => {
				return item.label.trim() && (Number(item.value1,) || Number(item.value2,))
			},)
			.map((item,) => {
				const series1 = parseFloat(item.value1.trim(),)
				const series2 = parseFloat(item.value2.trim(),)

				if (!Number.isNaN(series1,) && !Number.isNaN(series2,)) {
					return {
						label: item.label,
						series1,
						series2,
					} as TBarInputRaw
				}

				if (!Number.isNaN(series1,)) {
					return {
						label: item.label,
						series1,
					} as TBarInputRaw
				}

				if (!Number.isNaN(series2,)) {
					return {
						label: item.label,
						series2,
					} as TBarInputRaw
				}

				return null
			},)
			.filter((item,): item is TBarInputRaw => {
				return item !== null
			},)

		setBarContent({
			...barContent,
			content: filteredContent,
		},)
	}, [barForm,],)

	return (
		<div className={styles.horizontalInputWrapper}>
			<span
				className={styles.trashBtn}
				onClick={() => {
					setBarContent({
						...barContent,
						content: barContent.content.filter((item, idx,) => {
							return idx !== index
						},),
					},)

					setBarForm({
						...barForm,
						content: barForm.content.filter((item, idx,) => {
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
					placeholder='Enter here'
					value={barForm.content[index]?.label}
					onChange={(e,) => {
						setBarForm((prev,) => {
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
					value={barForm.content[index]?.value1}
					onChange={(e,) => {
						setBarForm((prev,) => {
							return {
								...prev,
								content: prev.content.map((item, idx,) => {
									return idx === index ?
										{
											...item,
											value1: e.target.value,
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
					value={barForm.content[index]?.value2}
					onChange={(e,) => {
						setBarForm((prev,) => {
							return {
								...prev,
								content: prev.content.map((item, idx,) => {
									return idx === index ?
										{
											...item,
											value2: e.target.value,
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