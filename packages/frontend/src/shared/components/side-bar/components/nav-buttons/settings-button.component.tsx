import React from 'react'
import {
	cx,
} from '@emotion/css'

import {
	SettingsDialog,
} from '../nav-dialogs'
import {
	Button, ButtonType, Color, Size,
} from '../../../button'
import {
	Tooltip,
} from '../../../tooltip'
import {
	Settings,
} from '../../../../../assets/icons'

import {
	toggleState,
} from '../../../../utils'

import {
	clientsBtn,
	clientsBtnWrapper,
	currentBtn,
	sidebarBtn,
} from '../../side-bar.styles'

type Props = {
	settingsRef?: React.MutableRefObject<null>
	current: boolean
}

export const SettingsButton: React.FC<Props> = ({
	settingsRef,
	current,
},) => {
	const [isOpen, setIsOpen,] = React.useState<boolean>(false,)

	return (
		<div className={clientsBtnWrapper}>
			<SettingsDialog
				toggleOpen={toggleState(setIsOpen,)}
			>
				<Tooltip text='Settings'>
					<Button<ButtonType.ICON>
						className={cx(sidebarBtn, clientsBtn(isOpen,), current && currentBtn,)}
						additionalProps={{
							icon:    <Settings width={20} height={20}/> ,
							btnType:  ButtonType.ICON,
							size:     Size.MEDIUM,
							color:    Color.MICRO,
						}}
					/>
				</Tooltip>
			</SettingsDialog>
		</div>
	)
}