/* eslint-disable complexity */
import React from 'react'
import {
	Popover, Classes,
} from '@blueprintjs/core'
import {
	cx,
} from '@emotion/css'
import {
	Eye,
	PenSquare,
	XmarkMid,
	Redo,
	MoreVertical,
	Trash,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Dialog,
	Drawer,
	Size,
} from '../../../../shared/components'
import {
	AssetDrawer,
} from '../../../clients/portfolios/portfolio-details/components/sub-items-list/asset-drawer.component'
import {
	EditAsset, TransferAssetDialog,
} from '../../../clients/portfolios/portfolio-details/components/asset'
import {
	useGetRefactoredAssetById,
} from '../../../../shared/hooks'
import {
	useUserStore,
} from '../../../../store/user.store'
import type {
	IAsset,
} from '../../../../shared/types'
import {
	AssetNamesType,
	Roles,
} from '../../../../shared/types'
import type {
	TOptionsAssetAnalytics,
} from '../../../../services/analytics/analytics.types'
import {
	toggleState,
	isDateFromPast,
} from '../../../../shared/utils'

import * as styles from '../options.styles'
import * as assetStyles from '../../../clients/portfolios/portfolio-details/components/sub-items-list/sub-items.style'

type Props = {
	row: TOptionsAssetAnalytics
	refetchData: () => void
	handleOpenDeleteModal: (assetId: string) => void
}

