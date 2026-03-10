/* eslint-disable no-unused-vars */
/* eslint-disable max-lines */
/* eslint-disable max-depth */
/* eslint-disable complexity */
import React from 'react'
import {
	useLocation,
	useNavigate,
} from 'react-router-dom'

import {
	Folder,
} from '../../../assets/icons'
import {
	PieChartConstructor,
	ReportBuilder,
	ReportContent,
	HorizontalBarChartConstructor,
	VerticalBarChartConstructor,
	BubbleChartConstructor,
	LineChartConstructor,
} from './components'

import {
	ReportBlockType,
} from './custom-report.types'
import type {
	TCustomReport, TReportImageData,
} from './custom-report.types'
import {
	useCreateReport,
	useCreateReportDraft,
	useReportById,
	useReportDraftById,
	useUpdateReport,
	useUpdateReportDraft,
} from '../../../shared/hooks/reports'
import {
	RouterKeys,
} from '../../../router/keys'
import {
	toggleState,
} from '../../../shared/utils'
import {
	useCustomReportStore,
} from './custom-report.store'
import {
	DocumentTypes,
} from '../../../shared/types'
import {
	useCreateDocument, useDeleteDocumentsByIds,
} from '../../../shared/hooks'

import * as styles from './custom-report.styles'

const CustomReport: React.FC = () => {
	const [customReport, setCustomReport,] = React.useState<TCustomReport>()
	const [editTableVisible, setEditTableVisible,] = React.useState<boolean>(false,)
	const [editTextVisible, setEditTextVisible,] = React.useState<boolean>(false,)
	const [editPieChartVisible, setEditPieChartVisible,] = React.useState<boolean>(false,)
	const [editHorizontalChartVisible, setEditHorizontalChartVisible,] = React.useState<boolean>(false,)
	const [editVerticalChartVisible, setEditVerticalChartVisible,] = React.useState<boolean>(false,)
	const [editBubbleChartVisible, setEditBubbleChartVisible,] = React.useState<boolean>(false,)
	const [editLineChartVisible, setEditLineChartVisible,] = React.useState<boolean>(false,)

	const {
		currentIndex,
		builderType,
		setBuilderType,
		reportPayload,
		setReportPayload,
		resetCustomReportStore,
		setCurrentIndex,
		resetCustomReportContent,
	} = useCustomReportStore()

	const location = useLocation()
	const customPayload = location.state?.customPayload
	const reportId = location.state?.reportId
	const reportDraftId = location.state?.reportDraftId

	const navigate = useNavigate()

	const {
		mutateAsync: createReport,
		isPending: reportPending,
	} = useCreateReport()
	const {
		mutateAsync: updateReport,
		isPending: updateReportPending,
	} = useUpdateReport()
	const {
		mutateAsync: createDraft,
		isPending: draftPending,
	} = useCreateReportDraft()
	const {
		mutateAsync: updateDraft,
		isPending: updateDraftPending,
	} = useUpdateReportDraft()
	const {
		data: report,
	} = useReportById(reportId,)
	const {
		data: reportDraft,
	} = useReportDraftById(reportDraftId,)
	const {
		mutateAsync: createDocument,
	} = useCreateDocument(DocumentTypes.REPORT,)
	const {
		mutateAsync: deleteDocuments,
	} = useDeleteDocumentsByIds()
	const hasHeader = Boolean(
		report?.clientId ??
		report?.portfolioId ??
		reportDraft?.portfolioId ??
		reportDraft?.clientId ??
		customPayload?.portfolioName ??
		customPayload?.clientName,
	)

	const closeEditors = React.useCallback((): void => {
		setEditTextVisible(false,)
		setEditTableVisible(false,)
		setEditPieChartVisible(false,)
		setEditHorizontalChartVisible(false,)
		setEditVerticalChartVisible(false,)
		setEditBubbleChartVisible(false,)
		setEditLineChartVisible(false,)
	}, [],)

	const toggleEditTable = React.useCallback((): void => {
		setCurrentIndex(undefined,)
		resetCustomReportContent()
		setEditTextVisible(false,)
		setEditPieChartVisible(false,)
		setEditHorizontalChartVisible(false,)
		setEditVerticalChartVisible(false,)
		setEditBubbleChartVisible(false,)
		setEditLineChartVisible(false,)
		toggleState(setEditTableVisible,)()
	}, [],)

	const toggleEditText = React.useCallback((): void => {
		setCurrentIndex(undefined,)
		resetCustomReportContent()
		setEditTableVisible(false,)
		setEditPieChartVisible(false,)
		setEditHorizontalChartVisible(false,)
		setEditVerticalChartVisible(false,)
		setEditBubbleChartVisible(false,)
		setEditLineChartVisible(false,)
		toggleState(setEditTextVisible,)()
	}, [],)

	const toggleEditPieChart = React.useCallback((): void => {
		setCurrentIndex(undefined,)
		resetCustomReportContent()
		setEditTextVisible(false,)
		setEditTableVisible(false,)
		setEditHorizontalChartVisible(false,)
		setEditVerticalChartVisible(false,)
		setEditBubbleChartVisible(false,)
		setEditLineChartVisible(false,)
		setBuilderType(ReportBlockType.PIE_CHART,)
		toggleState(setEditPieChartVisible,)()
	}, [],)

	const toggleEdiHorizontalChart = React.useCallback((): void => {
		setCurrentIndex(undefined,)
		resetCustomReportContent()
		setEditTextVisible(false,)
		setEditTableVisible(false,)
		setEditPieChartVisible(false,)
		setEditVerticalChartVisible(false,)
		setEditBubbleChartVisible(false,)
		setEditLineChartVisible(false,)
		setBuilderType(ReportBlockType.HORIZOTAL_CHART,)
		toggleState(setEditHorizontalChartVisible,)()
	}, [],)

	const toggleEditVerticalChart = React.useCallback((): void => {
		setCurrentIndex(undefined,)
		resetCustomReportContent()
		setEditTextVisible(false,)
		setEditTableVisible(false,)
		setEditPieChartVisible(false,)
		setEditHorizontalChartVisible(false,)
		setEditBubbleChartVisible(false,)
		setEditLineChartVisible(false,)
		setBuilderType(ReportBlockType.VERTICAL_CHART,)
		toggleState(setEditVerticalChartVisible,)()
	}, [],)

	const toggleEditBubbleChart = React.useCallback((): void => {
		setCurrentIndex(undefined,)
		resetCustomReportContent()
		setEditTextVisible(false,)
		setEditTableVisible(false,)
		setEditPieChartVisible(false,)
		setEditHorizontalChartVisible(false,)
		setEditVerticalChartVisible(false,)
		setEditLineChartVisible(false,)
		setBuilderType(ReportBlockType.BUBBLE_CHART,)
		toggleState(setEditBubbleChartVisible,)()
	}, [],)

	const toggleEditLineChart = React.useCallback((): void => {
		setCurrentIndex(undefined,)
		resetCustomReportContent()
		setEditTextVisible(false,)
		setEditTableVisible(false,)
		setEditPieChartVisible(false,)
		setEditHorizontalChartVisible(false,)
		setEditVerticalChartVisible(false,)
		setEditBubbleChartVisible(false,)
		setBuilderType(ReportBlockType.LINE_CHART,)
		toggleState(setEditLineChartVisible,)()
	}, [],)

	const handleLeavePage = (): void => {
		navigate(RouterKeys.REPORTS,{
			state: null,
		},)
		resetCustomReportStore()
	}

	const handleCreateReport = async(): Promise<void> => {
		if (customReport) {
			const {
				reportDraftId,
				...data
			} = customReport
			const newReport = await createReport({
				...customReport,
			},)
			const payload = await Promise.all(
				reportPayload.map(async(item,) => {
					if (item.type === ReportBlockType.IMAGE && item.file) {
						const formData = new FormData()
						formData.append('file', item.file,)
						formData.append('type', DocumentTypes.REPORT,)
						formData.append('reportId', String(newReport.id,),)
						const document = await createDocument(formData,)
						return {
							type: item.type,
							data: document,
							file: undefined,
						}
					}
					return item
				},),
			)
			const payloadSumbit = JSON.stringify(payload,)
			await updateReport({
				...data,
				id:      newReport.id,
				payload: payloadSumbit,
			},)
			navigate(RouterKeys.REPORTS, {
				state: {
					reportId: newReport.id,
				},
			},)
			resetCustomReportStore()
		}
	}

	const handleUpdateReport = async(): Promise<void> => {
		if (customReport?.reportId && report) {
			const {
				reportDraftId,
				reportId,
				...data
			} = customReport
			const existedDocumentIds = reportPayload
				.filter((item,) => {
					return (item.type === ReportBlockType.IMAGE && item.data)
				},)
				.map((item,) => {
					return (item as TReportImageData).data?.id
				},)
				.filter((item,): item is string => {
					return item !== undefined
				},)

			const documentsToDelete = report.documents.
				filter((doc,) => {
					return !existedDocumentIds.includes(doc.id,)
				},).
				map((doc,) => {
					return doc.id
				},)

			if (documentsToDelete.length) {
				await deleteDocuments({
					id: documentsToDelete,
				},)
			}
			const payload = await Promise.all(
				reportPayload.map(async(item,) => {
					if (item.type === ReportBlockType.IMAGE && item.file) {
						const formData = new FormData()
						formData.append('file', item.file,)
						formData.append('type', DocumentTypes.REPORT,)
						formData.append('reportId', String(reportId,),)
						const document = await createDocument(formData,)
						return {
							type: item.type,
							data: document,
							file: undefined,
						}
					}
					return item
				},),
			)
			const payloadSumbit = JSON.stringify(payload,)
			await updateReport({
				...data,
				id:      reportId,
				payload: payloadSumbit,
			},)
			handleLeavePage()
		}
	}

	const handleCreateDraft = async(): Promise<void> => {
		if (customReport) {
			const {
				reportId,
				reportDraftId,
				...data
			} = customReport
			if (reportDraftId && reportDraft) {
				const existedDocumentIds = reportPayload
					.filter((item,) => {
						return (item.type === ReportBlockType.IMAGE && item.data)
					},)
					.map((item,) => {
						return (item as TReportImageData).data?.id
					},)
					.filter((item,): item is string => {
						return item !== undefined
					},)

				const documentsToDelete = reportDraft.documents.
					filter((doc,) => {
						return !existedDocumentIds.includes(doc.id,)
					},).
					map((doc,) => {
						return doc.id
					},)

				if (documentsToDelete.length) {
					await deleteDocuments({
						id: documentsToDelete,
					},)
				}
				const payload = await Promise.all(
					reportPayload.map(async(item,) => {
						if (item.type === ReportBlockType.IMAGE && item.file) {
							const formData = new FormData()
							formData.append('file', item.file,)
							formData.append('type', DocumentTypes.REPORT,)
							formData.append('reportDraftId', String(reportDraftId,),)
							const document = await createDocument(formData,)
							return {
								type: item.type,
								data: document,
								file: undefined,
							}
						}
						return item
					},),
				)
				await updateDraft({
					...data,
					id:      reportDraftId,
					payload: JSON.stringify(payload,),
				},)
			} else {
				const newDraft = await createDraft({
					...data,
				},)
				const payload = await Promise.all(
					reportPayload.map(async(item,) => {
						if (item.type === ReportBlockType.IMAGE && item.file) {
							const formData = new FormData()
							formData.append('file', item.file,)
							formData.append('type', DocumentTypes.REPORT,)
							formData.append('reportDraftId', String(newDraft.id,),)
							const document = await createDocument(formData,)
							return {
								type: item.type,
								data: document,
								file: undefined,
							}
						}
						return item
					},),
				)
				await updateDraft({
					...data,
					id:      newDraft.id,
					payload: JSON.stringify(payload,),
				},)
			}
			handleLeavePage()
		}
	}

	React.useEffect(() => {
		if (!customPayload && !reportId && !reportDraftId) {
			handleLeavePage()
		}
	}, [],)

	React.useEffect(() => {
		if (customPayload) {
			setCustomReport({
				type:          customPayload.type,
				category:      customPayload.category,
				clientId:      customPayload.clientId,
				portfolioId:   customPayload.portfolioId,
				createdBy:     customPayload.createdBy,
				name:          customPayload.name,
			},)
		} else if (reportId && report) {
			try {
				setCustomReport({
					reportId:    report.id,
					type:        report.type,
					category:    report.category,
					clientId:    report.clientId ?? undefined,
					portfolioId: report.portfolioId ?? undefined,
					createdBy:   report.createdBy,
					isins:       report.isins,
					name:        report.name,
				},)
				setReportPayload(report.payload ?? [],)
			} catch (error) {
				handleLeavePage()
			}
		} else if (reportDraftId && reportDraft) {
			try {
				setCustomReport({
					reportDraftId: reportDraft.id,
					type:          reportDraft.type,
					category:      reportDraft.category,
					clientId:      reportDraft.clientId ?? undefined,
					portfolioId:   reportDraft.portfolioId ?? undefined,
					createdBy:     reportDraft.createdBy,
					isins:         reportDraft.isins,
					name:          reportDraft.name,
				},)
				setReportPayload(reportDraft.payload ?? [],)
			} catch (error) {
				handleLeavePage()
			}
		}
	}, [report, reportDraft, customPayload,],)

	return (
		<div className={styles.container}>
			<div className={styles.panel}>
				{hasHeader && (
					<div className={styles.panelHeager}>
						<Folder width={16} height={16} />
						{report?.client && (
							<span>{report.client.firstName} {report.client.lastName}</span>
						)}
						{reportDraft?.client && (
							<span>{reportDraft.client.firstName} {reportDraft.client.lastName}</span>
						)}
						{customPayload?.clientName && (
							<span>{customPayload.clientName}</span>
						)}
						{report?.clientId && report.portfolioId && (
							<span>/</span>
						)}
						{reportDraft?.clientId && reportDraft.portfolioId && (
							<span>/</span>
						)}
						{customPayload?.portfolioName && customPayload?.clientName && (
							<span>/</span>
						)}
						{report?.portfolio && (
							<span>{report.portfolio.name}</span>
						)}
						{reportDraft?.portfolio && (
							<span>{reportDraft.portfolio.name}</span>
						)}
						{customPayload?.portfolioName && (
							<span>{customPayload.portfolioName}</span>
						)}
					</div>
				)}
				<ReportContent
					hasHeader={hasHeader}
					editTableVisible={editTableVisible}
					editTextVisible={editTextVisible}
					editPieChartVisible={editPieChartVisible}
					editHorizontalChartVisible={editHorizontalChartVisible}
					editVerticalChartVisible={editVerticalChartVisible}
					editBubbleChartVisible={editBubbleChartVisible}
					editLineChartVisible={editLineChartVisible}
					closeEditors={closeEditors}
				/>
			</div>
			{builderType === ReportBlockType.CONTENT && (
				<ReportBuilder
					handleCreateReport={reportId ?
						undefined :
						handleCreateReport}
					handleUpdateReport={reportId ?
						handleUpdateReport :
						undefined}
					handleCreateDraft={handleCreateDraft}
					createDisabled={reportPending || draftPending || updateDraftPending || updateReportPending || !reportPayload.length}
					updateDisabled={updateReportPending || draftPending || updateDraftPending}
					toggleEditText={toggleEditText}
					toggleEditTable={toggleEditTable}
					toggleEditPieChart={toggleEditPieChart}
					toggleEdiHorizontalChart={toggleEdiHorizontalChart}
					toggleEditVerticalChart={toggleEditVerticalChart}
					toggleEditBubbleChart={toggleEditBubbleChart}
					toggleEditLineChart={toggleEditLineChart}
				/>
			)}
			{builderType === ReportBlockType.PIE_CHART && (
				<PieChartConstructor
					key={currentIndex}
					setEditPieChartVisible={setEditPieChartVisible}
				/>
			)}
			{builderType === ReportBlockType.HORIZOTAL_CHART && (
				<HorizontalBarChartConstructor
					key={currentIndex}
					setEditHorizontalChartVisible={setEditHorizontalChartVisible}
				/>
			)}
			{builderType === ReportBlockType.VERTICAL_CHART && (
				<VerticalBarChartConstructor
					key={currentIndex}
					setEditVerticalChartVisible={setEditVerticalChartVisible}
				/>
			)}
			{builderType === ReportBlockType.BUBBLE_CHART && (
				<BubbleChartConstructor
					key={currentIndex}
					setEditBubbleChartVisible={setEditBubbleChartVisible}
				/>
			)}
			{builderType === ReportBlockType.LINE_CHART && (
				<LineChartConstructor
					key={currentIndex}
					setEditLineChartVisible={setEditLineChartVisible}
				/>
			)}
		</div>
	)
}

export default CustomReport
