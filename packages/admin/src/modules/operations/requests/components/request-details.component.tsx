/* eslint-disable complexity */
import React from 'react'
import {
	format,
} from 'date-fns'
import {
	useNavigate,
} from 'react-router-dom'

import {
	BadgeDropdown,
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import {
	Download,
	DocsIcon,
	PenSquare,
	ListPlus,
} from '../../../../assets/icons'

import {
	useRequestById, useUpdateRequest,
} from '../../../../shared/hooks/requests'
import type {
	RequestStatusType,
} from '../../../../shared/types'
import {
	RequestType,
} from '../../../../shared/types'
import {
	RouterKeys,
} from '../../../../router/keys'

import * as styles from '../requests.styles'
import {
	getRequestStatus,
} from '../request.utils'
import {
	requestStatusOptions,
} from '../request.constants'
import {
	useGetDocumentTypes,
} from '../../../../shared/hooks/list-hub'
import {
	localeString,
} from '../../../../shared/utils'
import {
	handleDownload,
} from '../../../../services/document/document.util'

type Props = {
	onClose: () => void
	requestId: number | undefined
	toggleUpdateVisible: (id?: number) => void
}

export const RequestDetails: React.FC<Props> = ({
	onClose,
	requestId,
	toggleUpdateVisible,
},) => {
	const navigate = useNavigate()

	const {
		data: requestExtended,
	} = useRequestById(requestId,)
	const {
		mutateAsync: updateStatus,
	} = useUpdateRequest()

	const {
		data: documentTypes,
	} = useGetDocumentTypes()

	const updatedDocumentTypes = documentTypes?.map((type,) => {
		return {
			label: type.name,
			value: type.name,
		}
	},)

	const filteredStatusOptions = requestStatusOptions.filter((item,) => {
		return item !== requestExtended?.status
	},)

	return (
		<div className={styles.formContainer}>
			<h3 className={styles.formHeader}>Request details</h3>
			<div className={styles.detailsFormWrapper}>
				{requestExtended && (
					<>
						<div className={styles.detailsItemWrapper({
							hasBorder: true, hasBorderRadiusTop: true,
						},)}>
							<p className={styles.detailsItemTitle}>Request ID</p>
							<div className={styles.detailsItemText}><p>{requestExtended.id}</p></div>
						</div>
						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>Request type</p>
							<div className={styles.detailsItemText}><p>{requestExtended.type}</p></div>
						</div>
						{requestExtended.amount && (
							<div className={styles.detailsItemWrapper({
								hasBorder: true,
							},)}>
								<p className={styles.detailsItemTitle}>Amount</p>
								<div className={styles.detailsItemText}><p>{localeString(parseFloat(requestExtended.amount,), 'USD' , 2, true,)}</p></div>
							</div>
						)}
						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>Status</p>
							<div className={styles.detailsItemText}>
								<BadgeDropdown<RequestStatusType>
									value={requestExtended.status}
									options={filteredStatusOptions}
									onChange={async(status,) => {
										await updateStatus({
											status,
											id: requestExtended.id,
										},)
									}}
									getLabelColor={getRequestStatus}
								/>
							</div>
						</div>
						<div className={styles.detailsItemWrapper({
							hasBorder: false,
						},)}>
							<p className={styles.detailsItemTitle}>Last update</p>
							<div className={styles.detailsItemText}><p>{format(requestExtended.updatedAt, 'dd.MM.yyyy',)}</p></div>
						</div>
						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>Portfolio</p>
							<div className={styles.detailsItemText}><p>{requestExtended.portfolio?.name}</p></div>
						</div>
						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>Entity</p>
							<div className={styles.detailsItemText}><p>{requestExtended.entity?.name}</p></div>
						</div>
						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>Bank account</p>
							<div className={styles.detailsItemText}><p>{requestExtended.account?.accountName}</p></div>
						</div>
						{requestExtended.asset?.assetName && (
							<div className={styles.detailsItemWrapper({
								hasBorder: Boolean(requestExtended.comment,), hasBorderRadiusBottom: !Boolean(requestExtended.comment,),
							},)}>
								<p className={styles.detailsItemTitle}>Asset</p>
								<div className={styles.detailsItemText}><p>{requestExtended.asset.assetName}</p></div>
							</div>
						)}
						{requestExtended.comment && (
							<div className={styles.detailsCommentWrapper}>
								<p>{requestExtended.type === RequestType.OTHER ?
									'Transaction type' :
									'Comment'}</p>
								<span>{requestExtended.comment}</span>
							</div>
						)}
						<div className={styles.docsBlock}>
							{requestExtended.documents?.map((doc, index,) => {
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
			<div className={styles.addBtnWrapper}>
				{(requestExtended?.type === RequestType.BUY || requestExtended?.type === RequestType.SELL) ?
					<Button<ButtonType.ICON>
						onClick={() => {
							onClose()
							toggleUpdateVisible(requestExtended.id,)
						}}
						additionalProps={{
							btnType: ButtonType.ICON,
							icon:    <PenSquare width={20} height={20} />,
							size:    Size.MEDIUM,
							color:   Color.SECONDRAY_COLOR,
						}}
					/> :
					<Button<ButtonType.TEXT>
						onClick={() => {
							onClose()
							toggleUpdateVisible(requestExtended?.id,)
						}}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Edit',
							leftIcon: <PenSquare width={20} height={20} />,
							size:     Size.MEDIUM,
							color:    Color.SECONDRAY_COLOR,
						}}
					/>
				}
				{(requestExtended?.type === RequestType.BUY || requestExtended?.type === RequestType.SELL) && (
					<Button<ButtonType.TEXT>
						onClick={() => {
							onClose()
							navigate(RouterKeys.ORDERS,)
						}}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     `Add ${requestExtended.type.toLowerCase()} order`,
							leftIcon: <ListPlus />,
							size:     Size.MEDIUM,
							color:    Color.SECONDRAY_COLOR,
						}}
					/>)}
			</div>
		</div>
	)
}