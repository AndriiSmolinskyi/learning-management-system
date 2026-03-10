import React from 'react'
import {
	DraftIcon, TrashRed,
} from '../../../../../../assets/icons'
import {
	Button, ButtonType, Size, Color,
} from '../../../../../../shared/components'
import type {
	ClientDraft,
} from '../../../../../../shared/types'
import {
	useDeleteClientDraft,
} from '../../hooks/use-client-draft-hook'
import {
	useAddClientStore,
} from '../../store'
import * as styles from '../../clients.style'

interface IClientDraftItemProps {
	key: string
	draft: ClientDraft
	onResume: (draft: ClientDraft) => void
}

export const ClientDraftItem: React.FC<IClientDraftItemProps> = ({
	draft, onResume,
},) => {
	const {
		mutateAsync: deleteDraft,
	} = useDeleteClientDraft()

	const handleDelete = (): void => {
		if (draft.id) {
			deleteDraft(draft.id,)
		}
	}

	const {
		setDraftId,
	} = useAddClientStore()

	return (
		<div className={styles.draftContainer}>
			<div className={styles.draft}>
				<DraftIcon className={styles.draftIcon} />
				<div>
					<p className={styles.draftName}>Draft: {draft.id?.slice(0, 8,)}</p>
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
						onClick={() => {
							onResume(draft,)
							setDraftId(draft.id,)
						}}
						disabled={false}
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
