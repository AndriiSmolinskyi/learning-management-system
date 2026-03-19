import React from 'react'

import {
	Button,
	ButtonType,
	Color,
	CustomCheckbox,
	Input,
	Size,
} from '../../../../../shared/components'
import {
	PlusBlue,
} from '../../../../../assets/icons'
import {
	LineItem,
} from './line-item.component'
import {
	LineConstructor,
} from './line-constructor.component'

import type {
	TLineForm,
	TLineSetup,
} from '../../custom-lessons.types'
import {
	LessonBlockType,
} from '../../custom-lessons.types'
import {
	LINE_CONTENT_INITIAL_STATE,
	useCustomLessonStore,
} from '../../custom-lessons.store'

import * as styles from '../../custom-lessons.styles'

const baseLineSetup = {
	line:        '',
	xAxisValues: '',
	yAxisValues: '',
}

const initialState: TLineForm = {
	name:       '',
	nameToggle: false,
	legend:     false,
	xAxis:       '',
	yAxis:       '',
	content:    [baseLineSetup,],
}

type Props = {
	setEditLineChartVisible: React.Dispatch<React.SetStateAction<boolean>>
}

export const LineChartConstructor: React.FC<Props> = ({
	setEditLineChartVisible,
},) => {
	const {
		lineContent,
		setLineContent,
		setBuilderType,
		setCurrentIndex,
		currentIndex,
		lessonPayload,
		setLessonPayload,
	} = useCustomLessonStore()

	const [lineForm, setLineForm,] = React.useState<TLineForm>({
		...lineContent,
		name:       lineContent.name ?? '',
		nameToggle: Boolean(lineContent.name,),
		content:    lineContent.content.map((item,) => {
			return {
				line:        item.line,
				xAxisValues: item.xAxisValues,
				yAxisValues: item.yAxisValues,
			}
		},),
	},)
	const [lineSetup, setLineSetup,] = React.useState<TLineSetup>(baseLineSetup,)
	const [isSetupVisible, setIsSetupVisible,] = React.useState<boolean>(true,)
	const [lineIndex, setLineIndex,] = React.useState<number>()

	const handleCancel = (): void => {
		setEditLineChartVisible(false,)
		setLineContent(LINE_CONTENT_INITIAL_STATE,)
		setBuilderType(LessonBlockType.CONTENT,)
		setLineForm(initialState,)
		setCurrentIndex(undefined,)
	}

	const handleLineApply = (): void => {
		if (lineContent.content.length) {
			if (currentIndex === undefined) {
				setLessonPayload([
					...lessonPayload,
					{
						type: LessonBlockType.LINE_CHART,
						data: lineContent,
					},
				],)
			} else {
				setLessonPayload(lessonPayload.map((item, idx,) => {
					return (idx === currentIndex ?
						{
							type: LessonBlockType.LINE_CHART,
							data: lineContent,
						} :
						item)
				},),)
			}
			handleCancel()
		}
	}

	const handleLineCancel = (): void => {
		setIsSetupVisible(false,)
		setLineSetup({
			line:        '',
			xAxisValues: '',
			yAxisValues: '',
		},)
		setLineIndex(undefined,)
	}

	const handleLineSave = (): void => {
		if (lineIndex === undefined) {
			setLineForm((prev,) => {
				return {
					...prev,
					content: [
						...prev.content,
						lineSetup,
					],
				}
			},)
			setLineContent({
				...lineContent,
				content: [
					...lineContent.content,
					lineSetup,
				],
			},)
		} else {
			setLineForm((prev,) => {
				return {
					...prev,
					content: prev.content.map((item, idx,) => {
						return (idx === lineIndex ?
							lineSetup :
							item)
					},),
				}
			},)
			setLineContent({
				...lineContent,
				content: lineContent.content.map((item, idx,) => {
					return (idx === lineIndex ?
						lineSetup :
						item)
				},),
			},)
		}
		handleLineCancel()
	}

	const handleDeleteLine = (index: number,): void => {
		if (index === lineIndex) {
			setLineIndex(undefined,)
			setLineSetup(baseLineSetup,)
		}
		setLineContent({
			...lineContent,
			content: lineContent.content.filter((item, idx,) => {
				return idx !== index
			},),
		},)
		setLineForm({
			...lineForm,
			content: lineForm.content.filter((item, idx,) => {
				return idx !== index
			},),
		},)
	}

	return (
		<div className={styles.builder}>
			<div className={styles.constructorHeader}>
				<p>Line chart</p>
			</div>
			<div className={styles.constructorContent}>
				<div>
					<div className={styles.formWrapper}>
						<div className={styles.checkboxWrapper}>
							<CustomCheckbox
								text='Include chart name'
								label='nameToggle'
								onChange={() => {
									setLineForm((prev,) => {
										return {
											...prev,
											nameToggle: !prev.nameToggle,
											name:       '',
										}
									},)
									setLineContent({
										...lineContent,
										name: '',
									},)
								}}
								input={{
									checked:      lineForm.nameToggle,
								}}
							/>
						</div>
						<Input
							label=''
							input={{
								value:       lineForm.name,
								disabled:    !lineForm.nameToggle,
								placeholder: 'Enter chart name',
								onChange:    (e,) => {
									setLineForm((prev,) => {
										return {
											...prev,
											name: e.target.value,
										}
									},)
									setLineContent({
										...lineContent,
										name: e.target.value,
									},)
								},
							}}
						/>
						<span/>
						<div className={styles.checkboxWrapper}>
							<CustomCheckbox
								text='Include legend'
								label='legend'
								onChange={() => {
									setLineForm((prev,) => {
										return {
											...prev,
											legend: !prev.legend,
										}
									},)
									setLineContent({
										...lineContent,
										legend: !lineForm.legend,
									},)
								}}
								input={{
									checked: lineForm.legend,
								}}
							/>
						</div>
						<span />
						<div className={styles.axisInputWrapper}>
							<div>
								<Input
									label=''
									input={{
										value:       lineForm.yAxis,
										placeholder: 'Y-axis title',
										onChange:    (e,) => {
											setLineForm((prev,) => {
												return {
													...prev,
													yAxis: e.target.value,
												}
											},)
											setLineContent({
												...lineContent,
												yAxis: e.target.value,
											},)
										},
									}}
								/>
							</div>
							<div>
								<Input
									label=''
									input={{
										value:       lineForm.xAxis,
										placeholder: 'X-axis title',
										onChange:    (e,) => {
											setLineForm((prev,) => {
												return {
													...prev,
													xAxis: e.target.value,
												}
											},)
											setLineContent({
												...lineContent,
												xAxis: e.target.value,
											},)
										},
									}}
								/>
							</div>
						</div>
					</div>
				</div>
				<div>
					<div className={styles.lineItemsContainer}>
						{lineForm.content.map((item, index,) => {
							return (
								<LineItem
									key={`${item.line}${index}`}
									lineSetup={item}
									handleDelete={() => {
										handleDeleteLine(index,)
									}}
									handleEdit={() => {
										setLineIndex(index,)
										setLineSetup(item,)
										setIsSetupVisible(true,)
									}}
								/>
							)
						},)}
					</div>
					{isSetupVisible && (
						<LineConstructor
							lineSetup={lineSetup}
							setLineSetup={setLineSetup}
							handleCancel={handleLineCancel}
							handleSave={handleLineSave}
						/>
					)}
					<div className={styles.addLineWrapper}>
						<Button<ButtonType.TEXT>
							onClick={() => {
								setLineIndex(undefined,)
								setLineSetup(baseLineSetup,)
								setIsSetupVisible(true,)
							}}
							additionalProps={{
								text:     'Add line',
								btnType:  ButtonType.TEXT,
								leftIcon:    <PlusBlue width={20} height={20} />,
								size:     Size.MEDIUM,
								color:    Color.NON_OUT_BLUE,
							}}
						/>
					</div>
				</div>
			</div>
			<div className={styles.constructorFooter}>
				<Button<ButtonType.TEXT>
					onClick={handleCancel}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Cancel',
						size:    Size.MEDIUM,
						color:   Color.SECONDRAY_GRAY,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={handleLineApply}
					disabled={Boolean(!lineContent.content.length || !lineContent.xAxis.trim() || !lineContent.yAxis.trim(),)}
					additionalProps={{
						btnType:   ButtonType.TEXT,
						text:      'Save chart',
						size:      Size.MEDIUM,
					}}
				/>
			</div>
		</div>
	)
}
