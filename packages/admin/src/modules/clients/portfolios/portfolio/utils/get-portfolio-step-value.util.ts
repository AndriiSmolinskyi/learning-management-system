import type {
	IPortfolioFormValues,
} from '../components/drawer-content/components/form-portfolio'
import type {
	IProgressBarStep,
} from '../../../../../shared/types'

const getPortfolioName = (values: IPortfolioFormValues,): string => {
	return values.portfolioName ?
		values.portfolioName :
		'Enter the portfolio name and choose the portfolio type.'
}

const getPortfolioResidence = (values: IPortfolioFormValues,): string => {
	return (values.resident ?? values.taxResident) ?
		`${values.resident ?
			values.resident.label :
			''} ${values.taxResident ?
			values.taxResident.label :
			''}` :
		'Provide details on residency and tax residency (optional).'
}

const getDocumentsDesc = (): string => {
	return `Add relevant documents for the portfolio (optional).`
}

export const addPortfolioFormSteps = (values: IPortfolioFormValues,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Portfolio information',
			labelDesc:  getPortfolioName(values,),
		},
		{
			labelTitle: 'Residency information',
			labelDesc:  getPortfolioResidence(values,),
		},
		{
			labelTitle: 'Documents',
			labelDesc:  getDocumentsDesc(),
		},
	]
}
