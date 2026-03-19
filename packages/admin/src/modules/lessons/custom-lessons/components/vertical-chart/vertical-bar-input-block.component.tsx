/* eslint-disable complexity */
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
				return item.label.trim() && (Number(item.value1,) || Number(item.value2,) || Number(item.value3,))
			},)
			.map((item,) => {
				const series1 = parseFloat(item.value1.trim(),)
				const series2 = parseFloat(item.value2.trim(),)
				const series3 = parseFloat(item.value3.trim(),)

				if (!Number.isNaN(series1,) && !Number.isNaN(series2,) && !Number.isNaN(series3,)) {
					return {
						label: item.label,
						series1,
						series2,
						series3,
					} as TBarInputRaw
				}

				if (!Number.isNaN(series1,) && !Number.isNaN(series2,)) {
					return {
						label: item.label,
						series1,
						series2,
					} as TBarInputRaw
				}

				if (!Number.isNaN(series1,) && !Number.isNaN(series3,)) {
					return {
						label: item.label,
						series1,
						series3,
					} as TBarInputRaw
				}

				if (!Number.isNaN(series2,) && !Number.isNaN(series3,)) {
					return {
						label: item.label,
						series2,
						series3,
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

				if (!Number.isNaN(series3,)) {
					return {
						label: item.label,
						series3,
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
		<div className={styles.barInputWrapper}>
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
					placeholder='Label'
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

			<div>
				<input
					type='text'
					value={barForm.content[index]?.value3}
					onChange={(e,) => {
						setBarForm((prev,) => {
							return {
								...prev,
								content: prev.content.map((item, idx,) => {
									return idx === index ?
										{
											...item,
											value3: e.target.value,
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