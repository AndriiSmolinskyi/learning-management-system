import * as React from 'react'
import {
	useNavigate,
} from 'react-router-dom'

import type {
	IPortfolioDetailed,
} from '../../../../../../../../shared/types'
import {
	Check,
	CheckNegative,
	Briefcase,
	XmarkMid,
	MoreVertical,
} from '../../../../../../../../assets/icons'
import {
	PortfolioCardDialog,
} from '../../../../../../../clients/portfolios/portfolio/components/portfolio-card-dialog'
import {
	Button, ButtonType, Color, Size,
} from '../../../../../../../../shared/components'
import {
	useParams,
} from 'react-router-dom'
import {
	EditPortfolioDrawer,
} from '../../../edit-content/edit-content.component'
import {
	localeString,
} from '../../../../../../../../shared/utils'
import {
	RouterKeys,
} from '../../../../../../../../router/keys'

import * as styles from './subportfolio-list-item.styles'

interface ISubportfolioListItemtProps{
	subportfolio: IPortfolioDetailed
	handleOpenDeleteModal: (portfolioId: string) => void
}

export const SubportfolioListItem: React.FC<ISubportfolioListItemtProps> = ({
	subportfolio,
	handleOpenDeleteModal,
},) => {
	const {
		id,
	} = useParams()
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)
	const [isEditOpen, setIsEditOpen,] = React.useState<boolean>(false,)
	const buttonRef = React.useRef<HTMLDivElement | null>(null,)
	const liRef = React.useRef<HTMLLIElement | null>(null,)
	const navigate = useNavigate()

	React.useEffect(() => {
		const handleDocumentClick = (e: MouseEvent,): void => {
			const target = e.target as Node
			if (
				liRef.current?.contains(target,) &&
				!buttonRef.current?.contains(target,)
			) {
				navigate(`${RouterKeys.PORTFOLIO}/${id}/${RouterKeys.SUB_PORTFOLIO}/${subportfolio.id}`,)
			}
		}
		document.addEventListener('click', handleDocumentClick,)
		return () => {
			document.removeEventListener('click', handleDocumentClick,)
		}
	}, [navigate, id, subportfolio.id,],)
	const handlePopoverCondition = (): void => {
		setIsPopoverShown(!isPopoverShown,)
	}
	const handleEditCondition = (): void => {
		setIsEditOpen(!isEditOpen,)
	}
	return (
		<li ref={liRef} className={styles.liWrapper(subportfolio.isActivated,)} >
			<div className={styles.topBlock}>
				<div className={styles.statusTypeInfoBlock}>
					{subportfolio.isActivated ?
						<Check/> :
						<CheckNegative/>}
					<p className={styles.portfolioType(subportfolio.type, subportfolio.isActivated,)}>{subportfolio.type}</p>
					<Briefcase className={styles.briefcaseIcon}/>
				</div>
				<div ref={buttonRef}>
					<PortfolioCardDialog
						id={subportfolio.id}
						status={subportfolio.isActivated}
						handlePopoverCondition={handlePopoverCondition}
						handleEditCondition={handleEditCondition}
						isSubportfolio
						mainPortfolioId={id}
						handleOpenDeleteModal={handleOpenDeleteModal}
						usePortal
					>
						<Button<ButtonType.ICON>
							disabled={false}
							onClick={handlePopoverCondition}
							additionalProps={{
								btnType: ButtonType.ICON,
								size:    Size.SMALL,
								color:   Color.SECONDRAY_GRAY,
								icon:    isPopoverShown ?
									<XmarkMid width={20} height={20} />			:
									<MoreVertical width={20} height={20} />	,
							}}
						/>
					</PortfolioCardDialog>
				</div>
			</div>
			<div className={styles.infoBlock}>
				<p className={styles.subName(subportfolio.isActivated,)}>{subportfolio.name}</p>
				<p className={styles.subAssets(subportfolio.isActivated,)}>${localeString(subportfolio.totalAssets ?? 0, '', 2, false,)}</p>
			</div>
			<EditPortfolioDrawer
				isOpen={isEditOpen}
				onClose={handleEditCondition}
				id={subportfolio.id}
			/>
		</li>
	)
}