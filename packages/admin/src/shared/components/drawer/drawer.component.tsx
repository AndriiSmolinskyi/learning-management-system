import React from 'react'
import {
	Drawer as BlueprintDrawer,
} from '@blueprintjs/core'
import {
	cx,
} from '@emotion/css'

import {
	CloseXIcon,
} from '../../../assets/icons'

import * as styles from './drawer.styles'

type Props = {
	children: React.ReactNode;
	onClose: () => void;
	onClosed?: () => void;
	isOpen: boolean
	className?: string
	isCloseButtonShown?: boolean
	nonPortalContainer?: boolean
}

export const Drawer: React.FC<Props> = ({
	children,
	onClose,
	onClosed,
	isOpen,
	className,
	isCloseButtonShown,
	nonPortalContainer,
},) => {
	React.useEffect(() => {
		const handleEscape = (event: KeyboardEvent,): void => {
			if (event.key === 'Escape') {
				onClose()
			}
		}

		if (isOpen) {
			window.addEventListener('keydown', handleEscape,)
		}

		return () => {
			window.removeEventListener('keydown', handleEscape,)
		}
	}, [isOpen, onClose,],)

	const closeBtn = (
		<button
			type='button'
			className={styles.closeBtnStyle}
			onClick={() => {
				onClose()
			}}
		>
			<CloseXIcon width={20} height={20}/>
		</button>
	)

	const portalContainer = document.getElementById('root',)

	return (
		<BlueprintDrawer
			onClose={onClose}
			onClosed={onClosed}
			isOpen={isOpen}
			usePortal={true}
			hasBackdrop={true}
			portalContainer={nonPortalContainer ?
				undefined :
				portalContainer ?? undefined}
			canOutsideClickClose={true}
			canEscapeKeyClose={false}
			autoFocus={true}
			enforceFocus={true}
			title={isCloseButtonShown ?
				'' :
				null}
			icon={isCloseButtonShown ?
				closeBtn :
				undefined}
			className={cx(styles.drawer, className,)}
			backdropClassName={styles.darwerBackdrop}
		>
			{children}
		</BlueprintDrawer>)
}