import * as React from 'react'
import {
	useComplianceCheckStore,
} from '../../../../../../store/compliance-check.store'
import {
	useSearchParams,
} from 'react-router-dom'
import {
	useUpdateDocumentStatus,
} from '../../../../../../shared/hooks'
import {
	ReasonForClose,
} from '../reason-for-decline/reason-for-decline.component'
import {
	toggleState,
} from '../../../../../../shared/utils'
import {
	Dialog,
} from '../../../../../../shared/components'
import {
	DocumentStatus,
} from '../../../../../../shared/types'
import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../../../shared/components'
import {
	useGetTotalsForComplianceCheck,
} from '../../../../../../shared/hooks'
import type {
	Client,
} from '../../../../../../shared/types'
import * as styles from './buttons-block.styles'

export type ButtonStatus = keyof typeof DocumentStatus

interface IButtonsBlockProps {
	userData : Client
}

export const ButtonsBlock: React.FC<IButtonsBlockProps> = ({
	userData,
},) => {
	const {
		data,
	} = useGetTotalsForComplianceCheck(userData.id,)
	const [searchParams, setSearchParams,] = useSearchParams()
	const isValidStatus = (status: string | null,): status is ButtonStatus => {
		return status === 'PENDING' || status === 'APPROVED' || status === 'DECLINED'
	}
	const rawStatus = searchParams.get('status',)
	const initialStatus: ButtonStatus = isValidStatus(rawStatus,) ?
		rawStatus :
		DocumentStatus.PENDING
	const [status, setStatus,] = React.useState<ButtonStatus>(initialStatus,)
	const {
		items, checkAllSelected, portfolioItems, clearAllSelections,
	} = useComplianceCheckStore()

	const documentsIds = items
		.filter((item,) => {
			return item.isChecked
		},)
		.map((item,) => {
			return item.id
		},)
	const porfolioDocumentsIds = portfolioItems
		.flatMap((portfolio,) => {
			return portfolio.documents
		},)
		.filter((item,) => {
			return item.isChecked
		},)
		.map((item,) => {
			return item.id
		},)
	const assetDocumentsIds = portfolioItems
		.flatMap((portfolio,) => {
			return portfolio.entities
				.flatMap((entity,) => {
					return entity.assets
						.flatMap((asset,) => {
							return asset.documents
								.filter((doc,) => {
									return doc.isChecked
								},)
								.map((doc,) => {
									return doc.id
								},)
						},
						)
				},
				)
		},
		)
	const entityDocumentsIds = portfolioItems
		.flatMap((portfolio,) => {
			return portfolio.entities
				.flatMap((entity,) => {
					return entity.documents
						.filter((doc,) => {
							return doc.isChecked
						},)
						.map((doc,) => {
							return doc.id
						},)
				},
				)
		},
		)
	const documentsIdsArrayForUpdate = [...documentsIds, ...porfolioDocumentsIds, ...entityDocumentsIds, ...assetDocumentsIds,]
	React.useEffect(() => {
		checkAllSelected()
	},[items,],)
	const {
		mutateAsync: handleChangeStatus,
	} = useUpdateDocumentStatus()

	const selectedCount = React.useMemo(() => {
		return [
			...items,
			...portfolioItems.flatMap((portfolio,) => {
				return portfolio.documents
			},),
			...portfolioItems.flatMap((portfolio,) => {
				return portfolio.entities.flatMap((entity,) => {
					return [
						...entity.documents,
						...entity.assets.flatMap((asset,) => {
							return asset.documents
						},),
					]
				},)
			},
			),
		]
			.filter((item,) => {
				return item.isChecked
			},)
			.length
	}, [items, portfolioItems,],)

	const handleStatusChange = (newStatus: ButtonStatus,): void => {
		setStatus(newStatus,)
		setSearchParams({
			status: newStatus,
		},)
	}

	const [commentDialogVisible, setCommentDialogVisible,] = React.useState<boolean>(false,)

	const handleCloseCommentDialog = React.useCallback((): void => {
		if (commentDialogVisible && Boolean(documentsIdsArrayForUpdate.length > 0,)) {
			clearAllSelections()
		}
		if (Boolean(documentsIdsArrayForUpdate.length > 0,)) {
			toggleState(setCommentDialogVisible,)()
		}
	}, [commentDialogVisible, documentsIdsArrayForUpdate,],)

	return (
		<div className={styles.buttonsBlockWrapper}>
			<div className={styles.statusButtonsWrapper}>

				<button
					type='button'
					className={styles.statusButton(status === DocumentStatus.PENDING,)}
					disabled={status === DocumentStatus.PENDING}
					onClick={() => {
						handleStatusChange(DocumentStatus.PENDING,)
					}}
				>
					Pending review ({data?.pending})
				</button>
				<p className={styles.buttonDivider}/>
				<button
					type='button'
					className={styles.statusButton(status === DocumentStatus.APPROVED,)}
					disabled={status === DocumentStatus.APPROVED}
					onClick={() => {
						handleStatusChange(DocumentStatus.APPROVED,)
					}}
				>
					Approved ({data?.approved})
				</button>
				<p className={styles.buttonDivider}/>
				<button
					type='button'
					className={styles.statusButton(status === DocumentStatus.DECLINED,)}
					disabled={status === DocumentStatus.DECLINED}
					onClick={() => {
						handleStatusChange(DocumentStatus.DECLINED,)
					}}
				>
					Declined ({data?.declined})
				</button>
			</div>
			<div className={styles.actionButtonsWrapper}>
				{status !== DocumentStatus.DECLINED && (
					selectedCount > 0 ?
						(
							<Button<ButtonType.TEXT>
								type='submit'
								onClick={handleCloseCommentDialog}
								disabled={selectedCount === 0}
								additionalProps={{
									btnType:   ButtonType.TEXT,
									text:      'Decline',
									size:      Size.MEDIUM,
									rightIcon: (
										<span className={styles.quantitySpan(false,)}>
											{selectedCount}
										</span>
									),
									color: Color.SECONDARY_RED,
								}}
							/>
						) :
						(
							<Button<ButtonType.TEXT>
								type='submit'
								onClick={handleCloseCommentDialog}
								disabled={selectedCount === 0}
								additionalProps={{
									btnType: ButtonType.TEXT,
									text:    'Decline',
									size:    Size.MEDIUM,
									color:   Color.SECONDARY_RED,
								}}
							/>
						)
				)}

				{status !== DocumentStatus.APPROVED && (
					selectedCount > 0 ?
						(
							<Button<ButtonType.TEXT>
								type='submit'
								onClick={() => {
									handleChangeStatus({
										documentsIds: documentsIdsArrayForUpdate,
										status:       DocumentStatus.APPROVED,
										comment:      '',
									},)
								}}
								disabled={selectedCount === 0}
								additionalProps={{
									btnType:   ButtonType.TEXT,
									text:      'Approve',
									size:      Size.MEDIUM,
									rightIcon: (
										<span className={styles.quantitySpan(true,)}>
											{selectedCount}
										</span>
									),
									color: Color.SECONDARY_GREEN,
								}}
							/>
						) :
						(
							<Button<ButtonType.TEXT>
								type='submit'
								onClick={() => {
									handleChangeStatus({
										documentsIds: documentsIdsArrayForUpdate,
										status:       DocumentStatus.APPROVED,
										comment:      '',
									},)
								}}
								disabled={selectedCount === 0}
								additionalProps={{
									btnType: ButtonType.TEXT,
									text:    'Approve',
									size:    Size.MEDIUM,
									color:   Color.SECONDARY_GREEN,
								}}
							/>
						)
				)}
			</div>

			<Dialog
				open={commentDialogVisible}
				isCloseButtonShown
				onClose={handleCloseCommentDialog}
			>
				<ReasonForClose
					documentsIds={documentsIdsArrayForUpdate}
					status={DocumentStatus.DECLINED}
					onClose={handleCloseCommentDialog}
				/>
			</Dialog>
		</div>
	)
}