/* eslint-disable no-unused-vars */
import React from 'react'
import {
	useLocation, useNavigate,
} from 'react-router-dom'
import {
	ReportsTable,
} from '../../../../../../modules/reports/reports-list/components'
import {
	toggleState,
} from '../../../../../../shared/utils'
import type {
	TReportSearch,
} from '../../../../../../modules/reports/reports-list/reports.types'
import {
	Drawer, Dialog,
} from '../../../../../../shared/components'
import {
	ReportDetails, AddReportDialog, SuccessCreateDialog,
} from '../../../../../../modules/reports/reports-list/components'
import * as styles from './client-detail-table.style'

type Props = {
	clientId: string
	isCreateOpen: boolean
	toggleCreateVisible: () => void
}

export const ClientDetailReport: React.FC<Props> = ({
	isCreateOpen,
	clientId,
	toggleCreateVisible,
},) => {
	const location = useLocation()
	const navigate = useNavigate()
	const id: number | undefined = location.state?.reportId
	const [reportId, setReportId,] = React.useState<number | undefined>(id,)
	const [isDetailsOpen, setIsDetailsOpen,] = React.useState<boolean>(false,)
	const [isSuccessDialogOpen, setIsSuccessDialogOpen,] = React.useState<boolean>(Boolean(id,),)

	const [reportFilter, setReportFilter,] = React.useState<TReportSearch>()

	const toggleDetailsVisible = React.useCallback((id: number,) => {
		setReportId(id,)
		toggleState(setIsDetailsOpen,)()
	}, [],)

	const handleDetailsDrawerClose = React.useCallback(() => {
		toggleState(setIsDetailsOpen,)()
		setReportId(undefined,)
	}, [],)

	const handleViewDetails = React.useCallback((): void => {
		setIsSuccessDialogOpen(false,)
		toggleState(setIsDetailsOpen,)()
		navigate(location.pathname, {
			replace: true, state: null,
		},)
	}, [],)

	const toggleSuccessDialogVisible = React.useCallback((id: number,) => {
		setReportId(id,)
		toggleState(setIsSuccessDialogOpen,)()
	}, [],)

	const handleDownloadReport = React.useCallback((): void => {
		setIsSuccessDialogOpen(false,)
		navigate(location.pathname, {
			replace: true, state: null,
		},)
		// todo: download report
	}, [],)

	return (
		<div className={styles.tableBlock}>
			<ReportsTable
				toggleCreateVisible={toggleCreateVisible}
				setReportFilter={setReportFilter}
				toggleDetailsVisible={toggleDetailsVisible}
				isClient={true}
				clientId={clientId}
			/>
			<Drawer
				isOpen={isDetailsOpen}
				onClose={handleDetailsDrawerClose}
				isCloseButtonShown
			>
				{reportId && (
					<ReportDetails
						onClose={handleDetailsDrawerClose}
						reportId={reportId}
					/>
				)}
			</Drawer>
			<Dialog
				onClose={toggleCreateVisible}
				open={isCreateOpen}
				isCloseButtonShown
			>
				{isCreateOpen && (
					<AddReportDialog
						onClose={toggleCreateVisible}
						toggleSuccessDialogVisible={toggleSuccessDialogVisible}
					/>
				)}
			</Dialog>
			<Dialog
				onClose={() => {
					navigate(location.pathname, {
						replace: true, state: null,
					},)
					setIsSuccessDialogOpen(false,)
				}}
				open={isSuccessDialogOpen}
				isCloseButtonShown
			>
				{reportId && (
					<SuccessCreateDialog
						handleViewDetails={handleViewDetails}
						handleDownloadReport={handleDownloadReport}
					/>
				)}
			</Dialog>
		</div>
	)
}