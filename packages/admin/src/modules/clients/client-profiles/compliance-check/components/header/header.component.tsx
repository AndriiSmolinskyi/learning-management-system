import * as React from 'react'
import {
	useNavigate,
} from 'react-router-dom'
import {
	ArrowLeft,
} from '../../../../../../assets/icons'
import {
	RouterKeys,
} from '../../../../../../router/keys'
import {
	useParams,
} from 'react-router-dom'
import type {
	Client,
} from '../../../../../../shared/types'
import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../../../shared/components'
import * as styles from './header.styles'

interface IComplianceHeaderProps {
	userData: Client
}
export const ComplianceHeader: React.FC<IComplianceHeaderProps> = ({
	userData,
},) => {
	const {
		id,
	} = useParams()
	const navigate = useNavigate()

	const handleNavigate = (): void => {
		navigate(`${RouterKeys.CLIENTS}/${id}`,)
	}
	return (
		<div className={styles.headerWrapper}>
			<Button<ButtonType.ICON>
				onClick={handleNavigate}
				additionalProps={{
					btnType:   ButtonType.ICON,
					size:      Size.SMALL,
					icon:    <ArrowLeft width={20} height={20} />,
					color:     Color.SECONDRAY_GRAY,
				}}
			/>
			<p className={styles.headerTitle}>Compliance check - {userData.firstName} {userData.lastName}</p>
		</div>
	)
}