/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'
import type {
	CurrencyList,
} from '../../../../../../shared/types'
import {
	Roles,
	type IAsset,
	type IAccount,
	AssetNamesType,
} from '../../../../../../shared/types'
import {
	ChevronDown,
	ChevronUpBlue,
	PenSquareGray,
} from '../../../../../../assets/icons'
import accountIcon from '../../../../../../assets/images/account-image.png'
import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../../../shared/components'
import {
	AccountDrawer,
} from './account-drawer.component'
import {
	AssetItem,
} from './asset-item.component'
import {
	useUserStore,
} from '../../../../../../store/user.store'
import {
	localeString,
} from '../../../../../../shared/utils'
import {
	useCreatedAccountStore,
} from '../account/add-account.store'
import * as styles from './sub-items.style'
import {
	usePortfolioTreeStore,
} from '../../portfolio-details.store'

export type AccountDrawerProps = {
		account: IAccount,
		entityName: string,
		bankName: string
}

interface IAccountItemProps {
	account: IAccount
	isOpen: boolean
	assets: Array<IAsset>
	hoveredBankId: string | undefined
	hoveredEntityId: string | undefined
	bankListId: string | null
	toggle: () => void
	openAccountDrawer: () => void
	onEditAccount?: (account: IAccount) => void
	openAssetDrawer: (asset: IAsset) => void
	onEditAsset?: (asset: IAsset) => void
	handleOpenDeleteModal: (assetId: string) => void
	handleCashAssetTotal: (total: number) => void
}

export const AccountItem: React.FC<IAccountItemProps> = ({
	account,
	isOpen,
	assets,
	hoveredBankId,
	hoveredEntityId,
	bankListId,
	toggle,
	openAccountDrawer,
	onEditAccount,
	openAssetDrawer,
	onEditAsset,
	handleOpenDeleteModal,
	handleCashAssetTotal,
},) => {
	const [isDrawerOpen, setIsDrawerOpen,] = React.useState<boolean>(false,)
	const [isAllowed, setIsAllowed,] = React.useState<boolean>(false,)
	const [hoveredAccountId, setHoveredAccountId,] = React.useState<string | undefined>(undefined,)

	const {
		openAccounts,
		toggleAccount,
		focusedItemIds,
		setFocusedItemId,
	} = usePortfolioTreeStore()

	const {
		userInfo,
	} = useUserStore()
	const {
		resetCreatedAccount, createdAccount, openCreatedAccount,
	} = useCreatedAccountStore()

	const handleOpenDrawer = (): void => {
		setIsDrawerOpen(true,)
	}

	const handleCloseDrawer = (): void => {
		setIsDrawerOpen(false,)
	}

	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		if (hasPermission) {
			setIsAllowed(true,)
		}
	}, [],)

	React.useEffect(() => {
		if (createdAccount?.id === account.id && openCreatedAccount) {
			handleOpenDrawer()
			setTimeout(() => {
				resetCreatedAccount()
			}, 1000,)
		}
	},[createdAccount, openCreatedAccount,],)
	const handleFocusedAccount = (id: string,): void => {
		setFocusedItemId(id,)
	}
	// todo: clear if good version good
	// const cashAssets = account.accountsCurrencyTotals ?
	// 	Object.entries(account.accountsCurrencyTotals,)
	// 		// .filter(([item, totalAssets,],) => {
	// 		// 	return totalAssets !== 0
	// 		// },)
	// 		.map(([currency, totalAssets,],) => {
	// 			return {
	// 				currency:    currency as CurrencyList,
	// 				totalAssets,
	// 				assetName:   AssetNamesType.CASH,
	// 				portfolioId: account.portfolioId ?? '',
	// 				entityId:    account.entityId,
	// 				bankId:      account.bankId,
	// 				accountId:   account.id,
	// 			}
	// 		},) :
	// 	[]
	const cashAssets = account.accountsCurrencyTotals ?
		Object.entries(account.accountsCurrencyTotals,).map(([currency, totalAssets,],) => {
			return {
				currency:    currency as CurrencyList,
				totalAssets,
				assetName:   AssetNamesType.CASH,
				portfolioId: account.portfolioId ?? '',
				entityId:    account.entityId,
				bankId:      account.bankId,
				accountId:   account.id,
			}
		},) :
		[]

	const isAccountOpen = openAccounts[account.id]
	return (
		<div className={styles.listItemFull}>
			<div className={styles.subAccountItemListBlock}>
				<div
					onClick={() => {
						handleFocusedAccount(account.id,)
					}}
					onMouseEnter={() => {
						setHoveredAccountId(account.id,)
					}}
					onMouseLeave={() => {
						setHoveredAccountId(undefined,)
					}}
					className={styles.subItemListItem(Boolean(hoveredBankId === account.bankId || hoveredEntityId === account.entityId || hoveredAccountId === account.id || focusedItemIds?.includes(account.id,),),)}>
					<div className={styles.subItemListItemInside} onClick={(e,) => {
						e.stopPropagation()
						handleOpenDrawer()
					}}>
						<img src={accountIcon} className={styles.accountIconStyle} alt='account icon' />

						<div>
							<p className={styles.subItemListItemName}>{account.accountName}</p>
							<p className={styles.subItemMoney}>${localeString(account.totalAssets ?? 0, '', 2, false,)}</p>
						</div>
					</div>
					{isAllowed && <Button
						onClick={(e,) => {
							e.stopPropagation()
							openAccountDrawer()
						}}
						additionalProps={{
							btnType: ButtonType.ICON,
							size:    Size.SMALL,
							icon:    <PenSquareGray width={20} height={20} />,
							color:   Color.SECONDRAY_GRAY,
						}}
					/>}
				</div>
				<Button
					className={styles.chevronButton}
					onClick={() => {
						toggleAccount(account.id,)
					}}
					additionalProps={{
						btnType: ButtonType.ICON,
						size:    Size.SMALL,
						icon:    isAccountOpen ?
							(
								<ChevronUpBlue width={20} height={20} />
							) :
							(
								<ChevronDown width={20} height={20} />
							),
						color: Color.NONE,
					}}
				/>
			</div>
			{isAccountOpen && <div className={cx(styles.borderBig(Boolean(hoveredBankId === account.bankId || hoveredEntityId === account.entityId || hoveredAccountId === account.id,),), styles.assetsBlock,)}>
				{[...cashAssets,...(account.assetsWithTotalAssetsValue ?? []).filter((item,) => {
					return item.totalAssets !== 0
				},),].map((asset,) => {
					return <AssetItem
						key={asset.currency ?
							`${asset.assetName}-${asset.currency}` :
							asset.assetName}
						asset={asset}
						onEditAsset={onEditAsset}
						handleOpenDeleteModal={handleOpenDeleteModal}
						handleCashAssetTotal={handleCashAssetTotal}
						hoveredAccountId={hoveredAccountId}
						hoveredBankId={hoveredBankId}
						hoveredEntityId={hoveredEntityId}
						bankListId={bankListId}
					/>
				},)}
			</div>}
			<AccountDrawer
				isOpen={isDrawerOpen}
				onClose={handleCloseDrawer}
				account={createdAccount ?? account}
				onEditAccount={onEditAccount}
			/>
		</div>
	)
}
