import React from 'react'
import {
	DraftIcon, TrashRed,
} from '../../../../../assets/icons'
import {
	Button, ButtonType, Size, Color,
} from '../../../../../shared/components'
import type {
	IOrderDraft,
} from '../../../../../shared/types'
import {
	useDeleteOrderDraft,
} from '../../../../../shared/hooks/orders/orders.hook'
import * as styles from './order-list-item.style'

interface IOrderDraftItemProps {
	key: number | undefined
	draft: IOrderDraft
	onResume: (draft: IOrderDraft) => void
}

export const OrderDraftItem: React.FC<IOrderDraftItemProps> = ({
	draft, onResume,
},) => {
	const {
		mutate: deleteDraft,
	} = useDeleteOrderDraft()

	const handleDelete = (): void => {
		if (draft.id) {
			deleteDraft(draft.id,)
		}
	}

	return (
		<div className={styles.draftContainer}>
			<div className={styles.draft}>
				<DraftIcon className={styles.draftIcon} />
				<div>
					<p className={styles.draftName}>Draft: {draft.id}</p>
					<p className={styles.draftLast}>Last update
						{new Date(draft.updatedAt ?? 0,).toLocaleDateString('en-US', {
							year:  'numeric',
							month: 'short',
							day:   'numeric',
						},)}
					</p>
				</div>
				<div className={styles.draftBtns}>
					<Button<ButtonType.TEXT>
						disabled={false}
						onClick={() => {
							onResume(draft,)
						}}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Resume',
							size:     Size.SMALL,
							color:    Color.SECONDARY_GREEN,
						}}
					/>
					<Button<ButtonType.ICON>
						disabled={false}
						onClick={handleDelete}
						additionalProps={{
							btnType:  ButtonType.ICON,
							icon:     <TrashRed width={20} height={20}/>,
							size:     Size.SMALL,
							color:    Color.SECONDARY_RED,
						}}
					/>
				</div>
			</div>
		</div>
	)
}
