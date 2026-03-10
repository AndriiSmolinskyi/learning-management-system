/* eslint-disable complexity */
import React from 'react'
import {
	getCountryCode,
} from 'countries-list'
import ReactCountryFlag from 'react-country-flag'
import {
	Mail, Phone,
} from '../../../../../../assets/icons'
import {
	Tooltip,
} from '@blueprintjs/core'
import {
	useGetClientDocuments,
} from '../../../../../../shared/hooks'
import {
	ClientBillingDoc,
} from './client-billing-doc.component'
import type {
	Client,
} from '../../../../../../shared/types'
import {
	useResendConfirmation, useResetPassword,
} from '../../hooks/use-resend-creds.hook'
import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../../../shared/components'
import * as styles from './client-detail.style'

interface IClientDetailsProps {
    data: Client;
}

export const ClientDetailBilling: React.FC<IClientDetailsProps> = ({
	data,
},) => {
	const {
		mutateAsync : handleResendConfirmation,
	} = useResendConfirmation()
	const {
		mutateAsync : handleResetPassword,
	} = useResetPassword()
	const {
		data: dataDocs,
	} = useGetClientDocuments(data.id,)

	const isResend = data.user?.email?.token ?? data.user?.email?.isConfirmed
	const renderList = (
		items: Array<string> | undefined,
	): React.JSX.Element | null => {
		if (!items || items.length === 0) {
			return null
		}
		const [first, ...rest] = items
		return (
			<div className={styles.ClientDetailMoreContainer}>
				<p>
					{first}
					{rest.length > 0 && (
						<Tooltip
							content={
								<div className={styles.tooltipFlex}>
									{rest.map((item, index,) => {
										return (
											<span key={index} className={styles.tooltipText}>
												{item}
												{index < rest.length - 1 && ', '}
											</span>
										)
									},)}
								</div>
							}
							popoverClassName={styles.tooltip}
							placement='top'
							interactionKind='hover'
						>
							<span className={styles.ClientDetailMoreButton}>
                            +{rest.length}
							</span>
						</Tooltip>
					)}
				</p>
			</div>
		)
	}
	const country = getCountryCode(data.residence,)

	return (
		<div className={styles.ClientDetailBilling}>
			{data.user?.email?.email ?
				(
					<Button<ButtonType.TEXT>
						className={styles.resetPasswordPos}
						onClick={async() => {
							if (data.user?.email?.email) {
								await handleResetPassword(data.user.email.email,)
							}
						}}
						additionalProps={{
							btnType: ButtonType.TEXT,
							text:    'Reset password',
							size:    Size.SMALL,
							color:   Color.SECONDRAY_GRAY,
						}}
					/>
				) :
				null}

			{data.user?.email && (
				<Button<ButtonType.TEXT>
					className={styles.resendCredsPos}
					onClick={async() => {
						await handleResendConfirmation(data.id,)
					}}
					additionalProps={{
						btnType:   ButtonType.TEXT,
						text:      isResend ?
							'Resend creds' :
							'Send creds',
						size:      Size.SMALL,
						color:     Color.SECONDRAY_GRAY,
					}}
				/>
			)}

			<div className={styles.ClientDetailBillingMain}>
				<div className={styles.ClientDetailBiilingFlex}>
					<div className={styles.ClientDetailBillingItem}>
						<Mail width={18} height={18} />
						{renderList(data.emails,)}
					</div>
					<div className={styles.ClientDetailBillingItem}>
						<Phone width={18} height={18} />
						{renderList(data.contacts,)}
					</div>
					<div className={styles.ClientDetailBillingItem}>
						{country && (
							<ReactCountryFlag
								countryCode={country}
								svg
								style={{
									width:  '18px',
									height: '18px',
								}}
							/>
						)}
						<p>{data.residence}</p>
					</div>
				</div>
				<div>
					<p className={styles.ClientDetailBiilingInfoTitle}>
						Billing information
					</p>
					<p className={styles.ClientDetailBiilingInfo}>
						{`${data.country}, ${data.region}, ${data.city}, ${data.streetAddress}, ${data.buildingNumber}, ${data.postalCode}`}
					</p>
				</div>
				{data.comment && (
					<div className={styles.commentWrapper}>
						<p>Comment</p>
						<span>{data.comment}</span>
					</div>
				)}
			</div>

			{dataDocs && dataDocs.length > 0 && (
				<div>
					<ClientBillingDoc dataDocs={dataDocs} />
				</div>
			)}
		</div>
	)
}
