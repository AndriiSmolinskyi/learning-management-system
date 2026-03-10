/* eslint-disable complexity */
import * as React from 'react'
import {
	useNavigate, useLocation, useParams,
} from 'react-router-dom'
import {
	Link,
} from 'react-router-dom'
import {
	RouterKeys,
} from '../../../../../../router/keys'
import {
	ClientsRoute, ChevronRight, UserSquare, ClientsProfiles,
} from '../../../../../../assets/icons'
import {
	Button, ButtonType, Color, Size,
} from '../../../../../../shared/components'
import * as styles from './client-header-page.style'

interface IClientHeaderPageProps {
  clientDetailId?: string
  clientComplianceId?: string
}

export const ClientHeaderPage: React.FC<IClientHeaderPageProps> = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const {
		id,
	} = useParams()

	const isOnClientProfilePage = location.pathname.includes(RouterKeys.CLIENTS,)
	const isOnClientDetailsPage = location.pathname.includes(`${RouterKeys.CLIENTS}/${id}`,)
	const isOnComplianceCheckPage = location.pathname.includes(RouterKeys.COMPLIANCE_CHECK,)

	return (
		<div className={styles.pageHeader}>
			<Link to={RouterKeys.CLIENTS} className={styles.linkHeader}>
				<Button<ButtonType.TEXT>
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Clients',
						size:     Size.SMALL,
						color:    Color.NONE,
						leftIcon: <ClientsRoute width={20} height={20} />,
					}}
					onClick={() => {
						navigate(RouterKeys.CLIENTS,)
					}}
				/>
			</Link>
			<Link to={RouterKeys.CLIENTS} className={styles.linkHeader}>
				<ChevronRight width={20} height={20} />
				<Button<ButtonType.TEXT>
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Clients profiles',
						size:     Size.SMALL,
						color:    (isOnClientProfilePage || isOnComplianceCheckPage) && !isOnClientDetailsPage ?
							Color.NON_OUT_BLUE :
							Color.NONE,
						leftIcon:  (isOnClientProfilePage) && !isOnClientDetailsPage ?
							<ClientsProfiles width={20} height={20} /> :
							<UserSquare width={20} height={20} />,
					}}
					onClick={() => {
						navigate(RouterKeys.CLIENTS,)
					}}
				/>
			</Link>
			{id && (
				<Link to={`${RouterKeys.CLIENTS}/${id}`} className={styles.linkHeader}>
					<ChevronRight width={20} height={20} />
					<Button<ButtonType.TEXT>
						additionalProps={{
							btnType: ButtonType.TEXT,
							text:    'Client details',
							size:    Size.SMALL,
							color:   isOnComplianceCheckPage ?
								Color.NONE :
								Color.NON_OUT_BLUE,
						}}
					/>
				</Link>
			)}
			{isOnComplianceCheckPage && (
				<Link to={`${RouterKeys.CLIENTS}/${id}/${RouterKeys.COMPLIANCE_CHECK}`} className={styles.linkHeader}>
					<ChevronRight width={20} height={20} />
					<Button<ButtonType.TEXT>
						additionalProps={{
							btnType: ButtonType.TEXT,
							text:    'Compliance check',
							size:    Size.SMALL,
							color:   Color.NON_OUT_BLUE,
						}}
					/>
				</Link>
			)}
		</div>
	)
}