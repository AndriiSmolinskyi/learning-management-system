import React from 'react'
import classNames from 'classnames'
import {
	useNavigate,
} from 'react-router-dom'
import {
	Button, ButtonType, Size, Color,
} from '../../../../../../shared/components'
import {
	Plus, ArrowUpRight,
} from '../../../../../../assets/icons'
import {
	ClientDetailReport,
} from './client-detail-report.component'
import {
	toggleState,
} from '../../../../../../shared/utils'
import {
	useReportsListFiltered,
} from '../../../../../../shared/hooks/reports'
import {
	useReportStore,
} from '../../../../../reports/reports-list/reports.store'
import {
	RouterKeys,
} from '../../../../../../router/keys'
import * as styles from './client-detail-table.style'

enum ClientDetailTab {
	INVOICES = 'invoices',
	EXPENSES = 'expenses',
	REPORTS = 'reports',
	DOCUMENTS = 'documents',
}

type Props = {
	clientId: string
}

export const ClientDetailTable: React.FC<Props> = ({
	clientId,
},) => {
	const navigate = useNavigate()
	const {
		filter,
	} = useReportStore()
	const {
		data: reportList,
	} = useReportsListFiltered(filter,)
	const [selectedButton, setSelectedButton,] = React.useState<ClientDetailTab>(ClientDetailTab.INVOICES,)

	const handleButtonClick = (button: ClientDetailTab,): void => {
		setSelectedButton(button,)
	}

	const [isCreateOpen, setIsCreateOpen,] = React.useState<boolean>(false,)

	const toggleCreateVisible = React.useCallback(() => {
		toggleState(setIsCreateOpen,)()
	}, [],)

	return (
		<div className={styles.Table}>
			<div className={styles.TableHedaer}>
				<div className={styles.TableHeaderBtnBlock}>
					<p
						className={classNames(styles.TableHeaderBtn, {
							[styles.TableHeaderBtnSelected]: selectedButton === ClientDetailTab.INVOICES,
						},)}
						onClick={() => {
							handleButtonClick(ClientDetailTab.INVOICES,)
						}}
					>
						Invoices
					</p>
					<span className={styles.TableHeaderBtnBlockLine}></span>
					<p
						className={classNames(styles.TableHeaderBtn, {
							[styles.TableHeaderBtnSelected]: selectedButton === ClientDetailTab.EXPENSES,
						},)}
						onClick={() => {
							handleButtonClick(ClientDetailTab.EXPENSES,)
						}}
					>
						Expenses
					</p>
					<span className={styles.TableHeaderBtnBlockLine}></span>
					<p
						className={classNames(styles.TableHeaderBtn, {
							[styles.TableHeaderBtnSelected]: selectedButton === ClientDetailTab.REPORTS,
						},)}
						onClick={() => {
							handleButtonClick(ClientDetailTab.REPORTS,)
						}}
					>
						Reports
					</p>
					<span className={styles.TableHeaderBtnBlockLine}></span>
					<p
						className={classNames(styles.TableHeaderBtn, {
							[styles.TableHeaderBtnSelected]: selectedButton === ClientDetailTab.DOCUMENTS,
						},)}
						onClick={() => {
							handleButtonClick(ClientDetailTab.DOCUMENTS,)
						}}
					>
						Documents
					</p>
				</div>
				{selectedButton === ClientDetailTab.REPORTS ?
					<Button<ButtonType.TEXT>
						onClick={toggleCreateVisible}
						type='button'
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Add new',
							size:     Size.MEDIUM,
							color:    Color.BLUE,
							leftIcon: <Plus width={20} height={20} />,
						}}
					/> :
					<Button<ButtonType.TEXT>
						type='button'
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Add new',
							size:     Size.MEDIUM,
							color:    Color.BLUE,
							leftIcon: <Plus width={20} height={20} />,
						}}
					/>
				}
			</div>
			{selectedButton === ClientDetailTab.REPORTS && reportList &&
				<ClientDetailReport toggleCreateVisible={toggleCreateVisible} isCreateOpen={isCreateOpen} clientId={clientId}/>
			}
			{selectedButton === ClientDetailTab.REPORTS &&
							<div className={styles.tableFooter}>
								<Button<ButtonType.TEXT>
									onClick={() => {
										navigate(RouterKeys.REPORTS,)
									}}
									className={styles.navigateButton}
									additionalProps={{
										btnType:   ButtonType.TEXT,
										text:      'View more',
										rightIcon: <ArrowUpRight />,
										size:      Size.MEDIUM,
										color:     Color.SECONDRAY_COLOR,
									}}
								/>
							</div>
			}
		</div>
	)
}
