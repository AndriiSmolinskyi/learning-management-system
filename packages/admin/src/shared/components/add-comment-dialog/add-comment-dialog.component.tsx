import React from 'react'
import {
	Form,
} from 'react-final-form'
import {
	cx,
} from '@emotion/css'
import {
	Button,
	ButtonType,
	Color,
	FormField,
	Size,
} from '..'
import {
	MessageIcon,
} from '../../../assets/icons'
import type {
	EditClientProps,
} from '../../../services/client'
import type {
	Client,
} from '../../../shared/types'
import {
	useUpdateClient,
} from '../../../modules/clients/client-profiles/client-details/hooks'

import * as styles from './add-comment-dialog.styles'

type Props = Pick<Client, 'comment' | 'id'> & {
	onClose: () => void
}

const MAX_COMMENT_LENGTH = 200

type CommentFormValues = Pick<EditClientProps, 'comment'>

export const AddCommentDialog: React.FC<Props> = ({
	comment,
	id,
	onClose,
},) => {
	const {
		mutateAsync,
	} = useUpdateClient()

	const handleSubmit = async(values: CommentFormValues,): Promise<void> => {
		await mutateAsync({
			comment: values.comment ?? '', id,
		},)
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

	return (
		<>
			<Form<CommentFormValues>
				onSubmit={handleSubmit}
				initialValues={{
					comment,
				}}
				render={
					({
						handleSubmit,
						submitting,
						values,
						errors,
					},): React.ReactNode => {
						return (
							<form
								className={styles.container}
								onSubmit={handleSubmit}
							>
								<div className={styles.content}>
									<MessageIcon width={42} height={42} />
									<div>
										<h4>{comment ?
											'Update comment' :
											'Add comment'}
										</h4>
										<p>Provide additional notes or details for this client.</p>
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
											text:    'Cancel',
											btnType: ButtonType.TEXT,
											size:      Size.MEDIUM,
											color:     Color.SECONDRAY_GRAY,
										}}
										onClick={onClose}
									/>
									<Button<ButtonType.TEXT>
										type='submit'
										className={cx(styles.buttonStyle, styles.addBtn,)}
										loading={submitting}
										disabled={Boolean(errors?.['comment'],) || submitting || (!comment && !values.comment?.trim())}
										additionalProps={{
											text:    comment ?
												'Update comment' :
												'Add comment',
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