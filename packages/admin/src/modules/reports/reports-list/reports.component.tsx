import React from 'react'
import {
	useLocation, useNavigate,
} from 'react-router-dom'

import {
	AddReportDialog,
	ReportDetails,
	ReportsHeader, ReportsTable, SuccessCreateDialog,
} from './components'
import {
	Dialog,
	Drawer,
} from '../../../shared/components'
import {
	toggleState,
} from '../../../shared/utils'
import type {
	TReportSearch,
} from './reports.types'
import * as styles from './reports.styles'

const Reports: React.FC = () => {
	const location = useLocation()
	const navigate = useNavigate()
	const id: number | undefined = location.state?.reportId

	const [isCreateOpen, setIsCreateOpen,] = React.useState<boolean>(false,)
	const [reportFilter, setReportFilter,] = React.useState<TReportSearch | undefined>()

	const [reportId, setReportId,] = React.useState<number | undefined>(id,)
	const [isDetailsOpen, setIsDetailsOpen,] = React.useState<boolean>(false,)
	const [isSuccessDialogOpen, setIsSuccessDialogOpen,] = React.useState<boolean>(Boolean(id,),)

	const toggleCreateVisible = React.useCallback(() => {
		toggleState(setIsCreateOpen,)()
	}, [],)

	const toggleDetailsVisible = React.useCallback((id: number,) => {
		setReportId(id,)
		toggleState(setIsDetailsOpen,)()
	}, [],)

	const handleDetailsDrawerClose = React.useCallback(() => {
		toggleState(setIsDetailsOpen,)()
		setReportId(undefined,)
	}, [],)

	const toggleSuccessDialogVisible = React.useCallback((id: number,) => {
		setReportId(id,)
		toggleState(setIsSuccessDialogOpen,)()
	}, [],)

	const handleViewDetails = React.useCallback((): void => {
		setIsSuccessDialogOpen(false,)
		toggleState(setIsDetailsOpen,)()
		navigate(location.pathname, {
			replace: true, state: null,
		},)
	}, [],)

	const handleDownloadReport = React.useCallback((): void => {
		setIsSuccessDialogOpen(false,)
		navigate(location.pathname, {
			replace: true, state: null,
		},)
		// todo: download report
	}, [],)

	return (
		<div className={styles.container}>
			<ReportsHeader
				toggleCreateVisible={toggleCreateVisible}
				reportFilter={reportFilter}
				setReportFilter={setReportFilter}
			/>
			<ReportsTable
				toggleCreateVisible={toggleCreateVisible}
				setReportFilter={setReportFilter}
				toggleDetailsVisible={toggleDetailsVisible}
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

export default Reports
