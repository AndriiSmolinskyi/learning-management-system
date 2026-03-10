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
	useUserStore,
} from '../../../../../store/user.store'
import {
	getAvatar,
} from '../../utils'
import {
	ROLES_NAMES,
} from '../../../../constants'

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
	clearCacheWrapper,
	hoverZone,
} from './dialog.styles'
import {
	Button, ButtonType, Color, Size,
} from '../../../../../shared/components/button'
import {
	useGetRedisCacheCleared,
} from '../../../../hooks'
import {
	Roles,
} from '../../../../../shared/types'

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
	const [isAllowed, setIsAllowed,] = React.useState(false,)

	const {
		userInfo,
	} = useUserStore()

	const {
		setVisible,
	} = useBackdrop()

	const {
		mutateAsync: clearRedisCache,
		isPending,
	} = useGetRedisCacheCleared()
	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		if (hasPermission) {
			setIsAllowed(true,)
		}
	}, [userInfo.roles,],)
	const content = (
		<div className={profileDialogContainer}>
			<button
				type='button'
				className={cx(closeBtn, Classes.POPOVER_DISMISS,)}
			>
				<CloseXIcon width={20} height={20} />
			</button>
			<div className={infoWrapper}>
				<div className={avatar}>
					<span>{getAvatar(userInfo.name,)}</span>
				</div>
				<div className={info}>
					<p>{userInfo.name}</p>
					<span>{userInfo.email}</span>
				</div>
			</div>
			{userInfo.roles.length > 0 && (
				userInfo.roles.map((role,) => {
					return (
						<div key={role} className={roleStyle}>
							<p>{ROLES_NAMES[role]}</p>
							<span/>
						</div>
					)
				},)
			)}
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
					Version 4.0.7 from 06.01.2026
				</p>
				<div className={cx(clearCacheWrapper, 'clearCache',)}>
					{isAllowed && <Button<ButtonType.TEXT>
						onClick={async(e,) => {
							e.stopPropagation()
							await clearRedisCache()
						}}
						disabled={isPending}
						additionalProps={{
							btnType: ButtonType.TEXT,
							text:    'Clear cache',
							size:    Size.SMALL,
							color:   Color.BLUE,
						}}
					/>}
				</div>
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