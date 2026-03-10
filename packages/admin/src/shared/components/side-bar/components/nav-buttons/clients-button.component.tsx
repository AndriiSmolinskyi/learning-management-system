import React from 'react'
import {
	cx,
} from '@emotion/css'

import {
	ClientsDialog,
} from '../nav-dialogs'
import {
	Button, ButtonType, Color, Size,
} from '../../../button'
import {
	Tooltip,
} from '../../../tooltip'
import {
	ReactComponent as Users,
} from '../../../../../assets/icons/users-icon.svg'

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

export const ClientsButton: React.FC<Props> = ({
	profileRef,
	current,
},) => {
	const [isOpen, setIsOpen,] = React.useState<boolean>(false,)

	return (
		<div className={clientsBtnWrapper}>
			<ClientsDialog
				popoverRef={profileRef}
				toggleOpen={toggleState(setIsOpen,)}
			>
				<Tooltip text='Clients'>
					<Button<ButtonType.ICON>
						className={cx(sidebarBtn, clientsBtn(isOpen,), current && currentBtn,)}
						additionalProps={{
							icon:    <Users width={20} height={20}/> ,
							btnType:  ButtonType.ICON,
							size:     Size.MEDIUM,
							color:    Color.MICRO,
						}}
					/>
				</Tooltip>
			</ClientsDialog>
		</div>
	)
}