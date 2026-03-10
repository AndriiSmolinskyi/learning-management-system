/* eslint-disable complexity */
import React from 'react'
import type {
	ITransactionTypeCategory,
} from '../../../../shared/types'
import {
	PenSquareGray, TrashGray, Save,CloseXIcon,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
	Input,
} from '../../../../shared/components'
import {
	toggleState,
} from '../../../../shared/utils'
import {
	useUpdateTransactionTypeCategory,
} from '../../../../shared/hooks/settings/transaction-settings.hook'
import * as styles from './category.style'

type Props = {
	category: ITransactionTypeCategory
	handleDeleteCategory: (id: string | undefined) => void
}

export const CategoryItem: React.FC<Props> = ({
	category,
	handleDeleteCategory,
},) => {
	const [openEdit, setOpenEdit,] = React.useState<boolean>(false,)
	const [editedName, setEditedName,] = React.useState<string>(category.name ?? '',)
	const [error, setError,] = React.useState<string | undefined>(undefined,)
	const [touched, setTouched,] = React.useState(false,)
	const {
		mutateAsync: editCategory,
	} = useUpdateTransactionTypeCategory()

	const validate = (v: string,): string | undefined => {
		const val = v.trim()
		if (!val) {
			return 'required'
		}
		if (val.length < 3) {
			return 'min3'
		}
		return undefined
	}

	const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>,): void => {
		const v = e.target.value
		setEditedName(v,)
		setError(validate(v,),)
	}

	const handleBlur = (): void => {
		setTouched(true,)
		setError(validate(editedName,),)
	}

	const handleCloseEdit = (): void => {
		setOpenEdit(false,)
		setEditedName(category.name!,)
	}

	const handleUpdateCategory = (): void => {
		if (category.id && editedName) {
			editCategory({
				id: category.id, name: editedName,
			},)
		}
		setOpenEdit(false,)
	}

	return (
		<div className={styles.item(openEdit,)}>
			<div className={styles.itemTop}>
				<p className={styles.itemTitle}>{category.name}</p>
				<div className={styles.itemRight}>
					{!openEdit &&
						<Button<ButtonType.ICON>
							onClick={toggleState(setOpenEdit,)}
							additionalProps={{
								btnType: ButtonType.ICON,
								size:    Size.MEDIUM,
								color:   Color.NONE,
								icon:    <PenSquareGray width={20} height={20}/>,
							}}
						/>
					}
					{!openEdit &&
						<Button<ButtonType.ICON>
							onClick={() => {
								handleDeleteCategory(category.id,)
							}}
							additionalProps={{
								btnType: ButtonType.ICON,
								size:    Size.MEDIUM,
								color:   Color.NONE,
								icon:    <TrashGray width={20} height={20}/>,
							}}
						/>
					}
					{openEdit &&
						<Button<ButtonType.ICON>
							onClick={handleCloseEdit}
							additionalProps={{
								btnType: ButtonType.ICON,
								size:    Size.MEDIUM,
								color:   Color.NONE,
								icon:    <CloseXIcon width={20} height={20}/>,
							}}
						/>
					}
					{openEdit &&
						<Button<ButtonType.ICON>
							onClick={handleUpdateCategory}
							disabled={Boolean(error,)}
							additionalProps={{
								btnType: ButtonType.ICON,
								size:    Size.MEDIUM,
								color:   Color.NONE,
								icon:    <Save width={20} height={20}/>,
							}}
						/>
					}
				</div>
			</div>
			{openEdit &&
				<div className={styles.inputBlock}>
					<Input
						name='categoryName'
						label=''
						error={error}
						touched={touched}
						showError={false}
						input={{
							value:       editedName,
							onChange:    handleChangeName,
							placeholder: 'Category text',
							autoFocus:   true,
							onBlur:      handleBlur,
						}}
					/>
				</div>
			}
		</div>
	)
}