/* eslint-disable complexity */
import * as React from 'react'
import {
	useNavigate,
	useSearchParams,
} from 'react-router-dom'
import {
	useParams,
} from 'react-router-dom'
import * as styles from './compliance-check.styles'

import {
	ClientHeaderPage,
} from '../clients/components/client-header-page/client-header-page.component'
import {
	ComplianceHeader,
} from './components/header/header.component'
import {
	MainBlock,
} from './components/main-block/main-block.component'
import {
	useGetDocumentsForComplianceCheck,
} from '../../../../shared/hooks'
import {
	useComplianceCheckStore,
} from '../../../../store/compliance-check.store'
import {
	useClientGet,
} from '../client-details/hooks'
import {
	RouterKeys,
} from '../../../../router/keys'
import {
	Roles,
	DocumentStatus,
} from '../../../../shared/types'
import {
	useUserStore,
} from '../../../../store/user.store'

const ComplianceCheck: React.FC = () => {
	const [searchParams,] = useSearchParams()
	const navigate = useNavigate()
	const status = (searchParams.get('status',) as DocumentStatus | null) ?? DocumentStatus.PENDING
	const {
		id,
	} = useParams()
	const {
		data: userData, error,
	} = useClientGet(id ?? '',)
	const {
		data,
	} = useGetDocumentsForComplianceCheck(id ?? '', status,)
	const {
		setItems, setPortfolioItems,
	} = useComplianceCheckStore()
	const {
		userInfo,
	} = useUserStore()

	React.useEffect(() => {
		if (data) {
			setItems(data.clientDocuments,)
			setPortfolioItems(data.portfolios,)
		}
	}, [data,],)

	React.useEffect(() => {
		if (error) {
			navigate(RouterKeys.CLIENTS,)
		}
	}, [error,],)

	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		if (!hasPermission) {
			navigate(RouterKeys.PORTFOLIO,)
		}
	}, [],)

	return (
		<div>
			{userData && <ClientHeaderPage clientComplianceId={userData.id} />}
			<div className={styles.pageWrapper}>
				{userData && <ComplianceHeader userData={userData}/>}
				{userData && <MainBlock userData={userData}/>}
			</div>
		</div>
	)
}

export default ComplianceCheck