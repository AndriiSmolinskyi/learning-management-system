import * as React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	Dialog as BlueprintDialog,
} from '@blueprintjs/core'

import {
	CloseXIcon,
} from '../../../assets/icons'

import {
	closeBtnStyle,
	dialog,
	dialogBackdrop,
} from './dialog.styles'

interface IDialogProps {
	open: boolean;
	onClose: () => void;
	onClosed?: () => void;
	children: React.ReactNode;
	isCloseButtonShown?: boolean
	className?: string
	backdropClassName?: string
	isPortalUsed?: boolean
}

export const Dialog: React.FunctionComponent<IDialogProps> = ({
	open,
	onClose,
	children,
	className,
	backdropClassName,
	isCloseButtonShown = false,
	isPortalUsed = true,
	onClosed,
},) => {
	React.useEffect(() => {
		const handleEscape = (event: KeyboardEvent,): void => {
			if (event.key === 'Escape') {
				onClose()
			}
		}

		if (open) {
			window.addEventListener('keydown', handleEscape,)
		}

		return () => {
			window.removeEventListener('keydown', handleEscape,)
		}
	}, [open, onClose,],)

	const closeBtn = (
		<button
			type='button'
			className={closeBtnStyle}
			onClick={onClose}
		>
			<CloseXIcon width={20} height={20}/>
		</button>
	)
	return (
		<BlueprintDialog
			usePortal={isPortalUsed}
			isOpen={open}
			onClose={onClose}
			onClosed={onClosed}
			autoFocus={false}
			enforceFocus={false}
			canEscapeKeyClose={false}
			className={cx(dialog, className,)}
			title={isCloseButtonShown ?
				'' :
				undefined}
			backdropClassName={cx(dialogBackdrop, backdropClassName,)}
			icon={isCloseButtonShown ?
				closeBtn :
				undefined}
			isCloseButtonShown={isCloseButtonShown ?
				false :
				undefined}
		>
			{children}
		</BlueprintDialog>
	)
}
export default Dialog
