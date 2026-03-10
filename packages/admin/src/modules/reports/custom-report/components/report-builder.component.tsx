import React from 'react'
import {
	useNavigate,
} from 'react-router-dom'

import {
	Button,
	ButtonType,
	Color,
	Dialog,
	Size,
} from '../../../../shared/components'
import {
	ImageIcon,
	ListStart,
	PieChartIcon,
	TableIcon,
	TextCursorInput,
	XmarkMid,
} from '../../../../assets/icons'
import {
	ExitReportUnsavedDialog,
} from './exit-unsaved-dialog.component'
import {
	CreateChartDialog,
} from './create-chart-dialog.component'

import {
	toggleState,
} from '../../../../shared/utils'
import {
	ReportBlockType,
} from '../custom-report.types'
import {
	useCustomReportStore,
} from '../custom-report.store'
import {
	RouterKeys,
} from '../../../../router/keys'

import * as styles from '../custom-report.styles'
import {
	ReorderReportDialog,
} from './reorder-report-dialog.component'

type Props = {
	handleCreateReport?: () => Promise<void>
	handleUpdateReport?: () => Promise<void>
	handleCreateDraft: () => Promise<void>
	createDisabled: boolean
	updateDisabled: boolean
	toggleEditTable: VoidFunction
	toggleEditText: VoidFunction
	toggleEditPieChart: VoidFunction
	toggleEdiHorizontalChart: VoidFunction
	toggleEditVerticalChart: VoidFunction
	toggleEditBubbleChart: VoidFunction
	toggleEditLineChart: VoidFunction
}

