/* eslint-disable complexity */
import React from 'react'
import {
	format,
} from 'date-fns'
import {
	useStudent,
} from '../../../shared/hooks/students/students.hooks'
import * as styles from './students-details.styles'

type Props = {
	onClose: () => void
	studentId: string | undefined
}

export const StudentDetails: React.FC<Props> = ({
	studentId,
},) => {
	const {
		data: student,
	} = useStudent(studentId,)

	return (
		<div className={styles.formContainer}>
			<h3 className={styles.formHeader}>Students details</h3>
			<div className={styles.detailsFormWrapper}>
				{student && (
					<>
						<div className={styles.detailsItemWrapper({
							hasBorder: true, hasBorderRadiusTop: true,
						},)}>
							<p className={styles.detailsItemTitle}>Student ID</p>
							<div className={styles.detailsItemText}><p>{student.id}</p></div>
						</div>
						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>Student name</p>
							<div className={styles.detailsItemText}><p>{student.firstName} {student.lastName}</p></div>
						</div>
						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>Email</p>
							<div className={styles.detailsItemText}><p>{student.email}</p></div>
						</div>
						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>Phone number</p>
							<div className={styles.detailsItemText}><p>{student.phoneNumber}</p></div>
						</div>
						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>Country</p>
							<div className={styles.detailsItemText}><p>{student.country ?
								'' :
								'N/A'}</p></div>
						</div>
						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>City</p>
							<div className={styles.detailsItemText}><p>{student.city ?
								'' :
								'N/A'}</p></div>
						</div>
						<div className={styles.detailsItemWrapper({
							hasBorder: Boolean(student.comment,), hasBorderRadiusBottom: !Boolean(student.comment,),
						},)}>
							<p className={styles.detailsItemTitle}>Created at</p>
							<div className={styles.detailsItemText}><p>{format(student.createdAt, 'dd.MM.yyyy',)}</p></div>
						</div>
						{student.comment && (
							<div className={styles.detailsCommentWrapper}>
								<p>Comment</p>
								<span>{student.comment}</span>
							</div>
						)}
					</>
				)}
			</div>
			<div className={styles.addBtnWrapper}>

			</div>
		</div>
	)
}