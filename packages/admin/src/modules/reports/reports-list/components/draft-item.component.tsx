import React from 'react'
import {
	format,
} from 'date-fns'
import {
	useNavigate,
} from 'react-router-dom'

import {
	DraftIcon,
	Trash,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'

import type {
	IReportDraft,
} from '../../../../shared/types'
import {
	useDeleteReportDraft,
} from '../../../../shared/hooks/reports'
import {
	RouterKeys,
} from '../../../../router/keys'

import * as styles from '../reports.styles'

type Props = {
	draft: IReportDraft
}

export const DraftItem: React.FC<Props> = ({
	draft,
},) => {
	const navigate = useNavigate()
	const {
		mutateAsync: deleteDraft,
		isPending: isDeleting,
	} = useDeleteReportDraft()
	return (
		<div className={styles.draftContainer}>
			<div className={styles.draftInfoWrapper}>
				<DraftIcon/>
				<div>
					<p>Draft: {draft.id}</p>
					<span>Last update: {format(draft.updatedAt, 'dd.MM.yyyy',)}</span>
				</div>
			</div>
			<div className={styles.draftBtnWrapper}>
				<Button<ButtonType.TEXT>
					disabled={isDeleting}
					onClick={() => {
						navigate(`${RouterKeys.REPORTS}/${RouterKeys.CUSTOM_REPORT}`, {
							state: {
								reportDraftId: draft.id,
								reportId:      null,
								customPayload: null,
							},
						},)
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
