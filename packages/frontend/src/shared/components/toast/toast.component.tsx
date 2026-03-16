import * as React from 'react'

// import {
// 	ReactComponent as ErrorIcon,
// } from '../../../assets/icons/error_icon.svg'
// import {
// 	ReactComponent as SuccessIcon,
// } from '../../../assets/icons/success_icon.svg'

import type {
	ToastType,
} from '../../../services/toaster/toaster.types'

import {
	container,
	iconWrapper,
	info,
} from './toast.styles'

export interface IToastProps {
	message?: string
	toastType: ToastType
}

export const Toast: React.FunctionComponent<IToastProps> = ({
	toastType,
	message,
},) => {
	return (
		<div className={container}>
			<div className={iconWrapper}>
				{/* {toastType === 'success' && <SuccessIcon width={36} height={36}/>} */}
				{/* {toastType === 'error' && <ErrorIcon width={28} height={28}/>} */}
			</div>
			<div className={info}>
				<p>{message}</p>
			</div>
		</div>
	)
}

export default Toast