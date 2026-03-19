import React from 'react'
import {
	useLocation,
	useNavigate,
} from 'react-router-dom'

import {
	AddLessonDialog,
	LessonDetails,
	LessonsHeader,
	LessonsTable,
	SuccessCreateDialog,
} from './components'
import {
	Dialog,
	Drawer,
} from '../../../shared/components'
import {
	toggleState,
} from '../../../shared/utils'

import * as styles from './lessons.styles'

const Lessons: React.FC = () => {
	const location = useLocation()
	const navigate = useNavigate()
	const lessonIdFromState: string | undefined = location.state?.lessonId

	const [isCreateOpen, setIsCreateOpen,] = React.useState<boolean>(false,)
	const [lessonId, setLessonId,] = React.useState<string | undefined>(lessonIdFromState,)
	const [isDetailsOpen, setIsDetailsOpen,] = React.useState<boolean>(false,)
	const [isSuccessDialogOpen, setIsSuccessDialogOpen,] = React.useState<boolean>(Boolean(lessonIdFromState,),)

	const toggleCreateVisible = React.useCallback((): void => {
		toggleState(setIsCreateOpen,)()
	}, [],)

	const toggleDetailsVisible = React.useCallback((id: string,): void => {
		setLessonId(id,)
		toggleState(setIsDetailsOpen,)()
	}, [],)

	const handleDetailsDrawerClose = React.useCallback((): void => {
		toggleState(setIsDetailsOpen,)()
		setLessonId(undefined,)
	}, [],)

	const toggleSuccessDialogVisible = React.useCallback((id: string,): void => {
		setLessonId(id,)
		toggleState(setIsSuccessDialogOpen,)()
	}, [],)

	const handleViewDetails = React.useCallback((): void => {
		setIsSuccessDialogOpen(false,)
		toggleState(setIsDetailsOpen,)()
		navigate(location.pathname, {
			replace: true,
			state:   null,
		},)
	}, [
		location.pathname,
		navigate,
	],)

	return (
		<div className={styles.container}>
			<LessonsHeader
				toggleCreateVisible={toggleCreateVisible}
			/>

			<LessonsTable
				toggleCreateVisible={toggleCreateVisible}
				toggleDetailsVisible={toggleDetailsVisible}
			/>

			<Drawer
				isOpen={isDetailsOpen}
				onClose={handleDetailsDrawerClose}
				isCloseButtonShown
			>
				{lessonId && (
					<LessonDetails
						onClose={handleDetailsDrawerClose}
						lessonId={lessonId}
					/>
				)}
			</Drawer>

			<Dialog
				onClose={toggleCreateVisible}
				open={isCreateOpen}
				isCloseButtonShown
			>
				{isCreateOpen && (
					<AddLessonDialog
						onClose={toggleCreateVisible}
						toggleSuccessDialogVisible={toggleSuccessDialogVisible}
					/>
				)}
			</Dialog>

			<Dialog
				onClose={() => {
					navigate(location.pathname, {
						replace: true,
						state:   null,
					},)
					setIsSuccessDialogOpen(false,)
				}}
				open={isSuccessDialogOpen}
				isCloseButtonShown
			>
				{lessonId && (
					<SuccessCreateDialog
						handleViewDetails={handleViewDetails}
					/>
				)}
			</Dialog>
		</div>
	)
}

export default Lessons