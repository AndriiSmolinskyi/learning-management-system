import React from 'react'
import {
	format,
} from 'date-fns'

import {
	DocsIcon, Trash,
} from '../../../../assets/icons'

import type {
	IRequestDraft,
} from '../../../../shared/types'
import {
	Button, ButtonType, Color, Size,
} from '../../../../shared/components'

import * as styles from '../requests.styles'
import {
	useDeleteRequestDraft,
} from '../../../../shared/hooks/requests'

type Props = {
	draft: IRequestDraft
	handleResume: (id: number) => void
}

export const DraftItem: React.FC<Props> = ({
	handleResume,
	draft,
},) => {
	const {
		mutateAsync: deleteDraft, isPending: isDeleting,
	} = useDeleteRequestDraft()
	return (
		<div className={styles.draftContainer}>
			<div className={styles.draftInfoWrapper}>
				<DocsIcon/>
				<div>
					<p>Draft: {draft.id}</p>
					<span>Last update: {format(draft.updatedAt, 'dd.MM.yyyy',)}</span>
				</div>
			</div>
			<div className={styles.draftBtnWrapper}>
				<Button<ButtonType.TEXT>
					disabled={isDeleting}
					onClick={() => {
						handleResume(draft.id,)
					}}
					additionalProps={{
						btnType: ButtonType.TEXT,
						size:    Size.SMALL,
						color:   Color.SECONDARY_GREEN,
						text:    'Resume',
					}}
				/>
				<Button<ButtonType.ICON>
					disabled={isDeleting}
					onClick={async() => {
						await	deleteDraft(draft.id,)
					}}
					additionalProps={{
						btnType: ButtonType.ICON,
						size:    Size.SMALL,
						color:   Color.SECONDARY_RED,
						icon:    <Trash className={styles.trashIcon}/>,
					}}
				/>
			</div>
		</div>
	)
}
