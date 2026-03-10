import React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'

import {
	saveDraftBtn,
} from '../requests.styles'

type Props = {
	disabled?: boolean
	onSaveDraft: () => void
}

export const SaveDraftButton: React.FC<Props> = ({
	disabled = false,
	onSaveDraft,
},) => {
	return (
		<Button<ButtonType.TEXT>
			disabled={disabled}
			additionalProps={{
				btnType: ButtonType.TEXT,
				text:    'Save as draft',
				size:    Size.MEDIUM,
				color:   Color.NON_OUT_BLUE,
			}}
			onClick={onSaveDraft}
			className={saveDraftBtn}
		/>
	)
}