export const ReportBuilder: React.FC<Props> = ({
	handleCreateReport,
	createDisabled,
	handleCreateDraft,
	updateDisabled,
	handleUpdateReport,
	toggleEditTable,
	toggleEditText,
	toggleEditPieChart,
	toggleEdiHorizontalChart,
	toggleEditVerticalChart,
	toggleEditBubbleChart,
	toggleEditLineChart,
},) => {
	const [isUnsavedDialogOpen, setIsUnsavedDialogOpen,] = React.useState<boolean>(false,)
	const [isReorderDialogOpen, setIsReorderdDialogOpen,] = React.useState<boolean>(false,)
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)
	const ref = React.useRef<HTMLInputElement>(null,)
	const navigate = useNavigate()

	const {
		reportPayload,
		setReportPayload,
		resetCustomReportStore,
	} = useCustomReportStore()

	const togglePopover = toggleState(setIsPopoverShown,)
	const toggleReorderDialog = toggleState(setIsReorderdDialogOpen,)

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>,): void => {
		const selectedFile = event.target.files?.[0]

		if (selectedFile) {
			setReportPayload([
				...reportPayload,
				{
					type:   ReportBlockType.IMAGE,
					file:   selectedFile,
				},
			],)
		}

		if (ref.current) {
			ref.current.value = ''
		}
	}

	return (
		<div className={styles.builder}>
			<div className={styles.builderHeader}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						setIsUnsavedDialogOpen(true,)
					}}
					additionalProps={{
						text:     'Exit',
						btnType:  ButtonType.TEXT,
						size:     Size.MEDIUM,
						color:    Color.TERTIARY_GREY,
					}}
				/>
			</div>
			<div className={styles.builderContent}>
				<p>Add content</p>
				<div>
					<Button<ButtonType.TEXT>
						onClick={toggleEditText}
						additionalProps={{
							text:     'Text',
							btnType:  ButtonType.TEXT,
							leftIcon: <TextCursorInput width={20} height={20} />,
							size:     Size.MEDIUM,
							color:    Color.SECONDRAY_COLOR,
						}}
					/>
					<label>
						<Button<ButtonType.TEXT>
							onClick={() => {
								if (ref.current) {
									ref.current.click()
								}
							}}
							additionalProps={{
								text:     'Image',
								btnType:  ButtonType.TEXT,
								leftIcon: <ImageIcon width={20} height={20} />,
								size:     Size.MEDIUM,
								color:    Color.SECONDRAY_COLOR,
							}}
						/>
						<input
							ref={ref}
							type='file'
							accept='image/*'
							onChange={handleFileChange}
							className='hidden-el'
							id='fileInput'
						/>
					</label>
				</div>
				<div>
					<CreateChartDialog
						togglePopover={togglePopover}
						toggleEditPieChart={toggleEditPieChart}
						toggleEdiHorizontalChart={toggleEdiHorizontalChart}
						toggleEditVerticalChart={toggleEditVerticalChart}
						toggleEditBubbleChart={toggleEditBubbleChart}
						toggleEditLineChart={toggleEditLineChart}
					>
						{isPopoverShown ?
							<Button<ButtonType.TEXT>
								className={styles.closeBtn}
								additionalProps={{
									text:      'Close',
									btnType:   ButtonType.TEXT,
									rightIcon: <XmarkMid width={20} height={20} />,
									size:      Size.MEDIUM,
									color:     Color.SECONDRAY_COLOR,
								}}
							/>						:
							<Button<ButtonType.TEXT>
								onClick={togglePopover}
								additionalProps={{
									text:     'Chart',
									btnType:  ButtonType.TEXT,
									leftIcon: <PieChartIcon width={20} height={20} />,
									size:     Size.MEDIUM,
									color:    Color.SECONDRAY_COLOR,
								}}
							/>
						}
					</CreateChartDialog>
					<Button<ButtonType.TEXT>
						onClick={toggleEditTable}
						additionalProps={{
							text:     'Table',
							btnType:  ButtonType.TEXT,
							leftIcon: <TableIcon width={20} height={20} />,
							size:     Size.MEDIUM,
							color:    Color.SECONDRAY_COLOR,
						}}
					/>
				</div>
				<span />
				<Button<ButtonType.TEXT>
					onClick={toggleReorderDialog}
					additionalProps={{
						text:     'Reorder report',
						btnType:  ButtonType.TEXT,
						leftIcon: <ListStart width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.SECONDRAY_COLOR,
					}}
				/>
			</div>
			<div className={styles.builderFooter}>
				<Button<ButtonType.TEXT>
					onClick={handleCreateDraft}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Save as draft',
						size:    Size.MEDIUM,
						color:   Color.NON_OUT_BLUE,
					}}
				/>
				{handleCreateReport && (
					<Button<ButtonType.TEXT>
						onClick={handleCreateReport}
						disabled={createDisabled}
						additionalProps={{
							btnType:   ButtonType.TEXT,
							text:      'Add report',
							size:      Size.MEDIUM,
						}}
					/>
				)}
				{handleUpdateReport && (
					<Button<ButtonType.TEXT>
						onClick={handleUpdateReport}
						disabled={updateDisabled}
						additionalProps={{
							btnType:   ButtonType.TEXT,
							text:      'Save edits',
							size:      Size.MEDIUM,
						}}
					/>
				)}
			</div>
			<Dialog
				onClose={() => {
					setIsUnsavedDialogOpen(false,)
				}}
				open={isUnsavedDialogOpen}
				isCloseButtonShown
			>
				{isUnsavedDialogOpen && (
					<ExitReportUnsavedDialog
						onSaveDraft={handleCreateDraft}
						onClose={() => {
							setIsUnsavedDialogOpen(false,)
							navigate(RouterKeys.REPORTS,{
								state: null,
							},)
							resetCustomReportStore()
						}}
					/>
				)}
			</Dialog>
			<Dialog
				onClose={() => {
					setIsReorderdDialogOpen(false,)
				}}
				open={isReorderDialogOpen}
				isCloseButtonShown
			>
				<ReorderReportDialog
					toggleReorderDialog={toggleReorderDialog}
				/>
			</Dialog>
		</div>
	)
}