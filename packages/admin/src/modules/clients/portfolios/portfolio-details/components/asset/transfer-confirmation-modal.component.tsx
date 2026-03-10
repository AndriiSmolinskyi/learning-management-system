import React from 'react'

import type {
	AssetNamesType,
	TAssetTransfer,
} from '../../../../../../shared/types'
import {
	WarningIcon,
} from '../../../../../../assets/icons'
import {
	Button, ButtonType, Color, Size,
} from '../../../../../../shared/components'
import {
	useTransferAsset,
} from '../../../../../../shared/hooks'
import {
	useUserStore,
} from '../../../../../../store/user.store'

import * as styles from './asset.styles'

type Props = {
	onClose: () => void
	assetProps: TAssetTransfer
	handleTransferSuccess: (isSuccess: boolean) => void
	assetName: AssetNamesType
 }

export const TransferConfirmationDialog: React.FC<Props> = ({
	onClose,
	assetProps,
	handleTransferSuccess,
	assetName,
},) => {
	const {
		isPending,
		mutateAsync: transferAsset,
		isError,
	} = useTransferAsset()
	React.useEffect(() => {
		if (isError) {
			onClose()
		}
	},[isError,],)
	const {
		userInfo,
	} = useUserStore()
	const handleTransfer = async(): Promise<void> => {
		const data = {
			id:          assetProps.id,
			clientId:    assetProps.clientId,
			portfolioId: assetProps.portfolioId,
			entityId:    assetProps.entityId,
			bankId:      assetProps.bankId,
			accountId:   assetProps.accountId,
			assetName,
			userInfo:    {
				email:  userInfo.email,
				name:   userInfo.name,
			},
		}
		const asset = await transferAsset(data,)
		handleTransferSuccess(Boolean(asset,),)
		onClose()
	}
	return (
		<div className={styles.exitModalWrapper} onClick={(e,) => {
			e.stopPropagation()
		}}>
			<WarningIcon/>
			<h4>Transfer Confirmation</h4>
			<p>Are you sure you want to transfer
				<span> {assetProps.assetName ?
					assetProps.assetName :
					'N/A'} </span>
				asset, ISIN
				<span> {assetProps.isin ?
					assetProps.isin :
					'N/A'} </span>,
				Security <span> {assetProps.security ?
					assetProps.security :
					'N/A'} </span> with
				<span> {assetProps.totalUnitsToTransfer ?
					assetProps.totalUnitsToTransfer :
					'N/A'} </span>
				units?</p>
			<div className={styles.exitModalbuttonBlock}>
				<Button<ButtonType.TEXT>
					onClick={onClose}
					className={styles.exitModalButton}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Cancel',
						size:     Size.MEDIUM,
						color:    Color.SECONDARY_RED,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={handleTransfer}
					className={styles.exitModalButton}
					disabled={isPending}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Confirm Transfer',
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
				/>
			</div>
		</div>
	)
}