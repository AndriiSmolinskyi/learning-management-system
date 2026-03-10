import React from 'react'
import {
	Form,
} from 'react-final-form'
import {
	cx,
} from '@emotion/css'
import {
	Message,
} from '../../../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	FormField,
	Size,
} from '../../../../../../shared/components'
import {
	useUpdateDocumentStatus,
} from '../../../../../../shared/hooks'
import type {
	DocumentStatus,
} from '../../../../../../shared/types'
import * as styles from './reason-for-decline.style'

interface IReasonForClosePropts{
	onClose: () => void
	documentsIds?: Array<string>
	status?: DocumentStatus
}

const MAX_COMMENT_LENGTH = 200

interface ICommentFormValues {
	comment: string
}

export const ReasonForClose: React.FC<IReasonForClosePropts> = ({
	documentsIds,
	status,
	onClose,
},) => {
	const {
		mutateAsync: handleChangeStatus,
	} = useUpdateDocumentStatus()

	const handleSubmit = async(values: ICommentFormValues,): Promise<void> => {
		if (documentsIds && status) {
			await handleChangeStatus({
				documentsIds,
				status,
				comment: values.comment,
			},)
		}
		onClose()
	}

	const validate = (value: string | undefined,): string | undefined => {
		if (value) {
			return value.length >= MAX_COMMENT_LENGTH ?
				'error' :
				undefined
		}
		return undefined
	}

	const handleSkip = async(): Promise<void> => {
		if (documentsIds && status) {
			await handleChangeStatus({
				documentsIds,
				status,
			},)
		}
		onClose()
	}

	return (
		<>
			<Form<ICommentFormValues>
				onSubmit={handleSubmit}
				initialValues={{
					comment: '',
				}}
				render={
					({
						handleSubmit,
						submitting,
						values,
						errors,
					},): React.ReactNode => {
						const isSubmitDisabled =
						submitting || !values.comment.trim() || validate(values.comment,) !== undefined
						return (
							<form
								className={styles.container}
								onSubmit={handleSubmit}
							>
								<div className={styles.content}>
									<Message width={42} height={42} />
									<div>
										<h4>Reason for decline</h4>
										<p>Provide a reason for declining the documents.</p>
									</div>
									<FormField
										name='comment'
										placeholder='Enter your comment'
										validate={validate}
									/>
								</div>
								<div className={styles.buttonWrapper}>
									<Button<ButtonType.TEXT>
										loading={submitting}
										disabled={submitting}
										className={cx(styles.buttonStyle, styles.cancelBtn,)}
										additionalProps={{
											text:    'Skip',
											btnType: ButtonType.TEXT,
											size:      Size.MEDIUM,
											color:     Color.MICRO,
										}}
										onClick={handleSkip}
									/>
									<Button<ButtonType.TEXT>
										type='submit'
										className={cx(styles.buttonStyle, styles.addBtn,)}
										loading={submitting}
										disabled={isSubmitDisabled}
										additionalProps={{
											text:    'Submit reason',
											btnType: ButtonType.TEXT,
											size:      Size.MEDIUM,
											color:     Color.BLUE,
										}}
									/>
								</div>
							</form>
						)
					}
				}
			/>
		</>
	)
}
