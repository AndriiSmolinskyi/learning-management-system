import * as React from 'react'
import {
	useNavigate,
} from 'react-router-dom'

import {
	ArrowUpRight,
	Check,
	Plus,
} from '../../../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	CustomDialog,
	Drawer,
	Loader,
	Size,
} from '../../../../../../shared/components'
import {
	EditTransaction,
	TransactionDetails,
} from '../../../../../operations/transactions/components'
import {
	AddTransaction,
} from './add-transaction.component'
import {
	TransactionItem,
} from './transactions-item.component'
import {
	Roles,
	type IPortfolio,
} from '../../../../../../shared/types'
import {
	useTransactionListFiltered,
} from '../../../../../../shared/hooks'
import {
	RouterKeys,
} from '../../../../../../router/keys'
import {
	toggleState,
} from '../../../../../../shared/utils'
import {
	useUserStore,
} from '../../../../../../store/user.store'

import * as styles from './transactions.styles'

interface IPortfolioDetailsHeaderProps{
	portfolio: IPortfolio
}
export const Transactions: React.FC<IPortfolioDetailsHeaderProps> = ({
	portfolio,
},) => {
	const navigate = useNavigate()
	const [transactionId, setTransactionId,] = React.useState<number | undefined>()
	const [isCreateOpen, setIsCreateOpen,] = React.useState(false,)
	const [isUpdateOpen, setIsUpdateOpen,] = React.useState(false,)
	const [isDetailsOpen, setIsDetailsOpen,] = React.useState(false,)
	const [isExitDialogOpen, setIsExitDialogOpen,] = React.useState(false,)
	const [isSuccessDialogOpen, setIsSuccessDialogOpen,] = React.useState(false,)
	const {
		userInfo,
	} = useUserStore()

	const {
		data,
		isFetching,
	} = useTransactionListFiltered({
		portfolioIds: [portfolio.id,],
		sortBy:       'transactionDate',
		skip:         0,
		take:         5,
	},)

	const hasPermission = userInfo.roles.some((role,) => {
		return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
	},)

	const toggleCreateVisible = React.useCallback(() => {
		toggleState(setIsCreateOpen,)()
	}, [],)

	const handleAddDrawerClose = React.useCallback((id?: number,) => {
		setTransactionId(id,)
		toggleState(setIsCreateOpen,)()
	}, [],)

	const toggleSuccessDialogVisible = React.useCallback(() => {
		toggleState(setIsSuccessDialogOpen,)()
	}, [],)

	const toggleExitDialogVisible = React.useCallback(() => {
		toggleState(setIsExitDialogOpen,)()
	}, [],)

	const toggleDetailsVisible = React.useCallback((id: number,) => {
		setTransactionId(id,)
		toggleState(setIsDetailsOpen,)()
	}, [],)

	const handleDetailsDrawerClose = React.useCallback(() => {
		setTransactionId(undefined,)
		toggleState(setIsDetailsOpen,)()
	}, [],)

	const toggleUpdateVisible = React.useCallback((id: number,) => {
		setTransactionId(id,)
		toggleState(setIsUpdateOpen,)()
	}, [],)

	const handleUpdateDrawerClose = React.useCallback(() => {
		toggleState(setIsUpdateOpen,)()
		setTransactionId(undefined,)
	}, [],)

	return (
		<div className={styles.container}>
			<div>
				<div className={styles.titleContainer}>
					<p className={styles.title}>Transactions</p>
					{hasPermission && (
						<Button<ButtonType.TEXT>
							onClick={toggleCreateVisible}
							additionalProps={{
								btnType:  ButtonType.TEXT,
								text:     'Add new',
								leftIcon: <Plus />,
								size:     Size.SMALL,
								color:    Color.BLUE,
							}}
						/>
					)}
				</div>
				<div className={styles.itemsContainer(isFetching,)}>
					{isFetching && !data?.list && <Loader/>}
					{data?.list.map((transaction,) => {
						return (
							<TransactionItem
								key={transaction.id}
								transaction={transaction}
								toggleUpdateVisible={toggleUpdateVisible}
								toggleDetailsVisible={toggleDetailsVisible}
							/>
						)
					},)}
				</div>
			</div>
			<div className={styles.btnContainer}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						navigate(RouterKeys.TRANSACTIONS, {
							state: {
								portfolioId:   portfolio.id,
								portfolioName: portfolio.name,
							},
						},)
					}}
					className={styles.navigateButton}
					additionalProps={{
						btnType:   ButtonType.TEXT,
						text:      'View more',
						rightIcon: <ArrowUpRight />,
						size:      Size.MEDIUM,
						color:     Color.SECONDRAY_COLOR,
					}}
				/>
			</div>

			<Drawer
				isOpen={isCreateOpen}
				onClose={toggleExitDialogVisible}
				isCloseButtonShown
			>
				<AddTransaction
					clientId={portfolio.clientId}
					portfolioId={portfolio.id}
					isExitDialogOpen={isExitDialogOpen}
					setTransactionId={setTransactionId}
					toggleExitDialogVisible={toggleExitDialogVisible}
					toggleSuccessDialogVisible={toggleSuccessDialogVisible}
					onClose={handleAddDrawerClose}
				/>
			</Drawer>
			<Drawer
				isOpen={isDetailsOpen}
				onClose={handleDetailsDrawerClose}
				isCloseButtonShown
			>
				<TransactionDetails
					onClose={handleDetailsDrawerClose}
					transactionId={transactionId}
					toggleUpdateVisible={toggleUpdateVisible}
				/>
			</Drawer>
			<Drawer
				isOpen={isUpdateOpen}
				onClose={handleUpdateDrawerClose}
				isCloseButtonShown
			>
				<EditTransaction
					transactionId={transactionId}
					onClose={handleUpdateDrawerClose}
				/>
			</Drawer>
			<CustomDialog
				open={isSuccessDialogOpen}
				icon={<Check width={42} height={42}/>}
				title='New transaction added!'
				isCloseButtonShown
				submitBtnColor={Color.SECONDRAY_GRAY}
				submitBtnText='View details'
				isCancelBtn={false}
				onCancel={toggleSuccessDialogVisible}
				onSubmit={() => {
					toggleSuccessDialogVisible()
					toggleState(setIsDetailsOpen,)()
				}}
			/>
		</div>
	)
}