/* eslint-disable complexity */
import * as React from 'react'
import {
	useLocation,
} from 'react-router-dom'

import {
	Button,
	ButtonType,
	Color,
	Input,
	Size,
} from '../../../../shared/components'
import {
	WarningIcon,
} from '../../../../assets/icons'
import {
	useDeleteRefactoredAssetById,
} from '../../../../shared/hooks'
import type {
	AssetNamesType,
} from '../../../../shared/types'
import {
	useUserStore,
} from '../../../../store/user.store'

import * as styles from './delete-asset-modal.styles'

interface IDeleteModalProps {
	onClose: () => void
	assetId: string | undefined
	assetName: AssetNamesType
	cashAssetTotal?: number
	handleDeletedAssetIds?: (id: string) => void
}

export const DeleteAssetModal: React.FC<IDeleteModalProps> = ({
	onClose,
	assetId,
	cashAssetTotal,
	handleDeletedAssetIds,
	assetName,
},) => {
	const [reason, setReason,] = React.useState<string | null>(null,)
	const [showError, setShowError,] = React.useState(false,)
	const {
		pathname,
	} = useLocation()
	const {
		userInfo,
	} = useUserStore()
	const {
		mutateAsync: deleteAsset,
		isPending: isDeleting,
		isError,
	} = useDeleteRefactoredAssetById(pathname,)

	React.useEffect(() => {
		if (isError) {
			onClose()
		}
	}, [isError,],)
	const handleDelete = async(): Promise<void> => {
		if (assetId && userInfo.name && reason) {
			handleDeletedAssetIds?.(assetId,)
			onClose()
			await deleteAsset({
				id:       assetId,
				assetName,
				userInfo: {
					email: userInfo.email,
					name:  userInfo.name,
					reason,
				},
			},)
		}
	}
	const handleDeletionReason = (e: React.ChangeEvent<HTMLInputElement>,): void => {
		setReason(e.target.value || null,)
		if (e.target.value.trim().length >= 1) {
			setShowError(false,)
		} else {
			setShowError(true,)
		}
	}
	return (
		<div className={styles.exitModalWrapper}>
			<WarningIcon width={42} height={42}/>
			<h4>Are you sure you want to delete this asset? {cashAssetTotal !== 0 && cashAssetTotal !== undefined && 'This cash currency has related transactions'}</h4>
			<Input
				name='search'
				label=''
				input={{
					value:       reason ?? '',
					onChange:    handleDeletionReason,
					placeholder: 'Reason',
					autoFocus:   true,
				}}
				error='Minimum 1 character required'
				showError={showError || !reason}
			/>
			<div className={styles.exitModalbuttonBlock}>
				<Button<ButtonType.TEXT>
					className={styles.viewDetailsButton}
					onClick={onClose}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Cancel',
						size:     Size.MEDIUM,
						color:    Color.SECONDRAY_GRAY,
					}}
				/>
				<Button<ButtonType.TEXT>
					disabled={isDeleting || showError || !reason}
					className={styles.addButton}
					onClick={handleDelete}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Delete',
						size:     Size.MEDIUM,
						color:    Color.SECONDARY_RED,
					}}
				/>
			</div>

		</div>
	)
}