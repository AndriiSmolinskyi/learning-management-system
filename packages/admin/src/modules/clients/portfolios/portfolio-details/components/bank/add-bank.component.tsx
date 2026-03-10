/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	Form,
} from 'react-final-form'
import type {
	FormApi,
} from 'final-form'

import {
	FormField,
	SelectField,
	ButtonType,
	Button,
	Size,
	LabeledProgressBar,
	PrevButton,
	NextButton,
} from '../../../../../../shared/components'
import {
	Flag,
} from '../../../../../../assets/icons'

import {
	useCreateBank,
} from '../../../../../../shared/hooks'
import {
	useCreateBankListItem,
	useGetBankList,
} from '../../../../../../shared/hooks/list-hub'
import type {
	BankFormValues,
	CreateBankProps,
	StepType,
} from './add-bank.types'
import {
	validateAddBankForm,
} from './add-bank.validator'
import {
	email,
} from '../../../../../../shared/utils/validators'
import {
	getBankFormSteps,
} from './add-bank.utils'
import {
	CreatebleSelectEnum,
	filteredCountries,
} from '../../../../../../shared/constants'
import {
	useCreatedBankStore,
} from './add-bank.store'
import type {
	SelectOptionType,
} from '../../../../../../shared/types'
import * as styles from './bank.styles'

const countriesOptions = filteredCountries.map((name,) => {
	return {
		value: name,
		label: name,
	}
},)

type Props = {
	createBankProps: CreateBankProps
	clientId: string
	toggleBankDialogVisible?: () => void
	onClose: () => void

}

export const AddBank: React.FC<Props> = ({
	createBankProps,
	clientId,
	onClose,
	toggleBankDialogVisible,
},) => {
	const [step, setStep,] = React.useState<StepType>(1,)
	const {
		mutateAsync: createBank,
	} = useCreateBank()
	const {
		data: bankList,
	} = useGetBankList()
	const {
		mutateAsync: addBankItem,
		isPending: bankAddLoading,
	} = useCreateBankListItem()
	const {
		setCreatedBank,
	} = useCreatedBankStore()
	const handleCreateBank = async(name : string,): Promise<void> => {
		await addBankItem({
			name,
		},)
	}
	const bankListOptions = bankList?.map((type,) => {
		return {
			label: type.name,
			value: {
				name: type.name,
				id:   type.id,
			},
		}
	},) ?? []

	const handleSubmit = async(
		data: BankFormValues,
		form: FormApi<BankFormValues, Partial<BankFormValues>>,
	): Promise<void> => {
		const newBank = await createBank({
			...data,
			clientId,
			bankName:         data.bankName?.value.name ?? '',
			bankListId:       data.bankName?.value.id ?? '',
			country:          data.country?.value ?? '',
			portfolioDraftId: createBankProps.portfolioDraftId,
			portfolioId:      createBankProps.portfolioId,
			entityId:         createBankProps.entityId,
		},)
		setCreatedBank(newBank,)
		onClose()
		form.reset()
		if (toggleBankDialogVisible) {
			toggleBankDialogVisible()
		}
	}
	return (
		<Form<BankFormValues>
			onSubmit={handleSubmit}
			validate={validateAddBankForm}
			render={({
				handleSubmit,
				submitting,
				errors,
				values,
			},) => {
				const firstStepDisabled = Boolean(errors?.['bankName.value'],)
				const secondStepDisabled = Boolean(errors?.['country.value'] || errors?.['branchName'],)
				const thirdStepDisabled = Boolean(errors?.['email'] || errors?.['firstName'] || errors?.['lastName'],)

				return (
					<form className={styles.container} onSubmit={handleSubmit}>
						<h3 className={styles.header}>Add bank</h3>
						<LabeledProgressBar currentStep={step} steps={getBankFormSteps(values,)}/>
						<div className={cx(styles.addFormWrapper, step !== 1 && 'hidden-el',)}>
							<div className={styles.addInputBlock}>
								<SelectField<SelectOptionType>
									name='bankName'
									placeholder='Select or add new bank'
									options={bankListOptions}
									isCreateble
									isSearchable
									createbleStatus={CreatebleSelectEnum.BANK}
									createFn={handleCreateBank}
									isLoading={bankAddLoading}
								/>
							</div>
							<div className={styles.addBtnWrapper}>
								<NextButton
									disabled={firstStepDisabled}
									handleNext={() => {
										setStep(2,)
									}}
								/>
							</div>
						</div>
						<div className={cx(styles.addFormWrapper, step !== 2 && 'hidden-el',)}>
							<div className={styles.addInputBlock}>
								<div>
									<p className={styles.fieldTitle}>Location</p>
									<SelectField
										name='country'
										placeholder='Select country'
										isSearchable
										isMulti={false}
										options={countriesOptions}
										leftIcon={<Flag width={18} height={18} />}
									/>
								</div>
								<div>
									<p className={styles.fieldTitle}>Branch name</p>
									<FormField
										name='branchName'
										placeholder='Enter branch name'
									/>
								</div>
							</div>
							<div className={styles.addBtnWrapper}>
								<PrevButton
									handlePrev={() => {
										setStep(1,)
									}}
								/>
								<NextButton
									disabled={secondStepDisabled}
									handleNext={() => {
										setStep(3,)
									}}
								/>
							</div>
						</div>
						<div className={cx(styles.addFormWrapper, step !== 3 && 'hidden-el',)}>
							<div className={styles.addInputBlock}>
								<FormField
									name='firstName'
									placeholder='First name'
								/>
								<FormField
									name='lastName'
									placeholder='Last name'
								/>
								<FormField
									name='email'
									placeholder='Email'
									validate={values.email?.trim() ?
										email :
										undefined}
								/>
							</div>
							<div className={styles.addBtnWrapper}>
								<PrevButton
									handlePrev={() => {
										setStep(2,)
									}}
								/>
								<Button<ButtonType.TEXT>
									type='submit'
									disabled={Boolean(submitting || thirdStepDisabled,)}
									additionalProps={{
										btnType: ButtonType.TEXT,
										text:    'Add bank',
										size:    Size.MEDIUM,
									}}
								/>
							</div>
						</div>
					</form>
				)
			}
			}
		/>
	)
}