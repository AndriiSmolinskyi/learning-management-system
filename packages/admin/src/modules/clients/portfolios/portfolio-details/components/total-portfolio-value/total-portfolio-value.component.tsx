/* eslint-disable complexity */
import * as React from 'react'
import {
	useParams, useNavigate,
} from 'react-router-dom'

import {
	EntityIcon, BankIcon,
} from '../../../../../../assets/icons'
import assetIcon from '../../../../../../assets/images/asset-image.png'
import accountIcon from '../../../../../../assets/images/account-image.png'

import {
	Button, ButtonType, Color, Dialog, Drawer, Loader, Size,
} from '../../../../../../shared/components'
import {
	Plus, Check,
} from '../../../../../../assets/icons'
import {
	AddEntity,
} from '../entity'
import {
	AddBank,
	AddBankDialog,
} from '../bank'

import type {
	CreateBankProps,
} from '../bank'
import {
	AddAccount,
	AddAccountDialog,
	type CreateAccountProps,
} from '../account'
import {
	useUserStore,
} from '../../../../../../store/user.store'
import {
	Roles,
} from '../../../../../../shared/types'
import type {
	CreateAssetProps,
} from '../asset'
import {
	AddAsset,
	AddAssetDialog,
} from '../asset'
import {
	localeString,
} from '../../../../../../shared/utils'
import {
	toggleState,
} from '../../../../../../shared/utils'
import {
	CustomDialog,
} from '../../../../../../shared/components'
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
	useCreatedAssetStore,
} from '../asset/add-aset.store'
import {
	AssetNamesType,
} from '../../../../../../shared/types'
import {
	getRouteByAssetName,
} from '../sub-items-list/asset-types/asset-details.utils'
import * as styles from './total-portfolio-value.styles'

interface ITotalPortfolioValueProps {
	bankQuantity: number | undefined
	accountsQuantity: number | undefined
	entitiesQuantity: number | undefined
	assetQuantity: number | undefined
	totalAssets: number | undefined
	clientId: string
	isPortfolioPending: boolean
}

