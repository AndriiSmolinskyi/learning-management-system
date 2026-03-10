import React from 'react'
import {
	useTransactionTypeForList,
} from '../../../../shared/hooks/settings/transaction-settings.hook'
import {
	CategoryItem,
} from './category-item.component'
import {
	DeleteCategoryModal,
} from './delete-category-modal.component'
import {
	toggleState,
} from '../../../../shared/utils'
import {
	Dialog,
} from '../../../../shared/components'
import {
	CategoryCreate,
} from './category-create.component'
import * as styles from './category.style'

export const Category: React.FC = () => {
	const {
		data: categoryList,
	} = useTransactionTypeForList()
	const [isDeleteModalShowed, setIsDeleteModalShown,] = React.useState(false,)
	const [categoryId, setCategoryId,] = React.useState<string | undefined>(undefined,)

	const toggleDeleteDialog = toggleState(setIsDeleteModalShown,)

	const handleDeleteCategory = (id: string | undefined,): void => {
		setCategoryId(id,)
		toggleDeleteDialog()
	}

	return (
		<div className={styles.container}>
			<h3 className={styles.header}>Categories</h3>
			<div className={styles.body}>
				{categoryList?.map((category,) => {
					return (
						<CategoryItem
							key={category.id}
							category={category}
							handleDeleteCategory={handleDeleteCategory}
						/>
					)
				},)}
				<CategoryCreate/>
			</div>
			<Dialog
				onClose={() => {
					setIsDeleteModalShown(false,)
				}}
				open={isDeleteModalShowed}
				isCloseButtonShown
			>
				<DeleteCategoryModal
					onClose={toggleDeleteDialog}
					categoryId={categoryId}
				/>
			</Dialog>
		</div>
	)
}