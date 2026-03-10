/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	getCountryCode,
} from 'countries-list'
import ReactCountryFlag from 'react-country-flag'

import type {
	IAsset,
	IAccount,
	IBank,
} from '../../../../../../shared/types'
import {
	AccountItem,
} from './account-item.component'
import {
	ChevronDown,
	ChevronUpBlue,
	PenSquareGray,
	MiniBank,
} from '../../../../../../assets/icons'
import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../../../shared/components'
import {
	BankDrawer,
} from './bank-drawer.component'
import {
	useUserStore,
} from '../../../../../../store/user.store'
import {
	Roles,
} from '../../../../../../shared/types'
import {
	localeString,
} from '../../../../../../shared/utils'
import {
	useCreatedBankStore,
} from '../bank/add-bank.store'
import {
	useCreatedAccountStore,
} from '../account/add-account.store'
import * as styles from './sub-items.style'
import {
	usePortfolioTreeStore,
} from '../../portfolio-details.store'

interface IBankItemProps {
  bank: IBank
  isOpen: boolean
  accounts: Array<IAccount>
  assets: Array<IAsset>
  openAccounts: Record<string, boolean>
  hoveredEntityId: string | undefined
  toggle: () => void
	toggleAccounts: (accountId: string) => void
	openBankDrawer: () => void
	openAccountDrawer: (account: IAccount) => void
	onEditBank?: (bank: IBank) => void
	onEditAccount?: (account: IAccount) => void
	openAssetDrawer: (asset: IAsset, accountName: string) => void
	onEditAsset?: (asset: IAsset) => void
	handleOpenDeleteModal: (assetId: string) => void
	handleCashAssetTotal: (total: number) => void
}

export const BankItem: React.FC<IBankItemProps> = ({
	bank,
	isOpen,
	accounts,
	assets,
	openAccounts,
	hoveredEntityId,
	toggle,
	toggleAccounts,
	openBankDrawer,
	openAccountDrawer,
	onEditBank,
	onEditAccount,
	openAssetDrawer,
	onEditAsset,
	handleOpenDeleteModal,
	handleCashAssetTotal,
},) => {
	const country = getCountryCode(bank.country,)
	const [isDrawerOpen, setIsDrawerOpen,] = React.useState<boolean>(false,)
	const [isAllowed, setIsAllowed,] = React.useState<boolean>(false,)
	const [hoveredBankId, setHoveredBankId,] = React.useState<string | undefined>(undefined,)
	const {
		openBanks,
		toggleBank,
		focusedItemIds,
		setFocusedItemId,
	} = usePortfolioTreeStore()
	const {
		resetCreatedBank, createdBank, openCreatedBank,
	} = useCreatedBankStore()

	const {
		createdAccount,
	} = useCreatedAccountStore()

	const {
		userInfo,
	} = useUserStore()

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
		if (createdBank?.id === bank.id && openCreatedBank) {
			handleOpenDrawer()
			setTimeout(() => {
				resetCreatedBank()
			}, 100,)
		}
	},[createdBank, openCreatedBank,],)

	React.useEffect(() => {
		if (createdAccount?.id && accounts.some((account,) => {
			return account.id === createdAccount.id
		},)) {
			toggle()
		}
	}, [createdAccount,],)

	const handleFocusedBank = (id: string,): void => {
		setFocusedItemId(id,)
	}

	const isBankOpen = openBanks[bank.id]
	return (
		<div className={styles.listItemFull}>
			<div className={styles.subItemListBlock}>
				<div
					onClick={() => {
						handleFocusedBank(bank.id,)
					}}
					onMouseEnter={() => {
						setHoveredBankId(bank.id,)
					}}
					onMouseLeave={() => {
						setHoveredBankId(undefined,)
					}}
					className={styles.subItemListItem(Boolean((bank.entityId === hoveredEntityId || hoveredBankId === bank.id) || focusedItemIds?.includes(bank.id,),),)}>
					<div className={styles.subItemListItemInside} onClick={(e,) => {
						e.stopPropagation()
						handleOpenDrawer()
					}}>
						<MiniBank width={32} height={32} />
						<div>
							<p className={styles.subItemListItemName}>
								{bank.bankName} {country && (
									<ReactCountryFlag
										countryCode={country}
										svg
										style={{
											width:  '20px',
											height: '10px',
										}}
									/>
								)}
							</p>
							<p className={styles.subItemMoney}>${localeString(bank.totalAssets ?? 0, '', 2, false,)}</p>
						</div>
					</div>
					{isAllowed && <Button
						onClick={openBankDrawer}
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
					// onClick={toggle}
					onClick={() => {
						toggleBank(bank.id,)
					}}
					additionalProps={{
						btnType: ButtonType.ICON,
						size:    Size.SMALL,
						icon:    isBankOpen ?
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
			{isBankOpen && (
				<div className={cx(styles.borderBig(Boolean(bank.entityId === hoveredEntityId || hoveredBankId === bank.id,),), styles.accounts,)}>
					{accounts.map((account,) => {
						return (
							<AccountItem
								key={account.id}
								account={account}
								isOpen={Boolean(openAccounts[account.id],)}
								toggle={() => {
									toggleAccounts(account.id,)
								}}
								assets={assets.filter((asset,) => {
									return asset.accountId === account.id
								},)}
								openAccountDrawer={() => {
									openAccountDrawer(account,)
								}}
								openAssetDrawer={(asset: IAsset,) => {
									openAssetDrawer(asset, account.accountName,)
								}}
								onEditAccount={onEditAccount}
								onEditAsset={onEditAsset}
								handleOpenDeleteModal={handleOpenDeleteModal}
								handleCashAssetTotal={handleCashAssetTotal}
								hoveredBankId={hoveredBankId}
								hoveredEntityId={hoveredEntityId}
								bankListId={bank.bankListId}
							/>
						)
					},)}
				</div>
			)}
			<BankDrawer
				isOpen={isDrawerOpen}
				onClose={handleCloseDrawer}
				bank={createdBank ?? bank}
				onEditBank={onEditBank}
			/>
		</div>
	)
}

