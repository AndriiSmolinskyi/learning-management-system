/* eslint-disable no-unused-vars */
/* eslint-disable complexity */
import React, {
	useState,
} from 'react'
import {
	useNavigate,
} from 'react-router-dom'
import {
	Popover, Classes,
} from '@blueprintjs/core'
import {
	cx,
} from '@emotion/css'
import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../../../shared/components'
import {
	DotsMenuIcon,
	Eye,
	Trash,
	XmarkMid,
} from '../../../../../../assets/icons'
import type {
	CurrencyList,
} from '../../../../../../shared/types'
import {
	AssetNamesType,
	type IAsset,
} from '../../../../../../shared/types'
import {
	actionBtn,
	dialogContainer,
	menuActions,
	popoverContainer,
} from './sub-items.style'
import {
	renderSelectIcon,
} from '../../../portfolio/components/drawer-content/components/form-asset/form-asset.utils'
import {
	AssetDrawer,
} from './asset-drawer.component'
import {
	localeString,
} from '../../../../../../shared/utils'
import {
	getRouteByAssetName,
} from './asset-types/asset-details.utils'
import {
	useAnalyticsFilterStore,
} from '../../../../../../modules/analytics/analytics-store'

import * as styles from './sub-items.style'
import {
	usePortfolioTreeStore,
} from '../../portfolio-details.store'

interface IAssetItemProps {
	asset: {assetName: AssetNamesType,totalAssets: number,portfolioId: string,entityId: string,bankId: string,accountId: string, currency?: CurrencyList}
	hoveredAccountId: string | undefined
	hoveredBankId: string | undefined
	hoveredEntityId: string | undefined
	bankListId: string | null
	onEditAsset?: (asset: IAsset) => void
	handleOpenDeleteModal: (assetId: string) => void
	handleCashAssetTotal: (total: number) => void
}

export const AssetItem: React.FC<IAssetItemProps> = ({
	asset,
	hoveredAccountId,
	hoveredBankId,
	hoveredEntityId,
	bankListId,
	onEditAsset,
	handleOpenDeleteModal,
	handleCashAssetTotal,
},) => {
	const [isPopoverOpen, setIsPopoverOpen,] = useState<boolean>(false,)
	const [isDrawerOpen, setIsDrawerOpen,] = React.useState<boolean>(false,)
	const [hoveredAssetId, setHoveredAssetId,] = React.useState<string | undefined>(undefined,)
	const {
		focusedItemIds,
		setFocusedItemId,
	} = usePortfolioTreeStore()
	const navigate = useNavigate()
	const {
		resetAnalyticsFilterStore,
	} = useAnalyticsFilterStore()
	const handleNavigate = (): void => {
		const route = getRouteByAssetName(asset.assetName,)
		if (route) {
			resetAnalyticsFilterStore()
			navigate(route,{
				state: {
					// clientId:    asset.clientId,
					portfolioId:  asset.portfolioId,
					entityId:    asset.entityId,
					bankId:      bankListId ?? '',
					accountId:    asset.accountId,
					// currency:    asset.currency,
				},
			},)
		}
	}
	const handleCloseDrawer = (): void => {
		setIsDrawerOpen(false,)
	}

	// todo: Remove after cr - 142 tested
	// const handleOpenDrawer = (): void => {
	// 	setIsDrawerOpen(true,)
	// }

	return (
		<div
			key={asset.currency ?
				`${asset.assetName}-${asset.currency}` :
				asset.assetName}
			onClick={() => {
				setFocusedItemId(asset.assetName,)
			}}
			onMouseEnter={() => {
				setHoveredAssetId(asset.assetName,)
			}}
			onMouseLeave={() => {
				setHoveredAssetId(undefined,)
			}}
			className={styles.asset(false, Boolean(hoveredAccountId === asset.accountId ||
			hoveredBankId === asset.bankId ||
			hoveredEntityId === asset.entityId ||
			hoveredAssetId === asset.assetName || focusedItemIds?.includes(asset.assetName,),),)}>
			<div className={styles.assetLeft}>
				<div className={styles.assetIcon}>
					{renderSelectIcon(asset.assetName,)}
				</div>
				<div>
					<p className={styles.assetType}>{asset.currency ?
						`${asset.assetName} ${asset.currency}` :
						asset.assetName}</p>
					<p className={styles.assetMoney}>${asset.totalAssets ?
						localeString(asset.totalAssets, '', 2, false,) :
						0}</p>
				</div>
			</div>
			<Popover
				usePortal={true}
				placement='right-start'
				popoverClassName={cx(popoverContainer, Classes.POPOVER_DISMISS,)}
				content={
					<div className={dialogContainer}>
						<div className={menuActions}>
							<Button
								// todo: Remove after cr - 142 tested
								// onClick={asset.assetName === AssetNamesType.CASH ?
								// 	handleOpenDrawer :
								// 	handleNavigate}
								onClick={handleNavigate}
								className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
								additionalProps={{
									btnType:  ButtonType.TEXT,
									size:     Size.MEDIUM,
									color:    Color.NON_OUT_BLUE,
									text:     'View details',
									leftIcon: <Eye width={20} height={20} />,
								}}
							/>
							{asset.assetName === AssetNamesType.CASH && asset.totalAssets === 0 && <Button<ButtonType.TEXT>
								className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
								onClick={(e,) => {
									handleOpenDeleteModal(asset.assetName,)
									handleCashAssetTotal(asset.totalAssets,)
								}}
								additionalProps={{
									btnType:  ButtonType.TEXT,
									text:     'Delete',
									leftIcon: <Trash width={20} height={20} />,
									size:     Size.MEDIUM,
									color:    Color.NON_OUT_RED,
								}}
							/>}
						</div>
					</div>
				}
				isOpen={isPopoverOpen}
				onInteraction={(nextOpenState,e,) => {
					if (e) {
						e.stopPropagation()
					}
					setIsPopoverOpen(nextOpenState,)
				}}
				autoFocus={false}
				enforceFocus={false}
			>
				<Button
					additionalProps={{
						btnType: ButtonType.ICON,
						size:    Size.MEDIUM,
						color:   Color.SECONDRAY_GRAY,
						icon:    isPopoverOpen ?
							(
								<XmarkMid width={20} height={20} />
							) :
							(
								<DotsMenuIcon width={20} height={20} />
							),
					}}
				/>
			</Popover>
			{/* <AssetDrawer
				isOpen={isDrawerOpen}
				onClose={handleCloseDrawer}
				asset={asset}
				onEditAsset={onEditAsset}
			/> */}
		</div>
	)
}
