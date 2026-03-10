/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	format,
} from 'date-fns'
import {
	toZonedTime,
} from 'date-fns-tz'

import {
	TransactionTypeAuditType,
	TransactionCashFlow,
} from '../../../../shared/types'
import type {
	ITransactionTypeAuditTrail,
} from '../../../../shared/types'
import {
	ROLES_NAMES,
} from '../../../../shared/constants'
import {
	Check, CheckNegative, LightChevron, ChevronDown,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import {
	toggleState,
} from '../../../../shared/utils'
import * as styles from './audit-trail.style'

type Props = {
  auditItem: ITransactionTypeAuditTrail
}

export const AuditTrailItem: React.FC<Props> = ({
	auditItem,
},) => {
	const {
		timeZone,
	} = new Intl.DateTimeFormat().resolvedOptions()
	const zonedDate = toZonedTime(new Date(auditItem.createdAt,), timeZone,)
	const [isOpen, setIsOpen,] = React.useState(false,)

	const roleName = auditItem.userRole ?
		(ROLES_NAMES[auditItem.userRole] ?? auditItem.userRole) :
		'—'

	const isExpandable =
    auditItem.settingsType === TransactionTypeAuditType.EDITED ||
    auditItem.settingsType === TransactionTypeAuditType.RELATION

	const isRelation = auditItem.settingsType === TransactionTypeAuditType.RELATION
	const isEdited = auditItem.settingsType === TransactionTypeAuditType.EDITED

	const hasAny = (a: unknown, b: unknown,): boolean => {
		return (a !== null && String(a,).trim() !== '') ||
    (b !== null && String(b,).trim() !== '')
	}

	const show = (v: unknown,): string => {
		return (v !== null && String(v,).trim() !== '' ?
			String(v,) :
			'---')
	}

	const typeFrom = auditItem.transactionTypeRelatedTypeFrom
	const typeTo = auditItem.transactionTypeRelatedTypeTo
	const assetFrom = auditItem.transactionTypeRelatedAssetFrom
	const assetTo = auditItem.transactionTypeRelatedAssetTo

	const transactionNameFrom = auditItem.transactionTypeNameFrom
	const transactionNameTo = auditItem.transactionTypeNameTo
	const categoryFrom = auditItem.transactionTypeCategoryFrom
	const categoryTo = auditItem.transactionTypeCategoryTo
	const cashFlowFrom = auditItem.transactionTypeCashflowFrom
	const cashFlowTo = auditItem.transactionTypeCashflowTo
	const plFrom = auditItem.transactionTypePlFrom
	const plTo = auditItem.transactionTypePlTo
	const commentFrom = auditItem.transactionTypeCommentFrom
	const commentTo = auditItem.transactionTypeCommentTo

	const renderCashFlow = (cf?: string | null | undefined,): string => {
		if (cf === TransactionCashFlow.INFLOW) {
			return 'Cash In'
		}
		if (cf === TransactionCashFlow.OUTFLOW) {
			return 'Cash Out'
		}
		return 'N/A'
	}

	const renderPl = (pl?: string | null | undefined,): string => {
		if (pl === 'P') {
			return 'Profit'
		}
		if (pl === 'L') {
			return 'Loss'
		}
		return 'Neutral'
	}

	const blocks: Array<{ key: string; title: string; text: React.ReactNode }> = []

	if (isRelation && hasAny(typeFrom, typeTo,)) {
		blocks.push({
			key:   'relType',
			title: 'Related transaction settings',
			text:  <>From: {show(typeFrom,)} → To: {show(typeTo,)}</>,
		},)
	}

	if (isRelation && hasAny(assetFrom, assetTo,)) {
		blocks.push({
			key:   'relAsset',
			title: 'Related asset',
			text:  <>From: {show(assetFrom,)} → To: {show(assetTo,)}</>,
		},)
	}

	if (isEdited && hasAny(transactionNameFrom, transactionNameTo,)) {
		blocks.push({
			key:   'name',
			title: 'Transaction name',
			text:  <>From: {show(transactionNameFrom,)} → To: {show(transactionNameTo,)}</>,
		},)
	}

	if (isEdited && hasAny(categoryFrom, categoryTo,)) {
		blocks.push({
			key:   'category',
			title: 'Transaction category',
			text:  <>From: {show(categoryFrom,)} → To: {show(categoryTo,)}</>,
		},)
	}

	if (isEdited && hasAny(cashFlowFrom, cashFlowTo,)) {
		blocks.push({
			key:   'cashflow',
			title: 'Cashflow type',
			text:  <>From: {show(renderCashFlow(cashFlowFrom,),)} → To: {show(renderCashFlow(cashFlowTo,),)}</>,
		},)
	}

	if (isEdited && hasAny(plFrom, plTo,)) {
		blocks.push({
			key:   'pl',
			title: 'P/L type',
			text:  <>From: {show(renderPl(plFrom,),)} → To: {show(renderPl(plTo,),)}</>,
		},)
	}

	if (
		isEdited &&
    (auditItem.transactionTypeAnnualFrom.length > 0 ||
      auditItem.transactionTypeAnnualTo.length > 0)
	) {
		blocks.push({
			key:   'annual',
			title: 'Annual totals per assets',
			text:  <>
        From: {auditItem.transactionTypeAnnualFrom.length > 0 ?
					auditItem.transactionTypeAnnualFrom.join(', ',) :
					'---'} →
				{' '}To: {auditItem.transactionTypeAnnualTo.length > 0 ?
					auditItem.transactionTypeAnnualTo.join(', ',) :
					'---'}
			</>,
		},)
	}

	if (isEdited && hasAny(commentFrom, commentTo,)) {
		blocks.push({
			key:   'comment',
			title: 'Comment',
			text:  <>From: {show(commentFrom,)} → To: {show(commentTo,)}</>,
		},)
	}

	return (
		<div className={styles.auditItem}>
			<div className={styles.auditItemHeader}>
				<div className={styles.auditItemHeaderFlex}>
					<p className={styles.auditItemHeaderName}>
						{auditItem.transactionType?.isActivated ?
							(<Check width={20} height={20} />) :
							<CheckNegative width={20} height={20} />}
						{auditItem.transactionType?.versions[0]?.name}
					</p>
					<p className={styles.auditItemHeaderRole}>{auditItem.userName}({roleName})</p>
				</div>
				<div className={styles.auditItemHeaderRight}>
					<div className={styles.auditItemHeaderFlex}>
						<p className={styles.auditLabel(auditItem.settingsType,)}>{auditItem.settingsType}</p>
						<p className={styles.auditItemHeaderDate}>{format(zonedDate, 'd MMM, HH:mm',)}</p>
					</div>
					<Button<ButtonType.ICON>
						disabled={Boolean(!isExpandable,)}
						onClick={toggleState(setIsOpen,)}
						additionalProps={{
							btnType:  ButtonType.ICON,
							size:     Size.SMALL,
							color:    Color.NONE,
							icon:    (
								<span className={styles.chevron(isOpen,)}>
									{isExpandable ?
										<ChevronDown width={20} height={20} /> :
										<LightChevron width={20} height={20} />}
								</span>
							),
						}}
					/>
				</div>
			</div>

			{isExpandable && isOpen && blocks.length > 0 && (
				<div>
					{blocks.map((b, i,) => {
						return (
							<div
								key={b.key}
								className={cx(
									styles.auditItemInfo,
									i < blocks.length - 1 && styles.borderBottom,
								)}
							>
								<p className={styles.auditItemInfoTitle}>{b.title}</p>
								<p className={styles.auditItemInfoText}>{b.text}</p>
							</div>
						)
					},)}
				</div>
			)}
		</div>
	)
}
