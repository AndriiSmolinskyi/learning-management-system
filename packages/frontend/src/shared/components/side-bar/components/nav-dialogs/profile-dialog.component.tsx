import React from 'react'
import {
	Classes,
	Popover,
} from '@blueprintjs/core'
import {
	cx,
} from '@emotion/css'

import {
	ReactComponent as LogOut,
} from '../../../../../assets/icons/log-out-icon.svg'
import {
	ReactComponent as CloseXIcon,
} from '../../../../../assets/icons/close-x.svg'

import {
	useBackdrop,
} from '../../../../../store/backdrop.store'
import {
	getAvatar,
} from '../../utils'

import {
	avatar,
	btnStyle,
	closeBtn,
	info,
	infoWrapper,
	role as roleStyle,
	popoverContainer,
	profileDialogContainer,
	versionStyle,
	bottomBlock,
	hoverZone,
} from './dialog.styles'
interface IProps {
	children: React.ReactNode
	onButtonClick: () => void
	popoverRef?: React.MutableRefObject<null>
	toggleOpen: () => void
}

export const ProfileDialog: React.FC<IProps> = ({
	children,
	onButtonClick,
	popoverRef,
	toggleOpen,
},) => {
	const {
		setVisible,
	} = useBackdrop()

	const content = (
		<div className={profileDialogContainer}>
			<button
				type='button'
				className={cx(closeBtn, Classes.POPOVER_DISMISS,)}
			>
				<CloseXIcon width={20} height={20} />
			</button>
			<button
				type='button'
				onClick={onButtonClick}
				className={btnStyle}
			>
				<LogOut width={20} height={20}/>
				Sign out
			</button>
			<div className={cx(bottomBlock, hoverZone,)}>
				<p className={versionStyle}>
					Version 0.0.1 from 16.03.2026
				</p>
			</div>
		</div>)

	return (
		<Popover
			usePortal={false}
			placement='right-start'
			content={content}
			popoverClassName={cx(popoverContainer, Classes.POPOVER_DISMISS,)}
			popoverRef={popoverRef}
			onOpening={() => {
				setVisible(true,)
				toggleOpen()
			}}
			onClosing={() => {
				setVisible(false,)
				toggleOpen()
			}}
		>
			{children}
		</Popover>
	)
}