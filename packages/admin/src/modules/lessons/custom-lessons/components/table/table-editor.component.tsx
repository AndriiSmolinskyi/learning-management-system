/* eslint-disable camelcase */
import React from 'react'
import {
	Editor,
} from '@tinymce/tinymce-react'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../../shared/components'

import * as styles from '../../custom-lessons.styles'

type Props = {
	handleCancel: VoidFunction
	handleApply: (data: string) => void
	height?: number
	initialValue?: string
}

export const TableEditor: React.FC<Props> = ({
	handleApply,
	handleCancel,
	height = 400,
	initialValue,
},) => {
	const [content, setContent,] = React.useState<string>('',)

	return (
		<div className={styles.tableEditorWrapper(height,)}>
			<div className={styles.tableEditorButtons}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						handleApply(content,)
					}}
					disabled={!content}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Save table',
						size:     Size.SMALL,
						color:    Color.BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={handleCancel}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Cancel',
						size:     Size.SMALL,
						color:    Color.MICRO,
					}}
				/>
			</div>
			<Editor
				apiKey={import.meta.env.VITE_TINY_MCE_API_KEY}
				onEditorChange={(content: string,) => {
					setContent(content.replace(/<p>\s*(&nbsp;)?\s*<\/p>/g, '',),)
				}}
				initialValue={initialValue}
				init={{
					height,
					plugins: [
						'table',
					],
					menubar:             false,
					statusbar:           false,
					toolbar:             'undo redo | table',
					newline_behavior:    'linebreak',
					remove_trailing_brs: true,
				}}
			/>
		</div>
	)
}
