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
	BarInputBlock,
} from './vertical-bar-input-block.component'

import type {
	TBarForm,
} from '../../custom-report.types'
import {
	ReportBlockType,
} from '../../custom-report.types'
import {
	BAR_CONTENT_INITIAL_STATE,
	useCustomReportStore,
} from '../../custom-report.store'

import * as styles from '../../custom-report.styles'

const baseInputRaw = {
	label:  '',
	value1: '',
	value2: '',
	value3: '',
}

const initialState: TBarForm = {
	name:       '',
	nameToggle: false,
	legend:     false,
	xAxis:       '',
	yAxis:       '',
	content:    [baseInputRaw,],
}

type Props = {
	setEditVerticalChartVisible: React.Dispatch<React.SetStateAction<boolean>>
}

export const VerticalBarChartConstructor: React.FC<Props> = ({
	setEditVerticalChartVisible,
},) => {
	const {
		barContent,
		setBarContent,
		setBuilderType,
		setCurrentIndex,
		currentIndex,
		reportPayload,
		setReportPayload,
	} = useCustomReportStore()

	const [barForm, setBarForm,] = React.useState<TBarForm>({
		...barContent,
		nameToggle: Boolean(barContent.name,),
		content:    barContent.content.map((item,) => {
			return {
				label:  item.label,
				value1: String(item.series1 ?? '',),
				value2: String(item.series2 ?? '',),
				value3: String(item.series3 ?? '',),
			}
		},),
	},)

	const handleBarCancel = (): void => {
		setEditVerticalChartVisible(false,)
		setBarContent(BAR_CONTENT_INITIAL_STATE,)
		setBuilderType(ReportBlockType.CONTENT,)
		setBarForm(initialState,)
		setCurrentIndex(undefined,)
	}

	const handleBarApply = (): void => {
		if (barContent.content.length) {
			if (currentIndex === undefined) {
				setReportPayload([
					...reportPayload,
					{
						type: ReportBlockType.VERTICAL_CHART,
						data: barContent,
					},
				],)
			} else {
				setReportPayload(reportPayload.map((item, idx,) => {
					return (idx === currentIndex ?
						{
							type: ReportBlockType.VERTICAL_CHART,
							data: barContent,
						} :
						item)
				},),)
			}
			handleBarCancel()
		}
	}

	const addBtnEnabled = barForm.content.every((item,) => {
		return item.label.trim() && (Number(item.value1,) || Number(item.value2,) || Number(item.value3,))
	},)

	return (
		<div className={styles.builder}>
			<div className={styles.constructorHeader}>
				<p>Bar chart</p>
			</div>
			<div className={styles.constructorContent}>
				<div>
					<div className={styles.formWrapper}>
						<div className={styles.checkboxWrapper}>
							<CustomCheckbox
								text='Include chart name'
								label='nameToggle'
								onChange={() => {
									setBarForm((prev,) => {
										return {
											...prev,
											nameToggle: !prev.nameToggle,
											name:       '',
										}
									},)
									setBarContent({
										...barContent,
										name: '',
									},)
								}}
								input={{
									checked:      barForm.nameToggle,
								}}
							/>
						</div>
						<Input
							label=''
							input={{
								value:       barForm.name,
								disabled:    !barForm.nameToggle,
								placeholder: 'Enter chart name',
								onChange:    (e,) => {
									setBarForm((prev,) => {
										return {
											...prev,
											name: e.target.value,
										}
									},)
									setBarContent({
										...barContent,
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
									setBarForm((prev,) => {
										return {
											...prev,
											legend: !prev.legend,
										}
									},)
									setBarContent({
										...barContent,
										legend: !barForm.legend,
									},)
								}}
								input={{
									checked: barForm.legend,
								}}
							/>
						</div>
						<span />
						<div className={styles.axisInputWrapper}>
							<div>
								<Input
									label=''
									input={{
										value:       barForm.yAxis,
										placeholder: 'Y-axis title',
										onChange:    (e,) => {
											setBarForm((prev,) => {
												return {
													...prev,
													yAxis: e.target.value,
												}
											},)
											setBarContent({
												...barContent,
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
										value:       barForm.xAxis,
										placeholder: 'X-axis title',
										onChange:    (e,) => {
											setBarForm((prev,) => {
												return {
													...prev,
													xAxis: e.target.value,
												}
											},)
											setBarContent({
												...barContent,
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
					<div className={styles.inputHeadWrapper}>
						<div>
							<p>Label</p>
						</div>
						<div>
							<p>Series 1</p>
						</div>
						<div>
							<p>Series 2 (optional)</p>
						</div>
						<div>
							<p>Series 3 (optional)</p>
						</div>
					</div>
					{barForm.content.map((item, index,) => {
						return (
							<BarInputBlock
								key={index}
								index={index}
								barForm={barForm}
								setBarForm={setBarForm}
							/>
						)
					},)}
					<div
						className={styles.addInputBtn}
						onClick={() => {
							if (addBtnEnabled) {
								setBarForm((prev,) => {
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
								btnType:  ButtonType.ICON,
								icon:    <PlusBlue width={20} height={20} />,
								size:     Size.MEDIUM,
								color:    Color.NON_OUT_BLUE,
							}}
						/>
					</div>
				</div>
			</div>
			<div className={styles.constructorFooter}>
				<Button<ButtonType.TEXT>
					onClick={handleBarCancel}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Cancel',
						size:    Size.MEDIUM,
						color:   Color.SECONDRAY_GRAY,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={handleBarApply}
					disabled={!barContent.content.length || !barContent.xAxis || !barContent.yAxis}
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
