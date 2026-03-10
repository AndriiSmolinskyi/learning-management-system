import React from 'react'

import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../shared/components'

import {
	saveDraftBtn,
} from '../transactions.styles'

type Props = {
	disabled?: boolean
	tabIndex?: number
	onSaveDraft: () => void
}

export const SaveDraftButton: React.FC<Props> = ({
	disabled = false,
	tabIndex,
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
			tabIndex={tabIndex}
		/>
	)
}
