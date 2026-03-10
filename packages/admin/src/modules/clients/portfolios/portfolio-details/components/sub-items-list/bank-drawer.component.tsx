import React from 'react'
import {
	Button,
	ButtonType,
	Size,
	Color,
	Drawer,
} from '../../../../../../shared/components'
import {
	PenSquare,
	XmarkSecond,
} from '../../../../../../assets/icons'
import type {
	IBank,
} from '../../../../../../shared/types'
import {
	cx,
} from '@emotion/css'
import {
	useUserStore,
} from '../../../../../../store/user.store'
import {
	Roles,
} from '../../../../../../shared/types'
import * as styles from './sub-items.style'

interface IEntityDrawerProps {
    isOpen: boolean;
    onClose: () => void;
	bank: IBank;
	onEditBank?: (bank: IBank) => void
}

export const BankDrawer: React.FC<IEntityDrawerProps> = ({
	isOpen, onClose, bank, onEditBank,
},) => {
	const [isAllowed, setIsAllowed,] = React.useState<boolean>(false,)

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

	return (
		<Drawer
			isOpen={isOpen}
			onClose={onClose}
		>
			<div className={styles.drawerBlock}>
				<div className={styles.drawerHeader}>
					<h2 className={styles.drawerHeaderTitle}>Bank details</h2>
					<Button<ButtonType.ICON>
						onClick={onClose}
						additionalProps={{
							btnType:  ButtonType.ICON,
							icon:     <XmarkSecond width={20} height={20}/>,
							size:     Size.SMALL,
							color:    Color.NONE,
						}}
					/>
				</div>
				<div className={styles.drawerContent}>
					<div className={styles.drawerItemBorder}>
						<div className={styles.drawerTextBlock}>
							<p className={styles.drawerTypeText}>Bank name</p>
							<p className={styles.drawerText}>{bank.bankName}</p>
						</div>
					</div>
					<div className={styles.drawerItemBorder}>
						<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
							<p className={styles.drawerTypeText}>Location</p>
							<p className={styles.drawerText}>{bank.country}</p>
						</div>
						<div className={styles.drawerTextBlock}>
							<p className={styles.drawerTypeText}>Branch name</p>
							<p className={styles.drawerText}>{bank.branchName}</p>
						</div>
					</div>
					{isAllowed &&
						<div className={styles.drawerItemBorder}>
							{bank.firstName &&
								<div className={cx(
									styles.drawerTextBlock,
									bank.email && styles.drawerBorderBottom,
								)}>
									<p className={styles.drawerTypeText}>Contact person</p>
									<p className={styles.drawerText}>{bank.firstName} {bank.lastName}</p>
								</div>
							}
							{bank.email &&
								<div className={styles.drawerTextBlock}>
									<p className={styles.drawerTypeText}>Email</p>
									<p className={styles.drawerText}>{bank.email}</p>
								</div>
							}
						</div>
					}
				</div>
				<div className={styles.drawerFooter}>
					{isAllowed &&
						<Button
							onClick={() => {
								onClose()
								onEditBank?.(bank,)
							}}
							additionalProps={{
								btnType:  ButtonType.TEXT,
								size:     Size.MEDIUM,
								text:     'Edit',
								color:    Color.SECONDRAY_COLOR,
								leftIcon: <PenSquare width={20} height={20}/>,
							}}
						/>
					}
				</div>
			</div>
		</Drawer>
	)
}