export const TotalPortfolioValue: React.FC<ITotalPortfolioValueProps> = ({
	bankQuantity, accountsQuantity,entitiesQuantity,assetQuantity, totalAssets, clientId, isPortfolioPending,
},) => {
	const {
		id, subportfolioId,
	} = useParams()
	const {
		setOpenCreatedEntity,
	} = useCreatedEntityStore()
	const {
		setOpenCreatedBank,
	} = useCreatedBankStore()
	const {
		setOpenCreatedAccount,
	} = useCreatedAccountStore()
	const {
		resetCreatedAsset, createdAsset,
	} = useCreatedAssetStore()
	const navigate = useNavigate()
	const [isEntityDrawerOpen, setIsEntityDrawerOpen,] = React.useState<boolean>(false,)
	const [isBankDrawerOpen, setIsBankDrawerOpen,] = React.useState<boolean>(false,)
	const [isAccountDrawerOpen, setIsAccountDrawerOpen,] = React.useState<boolean>(false,)
	const [isAssetDrawerOpen, setIsAssetDrawerOpen,] = React.useState<boolean>(false,)
	const [isBankDialogOpen, setIsBankDialogOpen,] = React.useState<boolean>(false,)
	const [isAccountDialogOpen, setIsAccountDialogOpen,] = React.useState<boolean>(false,)
	const [isAssetDialogOpen, setIsAssetDialogOpen,] = React.useState<boolean>(false,)
	const [createBankProps, setCreateBankProps,] = React.useState<CreateBankProps>()
	const [createAccountProps, setCreateAccountProps,] = React.useState<CreateAccountProps>()
	const [isAllowed, setIsAllowed,] = React.useState<boolean>(false,)
	const [isAssetSuccessDialogOpen, setIsAssetSuccessDialogOpen,] = React.useState(false,)
	const [isAccountSuccessDialogOpen, setIsAccountSuccessDialogOpen,] = React.useState(false,)
	const [isBankSuccessDialogOpen, setIsBankSuccessDialogOpen,] = React.useState(false,)
	const [isEntitySuccessDialogOpen, setIsEntitySuccessDialogOpen,] = React.useState(false,)

	const toggleAssetDialogVisible = React.useCallback(() => {
		toggleState(setIsAssetSuccessDialogOpen,)()
	}, [],)

	const toggleAccountDialogVisible = React.useCallback(() => {
		toggleState(setIsAccountSuccessDialogOpen,)()
	}, [],)

	const toggleBankDialogVisible = React.useCallback(() => {
		toggleState(setIsBankSuccessDialogOpen,)()
	}, [],)

	const toggleEntityDialogVisible = React.useCallback(() => {
		toggleState(setIsEntitySuccessDialogOpen,)()
	}, [],)

	const {
		userInfo,
	} = useUserStore()
	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		if (hasPermission) {
			setIsAllowed(true,)
		}
	}, [],)
	const [createAssetProps, setCreateAssetProps,] = React.useState<CreateAssetProps>()

	const handleNavigate = (assetName: AssetNamesType,): void => {
		const route = getRouteByAssetName(assetName,)
		const payload = createdAsset?.payload && JSON.parse(createdAsset.payload,)
		if (route) {
			navigate(route,{
				state: {
					clientId:    createdAsset?.clientId,
					portfolioId:  createdAsset?.portfolioId,
					entityId:    createdAsset?.entityId,
					bankId:      createdAsset?.bankListId,
					accountId:    createdAsset?.accountId,
					currency:    payload?.currency,
				},
			},)
		}
	}
	return (
		<div className={styles.totalValueWrapper}>
			<div className={styles.headerStyles}>
				<p className={styles.totalText}>Total portfolio value</p>
				{isPortfolioPending ?
					<Loader width={40} position='static' wrapperClassName={styles.loaderWrapper}/> :
					<p className={styles.totalValue}>{totalAssets ?
						localeString(totalAssets, 'USD', 0, false,) :
						0}</p>}
			</div>
			<div className={styles.entitiesBlockWrapper}>
				<div className={styles.entityWrapper}>
					<EntityIcon/>
					<p className={styles.entityText}>{entitiesQuantity} entities</p>
					{isAllowed && <Button<ButtonType.TEXT>
						onClick={() => {
							setIsEntityDrawerOpen(true,)
						} }
						className={styles.addButton}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Add entity',
							leftIcon: <Plus className={styles.plusIcon}/>,
							size:     Size.SMALL,
							color:    Color.SECONDRAY_COLOR,
						}}
					/>}
				</div>
				<div className={styles.entityWrapper}>
					<BankIcon/>
					<p className={styles.entityText}>{bankQuantity} banks</p>
					{isAllowed && <Button<ButtonType.TEXT>
						onClick={() => {
							setIsBankDialogOpen(true,)
						}}
						className={styles.addButton}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Add bank',
							leftIcon: <Plus className={styles.plusIcon}/>,
							size:     Size.SMALL,
							color:    Color.SECONDRAY_COLOR,
						}}
					/>}
				</div>
				<div className={styles.entityWrapper}>
					<img src={accountIcon} className={styles.assetIconStyle} alt='account icon' />
					<p className={styles.entityText}>{accountsQuantity} account</p>
					{isAllowed && <Button<ButtonType.TEXT>
						onClick={() => {
							setIsAccountDialogOpen(true,)
						}}
						className={styles.addButton}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Add account',
							leftIcon: <Plus className={styles.plusIcon} />,
							size:     Size.SMALL,
							color:    Color.SECONDRAY_COLOR,
						}}
					/>}
				</div>
				<div className={styles.entityWrapper}>
					<img src={assetIcon} className={styles.assetIconStyle} alt='asset icon' />
					<p className={styles.entityText}>{assetQuantity} assets</p>
					{isAllowed && <Button<ButtonType.TEXT>
						onClick={() => {
							setIsAssetDialogOpen(true,)
						}}
						className={styles.addButton}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Add asset',
							leftIcon: <Plus className={styles.plusIcon}/>,
							size:     Size.SMALL,
							color:    Color.SECONDRAY_COLOR,
						}}
					/>}
				</div>
			</div>
			<Drawer
				isOpen={isEntityDrawerOpen}
				onClose={() => {
					setIsEntityDrawerOpen(false,)
				}}
				isCloseButtonShown
			>
				<AddEntity
					onClose={() => {
						setIsEntityDrawerOpen(false,)
					}}
					toggleEntityDialogVisible={toggleEntityDialogVisible}
				/>
			</Drawer>
			<Drawer
				isOpen={isBankDrawerOpen}
				onClose={() => {
					setIsBankDrawerOpen(false,)
				}}
				isCloseButtonShown
				onClosed={() => {
					setCreateBankProps(undefined,)
				}}
			>
				{createBankProps && (
					<AddBank
						onClose={() => {
							setIsBankDrawerOpen(false,)
						}}
						createBankProps={createBankProps}
						clientId={clientId}
						toggleBankDialogVisible={toggleBankDialogVisible}
					/>
				)}
			</Drawer>
			<Drawer
				isOpen={isAccountDrawerOpen}
				onClose={() => {
					setIsAccountDrawerOpen(false,)
					setCreateAccountProps(undefined,)
				}}
				isCloseButtonShown
			>
				{createAccountProps && (
					<AddAccount
						onClose={() => {
							setIsAccountDrawerOpen(false,)
							setCreateAccountProps(undefined,)
						}}
						createAccountProps={createAccountProps}
						toggleAccountDialogVisible={toggleAccountDialogVisible}
					/>
				)}
			</Drawer>
			<Drawer
				isOpen={isAssetDrawerOpen}
				onClose={() => {
					setIsAssetDrawerOpen(false,)
					setCreateAssetProps(undefined,)
				}}
				isCloseButtonShown
			>
				{createAssetProps && (
					<AddAsset
						onClose={() => {
							setIsAssetDrawerOpen(false,)
							setCreateAssetProps(undefined,)
						}}
						createAssetProps={createAssetProps}
						clientId={clientId}
						toggleAssetDialogVisible={toggleAssetDialogVisible}
					/>
				)}
			</Drawer>
			<Dialog
				onClose={() => {
					setIsBankDialogOpen(false,)
					setCreateBankProps(undefined,)
				}}
				open={isBankDialogOpen}
				isCloseButtonShown
			>
				{id && (
					<AddBankDialog
						onClose={() => {
							setIsBankDialogOpen(false,)
						}}
						handleBankDrawerOpen={() => {
							setIsBankDrawerOpen(true,)
						}
						}
						setCreateBankProps={setCreateBankProps}
						portfolioId={subportfolioId ?? id}
						createBankProps={createBankProps}
					/>
				)}
			</Dialog>
			<Dialog
				onClose={() => {
					setIsAccountDialogOpen(false,)
					setCreateAccountProps(undefined,)
				}}
				open={isAccountDialogOpen}
				isCloseButtonShown
			>
				{id && (
					<AddAccountDialog
						onClose={() => {
							setIsAccountDialogOpen(false,)
						}}
						handleAccountDrawerOpen={() => {
							setIsAccountDrawerOpen(true,)
						}
						}
						setCreateAccountProps={setCreateAccountProps}
						portfolioId={subportfolioId ?? id}
						createAccountProps={createAccountProps}
					/>
				)}
			</Dialog>
			<Dialog
				onClose={() => {
					setIsAssetDialogOpen(false,)
					setCreateAssetProps(undefined,)
				}}
				open={isAssetDialogOpen}
				isCloseButtonShown
			>
				{id && (
					<AddAssetDialog
						onClose={() => {
							setIsAssetDialogOpen(false,)
						}}
						handleAssetDrawerOpen={() => {
							setIsAssetDrawerOpen(true,)
						}
						}
						setCreateAssetProps={setCreateAssetProps}
						portfolioId={subportfolioId ?? id}
						createAssetProps={createAssetProps}
					/>
				)}
			</Dialog>
			<CustomDialog
				open={isAssetSuccessDialogOpen}
				icon={<Check width={42} height={42}/>}
				title='New asset added!'
				isCloseButtonShown
				submitBtnColor={Color.SECONDRAY_GRAY}
				submitBtnText='View details'
				isCancelBtn={false}
				onCancel={toggleAssetDialogVisible}
				onSubmit={() => {
					handleNavigate(createdAsset?.assetName ?? AssetNamesType.BONDS,)
					toggleAssetDialogVisible()
					resetCreatedAsset()
				}}
			/>
			<CustomDialog
				open={isAccountSuccessDialogOpen}
				icon={<Check width={42} height={42}/>}
				title='New account added!'
				isCloseButtonShown
				submitBtnColor={Color.SECONDRAY_GRAY}
				submitBtnText='View details'
				isCancelBtn={false}
				onCancel={toggleAccountDialogVisible}
				onSubmit={() => {
					setOpenCreatedAccount(true,)
					toggleAccountDialogVisible()
				}}
			/>
			<CustomDialog
				open={isBankSuccessDialogOpen}
				icon={<Check width={42} height={42}/>}
				title='New bank added!'
				isCloseButtonShown
				submitBtnColor={Color.SECONDRAY_GRAY}
				submitBtnText='View details'
				isCancelBtn={false}
				onCancel={toggleBankDialogVisible}
				onSubmit={() => {
					setOpenCreatedBank(true,)
					toggleBankDialogVisible()
				}}
			/>
			<CustomDialog
				open={isEntitySuccessDialogOpen}
				icon={<Check width={42} height={42}/>}
				title='New entity added!'
				isCloseButtonShown
				submitBtnColor={Color.SECONDRAY_GRAY}
				submitBtnText='View details'
				isCancelBtn={false}
				onCancel={toggleEntityDialogVisible}
				onSubmit={() => {
					setOpenCreatedEntity(true,)
					toggleEntityDialogVisible()
				}}
			/>
		</div>

	)
}