
import * as React from 'react'
import {
	useNavigate,
} from 'react-router-dom'

import {
	RouterKeys,
} from '../../../../../router/keys'
import {
	MoreVertical,
	XmarkMid,
} from '../../../../../assets/icons'
import {
	Button, ButtonType, Color, Size,
} from '../../../../../shared/components'
import {
	Check,
	CheckNegative,
	ClientsRoute,
} from '../../../../../assets/icons'
import type {
	IBudgetPlan,
} from '../../../../../shared/types'
import {
	BudgetCardDialog,
} from '../card-dialog/card-dialog.component'
import {
	formatBigNumber,
} from '../../../../../shared/utils'

import * as styles from './budget-card.styles'
import {
	useBudgetStore,
} from '../../budget.store'

interface IBudgetCardProps {
	budgetPlan: IBudgetPlan
	toggleEditVisible: (id?: string) => void
	toggleDeleteVisible: (id?: string) => void
}

export const BudgetCard: React.FC<IBudgetCardProps> = ({
	budgetPlan,
	toggleEditVisible,
	toggleDeleteVisible,
},) => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)
	const {
		mutatedBudgetIds,
	} = useBudgetStore()
	const buttonRef = React.useRef<HTMLDivElement | null>(null,)
	const handlePopoverCondition = (): void => {
		setIsPopoverShown(!isPopoverShown,)
	}
	const handlePopoverButtonClick = (e: React.MouseEvent,): void => {
		setIsPopoverShown(!isPopoverShown,)
	}
	const navigate = useNavigate()
	const handleNavigate = (e: React.MouseEvent,): void => {
		if (mutatedBudgetIds?.includes(budgetPlan.id,)) {
			return
		}
		if (buttonRef.current && buttonRef.current.contains(e.target as Node,)) {
			return
		}
		navigate(`${RouterKeys.BUDGET_MANAGMENT}/${budgetPlan.id}`,)
	}
	return (
		<div className={styles.cardWrapper(budgetPlan.isActivated, mutatedBudgetIds?.includes(budgetPlan.id,),)} onClick={handleNavigate}>
			{!mutatedBudgetIds?.includes(budgetPlan.id,) && <div className={styles.buttonWrapper} ref={buttonRef}>
				<BudgetCardDialog
					id={budgetPlan.id}
					status={budgetPlan.isActivated}
					handlePopoverCondition={handlePopoverCondition}
					toggleEditVisible={toggleEditVisible}
					toggleDeleteVisible={toggleDeleteVisible}
				>
					<Button<ButtonType.ICON>
						disabled={false}
						onClick={handlePopoverButtonClick}
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
				</BudgetCardDialog>
			</div>}
			<div className={styles.cardHeader(budgetPlan.isActivated,)}>
				{budgetPlan.isActivated ?
					<Check/> :
					<CheckNegative/>}
				<p>
					{budgetPlan.name}
				</p>
			</div>
			<div className={styles.clientBlock}>
				<ClientsRoute/>
				<p>
					{budgetPlan.clientName}
				</p>
			</div>
			<div className={styles.footerBlock}>
				<div className={styles.totalBlock}>
					<p className={styles.totalTitle}>Total in banks:</p>
					<p className={styles.totalBanks(budgetPlan.isActivated,)}>${formatBigNumber(budgetPlan.totalBanks,)	}</p>
				</div>
				<div className={styles.totalBlock}>
					<p className={styles.totalTitle}>Expected Monthly Income:</p>
					<p className={styles.totalManage(Boolean(budgetPlan.totalManage > 0,), budgetPlan.isActivated,)}>${budgetPlan.isActivated ?
						formatBigNumber(budgetPlan.totalManage,)			 :
						0}</p>
				</div>
			</div>
		</div>
	)
}