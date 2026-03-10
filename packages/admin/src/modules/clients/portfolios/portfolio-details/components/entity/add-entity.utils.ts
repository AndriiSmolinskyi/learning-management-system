/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import type {
	IProgressBarStep,
} from '../../../../../../shared/types'
import type {
	EntityFormValues,
} from './add-entity.types'

const getEntityName = (values: EntityFormValues,): string => {
	return values.name ?
		values.country?.value ?
			`${values.name} ${values.country.value}` :
			values.name :
		'Add an entity name and choose the entitys location (country) if applicable.'
}

const getEntitySignature = (values: EntityFormValues,): string => {
	return values.authorizedSignatoryName ?
		values.authorizedSignatoryName :
		'Provide the name of the authorized signatory for the entity.'
}

const getAuthorizedPerson = (values: EntityFormValues,): string => {
	return values.firstName ?? values.lastName ?? values.email ?
		`${values.firstName ?
			values.firstName :
			''} ${values.lastName ?
			values.lastName :
			''} ${values.email ?
			values.email :
			''}` :
		'Add details for the client’s authorized person (optional).'
}

const getDocumentsDesc = (): string => {
	return `Add relevant documents for the client (optional).`
}

export const getEntityFormSteps = (values: EntityFormValues,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Entity information',
			labelDesc:  getEntityName(values,),
		},
		{
			labelTitle: 'Authorized signatory',
			labelDesc:  getEntitySignature(values,),
		},
		{
			labelTitle: 'Client’s authorized person',
			labelDesc:  getAuthorizedPerson(values,),
		},
		{
			labelTitle: 'Documents',
			labelDesc:  getDocumentsDesc(),
		},
	]
}
