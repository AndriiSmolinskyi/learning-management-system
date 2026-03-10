/* eslint-disable no-unused-vars */
import React, {
	useState,
} from 'react'
import {
	EntityItem,
} from './entity-item.component'
import {
	EditEntity,
} from '../entity'
import {
	Dialog,
	Drawer,
} from '../../../../../../shared/components'
import type {
	IPortfolioDetailed,
} from '../../../../../../shared/types'
import {
	EditBank,
} from '../bank'
import {
	EditAccount,
} from '../account'

import {
	EditAsset,
} from '../asset'
import type {
	IEntity,
	IBank,
	IAsset,
	IAccount,
} from '../../../../../../shared/types'
import {
	useDocumentStore,
} from '../../../../../../store/document.store'
import {
	toggleState,
} from '../../../../../../shared/utils'
import {
	DeleteAssetModal,
} from '../../../../../../modules/analytics/components/delete-asset-modal/delete-asset-modal.component'

interface IPortfolioDetailsHeaderProps {
  portfolio: IPortfolioDetailed
}

export const SubItemsList: React.FC<IPortfolioDetailsHeaderProps> = ({
	portfolio,
},) => {
	const [openEntities, setOpenEntities,] = useState<Record<string, boolean>>({
	},)
	const [openBanks, setOpenBanks,] = useState<Record<string, boolean>>({
	},)
	const [openAccounts, setOpenAccounts,] = useState<Record<string, boolean>>({
	},)
	const [isEditEntityDrawerOpen, setIsEditEntityDrawerOpen,] = React.useState<boolean>(false,)
	const [entityModalData, setEntityModalData,] = React.useState<IEntity>()
	const [isEditBankDrawerOpen, setIsEditBankDrawerOpen,] = React.useState<boolean>(false,)
	const [bankModalData, setBankModalData,] = React.useState<IBank>()
	const [assetModalData, setAssetModalData,] = React.useState<IAsset>()
	const [isEditAccountDrawerOpen, setIsEditAccountDrawerOpen,] = React.useState<boolean>(false,)
	const [accountModalData, setAccountModalData,] = React.useState<IAccount>()
	const [isEditAssetDrawerOpen, setIsEditAssetDrawerOpen,] = React.useState<boolean>(false,)
	const [entityName, setEntityName,] = React.useState<string>('',)
	const [bankName, setBankName,] = React.useState<string>('',)
	const [accountName, setAccountName,] = React.useState<string>('',)
	const [isDeleteModalShowed, setIsDeleteModalShown,] = React.useState(false,)
	const [deleteAssetId, setDeleteAssetId,] = React.useState<string | undefined>(undefined,)
	const [cashAssetTotal, setCashAssetTotal,] = React.useState<number>(0,)
	const toggleDeleteDialog = toggleState(setIsDeleteModalShown,)
	const handleOpenDeleteModal = (assetId: string,): void => {
		setDeleteAssetId(assetId,)
		toggleDeleteDialog()
	}
	const handleCashAssetTotal = (total: number,): void => {
		setCashAssetTotal(total,)
	}
	const {
		clearDocuments,
	} = useDocumentStore()

	const toggleEntities = (entityId: string,): void => {
		setOpenEntities((prev,) => {
			const newEntities = {
				...prev, [entityId]: !prev[entityId],
			}
			if (!prev[entityId]) {
				portfolio.banks.forEach((bank,) => {
					if (bank.entityId === entityId) {
						setOpenBanks((prevBanks,) => {
							return {
								...prevBanks,
								[bank.id]: true,
							}
						},)
					}
				},)

				portfolio.accounts.forEach((account,) => {
					if (account.entityId === entityId) {
						setOpenAccounts((prevAccounts,) => {
							return {
								...prevAccounts,
								[account.id]: true,
							}
						},)
					}
				},)
			}
			return newEntities
		},)
	}
	const toggleBanks = (bankId: string,): void => {
		setOpenBanks((prev,) => {
			return {
				...prev,
				[bankId]: !prev[bankId],
			}
		},)
	}

	const toggleAccounts = (accountId: string,): void => {
		setOpenAccounts((prev,) => {
			return {
				...prev,
				[accountId]: !prev[accountId],
			}
		},)
	}

	const openBankDrawer = React.useCallback((bank: IBank, entityName: string,) => {
		setBankModalData(bank,)
		setEntityName(entityName,)
		setIsEditBankDrawerOpen(true,)
	}, [],)

	const openAccountDrawer = React.useCallback(({
		account,
		bankName,
		entityName,
	}: {
		account: IAccount,
		entityName: string,
		bankName: string
	},): void => {
		setAccountModalData(account,)
		setEntityName(entityName,)
		setBankName(bankName,)
		setIsEditAccountDrawerOpen(true,)
	}, [],)

	const openAssetDrawer = React.useCallback(({
		asset,
		bankName,
		entityName,
		accountName,
	}: {
		asset: IAsset,
		entityName: string,
		bankName: string
		accountName: string
	},): void => {
		setAssetModalData(asset,)
		setEntityName(entityName,)
		setBankName(bankName,)
		setAccountName(accountName,)
		setIsEditAssetDrawerOpen(true,)
	}, [],)
	return (
		<>
			{portfolio.entities.map((entity,) => {
				return (
					<EntityItem
						key={entity.id}
						entity={entity}
						isOpen={Boolean(openEntities[entity.id],)}
						toggle={() => {
							toggleEntities(entity.id,)
						}}
						banks={portfolio.banks.filter((bank,) => {
							return bank.entityId === entity.id
						},)}
						accounts={portfolio.accounts}
						assets={portfolio.assets}
						openBanks={openBanks}
						toggleBanks={toggleBanks}
						openAccounts={openAccounts}
						toggleAccounts={toggleAccounts}
						openEntityDrawer={() => {
							setEntityModalData(entity,)
							setIsEditEntityDrawerOpen(true,)
						}
						}
						openBankDrawer={openBankDrawer}
						openAccountDrawer={openAccountDrawer}
						onEditEntity={(entity,) => {
							setEntityModalData(entity,)
							setIsEditEntityDrawerOpen(true,)
						}}
						onEditBank={(bank,) => {
							setBankModalData(bank,)
							setIsEditBankDrawerOpen(true,)
						}}
						onEditAccount={(account,) => {
							setAccountModalData(account,)
							setIsEditAccountDrawerOpen(true,)
						}}
						onEditAsset={(asset,) => {
							setAssetModalData(asset,)
							setIsEditAssetDrawerOpen(true,)
						}}
						openAssetDrawer={openAssetDrawer}
						handleOpenDeleteModal={handleOpenDeleteModal}
						handleCashAssetTotal={handleCashAssetTotal}
					/>
				)
			},)}
			<Drawer
				isOpen={isEditEntityDrawerOpen}
				onClose={() => {
					setIsEditEntityDrawerOpen(false,)
					clearDocuments()
				}}
				onClosed={() => {
					setEntityModalData(undefined,)
				}}
				isCloseButtonShown
			>
				{entityModalData && (
					<EditEntity
						entityModalData={entityModalData}
						onClose={() => {
							setIsEditEntityDrawerOpen(false,)
						}}
						portfolioName={portfolio.name}
					/>
				)}
			</Drawer>
			<Drawer
				isOpen={isEditBankDrawerOpen}
				onClose={() => {
					setIsEditBankDrawerOpen(false,)
				}}
				onClosed={() => {
					setBankModalData(undefined,)
					setEntityName('',)
				}}
				isCloseButtonShown
			>
				{bankModalData && (
					<EditBank
						bankModalData={bankModalData}
						onClose={() => {
							setIsEditBankDrawerOpen(false,)
						}}
						portfolioName={portfolio.name}
						entityName={entityName}
					/>
				)}
			</Drawer>
			<Drawer
				isOpen={isEditAccountDrawerOpen}
				onClose={() => {
					setIsEditAccountDrawerOpen(false,)
				}}
				onClosed={() => {
					setAccountModalData(undefined,)
					setEntityName('',)
					setBankName('',)
				}}
				isCloseButtonShown
			>
				{accountModalData && (
					<EditAccount
						accountModalData={accountModalData}
						onClose={() => {
							setIsEditAccountDrawerOpen(false,)
						}}
						portfolioName={portfolio.name}
						entityName={entityName}
						bankName={bankName}
					/>
				)}
			</Drawer>
			<Drawer
				isOpen={isEditAssetDrawerOpen}
				onClose={() => {
					setIsEditAssetDrawerOpen(false,)
					clearDocuments()
				}}
				onClosed={() => {
					setAssetModalData(undefined,)
					setEntityName('',)
					setBankName('',)
					setAccountName('',)
				}}
				isCloseButtonShown
			>
				{assetModalData && (
					<EditAsset
						assetModalData={assetModalData}
						onClose={() => {
							setIsEditAssetDrawerOpen(false,)
						}}
						portfolioName={portfolio.name}
						entityName={entityName}
						bankName={bankName}
						accountName={accountName}
					/>
				)}
			</Drawer>
			{/* <Dialog
				onClose={() => {
					setIsDeleteModalShown(false,)
				}}
				open={isDeleteModalShowed}
				isCloseButtonShown
			>
				<DeleteAssetModal
					onClose={toggleDeleteDialog}
					assetId={deleteAssetId}
					cashAssetTotal={cashAssetTotal}
				/>
			</Dialog> */}
		</>
	)
}
