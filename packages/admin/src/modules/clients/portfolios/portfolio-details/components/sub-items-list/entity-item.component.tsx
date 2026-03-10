/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
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
	IEntity,
	IAccount,
	IAsset,
	IBank,
} from '../../../../../../shared/types'
import {
	Roles,
} from '../../../../../../shared/types'

import {
	BankItem,
} from './bank-item.component'
import {
	EntityIcon,
	ChevronDown,
	ChevronUpBlue,
	PenSquareGray,
} from '../../../../../../assets/icons'
import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../../../shared/components'
import {
	EntityDrawer,
} from './entity-drawer.component'
import {
	useUserStore,
} from '../../../../../../store/user.store'
import {
	localeString,
} from '../../../../../../shared/utils'
import {
	useCreatedEntityStore,
} from '../entity/add-entity.store'
import {
	useCreatedBankStore,
} from '../bank/add-bank.store'
import {
	useCreatedAccountStore,
} from '../account/add-account.store'
import {
	usePortfolioTreeStore,
} from '../../portfolio-details.store'

import * as styles from './sub-items.style'

interface IEntityItemProps {
	entity: IEntity
	isOpen: boolean
	banks: Array<IBank>
	accounts: Array<IAccount>
	assets: Array<IAsset>
	openBanks: Record<string, boolean>
	openAccounts: Record<string, boolean>
	toggle: () => void
	toggleAccounts: (accountId: string) => void
	toggleBanks: (bankId: string) => void
	openEntityDrawer: () => void
	openBankDrawer: (bank: IBank, entityName: string) => void
	openAccountDrawer: (props: {
		account: IAccount,
		entityName: string,
		bankName: string
	}) => void
	onEditEntity?: (entity: IEntity) => void
	openAssetDrawer: (props: {
		asset: IAsset,
		entityName: string,
		bankName: string
		accountName: string
	}) => void
	onEditBank?: (bank: IBank) => void
	onEditAccount?: (account: IAccount) => void
	onEditAsset?: (asset: IAsset) => void
	handleOpenDeleteModal: (assetId: string) => void
	handleCashAssetTotal: (total: number) => void
}