export const ItemDetails: React.FC<Props> = ({
	row,
	refetchData,
	handleOpenDeleteModal,
},) => {
	const {
		userInfo,
	} = useUserStore()
	const [currentAssetId, setCurrentAssetId,] = React.useState<string | undefined>()
	const [asset, setAsset,] = React.useState<IAsset | undefined>()
	const [isAllowed, setIsAllowed,] = React.useState(false,)
	const [isPopoverOpen, setIsPopoverOpen,] = React.useState(false,)
	const [isDrawerOpen, setIsDrawerOpen,] = React.useState(false,)
	const [isEditDrawerOpen, setIsEditDrawerOpen,] = React.useState(false,)
	const [isTransferDialogOpen, setIsTransferDialogOpen,] = React.useState(false,)
	const transferStateToggle = toggleState(setIsTransferDialogOpen,)

	const hasMainId = Boolean(row.assetMainId,)
	const {
		data,
	} = useGetRefactoredAssetById({
		id:        currentAssetId ?? '',
		assetName: AssetNamesType.OPTIONS,
		...(hasMainId ?
			{
				isVersion: true,
			} :
			{
			}),
	},)

	React.useEffect(() => {
		if (data) {
			setAsset(data,)
		}
	}, [data,],)

	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		if (hasPermission) {
			setIsAllowed(true,)
		}
	}, [],)

	const isDatePast = isDateFromPast(row.startDate,)

	return (
		<>
			<Popover
				isOpen={isPopoverOpen}
				usePortal={true}
				autoFocus={false}
				enforceFocus={false}
				placement='right-start'
				popoverClassName={cx(assetStyles.popoverContainer, Classes.POPOVER_DISMISS,)}
				onInteraction={(nextOpenState, e,) => {
					if (e) {
						e.stopPropagation()
					}
					if (!nextOpenState) {
						setCurrentAssetId(undefined,)
					}
					setIsPopoverOpen(nextOpenState,)
				}}
				content={
					<div className={assetStyles.dialogContainer}>
						<div className={assetStyles.menuActions}>
							<Button
								onClick={() => {
									setIsDrawerOpen(true,)
								}}
								className={cx(Classes.POPOVER_DISMISS, assetStyles.actionBtn,)}
								additionalProps={{
									btnType:  ButtonType.TEXT,
									size:     Size.MEDIUM,
									color:    Color.NON_OUT_BLUE,
									text:     'View details',
									leftIcon: <Eye width={20} height={20} />,
								}}
							/>
							{isAllowed && (
								<>
									{!row.isTransferred && <Button
										className={cx(Classes.POPOVER_DISMISS, assetStyles.actionBtn,)}
										onClick={() => {
											setIsEditDrawerOpen(true,)
										}}
										additionalProps={{
											btnType:  ButtonType.TEXT,
											size:     Size.MEDIUM,
											color:    Color.NON_OUT_BLUE,
											text:     'Edit',
											leftIcon: <PenSquare width={20} height={20} />,
										}}
									/>}
									{/* {!hasMainId &&
										<Button
											className={cx(Classes.POPOVER_DISMISS, assetStyles.actionBtn,)}
											disabled
											additionalProps={{
												btnType:  ButtonType.TEXT,
												size:     Size.MEDIUM,
												color:    Color.NON_OUT_BLUE,
												text:     'Transfer',
												leftIcon: <Redo width={20} height={20} />,
											}}
											onClick={() => {
												setIsTransferDialogOpen(true,)
											}}
										/>
									} */}
									{!hasMainId && isDatePast && !row.isTransferred && <Button
										className={cx(Classes.POPOVER_DISMISS, assetStyles.actionBtn,)}
										additionalProps={{
											btnType:  ButtonType.TEXT,
											size:     Size.MEDIUM,
											color:    Color.NON_OUT_BLUE,
											text:     'Transfer',
											leftIcon: <Redo width={20} height={20} />,
										}}
										onClick={() => {
											setIsTransferDialogOpen(true,)
										}}
									/>}
									{!hasMainId && !row.isTransferred &&
										<Button<ButtonType.TEXT>
											className={cx(Classes.POPOVER_DISMISS, assetStyles.actionBtn,)}
											onClick={() => {
												handleOpenDeleteModal(row.id,)
											}}
											additionalProps={{
												btnType:  ButtonType.TEXT,
												text:     'Delete',
												leftIcon: <Trash width={20} height={20} />,
												size:     Size.MEDIUM,
												color:    Color.NON_OUT_RED,
											}}
										/>
									}
								</>
							)}
						</div>
					</div>
				}
			>
				<Button
					onClick={() => {
						setCurrentAssetId(row.id,)
					}}
					className={styles.popoverBtn}
					additionalProps={{
						btnType: ButtonType.ICON,
						size:    Size.SMALL,
						color:   Color.NONE,
						icon:    isPopoverOpen ?
							(<XmarkMid width={20} height={20} />) :
							(<MoreVertical width={20} height={20} />),
					}}
				/>
			</Popover>
			{asset && (
				<>
					<AssetDrawer
						isOpen={isDrawerOpen}
						onClose={() => {
							setAsset(undefined,)
							setCurrentAssetId(undefined,)
							setIsDrawerOpen(false,)
						}}
						asset={asset}
						onEditAsset={() => {
							setIsDrawerOpen(false,)
							setIsEditDrawerOpen(true,)
						}}
						onTransferClick={transferStateToggle}
					/>
					<Drawer
						isOpen={isEditDrawerOpen}
						onClose={() => {
							setCurrentAssetId(undefined,)
							setIsEditDrawerOpen(false,)
						}}
						onClosed={() => {
							setAsset(undefined,)
							setCurrentAssetId(undefined,)
						}}
						isCloseButtonShown
					>
						<EditAsset
							assetModalData={asset}
							onClose={() => {
								setIsEditDrawerOpen(false,)
								refetchData()
							}}
							portfolioName={row.portfolio}
							entityName={row.entity}
							bankName={row.bank}
							accountName={row.account}
							// handleEditedAssetIds={handleEditedAssetIds}
						/>
					</Drawer>
					<Dialog
						open={isTransferDialogOpen}
						onClose={() => {
							// setCurrentAssetId(undefined,)
							setIsTransferDialogOpen(false,)
						}}
						// onClosed={() => {
						// 	setAsset(undefined,)
						// 	setCurrentAssetId(undefined,)
						// }}
						isCloseButtonShown
					>
						<TransferAssetDialog
							onClose={() => {
								setIsTransferDialogOpen(false,)
							}}
							asset={asset}
						/>
					</Dialog>
				</>
			)}
		</>
	)
}
