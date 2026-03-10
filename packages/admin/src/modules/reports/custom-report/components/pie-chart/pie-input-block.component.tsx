import React from 'react'

import {
	Trash,
} from '../../../../../assets/icons'

import type {
	TPieForm,
} from '../../custom-report.types'
import {
	useCustomReportStore,
} from '../../custom-report.store'

import * as styles from '../../custom-report.styles'

type Props = {
	index: number
	pieForm: TPieForm
	setPieForm: React.Dispatch<React.SetStateAction<TPieForm>>
}

export const PieInputBlock: React.FC<Props> = ({
	index,
	pieForm,
	setPieForm,
},) => {
	const {
		pieContent,
		setPieContent,
	} = useCustomReportStore()

	const placeholder = pieForm.type === 'Percentage' ?
		`${100 - pieForm.content.reduce((acc, item,) => {
			return acc + (parseFloat(item.value,) || 0)
		}, 0,)}%` :
		undefined

	React.useEffect(() => {
		const filteredContent = pieForm.content
			.filter((item,) => {
				return item.label.trim() && Number(item.value,)
			},)
			.map((item,) => {
				return {
					label: item.label,
					value: parseFloat(item.value.trim(),) || 0,
				}
			},)

		setPieContent({
			...pieContent,
			content: filteredContent,
		},)
	}, [pieForm,],)

	return (
		<div className={styles.inputWrapper}>
			<span
				className={styles.trashBtn}
				onClick={() => {
					setPieContent({
						...pieContent,
						content: pieContent.content.filter((item, idx,) => {
							return idx !== index
						},),
					},)
					setPieForm({
						...pieForm,
						content: pieForm.content.filter((item, idx,) => {
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
					value={pieForm.content[index]?.label}
					onChange={(e,) => {
						setPieForm((prev,) => {
							return {
								...prev,
								content: prev.content.map((item, idx,) => {
									return idx === index ?
										{
											label: e.target.value,
											value: item.value,
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
					placeholder={placeholder}
					value={pieForm.content[index]?.value}
					onChange={(e,) => {
						setPieForm((prev,) => {
							return {
								...prev,
								content: prev.content.map((item, idx,) => {
									return idx === index ?
										{
											label: item.label,
											value: e.target.value,
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
