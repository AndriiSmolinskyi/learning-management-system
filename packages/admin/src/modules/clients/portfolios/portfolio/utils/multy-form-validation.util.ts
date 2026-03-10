import type {
	IAccountValidateValues,
} from '../components/drawer-content/components/form-account'
import {
	validateAccount,
} from '../components/drawer-content/components/form-account'
import type {
	IBankValidateValues,
} from '../components/drawer-content/components/form-bank'
import {
	validateBank,
} from '../components/drawer-content/components/form-bank'
import type {
	IEntityValidateValues,
} from '../components/drawer-content/components/form-entity'
import {
	validateEntity,
} from '../components/drawer-content/components/form-entity'
import type {
	IPortfolioValidateValues,
} from '../components/drawer-content/components/form-portfolio'
import {
	validatePortfolio,
} from '../components/drawer-content/components/form-portfolio'
import type {
	FormValuesForStep,
} from '../components/drawer-content/drawer-content.component'

export const validationMultyForm = (rawStep: 1 | 2 | 3 | 4, subStep: number,) => {
	return (values: FormValuesForStep<typeof rawStep>,): unknown => {
		switch (rawStep) {
		case 1:
			return validatePortfolio(values as IPortfolioValidateValues,)
		case 2:
			return validateEntity(values as IEntityValidateValues, subStep,)
		case 3:
			return validateBank(values as IBankValidateValues, subStep,)
		case 4:
			return validateAccount(values as IAccountValidateValues, subStep,)
		default:
			return validatePortfolio(values as IPortfolioValidateValues,)
		}
	}
}