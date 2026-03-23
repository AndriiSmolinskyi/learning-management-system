import React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Input,
	Size,
} from '../../../../../shared/components'

import type {
	TLineSetup,
} from '../../custom-lessons.types'

import * as styles from '../../custom-lessons.styles'

type Props = {
	lineSetup: TLineSetup
	setLineSetup: React.Dispatch<React.SetStateAction<TLineSetup>>
	handleCancel: VoidFunction
	handleSave: VoidFunction
}

export const LineConstructor: React.FC<Props> = ({
	lineSetup,
	setLineSetup,
	handleCancel,
	handleSave,
},) => {
	return (
		<div className={styles.lineSetupWpapper}>
			<div>
				<p>Setup line</p>
				<Input
					label='Line name'
					input={{
						value:       lineSetup.line,
						placeholder: 'Enter line name',
						onChange:    (e,) => {
							setLineSetup((prev,) => {
								return {
									...prev,
									line: e.target.value,
								}
							},)
						},
					}}
				/>
				<Input
					label='Y-axis values'
					input={{
						value:       lineSetup.yAxisValues,
						placeholder: 'e.g., "1, 2, 3, 4"',
						onChange:    (e,) => {
							setLineSetup((prev,) => {
								return {
									...prev,
									yAxisValues: e.target.value,
								}
							},)
						},
					}}
				/>
				<Input
					label='X-axis values'
					input={{
						value:       lineSetup.xAxisValues,
						placeholder: 'e.g., "1, 2, 3, 4"',
						onChange:    (e,) => {
							setLineSetup((prev,) => {
								return {
									...prev,
									xAxisValues: e.target.value,
								}
							},)
						},
					}}
				/>
				<div >
					<Button<ButtonType.TEXT>
						onClick={handleCancel}
						additionalProps={{
							btnType: ButtonType.TEXT,
							text:    'Cancel',
							size:    Size.SMALL,
							color:   Color.SECONDRAY_GRAY,
						}}
					/>
					<Button<ButtonType.TEXT>
						onClick={handleSave}
						disabled={Boolean(!lineSetup.line.trim() || !lineSetup.xAxisValues.trim() || !lineSetup.yAxisValues.trim(),)}
						additionalProps={{
							btnType:   ButtonType.TEXT,
							text:      'Save',
							size:      Size.SMALL,
						}}
					/>
				</div>
			</div>
		</div>
	)
}
