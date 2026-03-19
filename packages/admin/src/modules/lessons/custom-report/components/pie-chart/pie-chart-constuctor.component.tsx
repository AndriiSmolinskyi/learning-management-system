import React from 'react'

import {
	Button,
	ButtonType,
	Color,
	CustomCheckbox,
	Input,
	Radio,
	Size,
} from '../../../../../shared/components'
import {
	PlusBlue,
} from '../../../../../assets/icons'

import type {
	TPieForm,
} from '../../custom-lessons.types'
import {
	LessonBlockType,
} from '../../custom-lessons.types'
import {
	PIE_CONTENT_INITIAL_STATE,
	useCustomLessonStore,
} from '../../custom-lessons.store'

import * as styles from '../../custom-lessons.styles'
import {
	PieInputBlock,
} from './pie-input-block.component'

const baseInputRaw = {
	label: '',
	value: '',
}

const initialState: TPieForm = {
	name:       '',
	nameToggle: false,
	legend:     false,
	type:       'Amount',
	content:    [
		baseInputRaw,
	],
}

type Props = {
	setEditPieChartVisible: React.Dispatch<React.SetStateAction<boolean>>
}

export const PieChartConstructor: React.FC<Props> = ({
	setEditPieChartVisible,
},) => {
	const {
		pieContent,
		setPieContent,
		setBuilderType,
		lessonPayload,
		setLessonPayload,
		currentIndex,
		setCurrentIndex,
	} = useCustomLessonStore()

	const [pieForm, setPieForm,] = React.useState<TPieForm>({
		...pieContent,
		nameToggle: Boolean(pieContent.name,),
		content:    pieContent.content.map((item,) => {
			return {
				label: item.label,
				value: String(item.value || '',),
			}
		},),
	},)

	const handlePieCancel = (): void => {
		setEditPieChartVisible(false,)
		setPieContent(PIE_CONTENT_INITIAL_STATE,)
		setBuilderType(LessonBlockType.CONTENT,)
		setPieForm(initialState,)
		setCurrentIndex(undefined,)
	}

	const handlePieApply = (): void => {
		if (pieContent.content.length) {
			if (currentIndex === undefined) {
				setLessonPayload([
					...lessonPayload,
					{
						type: LessonBlockType.PIE_CHART,
						data: pieContent,
					},
				],)
			} else {
				setLessonPayload(lessonPayload.map((item, idx,) => {
					return (idx === currentIndex ?
						{
							type: LessonBlockType.PIE_CHART,
							data: pieContent,
						} :
						item)
				},),)
			}

			handlePieCancel()
		}
	}

	const addBtnEnabled = pieForm.content.every((item,) => {
		return item.label.trim() && Number(item.value,)
	},) && (pieForm.type === 'Percentage' ?
		pieForm.content.reduce((acc, item,) => {
			return acc + (parseFloat(item.value,) || 0)
		}, 0,) < 100 :
		true)

	return (
		<div className={styles.builder}>
			<div className={styles.constructorHeader}>
				<p>Pie chart</p>
			</div>

			<div className={styles.constructorContent}>
				<div>
					<div className={styles.formWrapper}>
						<div className={styles.checkboxWrapper}>
							<CustomCheckbox
								text='Include chart name'
								label='nameToggle'
								onChange={() => {
									setPieForm((prev,) => {
										return {
											...prev,
											nameToggle: !prev.nameToggle,
											name:       '',
										}
									},)
									setPieContent({
										...pieContent,
										name: '',
									},)
								}}
								input={{
									checked: pieForm.nameToggle,
								}}
							/>
						</div>

						<Input
							label=''
							input={{
								value:       pieForm.name,
								disabled:    !pieForm.nameToggle,
								placeholder: 'Enter chart name',
								onChange:    (e,) => {
									setPieForm((prev,) => {
										return {
											...prev,
											name: e.target.value,
										}
									},)
									setPieContent({
										...pieContent,
										name: e.target.value,
									},)
								},
							}}
						/>

						<span />

						<div className={styles.checkboxWrapper}>
							<CustomCheckbox
								text='Include legend'
								label='legend'
								onChange={() => {
									setPieForm((prev,) => {
										return {
											...prev,
											legend: !prev.legend,
										}
									},)
									setPieContent({
										...pieContent,
										legend: !pieForm.legend,
									},)
								}}
								input={{
									checked: pieForm.legend,
								}}
							/>
						</div>

						<span />

						<div className={styles.radioWrapper}>
							<p>Value type</p>

							<div>
								<Radio
									name='type'
									label='Amount'
									input={{
										checked:  pieForm.type === 'Amount',
										value:    pieForm.type,
										onChange: () => {
											setPieForm((prev,) => {
												return {
													...prev,
													type:    'Amount',
													content: [baseInputRaw,],
												}
											},)
											setPieContent({
												...pieContent,
												type:    'Amount',
												content: [],
											},)
										},
									}}
								/>

								<Radio
									name='type'
									label='Percentage (%)'
									input={{
										checked:  pieForm.type === 'Percentage',
										value:    pieForm.type,
										onChange: () => {
											setPieForm((prev,) => {
												return {
													...prev,
													type:    'Percentage',
													content: [baseInputRaw,],
												}
											},)
											setPieContent({
												...pieContent,
												type:    'Percentage',
												content: [],
											},)
										},
									}}
								/>
							</div>
						</div>
					</div>
				</div>

				<div>
					<div className={styles.pieHeadWrapper}>
						<div>
							<p>Label</p>
						</div>
						<div>
							<p>Value</p>
						</div>
					</div>

					{pieForm.content.map((item, index,) => {
						return (
							<PieInputBlock
								key={index}
								index={index}
								pieForm={pieForm}
								setPieForm={setPieForm}
							/>
						)
					},)}

					<div
						className={styles.addInputBtn}
						onClick={() => {
							if (addBtnEnabled) {
								setPieForm((prev,) => {
									return {
										...prev,
										content: [
											...prev.content,
											baseInputRaw,
										],
									}
								},)
							}
						}}
					>
						<Button<ButtonType.ICON>
							disabled={!addBtnEnabled}
							additionalProps={{
								btnType: ButtonType.ICON,
								icon:    <PlusBlue width={20} height={20} />,
								size:    Size.MEDIUM,
								color:   Color.NON_OUT_BLUE,
							}}
						/>
					</div>
				</div>
			</div>

			<div className={styles.constructorFooter}>
				<Button<ButtonType.TEXT>
					onClick={handlePieCancel}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Cancel',
						size:    Size.MEDIUM,
						color:   Color.SECONDRAY_GRAY,
					}}
				/>

				<Button<ButtonType.TEXT>
					onClick={handlePieApply}
					disabled={!pieContent.content.length}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Save chart',
						size:    Size.MEDIUM,
					}}
				/>
			</div>
		</div>
	)
}