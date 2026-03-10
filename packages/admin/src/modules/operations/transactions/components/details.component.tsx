/* eslint-disable no-unused-vars */
/* eslint-disable complexity */
import React from 'react'
import {
	format,
} from 'date-fns'
import {
	cx,
} from '@emotion/css'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import {
	Download,
	DocsIcon,
	PenSquare,
	Trash,
} from '../../../../assets/icons'

import {
	useDeleteTransaction,
	useGetDocumentTypes,
	useTransactionById,
} from '../../../../shared/hooks'
import type {
	CustomField,
} from '../transaction.types'
import {
	TransactionCashFlow,
} from '../../../../shared/types'
import {
	localeString,
} from '../../../../shared/utils'
import {
	Roles,
} from '../../../../shared/types'
import {
	useUserStore,
} from '../../../../store/user.store'
import {
	handleDownload,
} from '../../../../services/document/document.util'

import * as styles from '../transactions.styles'

type Props = {
	transactionId?: number
	onClose: () => void
	toggleUpdateVisible: (transactionId: number) => void
}

export const TransactionDetails: React.FC<Props> = ({
	transactionId,
	onClose,
	toggleUpdateVisible,
},) => {
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

	const {
		data: transaction,
	} = useTransactionById(transactionId,)
	const {
		data: documentTypes,
	} = useGetDocumentTypes()

	const {
		mutateAsync: deleteTransaction,
		isPending: isDeleting,
	} = useDeleteTransaction()

	const updatedDocumentTypes = documentTypes?.map((type,) => {
		return {
			label: type.name,
			value: type.name,
		}
	},)

	return (
		<div className={styles.formContainer}>
			<h3 className={styles.formHeader}>Transaction details</h3>
			<div className={styles.detailsFormWrapper}>
				{transaction && (
					<>
						<div className={styles.detailsItemWrapper({
							hasBorder: false, hasBorderRadiusTop: true, hasBorderRadiusBottom: true,
						},)}>
							<p className={styles.detailsItemTitle}>Transaction ID</p>
							<p className={styles.detailsItemText}>{transaction.id}</p>
						</div>
						<div className={cx(styles.detailsItemWrapper({
							hasBorder: true, hasBorderRadiusTop: true,
						},), styles.marginTop16,)}>
							<p className={styles.detailsItemTitle}>Client</p>
							<p className={styles.detailsItemText}>{`${transaction.client?.firstName} ${transaction.client?.lastName}`}</p>
						</div>
						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>Portfolio</p>
							<p className={styles.detailsItemText}>{transaction.portfolio?.name}</p>
						</div>
						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>Bank account</p>
							<p className={styles.detailsItemText}>{transaction.account?.accountName}</p>
						</div>
						<div className={styles.detailsItemWrapper({
							hasBorderRadiusBottom: true,
						},)}>
							<p className={styles.detailsItemTitle}>Bank</p>
							<p className={styles.detailsItemText}>{transaction.bank?.bankName}</p>
						</div>
						<div className={cx(styles.detailsItemWrapper({
							hasBorder: true, hasBorderRadiusTop: true,
						},), styles.marginTop16,)}>
							<p className={styles.detailsItemTitle}>Name</p>
							<p className={styles.detailsItemText}>{transaction.typeVersion?.name}</p>
						</div>
						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>Category</p>
							<p className={styles.detailsItemText}>{transaction.typeVersion?.categoryType?.name}</p>
						</div>
						{Boolean(transaction.expenseCategory,) && (
							<div className={styles.detailsItemWrapper({
								hasBorder: true,
							},)}>
								<p className={styles.detailsItemTitle}>Expense Category</p>
								<p className={styles.detailsItemText}>{transaction.expenseCategory?.name}</p>
							</div>
						)}
						{Boolean(transaction.orderId,) && (
							<div className={styles.detailsItemWrapper({
								hasBorder: true,
							},)}>
								<p className={styles.detailsItemTitle}>Order ID</p>
								<p className={styles.detailsItemText}>{`${transaction.orderId} (${transaction.order?.type})`}</p>
							</div>
						)}
						{Boolean(transaction.isin,) && (
							<div className={styles.detailsItemWrapper({
								hasBorder: true,
							},)}>
								<p className={styles.detailsItemTitle}>ISIN</p>
								<p className={styles.detailsItemText}>{transaction.isin}</p>
							</div>
						)}
						{Boolean(transaction.security,) && (
							<div className={styles.detailsItemWrapper({
								hasBorder: true,
							},)}>
								<p className={styles.detailsItemTitle}>Security</p>
								<p className={styles.detailsItemText}>{transaction.security}</p>
							</div>
						)}
						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>Service provider</p>
							<p className={styles.detailsItemText}>{transaction.serviceProvider}</p>
						</div>
						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>Currency</p>
							<p className={styles.detailsItemText}>{transaction.currency}</p>
						</div>
						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>Amount</p>
							<p className={styles.detailsItemText}>
								{transaction.amount &&
								<span className={transaction.typeVersion?.cashFlow === TransactionCashFlow.INFLOW ?
									styles.textColorGreen :
									styles.textColorRed
								}>
									{transaction.typeVersion?.cashFlow === TransactionCashFlow.INFLOW ?
										'+' :
										''}
									{localeString(Number(transaction.amount,), '', 2,)}
								</span>}
							</p>
						</div>
						<div className={styles.detailsItemWrapper({
							hasBorder:             Boolean(transaction.comment,),
							hasBorderRadiusBottom:  !Boolean(transaction.comment,),
						},)}>
							<p className={styles.detailsItemTitle}>Date</p>
							<p className={styles.detailsItemText}>
								{transaction.transactionDate && format(transaction.transactionDate, 'dd.MM.yyyy',)}
							</p>
						</div>
						{Boolean(transaction.comment,) && (
							<div className={styles.detailsItemWrapper({
								hasBorderRadiusBottom: true,
							},)}>
								<div className={styles.fullWidth}>
									<p className={styles.detailsItemTitle}>Comment</p>
									<p className={styles.detailsCommentItem}>{transaction.comment}</p>
								</div>
							</div>
						)}
						{transaction.customFields && JSON.parse(transaction.customFields,).map((field: CustomField ,) => {
							return (
								<div className={cx(styles.detailsItemWrapper({
									hasBorderRadiusTop: true, hasBorderRadiusBottom: true,
								},), styles.marginTop16,) }>
									<p className={styles.detailsItemTitle}>{field.label}</p>
									<p className={styles.detailsItemText}>{field.info}</p>
								</div>
							)
						},)
						}
						<div className={styles.docsBlock}>
							{transaction.documents?.map((doc, index,) => {
								const docTypeLabel = updatedDocumentTypes?.find((type,) => {
									return type.value === doc.type
								},)?.label ?? 'Unknown'
								return (
									<div key={index} className={styles.oldDoc}>
										<div className={styles.oldDocLeft}>
											<DocsIcon className={styles.docsIcon} />
											<div className={styles.oldDocTextBlock}>
												<span className={styles.oldDocTextType}>{docTypeLabel}</span>
												<span className={styles.oldDocTextFormat}>
													{doc.format.toLocaleUpperCase()}
												</span>
											</div>
										</div>
										<Button
											type='button'
											onClick={async() => {
												return handleDownload(doc.storageName,)
											}}
											disabled={false}
											additionalProps={{
												btnType: ButtonType.ICON,
												size:    Size.SMALL,
												color:   Color.SECONDRAY_GRAY,
												icon:    <Download />,
											}}
										/>
									</div>
								)
							},)}
						</div>
					</>
				)}
			</div>
			<div className={styles.detailsBtnsBlock}>
				{hasPermission && (<>
					{/* <Button<ButtonType.TEXT>
						onClick={async() => {
							if (transaction?.id) {
								await deleteTransaction(transaction.id,)
								onClose()
							}
						}}
						disabled={isDeleting}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Delete',
							leftIcon: <Trash />,
							color:    Color.SECONDARY_RED,
						}}
					/> */}
					<Button<ButtonType.TEXT>
						onClick={() => {
							onClose()
							if (transaction?.id) {
								toggleUpdateVisible(transaction.id,)
							}
						}}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Edit',
							leftIcon: <PenSquare />,
							color:    Color.SECONDRAY_COLOR,
						}}
					/>
				</>)}
			</div>
		</div>
	)
}