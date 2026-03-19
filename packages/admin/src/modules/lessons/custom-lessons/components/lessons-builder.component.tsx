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
	ListStart,
	PieChartIcon,
	TableIcon,
	TextCursorInput,
	XmarkMid,
} from '../../../../assets/icons'
import {
	CreateChartDialog,
} from './create-chart-dialog.component'
import {
	toggleState,
} from '../../../../shared/utils'
import {
	useCustomLessonStore,
} from '../custom-lessons.store'
import {
	RouterKeys,
} from '../../../../router/keys'

import * as styles from '../custom-lessons.styles'
import {
	ReorderLessonsDialog,
} from './reorder-lessons-dialog.component'

type Props = {
	handleCreateLesson?: () => Promise<void>
	handleUpdateLesson?: () => Promise<void>
	createDisabled: boolean
	updateDisabled: boolean
	toggleEditTable: VoidFunction
	toggleEditText: VoidFunction
	toggleEditPieChart: VoidFunction
	toggleEditHorizontalChart: VoidFunction
	toggleEditVerticalChart: VoidFunction
	toggleEditBubbleChart: VoidFunction
	toggleEditLineChart: VoidFunction
}

export const LessonsBuilder: React.FC<Props> = ({
	handleCreateLesson,
	createDisabled,
	updateDisabled,
	handleUpdateLesson,
	toggleEditTable,
	toggleEditText,
	toggleEditPieChart,
	toggleEditHorizontalChart,
	toggleEditVerticalChart,
	toggleEditBubbleChart,
	toggleEditLineChart,
},) => {
	const [isUnsavedDialogOpen, setIsUnsavedDialogOpen,] = React.useState<boolean>(false,)
	const [isReorderDialogOpen, setIsReorderDialogOpen,] = React.useState<boolean>(false,)
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)
	const navigate = useNavigate()

	const {
		resetCustomLessonStore,
	} = useCustomLessonStore()

	const togglePopover = toggleState(setIsPopoverShown,)
	const toggleReorderDialog = toggleState(setIsReorderDialogOpen,)

	const handleExit = (): void => {
		setIsUnsavedDialogOpen(false,)
		navigate(RouterKeys.LESSONS, {
			state: null,
		},)
		resetCustomLessonStore()
	}

	return (
		<div className={styles.builder}>
			<div className={styles.builderHeader}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						setIsUnsavedDialogOpen(true,)
					}}
					additionalProps={{
						text:    'Exit',
						btnType: ButtonType.TEXT,
						size:    Size.MEDIUM,
						color:   Color.TERTIARY_GREY,
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
				</div>

				<div>
					<CreateChartDialog
						togglePopover={togglePopover}
						toggleEditPieChart={toggleEditPieChart}
						toggleEditHorizontalChart={toggleEditHorizontalChart}
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
							/> :
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
						text:     'Reorder lesson',
						btnType:  ButtonType.TEXT,
						leftIcon: <ListStart width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.SECONDRAY_COLOR,
					}}
				/>
			</div>

			<div className={styles.builderFooter}>
				{handleCreateLesson && (
					<Button<ButtonType.TEXT>
						onClick={handleCreateLesson}
						disabled={createDisabled}
						additionalProps={{
							btnType: ButtonType.TEXT,
							text:    'Add lesson',
							size:    Size.MEDIUM,
						}}
					/>
				)}

				{handleUpdateLesson && (
					<Button<ButtonType.TEXT>
						onClick={handleUpdateLesson}
						disabled={updateDisabled}
						additionalProps={{
							btnType: ButtonType.TEXT,
							text:    'Save edits',
							size:    Size.MEDIUM,
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
					<div>
						<p>Unsaved changes will be lost. Exit lesson builder?</p>

						<div>
							<Button<ButtonType.TEXT>
								onClick={() => {
									setIsUnsavedDialogOpen(false,)
								}}
								additionalProps={{
									btnType: ButtonType.TEXT,
									text:    'Stay',
									size:    Size.MEDIUM,
									color:   Color.TERTIARY_GREY,
								}}
							/>

							<Button<ButtonType.TEXT>
								onClick={handleExit}
								additionalProps={{
									btnType: ButtonType.TEXT,
									text:    'Exit',
									size:    Size.MEDIUM,
								}}
							/>
						</div>
					</div>
				)}
			</Dialog>

			<Dialog
				onClose={() => {
					setIsReorderDialogOpen(false,)
				}}
				open={isReorderDialogOpen}
				isCloseButtonShown
			>
				<ReorderLessonsDialog
					toggleReorderDialog={toggleReorderDialog}
				/>
			</Dialog>
		</div>
	)
}