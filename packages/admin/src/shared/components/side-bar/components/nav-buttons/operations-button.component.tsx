import React from 'react'
import {
	cx,
} from '@emotion/css'

import {
	OperationsDialog,
} from '../nav-dialogs'
import {
	Button, ButtonType, Color, Size,
} from '../../../button'
import {
	Tooltip,
} from '../../../tooltip'
import {
	ListChecks,
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
	profileRef?: React.MutableRefObject<null>
	current: boolean
}

export const OperationsButton: React.FC<Props> = ({
	profileRef,
	current,
},) => {
	const [isOpen, setIsOpen,] = React.useState<boolean>(false,)

	return (
		<div className={clientsBtnWrapper}>
			<OperationsDialog
				popoverRef={profileRef}
				toggleOpen={toggleState(setIsOpen,)}
			>
				<Tooltip text='Operations'>
					<Button<ButtonType.ICON>
						className={cx(sidebarBtn, clientsBtn(isOpen,), current && currentBtn,)}
						additionalProps={{
							icon:    <ListChecks width={20} height={20}/> ,
							btnType:  ButtonType.ICON,
							size:     Size.MEDIUM,
							color:    Color.MICRO,
						}}
					/>
				</Tooltip>
			</OperationsDialog>
		</div>
	)
}