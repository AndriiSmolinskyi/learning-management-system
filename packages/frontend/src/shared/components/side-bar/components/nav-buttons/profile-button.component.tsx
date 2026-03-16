import React from 'react'

import {
	ProfileDialog,
} from '../nav-dialogs'
import {
	Button, ButtonType, Color, Size,
} from '../../../button'
import {
	Tooltip,
} from '../../../tooltip'
import {
	ReactComponent as Avatar,
} from '../../../../../assets/icons/avatar-icon.svg'
import {
	ReactComponent as AvatarOpen,
} from '../../../../../assets/icons/avatar-open.svg'

import {
	toggleState,
} from '../../../../utils'

import {
	profileBtn,
	profileBtnWrapper,
} from '../../side-bar.styles'

type Props = {
	handleSignOut: () => Promise<void>
	profileRef?: React.MutableRefObject<null>
}

export const ProfileButton: React.FC<Props> = ({
	handleSignOut, profileRef,
},) => {
	const [isOpen, setIsOpen,] = React.useState<boolean>(false,)

	return (
		<div className={profileBtnWrapper}>
			<ProfileDialog
				popoverRef={profileRef}
				toggleOpen={toggleState(setIsOpen,)}
				onButtonClick={async() => {
					await handleSignOut()
				}}
			>
				<Tooltip text='Profile'>
					<Button<ButtonType.ICON>
						className={profileBtn(isOpen,)}
						additionalProps={{
							icon:  isOpen ?
								<AvatarOpen width={20} height={21}/> :
								<Avatar width={20} height={21}/> ,
							btnType:  ButtonType.ICON,
							size:     Size.MEDIUM,
							color:    Color.MICRO,
						}}
					/>
				</Tooltip>
			</ProfileDialog>
		</div>
	)
}