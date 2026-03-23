/* eslint-disable complexity */
import React from 'react'
import {
	format,
} from 'date-fns'

import {
	useGroup,
} from '../../../shared/hooks/groups/groups.hook'
import * as styles from './groups-details.styles'

type Props = {
	onClose: () => void
	groupId: string | undefined
}

export const GroupDetails: React.FC<Props> = ({
	groupId,
},) => {
	const {
		data: group,
	} = useGroup(groupId,)

	return (
		<div className={styles.formContainer}>
			<h3 className={styles.formHeader}>Group details</h3>
			<div className={styles.detailsFormWrapper}>
				{group && (
					<>
						<div className={styles.detailsItemWrapper({
							hasBorder:          true,
							hasBorderRadiusTop: true,
						},)}>
							<p className={styles.detailsItemTitle}>Group name</p>
							<div className={styles.detailsItemText}>
								<p>{group.groupName}</p>
							</div>
						</div>

						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>Course name</p>
							<div className={styles.detailsItemText}>
								<p>{group.courseName}</p>
							</div>
						</div>

						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>Start date</p>
							<div className={styles.detailsItemText}>
								<p>{format(group.startDate, 'dd.MM.yyyy',)}</p>
							</div>
						</div>

						<div className={styles.detailsItemWrapper({
							hasBorder: true,
						},)}>
							<p className={styles.detailsItemTitle}>Created at</p>
							<div className={styles.detailsItemText}>
								<p>{format(group.createdAt, 'dd.MM.yyyy',)}</p>
							</div>
						</div>

						<div className={styles.detailsItemWrapper({
							hasBorder:             Boolean(group.comment,),
							hasBorderRadiusBottom: !Boolean(group.comment,),
						},)}>
							<p className={styles.detailsItemTitle}>Active lessons</p>
							<div className={styles.detailsItemText}>
								<p>{group.activeLessons}</p>
							</div>
						</div>

						{group.comment && (
							<div className={styles.detailsCommentWrapper}>
								<p>Comment</p>
								<span>{group.comment}</span>
							</div>
						)}
					</>
				)}
			</div>
			<div className={styles.addBtnWrapper} />
		</div>
	)
}