/* eslint-disable complexity */
import React from 'react'
import {
	MoreVertical,
	XmarkMid,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import type {
	ITransactionType,
} from '../../../../shared/types'
import {
	TransactionCashFlow,
} from '../../../../shared/types'
import {
	ItemDialog,
} from './item-dialog.component'
import {
	toggleState,
} from '../../../../shared/utils'
import {
	Check, CheckNegative,
} from '../../../../assets/icons'
import {
	useUserStore,
} from '../../../../store/user.store'
import {
	Roles,
} from '../../../../shared/types'
import * as styles from './table.style'

type Props = {
	transaction: ITransactionType
	toggleRelationsVisible: (id: string) => void
	toggleUpdateVisible: (id: string) => void
	handleOpenDeleteModal: (transactionTypeId: string) => void
}

export const TransactionTypeItem: React.FC<Props> = ({
	transaction,
	toggleRelationsVisible,
	toggleUpdateVisible,
	handleOpenDeleteModal,
},) => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)
	const [hasPermission, setHasPermission,] = React.useState<boolean>(false,)

	const {
		userInfo,
	} = useUserStore()

	React.useEffect(() => {
		const permission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		setHasPermission(permission,)
	}, [userInfo,],)

	const renderCashFlow = (cf?: string,): string => {
		if (cf === TransactionCashFlow.INFLOW) {
			return 'Cash In'
		}
		if (cf === TransactionCashFlow.OUTFLOW) {
			return 'Cash Out'
		}
		return 'N/A'
	}

	const renderPl = (pl?: string | null,): string => {
		if (pl === 'P') {
			return 'Profit'
		}
		if (pl === 'L') {
			return 'Loss'
		}
		return 'Neutral'
	}

	return (
		<tr >
			<td className={styles.smallTableCell}>
				<div className={styles.menuCell}>
					<ItemDialog
						transactionType={transaction}
						setDialogOpen={setIsPopoverShown}
						toggleRelationsVisible={toggleRelationsVisible}
						handleOpenDeleteModal={handleOpenDeleteModal}
						toggleUpdateVisible={toggleUpdateVisible}
					>
						<Button<ButtonType.ICON>
							onClick={toggleState(setIsPopoverShown,)}
							disabled={!hasPermission}
							className={styles.dotsButton(isPopoverShown,)}
							additionalProps={{
								btnType: ButtonType.ICON,
								size:    Size.SMALL,
								color:   Color.SECONDRAY_GRAY,
								icon:    isPopoverShown ?
									<XmarkMid width={20} height={20} />			:
									<MoreVertical width={20} height={20} />	,
							}}
						/>
					</ItemDialog>
				</div>
			</td>
			<td className={styles.tableCellFlex}>
				{transaction.isActivated ?
					(
						<Check width={20} height={20} />
					) :
					(
						<CheckNegative width={20} height={20} />
					)}
				{transaction.versions[0]?.name}
			</td>
			<td className={styles.tableCell}>{transaction.versions[0]?.categoryType?.name}</td>
			<td className={styles.tableCell}> <p className={styles.labelColor(transaction.versions[0]?.cashFlow,)}>{renderCashFlow(transaction.versions[0]?.cashFlow,)}</p></td>
			<td className={styles.tableCell}>
				<p className={styles.labelColorProfit(transaction.versions[0]?.pl ?? '',)}>{renderPl(transaction.versions[0]?.pl,)}</p>
			</td>
			<td className={styles.tableCell}>{transaction.relatedType ?
				transaction.relatedType.versions[0]?.name :
				'N/A'}</td>
			<td className={styles.tableCell}>{transaction.asset ?
				transaction.asset :
				'N/A'}</td>
			<td className={styles.tableCell}>{transaction.versions[0]?.comment ??
				'N/A'}</td>
			{/* <td className={styles.tableCell}>N/A</td> */}

		</tr>
	)
}
