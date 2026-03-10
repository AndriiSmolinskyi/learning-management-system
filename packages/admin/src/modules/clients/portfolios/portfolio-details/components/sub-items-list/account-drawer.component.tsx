/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'

import type {
	IAccount,
} from '../../../../../../shared/types'
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
	account: IAccount;
	onEditAccount?: (account: IAccount) => void
}

export const AccountDrawer: React.FC<IEntityDrawerProps> = ({
	isOpen, onClose, account, onEditAccount,
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
					<h2 className={styles.drawerHeaderTitle}>Bank account details</h2>
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
							<p className={styles.drawerTypeText}>Account name</p>
							<p className={styles.drawerText}>{account.accountName}</p>
						</div>
					</div>
					<div className={styles.drawerItemBorder}>
						<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
							<p className={styles.drawerTypeText}>Portfolio Management fee</p>
							<p className={styles.drawerText}>{account.managementFee}%</p>
						</div>
						<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
							<p className={styles.drawerTypeText}>Account Hold fee</p>
							<p className={styles.drawerText}>{account.holdFee}%</p>
						</div>
						<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
							<p className={styles.drawerTypeText}>Sell fee</p>
							<p className={styles.drawerText}>{account.sellFee}%</p>
						</div>
						<div className={styles.drawerTextBlock}>
							<p className={styles.drawerTypeText}>Buy fee</p>
							<p className={styles.drawerText}>{account.buyFee}%</p>
						</div>
					</div>
					<div className={styles.drawerItemBorder}>
						{account.description &&
							<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
								<p className={styles.drawerTypeText}>Description</p>
								<p className={styles.drawerText}>{account.description}</p>
							</div>
						}
						<div className={cx(
							styles.drawerTextBlock,
							(account.iban ?? account.accountNumber ?? account.comment) && styles.drawerBorderBottom,
						)}>
							<p className={styles.drawerTypeText}>Date created</p>
							<p className={styles.drawerText}>
								{new Date(account.createdAt,).toLocaleDateString('en-GB', {
									month: '2-digit',
									day:   '2-digit',
									year:  'numeric',
								},)
									.replace(/\//g, '.',)}
							</p>
						</div>
						{account.iban &&
							<div className={cx(
								styles.drawerTextBlock,
								(account.accountNumber ?? account.comment) && styles.drawerBorderBottom,
							)}>
								<p className={styles.drawerTypeText}>IBAN</p>
								<p className={styles.drawerText}>{account.iban}</p>
							</div>
						}
						{account.accountNumber &&
							<div className={cx(
								styles.drawerTextBlock,
								(account.comment) && styles.drawerBorderBottom,
							)}>
								<p className={styles.drawerTypeText}>Account number</p>
								<p className={styles.drawerText}>{account.accountNumber}</p>
							</div>
						}
						{
							account.comment &&
							<div className={cx(styles.drawerTextBlock, styles.commentBlock,)}>
								<p className={styles.drawerTypeText}>Comment</p>
								<p className={styles.drawerText}>{account.comment}</p>
							</div>
						}
					</div>
				</div>
				<div className={styles.drawerFooter}>
					{isAllowed &&
						<Button
							onClick={() => {
								onClose()
								onEditAccount?.(account,)
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
