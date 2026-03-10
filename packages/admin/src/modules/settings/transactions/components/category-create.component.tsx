import React from 'react'
import {
	Button,
	ButtonType,
	Color,
	Size,
	Input,
} from '../../../../shared/components'
import {
	PlusBlue,
	Save,
	CloseXIcon,
} from '../../../../assets/icons'
import {
	useCreateTransactionCategory,
} from '../../../../shared/hooks/settings/transaction-settings.hook'
import * as styles from './category.style'

export const CategoryCreate: React.FC = () => {
	const {
		mutateAsync: createCategory,
	} = useCreateTransactionCategory()
	const [openCreate, setOpenCreate,] = React.useState<boolean>(false,)
	const [createdName, setCreatedName,] = React.useState<string>('',)
	const [error, setError,] = React.useState<string | undefined>(undefined,)
	const [touched, setTouched,] = React.useState(false,)

	const handleCreateOpen = (): void => {
		setOpenCreate(true,)
	}

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
		setCreatedName(v,)
		setError(validate(v,),)
	}

	const handleBlur = (): void => {
		setTouched(true,)
		setError(validate(createdName,),)
	}

	const handleCloseCreate = (): void => {
		setOpenCreate(false,)
		setCreatedName('',)
	}

	const handleCreateCategory = (): void => {
		createCategory(createdName,)
		setOpenCreate(false,)
		setCreatedName('',)
	}

	return (
		<>
			{!openCreate &&
					<div className={styles.createCategoryBlock}>
						<Button<ButtonType.TEXT>
							onClick={handleCreateOpen}
							additionalProps={{
								btnType:  ButtonType.TEXT,
								text:     'Add category',
								size:     Size.SMALL,
								color:    Color.NON_OUT_BLUE,
								leftIcon: <PlusBlue width={20} height={20}/>,
							}}
						/>
					</div>
			}

			{openCreate &&
				<div className={styles.item(openCreate,)}>
					<div className={styles.itemTop}>
						<p className={styles.itemTitle}>Create category</p>

						<div className={styles.itemRight}>
							<Button<ButtonType.ICON>
								onClick={handleCloseCreate}
								additionalProps={{
									btnType: ButtonType.ICON,
									size:    Size.MEDIUM,
									color:   Color.NONE,
									icon:    <CloseXIcon width={20} height={20}/>,
								}}
							/>
							<Button<ButtonType.ICON>
								onClick={handleCreateCategory}
								disabled={Boolean(error,)}
								additionalProps={{
									btnType: ButtonType.ICON,
									size:    Size.MEDIUM,
									color:   Color.NONE,
									icon:    <Save width={20} height={20}/>,
								}}
							/>
						</div>
					</div>
					<div className={styles.inputBlock}>
						<Input
							name='categoryName'
							label=''
							error={error}
							touched={touched}
							showError={false}
							input={{
								value:       createdName,
								onChange:    handleChangeName,
								placeholder: 'Create category',
								autoFocus:   true,
								onBlur:      handleBlur,
							}}
						/>
					</div>
				</div>
			}
		</>
	)
}