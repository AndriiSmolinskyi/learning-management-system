
import * as React from 'react'
import {
	cx,
} from '@emotion/css'

import {
	FormField,
	SelectField,
} from '../../../../../../shared/components'
import type {
	BudgetPlanFormValues,
	StepType,
} from '../../../../budget/budget.types'
import {
	getClientListWithoutBudgetPlan,
} from '../../../../../../shared/hooks'
import type {
	BudgetClientListType,
} from '../../../../budget/budget.types'
import type {
	IOptionType,
} from '../../../../../../shared/types'
import {
	ClientsRoute,
} from '../../../../../../assets/icons'

import * as styles from './styles'

interface IAddBudgetFirstStepProps {
	step: StepType
	values: BudgetPlanFormValues
	setBudgetPlanForm: React.Dispatch<React.SetStateAction<BudgetPlanFormValues>>
}

export const AddBudgetFirstStep: React.FC<IAddBudgetFirstStepProps> = ({
	step,
	values,
	setBudgetPlanForm,
},) => {
	const {
		data: clientsList,
	} = getClientListWithoutBudgetPlan()

	const clientOptionsArray = clientsList?.map((client,) => {
		return {
			label: `${client.firstName} ${client.lastName}`,
			value: {
				id:   client.id,
				name: `${client.firstName} ${client.lastName}`,
			},
		}
	},) ?? []
	return (
		<div className={cx(styles.formStepWrapper, step !== 1 && 'hidden-el',)}>
			<FormField
				name='budgetPlanName'
				placeholder='Budget plan name'
				value={values.budgetPlanName}
				onChange={(e,) => {
					setBudgetPlanForm({
						...values,
						budgetPlanName:    e.target.value,
					},)
				}}
			/>
			<SelectField<BudgetClientListType>
				name='clientId'
				isDisabled={!clientsList}
				placeholder='Select client'
				leftIcon={<ClientsRoute width={18} height={18} />}
				options={clientOptionsArray}
				onChange={(select,) => {
					if (select && !Array.isArray(select,)) {
						setBudgetPlanForm({
							...values,
							clientId:    select as IOptionType<BudgetClientListType>,
						},)
					}
				}}
				value={values.clientId}
				isSearchable
			/>
		</div>
	)
}