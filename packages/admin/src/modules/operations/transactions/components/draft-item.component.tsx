import React from 'react'
import {
	format,
} from 'date-fns'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import {
	DraftIcon,
	Trash,
} from '../../../../assets/icons'

import {
	useDeleteTransactionDraft,
} from '../../../../shared/hooks/transaction'
import {
	Roles,
	type ITransaction,
} from '../../../../shared/types'
import {
	useUserStore,
} from '../../../../store/user.store'

import * as styles from '../transactions.styles'

type Props = {
	draft: ITransaction
	handleResume: (draftId: number) => void
}

export const DraftItem: React.FC<Props> = ({
	draft, handleResume,
},) => {
	const {
		userInfo,
	} = useUserStore()

	const {
		mutateAsync: deleteDraft,
		isPending: isDeleting,
	} = useDeleteTransactionDraft()

	const hasPermission = userInfo.roles.some((role,) => {
		return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
	},)

	return (
		<div className={styles.draftContainer}>
			<div className={styles.draftInfoWrapper}>
				<DraftIcon />
				<div>
					<p>Draft: {draft.id}</p>
					<span>Last update: {format(draft.updatedAt, 'dd.MM.yyyy',)}</span>
				</div>
			</div>
			<div className={styles.draftBtnWrapper}>
				{hasPermission && (<>
					<Button<ButtonType.TEXT>
						disabled={false}
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
				</>)}
			</div>
		</div>
	)
}
