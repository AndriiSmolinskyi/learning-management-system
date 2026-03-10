import type {
	IProgressBarStep,
} from '../../../../../shared/types'
import type {
	ClientStoreValues,
} from '../clients.types'

const getPersonalDetailsDesc = (values: ClientStoreValues,): string => {
	return values.firstName && values.lastName ?
		`${values.firstName} ${values.lastName}` :
		'Fill in the client’s name.'
}

const getEmailAddressesDesc = (values: ClientStoreValues,): string => {
	return values.emails.length > 1 ?
		`${values.emails[0]} (+${values.emails.length - 1})` :
		values.emails[0] ?? 'Enter the client’s primary email.'
}

const getContactNumbersDesc = (values: ClientStoreValues,): string => {
	return values.contacts.length > 1 ?
		`${values.contacts[0]} (+${values.contacts.length - 1})` :
		values.contacts[0] ?? 'Provide the client’s phone number(s)'
}

const getResidenceDesc = (values: ClientStoreValues,): string => {
	return values.residence ?
		`${values.residence}` :
		`Select the client's country of residence.`
}

const getBillingInformationDesc = (values: ClientStoreValues,): string => {
	const {
		country, region, city, streetAddress, buildingNumber, postalCode,
	} = values

	const addressParts = [
		country,
		region,
		city,
		streetAddress,
		buildingNumber,
		postalCode,
	]

	const address = addressParts.filter((part,) => {
		return part
	},).join(', ',)

	return address ?
		`${address}` :
		`Enter the billing address details.`
}

const getDocumentsDesc = (): string => {
	return `Add relevant documents for the client (optional).`
}

export const addClientFormSteps = (values: ClientStoreValues,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Personal details',
			labelDesc:  getPersonalDetailsDesc(values,),
		},
		{
			labelTitle: 'Email addresses',
			labelDesc:  getEmailAddressesDesc(values,),
		},
		{
			labelTitle: 'Contact numbers',
			labelDesc:  getContactNumbersDesc(values,),
		},
		{
			labelTitle: 'Residence',
			labelDesc:  getResidenceDesc(values,),
		},
		{
			labelTitle: 'Billing information',
			labelDesc:  getBillingInformationDesc(values,),
		},
		{
			labelTitle: 'Documents',
			labelDesc:  getDocumentsDesc(),
		},
	]
}
