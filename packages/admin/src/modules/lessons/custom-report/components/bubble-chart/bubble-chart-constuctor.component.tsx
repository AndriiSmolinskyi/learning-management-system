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
	BubbleInputBlock,
} from './bubble-input-block.component'

import type {
	TBubbleForm,
} from '../../custom-lessons.types'
import {
	LessonBlockType,
} from '../../custom-lessons.types'
import {
	BUBBLE_CONTENT_INITIAL_STATE,
	useCustomLessonStore,
} from '../../custom-lessons.store'

import * as styles from '../../custom-lessons.styles'

const baseInputRaw = {
	label:      '',
	xAxisValue: '',
	yAxisValue: '',
	size:       '',
}

const initialState: TBubbleForm = {
	name:       '',
	nameToggle: false,
	legend:     false,
	xAxis:      '',
	yAxis:      '',
	content:    [baseInputRaw,],
}

type Props = {
	setEditBubbleChartVisible: React.Dispatch<React.SetStateAction<boolean>>
}

export const BubbleChartConstructor: React.FC<Props> = ({
	setEditBubbleChartVisible,
},) => {
	const {
		bubbleContent,
		setBubbleContent,
		setBuilderType,
		setCurrentIndex,
		currentIndex,
		lessonPayload,
		setLessonPayload,
	} = useCustomLessonStore()

	const [bubbleForm, setBubbleForm,] = React.useState<TBubbleForm>({
		...bubbleContent,
		nameToggle: Boolean(bubbleContent.name,),
		content:    bubbleContent.content.map((item,) => {
			return {
				label:      item.label,
				xAxisValue: String(item.xAxisValue || '',),
				yAxisValue: String(item.yAxisValue || '',),
				size:       String(item.size || '',),
			}
		},),
	},)

	const handleBubbleCancel = (): void => {
		setEditBubbleChartVisible(false,)
		setBubbleContent(BUBBLE_CONTENT_INITIAL_STATE,)
		setBuilderType(LessonBlockType.CONTENT,)
		setBubbleForm(initialState,)
		setCurrentIndex(undefined,)
	}

	const handleBubbleApply = (): void => {
		if (bubbleContent.content.length) {
			if (currentIndex === undefined) {
				setLessonPayload([
					...lessonPayload,
					{
						type: LessonBlockType.BUBBLE_CHART,
						data: bubbleContent,
					},
				],)
			} else {
				setLessonPayload(lessonPayload.map((item, idx,) => {
					return idx === currentIndex ?
						{
							type: LessonBlockType.BUBBLE_CHART,
							data: bubbleContent,
						} :
						item
				},),)
			}

			handleBubbleCancel()
		}
	}

	const addBtnEnabled = bubbleForm.content.every((item,) => {
		return item.label.trim() &&
			Number(item.xAxisValue,) &&
			Number(item.yAxisValue,) &&
			Number(item.size,)
	},)

	return (
		<div className={styles.builder}>
			<div className={styles.constructorHeader}>
				<p>Bubble chart</p>
			</div>

			<div className={styles.constructorContent}>
				<div>
					<div className={styles.formWrapper}>
						<div className={styles.checkboxWrapper}>
							<CustomCheckbox
								text='Include chart name'
								label='nameToggle'
								onChange={() => {
									setBubbleForm((prev,) => {
										return {
											...prev,
											nameToggle: !prev.nameToggle,
											name:       '',
										}
									},)

									setBubbleContent({
										...bubbleContent,
										name: '',
									},)
								}}
								input={{
									checked: bubbleForm.nameToggle,
								}}
							/>
						</div>

						<Input
							label=''
							input={{
								value:       bubbleForm.name,
								disabled:    !bubbleForm.nameToggle,
								placeholder: 'Enter chart name',
								onChange:    (e,) => {
									setBubbleForm((prev,) => {
										return {
											...prev,
											name: e.target.value,
										}
									},)

									setBubbleContent({
										...bubbleContent,
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
									setBubbleForm((prev,) => {
										return {
											...prev,
											legend: !prev.legend,
										}
									},)

									setBubbleContent({
										...bubbleContent,
										legend: !bubbleForm.legend,
									},)
								}}
								input={{
									checked: bubbleForm.legend,
								}}
							/>
						</div>

						<span />

						<div className={styles.axisInputWrapper}>
							<div>
								<Input
									label=''
									input={{
										value:       bubbleForm.yAxis,
										placeholder: 'Y-axis title',
										onChange:    (e,) => {
											setBubbleForm((prev,) => {
												return {
													...prev,
													yAxis: e.target.value,
												}
											},)

											setBubbleContent({
												...bubbleContent,
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
										value:       bubbleForm.xAxis,
										placeholder: 'X-axis title',
										onChange:    (e,) => {
											setBubbleForm((prev,) => {
												return {
													...prev,
													xAxis: e.target.value,
												}
											},)

											setBubbleContent({
												...bubbleContent,
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
					<div className={styles.bubbleInputHeadWrapper}>
						<div>
							<p>Label</p>
						</div>
						<div>
							<p>Y-axis</p>
						</div>
						<div>
							<p>X-axis</p>
						</div>
						<div>
							<p>Size</p>
						</div>
					</div>

					{bubbleForm.content.map((item, index,) => {
						return (
							<BubbleInputBlock
								key={index}
								index={index}
								bubbleForm={bubbleForm}
								setBubbleForm={setBubbleForm}
							/>
						)
					},)}

					<div
						className={styles.addInputBtn}
						onClick={() => {
							if (addBtnEnabled) {
								setBubbleForm((prev,) => {
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
					onClick={handleBubbleCancel}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Cancel',
						size:    Size.MEDIUM,
						color:   Color.SECONDRAY_GRAY,
					}}
				/>

				<Button<ButtonType.TEXT>
					onClick={handleBubbleApply}
					disabled={Boolean(!bubbleContent.content.length || !bubbleContent.xAxis.trim() || !bubbleContent.yAxis.trim(),)}
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