export const EntityItem: React.FC<IEntityItemProps> = ({
	entity,
	isOpen,
	banks,
	accounts,
	assets,
	openBanks,
	openAccounts,
	toggle,
	toggleBanks,
	toggleAccounts,
	openEntityDrawer,
	openBankDrawer,
	openAccountDrawer,
	onEditEntity,
	onEditBank,
	onEditAccount,
	openAssetDrawer,
	onEditAsset,
	handleOpenDeleteModal,
	handleCashAssetTotal,
},) => {
	const [isDrawerOpen, setIsDrawerOpen,] = React.useState<boolean>(false,)
	const [isAllowed, setIsAllowed,] = React.useState<boolean>(false,)
	const [hoveredEntityId, setHoveredEntityId,] = React.useState<string | undefined>(undefined,)
	const {
		openEntities,
		toggleEntity,
		focusedItemIds,
		setFocusedItemId,
	} = usePortfolioTreeStore()
	const {
		createdBank, openCreatedBank,
	} = useCreatedBankStore()

	const {
		createdAccount,
	} = useCreatedAccountStore()

	const {
		resetCreatedEntity, createdEntity, openCreatedEntity,
	} = useCreatedEntityStore()

	const {
		userInfo,
	} = useUserStore()

	const country = getCountryCode(entity.country,)

	const handleOpenDrawer = (): void => {
		setIsDrawerOpen(true,)
	}

	const handleCloseDrawer = (): void => {
		setIsDrawerOpen(false,)
	}
	const handleFocusedEntity = (id: string,): void => {
		setFocusedItemId(id,)
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
		if (createdEntity?.id === entity.id && openCreatedEntity) {
			handleOpenDrawer()
			setTimeout(() => {
				resetCreatedEntity()
			}, 100,)
		}
	},[createdEntity, openCreatedEntity,],)

	React.useEffect(() => {
		if (createdBank?.id && banks.some((bank,) => {
			return bank.id === createdBank.id
		},)) {
			toggle()
		}
	}, [createdBank, openCreatedBank,],)

	React.useEffect(() => {
		if (createdAccount?.id && accounts.some((account,) => {
			return account.id === createdAccount.id
		},)) {
			toggle()
		}
	}, [createdAccount,],)
	const idEntityOpen = openEntities[entity.id]
	return (
		<div className={styles.subItemFlex(Boolean(((entity.id === hoveredEntityId) && idEntityOpen) || (focusedItemIds?.includes(entity.id,) && idEntityOpen),),)}>
			<div
				className={styles.mockupEntityBlock(Boolean(((entity.id === hoveredEntityId) && idEntityOpen) || (focusedItemIds?.includes(entity.id,) && idEntityOpen),),)}
			/>
			<div
				className={styles.subEntityItemListItem}
				onClick={() => {
					handleFocusedEntity(entity.id,)
				}}
				onMouseLeave={() => {
					setHoveredEntityId(undefined,)
				}}
				onMouseEnter={() => {
					setHoveredEntityId(entity.id,)
				}}>
				<div className={styles.subItemListItemInside} onClick={(e,) => {
					e.stopPropagation()
					handleOpenDrawer()
				}}>
					<EntityIcon width={42} height={42} />
					<div>
						<p className={styles.subItemListItemName}>
							{entity.name} {country && (
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
						<p className={styles.subItemMoney}>${localeString(entity.totalAssets ?? 0, '', 2, false,)}</p>
					</div>
				</div>
				<div className={styles.buttonRightBlock}>
					{isAllowed && <Button
						onClick={openEntityDrawer}
						additionalProps={{
							btnType: ButtonType.ICON,
							size:    Size.SMALL,
							icon:    <PenSquareGray width={20} height={20} />,
							color:   Color.SECONDRAY_GRAY,
						}}
					/>}
					<Button
						className={styles.chevronButton}
						onClick={(e,) => {
							e.stopPropagation()
							toggleEntity(entity.id,)
						}}
						additionalProps={{
							btnType: ButtonType.ICON,
							size:    Size.SMALL,
							icon:    idEntityOpen ?
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

			</div>
			{idEntityOpen && (
				<div className={cx(styles.borderBig(Boolean((entity.id === hoveredEntityId) && idEntityOpen,),), styles.banksBlock,)}>
					{banks.map((bank,) => {
						return (
							<BankItem
								key={bank.id}
								bank={bank}
								isOpen={Boolean(openBanks[bank.id],)}
								toggle={() => {
									toggleBanks(bank.id,)
								}}
								accounts={accounts.filter((account,) => {
									return account.bankId === bank.id
								},)}
								assets={assets}
								openAccounts={openAccounts}
								toggleAccounts={toggleAccounts}
								openBankDrawer={() => {
									openBankDrawer(bank, entity.name,)
								}}
								openAccountDrawer={(account: IAccount,) => {
									openAccountDrawer({
										bankName: bank.bankName, entityName: entity.name, account,
									},)
								}}
								openAssetDrawer={(asset: IAsset, accountName: string,) => {
									openAssetDrawer({
										bankName:   bank.bankName,
										entityName: entity.name,
										asset,
										accountName,
									},)
								}}
								onEditBank={onEditBank}
								onEditAccount={onEditAccount}
								onEditAsset={onEditAsset}
								handleOpenDeleteModal={handleOpenDeleteModal}
								handleCashAssetTotal={handleCashAssetTotal}
								hoveredEntityId={hoveredEntityId}
							/>
						)
					},)}
					<Button
						className={styles.chevronBottomButton}
						onClick={(e,) => {
							e.stopPropagation()
							toggleEntity(entity.id,)
						}}
						additionalProps={{
							btnType: ButtonType.ICON,
							size:    Size.SMALL,
							icon:    <ChevronUpBlue width={26} height={26} />,
							color:   Color.NONE,
						}}
					/>
				</div>
			)}
			<EntityDrawer
				isOpen={isDrawerOpen}
				onClose={handleCloseDrawer}
				entity={createdEntity ?? entity}
				onEditEntity={onEditEntity}
				isAllowed={isAllowed}
			/>
		</div>
	)
}

