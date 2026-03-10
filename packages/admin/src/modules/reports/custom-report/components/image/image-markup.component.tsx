import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	Classes,
	Popover,
} from '@blueprintjs/core'

import {
	Button,
	ButtonType,
	Color,
	Loader,
	Size,
} from '../../../../../shared/components'
import {
	MoreVertical,
	ReplaceIcon,
	Trash,
	XmarkMid,
} from '../../../../../assets/icons'

import {
	toggleState,
} from '../../../../../shared/utils'
import type {
	TReportImageData,
} from '../../custom-report.types'

import * as styles from '../../custom-report.styles'

type Props = {
	item: TReportImageData
	handleDelete?: VoidFunction
	handleEdit?: (data: File) => void
	isEditor?: boolean
}

export const ImageMarkup: React.FC<Props> = ({
	item,
	handleDelete,
	handleEdit,
	isEditor = false,
},) => {
	const ref = React.useRef<HTMLInputElement>(null,)
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)
	const [imagePreview, setImagePreview,] = React.useState<string | undefined>(item.data?.preview,)

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>,): void => {
		const selectedFile = event.target.files?.[0]

		if (selectedFile) {
			handleEdit?.(selectedFile,)
		}

		if (ref.current) {
			ref.current.value = ''
		}
	}

	React.useEffect(() => {
		if (item.file) {
			const reader = new FileReader()
			reader.onloadend = (): void => {
				setImagePreview(reader.result as string,)
			}
			reader.readAsDataURL(item.file,)
		}
	}, [item.file,],)

	const content = (
		<div className={styles.dialogContainer}>
			<div className={styles.menuActions}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					onClick={() => {
						if (ref.current) {
							ref.current.click()
						}
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Replace image',
						leftIcon: <ReplaceIcon width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					onClick={handleDelete}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Delete image',
						leftIcon: <Trash width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_RED,
					}}
				/>
			</div>
		</div>)

	return (
		<div className={styles.reportBlockContaliner}>
			<div className={styles.reportBlockWrapper(isEditor,)}>
				{(!isEditor &&
					<div className={styles.markupPopoverWrapper}>
						<input
							ref={ref}
							type='file'
							accept='image/*'
							onChange={handleFileChange}
							className='hidden-el'
							id='fileInput2'
						/>
						<Popover
							usePortal={false}
							hasBackdrop={false}
							placement='bottom-end'
							content={content}
							popoverClassName={cx(
								styles.popoverContainer,
								Classes.POPOVER_DISMISS,
							)}
							onClose={() => {
								setIsPopoverShown(false,)
							}}
						>
							<Button<ButtonType.ICON>
								onClick={toggleState(setIsPopoverShown,)}
								className={cx(isPopoverShown && styles.closeBtn,)}
								additionalProps={{
									btnType: ButtonType.ICON,
									size:    Size.SMALL,
									color:   Color.BLUE,
									icon:    isPopoverShown ?
										<XmarkMid width={20} height={20} /> :
										<MoreVertical width={20} height={20} />,
								}}
							/>
						</Popover>
					</div>
				)}
				<div className={styles.imageMarkupLoader(Boolean(imagePreview,),)}>
					{imagePreview ?
						(
							<img
								src={imagePreview}
								alt='Image preview'
							/>
						) :
						(
							<Loader
								width={50}
								radius={4}
							/>
						)}
				</div>
			</div>
		</div>
	)
}