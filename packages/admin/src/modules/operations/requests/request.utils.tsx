/* eslint-disable complexity */
import type {
	MultiValueProps,
} from 'react-select'
import React from 'react'

import {
	Label,
	LabelColor,
} from '../../../shared/components'

import type {
	IOptionType,
	IProgressBarStep,
	IRequestDraftExtended,
	IRequestExtended,
} from '../../../shared/types'
import {
	RequestStatusType,
} from '../../../shared/types'
import type {
	RequestFormValues,
} from './request.types'

const getRequestType = (values: RequestFormValues,): string => {
	return values.type ?? 'Choose the type of request you want to create.'
}

const getRequestAccount = (values: RequestFormValues,): string => {
	const client = values.clientId ?
		`${values.clientId.value.name} (client)` :
		undefined
	const portfolio = values.portfolioId ?
		`, ${values.portfolioId.value.name} (portfolio)` :
		undefined
	const entity = values.entityId ?
		`, ${values.entityId.value.name} (entity)` :
		undefined
	const account = values.accountId ?
		`, ${values.accountId.value.name} (bank account).` :
		undefined
	return `${client ?? ''}${portfolio ?? ''}${entity ?? ''}${account ?? ''}` ||
		'Specify the portfolio, entity, and bank account for this request.'
}

const getRequestDetails = (values: RequestFormValues,): string => {
	return values.amount ?? values.comment ?? values.assetId?.value.name ??
		'Provide the required information based on the selected request type.'
}

const getDocumentsDesc = (): string => {
	return `Add relevant documents for the request (optional).`
}

export const getRequestFormSteps = (values: RequestFormValues,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Request type',
			labelDesc:  getRequestType(values,),
		},
		{
			labelTitle: 'Linked account',
			labelDesc:  getRequestAccount(values,),
		},
		{
			labelTitle: 'Request details',
			labelDesc:  getRequestDetails(values,),
		},
		{
			labelTitle: 'Documents',
			labelDesc:  getDocumentsDesc(),
		},
	]
}

export const getRequestFormInitialValues = (requestExtended?: IRequestExtended | IRequestDraftExtended,): RequestFormValues => {
	return {
		type:        requestExtended?.type,
		amount:        requestExtended?.amount ?? undefined,
		comment:        requestExtended?.comment ?? undefined,
		accountId: requestExtended?.account ?
			{
				label: requestExtended.account.accountName,
				value: {
					id:   requestExtended.account.id,
					name: requestExtended.account.accountName,
				},
			} :
			undefined,
		bankId: requestExtended?.bank ?
			requestExtended.bank.id :
			undefined,
		clientId: requestExtended?.client ?
			{
				label: `${requestExtended.client.firstName} ${requestExtended.client.lastName}`,
				value: {
					id:   requestExtended.client.id,
					name: `${requestExtended.client.firstName} ${requestExtended.client.lastName}`,
				},
			} :
			undefined,
		portfolioId: requestExtended?.portfolio ?
			{
				label: requestExtended.portfolio.name,
				value: {
					id:   requestExtended.portfolio.id,
					name: requestExtended.portfolio.name,
				},
			} :
			undefined,
		entityId:    requestExtended?.entity ?
			{
				label: requestExtended.entity.name,
				value: {
					id:   requestExtended.entity.id,
					name: requestExtended.entity.name,
				},
			} :
			undefined,
		assetId:   requestExtended?.asset ?
			{
				label: requestExtended.asset.assetName,
				value: {
					id:   requestExtended.asset.id,
					name: requestExtended.asset.assetName,
				},
			} :
			undefined,
	}
}

export const displayRequestInformation = (form: RequestFormValues,): string => {
	const portfolio = form.portfolioId ?
		`${form.portfolioId.value.name} (portfolio)` :
		''
	const entity = form.entityId ?
		`, ${form.entityId.value.name} (entity)` :
		''
	const account = form.accountId ?
		`, ${form.accountId.value.name} (bank account).` :
		''
	return `${portfolio}${entity}${account}`
}

export const getRequestStatus = (status?: RequestStatusType,): LabelColor | undefined => {
	switch (status) {
	case RequestStatusType.APPROVED:
		return LabelColor.GREEN
	case RequestStatusType.CANCELED:
		return LabelColor.RED
	case RequestStatusType.SIGNED:
		return LabelColor.PINK
	case RequestStatusType.SENT_TO_CLIENT:
		return LabelColor.ORANGE
	case RequestStatusType.IN_PROGRESS:
		return LabelColor.YELLOW
	case RequestStatusType.NOT_STARTED:
		return LabelColor.GRAY
	default:
		return undefined
	}
}

export const getSelectMultiLabelElement = (props: MultiValueProps<IOptionType<RequestStatusType>, boolean>,): React.ReactNode => {
	return (
		<Label
			{...props.removeProps}
			color={getRequestStatus(props.data.value,)}
			label={props.data.value}
		/>)
}