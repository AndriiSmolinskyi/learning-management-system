import React from 'react'
import {
	Classes,
	Popover,
} from '@blueprintjs/core'
import {
	cx,
} from '@emotion/css'

import {
	Button, ButtonType, Color, Size,
} from '../../../../../shared/components/button'
import {
	Eye,
	Trash,
} from '../../../../../assets/icons'
import {
	actionBtn,
	dialogContainer,
	menuActions,
	popoverContainer,
} from './card-dialog.styles'
import type {
	IExpenseCategory,
} from '../../../../../shared/types'

interface IProps {
	children: React.ReactNode
	popoverRef?: React.MutableRefObject<null>
	id: string
	handlePopoverCondition?: () => void
	status?: boolean
	isPopoverShown?: boolean
	usePortal?: boolean,
	toggleDeleteVisible: (id?: string) => void
	toggleAddTransaction: (expenseCategory: IExpenseCategory) => void
	toggleCategoryViewDetails: (expenseCategory: IExpenseCategory) => void
	category: IExpenseCategory
}

export const BudgetExpenseCardDialog: React.FC<IProps> = ({
	children,
	popoverRef,
	id,
	handlePopoverCondition,
	status,
	usePortal = false,
	toggleDeleteVisible,
	toggleAddTransaction,
	toggleCategoryViewDetails,
	category,
},) => {
	const content = (
		<div className={dialogContainer}>
			<div className={menuActions}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					onClick={() => {
						toggleCategoryViewDetails(category,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'View details',
						leftIcon: <Eye width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					onClick={() => {
						toggleDeleteVisible(id,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Delete',
						leftIcon: <Trash width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_RED,
					}}
				/>
			</div>
		</div>)

	return (
		<Popover
			usePortal={usePortal}
			placement='left-start'
			content={content}
			popoverClassName={cx(
				popoverContainer,
				Classes.POPOVER_DISMISS,
			)}
			popoverRef={popoverRef}
			autoFocus={false}
			enforceFocus={false}
			onClosing={() => {
				if (handlePopoverCondition) {
					handlePopoverCondition()
				}
			}}
		>
			{children}
		</Popover>
	)
}