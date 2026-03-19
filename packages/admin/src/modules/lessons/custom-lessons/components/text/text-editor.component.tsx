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

export const TextEditor: React.FC<Props> = ({
	handleApply,
	handleCancel,
	height = 200,
	initialValue,
},) => {
	const [content, setContent,] = React.useState<string>('',)

	return (
		<div className={styles.textEditorWrapper(height,)}>
			<div className={styles.tableEditorButtons}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						handleApply(content,)
					}}
					disabled={!content}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Save text',
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
						color:    Color.SECONDRAY_GRAY,
					}}
				/>
			</div>
			<Editor
				apiKey={import.meta.env.VITE_TINY_MCE_API_KEY}
				onEditorChange={setContent}
				initialValue={initialValue}
				init={{
					plugins: [
						'autolink',
						'charmap',
						'codesample',
						'link',
						'lists',
					],
					height,
					menubar:    false,
					statusbar:  false,
					toolbar:    'undo redo | blocks fontsize | underline bold italic | alignleft aligncenter alignright alignjustify | link numlist bullist charmap',
				}}
			/>
		</div>
	)
}
