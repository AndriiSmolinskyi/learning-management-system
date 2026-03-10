
import * as React from 'react'

import type {
	IBudgetDraft,
} from '../../../../../shared/types'
import {
	DraftIcon,
	Trash,
} from '../../../../../assets/icons'
import {
	Button, ButtonType, Color, Loader, Size,
} from '../../../../../shared/components'
import {
	useDeleteBudgetDraftById,
} from '../../../../../shared/hooks'
import {
	formatDateToThreeLetterMonth,
} from '../../../../../shared/utils'

import * as styles from './budget-draft-card.styles'
import {
	useBudgetStore,
} from '../../budget.store'

interface IBudgetDraftCardProps {
	budgetDraft: IBudgetDraft
	handleResume: (id: string) => void
}

export const BudgetDraftCard: React.FC<IBudgetDraftCardProps> = ({
	budgetDraft,
	handleResume,
},) => {
	const {
		mutateAsync: deleteBudgetDraft,
		isPending,
	} = useDeleteBudgetDraftById()
	const {
		mutatedBudgetIds,
	} = useBudgetStore()
	return (
		<div className={styles.cardWrapper}>
			{mutatedBudgetIds?.includes(budgetDraft.id,) && <Loader width={100}/>}

			<DraftIcon width={32} height={32}/>
			<div className={styles.infoBlock}>
				<p className={styles.draftName}>
					Draft: {budgetDraft.name}
				</p>
				<p className={styles.draftUpdatedText}>
					Last update: {formatDateToThreeLetterMonth(budgetDraft.updatedAt,)}
				</p>
			</div>
			{!mutatedBudgetIds?.includes(budgetDraft.id,) && <div className={styles.buttonBlock}>
				<Button<ButtonType.TEXT>
					disabled={isPending}
					onClick={() => {
						handleResume(budgetDraft.id,)
					}}
					additionalProps={{
						btnType: ButtonType.TEXT,
						size:    Size.SMALL,
						color:   Color.SECONDARY_GREEN,
						text:    'Resume',
					}}
				/>
				<Button<ButtonType.ICON>
					disabled={isPending}
					onClick={async() => {
						await	deleteBudgetDraft(budgetDraft.id,)
					}}
					additionalProps={{
						btnType: ButtonType.ICON,
						size:    Size.SMALL,
						color:   Color.SECONDARY_RED,
						icon:    <Trash width={20} height={20} />	,
					}}
				/>
			</div>}
		</div>
	)
}