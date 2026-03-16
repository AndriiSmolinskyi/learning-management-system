import * as React from 'react'
import {
	Button,
	ButtonType,
	Size,
	Color,
	Input,
} from '..'
import {
	Dialog,
} from '../dialog/dialog.component'

import * as styles from './customDialog.styles'
import {
	cx,
} from '@emotion/css'

interface IProps {
	open: boolean
	icon?: React.ReactElement | null
	title?: string
	description?: string;
	content?: React.ReactNode
	isCloseButtonShown?: boolean
	isCancelBtn?: boolean
	cancelBtnColor?: Color
	submitBtnColor?: Color
	cancelBtnText?: string,
	submitBtnText?: string,
	isCancelBtnDisable?: boolean,
	isSubmitBtnDisable?: boolean,
	reason?: string | null
	showError?: boolean
	onCancel: () => void;
	onSubmit?: () => void;
	onCloseButtonClick?: () => void
	handleDeletionReason?: (e: React.ChangeEvent<HTMLInputElement>,) => void
}

export const CustomDialog: React.FC<IProps> = ({
	open,
	icon = null,
	title = '',
	description = '',
	content,
	isCloseButtonShown = false,
	isCancelBtn = true,
	cancelBtnColor = Color.SECONDRAY_GRAY,
	submitBtnColor = Color.BLUE,
	cancelBtnText = 'Cancel',
	submitBtnText = 'Save',
	isCancelBtnDisable = false,
	isSubmitBtnDisable = false,
	reason,
	showError,
	handleDeletionReason,
	onCancel,
	onSubmit,
	onCloseButtonClick,
},) => {
	return (
		<Dialog
			open={open}
			isCloseButtonShown={isCloseButtonShown}
			onClose={() => {
				if (onCloseButtonClick) {
					onCloseButtonClick()
				} else {
					onCancel()
				}
			}
			}
		>
			<div className={styles.mainWrapper}>
				<div className={cx(styles.contentWrapper, handleDeletionReason ?
					styles.marginBottom12px :
					'',)}>
					{icon}
					<h4 className={styles.title}>{title}</h4>
					<p className={styles.description}>{description}</p>
					{content}
				</div>
				{handleDeletionReason && <Input
					name='search'
					label=''
					input={{
						value:       reason ?? '',
						onChange:    handleDeletionReason,
						placeholder: 'Reason',
						autoFocus:   true,
					}}
					error='Minimum 1 character required'
					showError={showError}
				/>}
				<div className={styles.buttonWrapper}>
					{isCancelBtn && (
						<Button<ButtonType.TEXT>
							disabled={isCancelBtnDisable}
							className={styles.buttonStyle}
							onClick={onCancel}
							additionalProps={{
								text:    cancelBtnText,
								btnType: ButtonType.TEXT,
								size:    Size.MEDIUM,
								color:   cancelBtnColor,
							}}
						/>
					)}
					<Button<ButtonType.TEXT>
						className={styles.buttonStyle}
						disabled={isSubmitBtnDisable || showError}
						onClick={onSubmit}
						additionalProps={{
							text:    submitBtnText,
							btnType: ButtonType.TEXT,
							size:    Size.MEDIUM,
							color:   submitBtnColor,
						}}
					/>
				</div>
			</div>
		</Dialog>
	)
}
export default Dialog
