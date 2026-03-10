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
	ButtonType,
	Button,
	Size,
	LabeledProgressBar,
	PrevButton,
	NextButton,
} from '../../../../../../shared/components'
import {
	CustomDatePickerField,
} from '../../../../../../shared/components/datepicker-mui/datepicker.component'

import {
	useCreateAccount,
} from '../../../../../../shared/hooks'
import type {
	StepType,
	AccountFormValues,
	CreateAccountProps,
} from './add-account.types'
import {
	validateAddAccountForm,
} from './add-account.validator'
import {
	getAccountFormSteps,
} from './add-account.utils'
import {
	validateIBAN,
} from '../../../portfolio/components/drawer-content/components/form-account'
import {
	useCreatedAccountStore,
} from './add-account.store'
import * as styles from './account.styles'

type Props = {
	createAccountProps: CreateAccountProps
	toggleAccountDialogVisible?: () => void
	onClose: () => void
}

export const AddAccount: React.FC<Props> = ({
	createAccountProps,
	toggleAccountDialogVisible,
	onClose,
},) => {
	const [step, setStep,] = React.useState<StepType>(1,)
	const {
		mutateAsync: createAccount,
	} = useCreateAccount()

	const {
		setCreatedAccount,
	} = useCreatedAccountStore()

	const handleSubmit = async(
		data: AccountFormValues,
		form: FormApi<AccountFormValues, Partial<AccountFormValues>>,
	): Promise<void> => {
		const utcISOString = data.dataCreated && new Date(Date.UTC(
			data.dataCreated.getFullYear(),
			data.dataCreated.getMonth(),
			data.dataCreated.getDate(),
			0, 0, 0, 0,
		),).toISOString()

		const newAccount = await createAccount({
			...data,
			dataCreated:      utcISOString,
			portfolioDraftId: createAccountProps.portfolioDraftId,
			portfolioId:      createAccountProps.portfolioId,
			entityId:         createAccountProps.entityId,
			bankId:           createAccountProps.bankId,
		},)
		setCreatedAccount(newAccount,)
		onClose()
		form.reset()
		if (toggleAccountDialogVisible) {
			toggleAccountDialogVisible()
		}
	}
	return (
		<Form<AccountFormValues>
			onSubmit={handleSubmit}
			validate={validateAddAccountForm}
			render={({
				handleSubmit,
				submitting,
				errors,
				values,
			},) => {
				const firstStepDisabled = Boolean(errors?.['accountName'],)
				const secondStepDisabled = Boolean(errors?.['managementFee'] ||
					errors?.['holdFee'] ||
					errors?.['sellFee'] ||
					errors?.['buyFee'],
				)

				return (
					<form className={styles.container} onSubmit={handleSubmit}>
						<h3 className={styles.header}>Add bank account</h3>
						<LabeledProgressBar currentStep={step} steps={getAccountFormSteps(values,)}/>
						<div className={styles.addFormWrapper}>
							<div className={cx(step !== 1 && 'hidden-el',)}>
								<div className={styles.addInputBlock}>
									<FormField
										name='accountName'
										placeholder='Enter account name'
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
							<div className={cx(step !== 2 && 'hidden-el',)}>
								<div className={styles.addInputBlock}>
									<div>
										<p className={styles.fieldTitle}>Portfolio Management fee %</p>
										<FormField
											name='managementFee'
											placeholder='Enter percentage'
										/>
									</div>
									<div>
										<p className={styles.fieldTitle}>Account Hold fee %</p>
										<FormField
											name='holdFee'
											placeholder='Enter percentage'
										/>
									</div>
									<div>
										<p className={styles.fieldTitle}>Sell fee %</p>
										<FormField
											name='sellFee'
											placeholder='Enter percentage'
										/>
									</div>
									<div>
										<p className={styles.fieldTitle}>Buy fee %</p>
										<FormField
											name='buyFee'
											placeholder='Enter percentage'
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
							<div className={cx(step !== 3 && 'hidden-el',)}>
								<div className={styles.addInputBlock}>
									<div>
										<p className={styles.fieldTitle}>Description (optional)</p>
										<FormField
											name='description'
											placeholder='Enter account description'
										/>
									</div>
									<div>
										<p className={styles.fieldTitle}>Date created (optional)</p>
										<CustomDatePickerField name='dataCreated'/>
									</div>
									<div>
										<p className={styles.fieldTitle}>IBAN (optional)</p>
										<FormField
											validate={validateIBAN}
											name='iban'
											placeholder='IBAN'
										/>
									</div>
									<div>
										<p className={styles.fieldTitle}>Account number (optional)</p>
										<FormField
											name='accountNumber'
											placeholder='Enter account number'
										/>
									</div>
									<div>
										<p className={styles.fieldTitle}>Comment (optional)</p>
										<FormField
											name='comment'
											placeholder='Enter comment'
										/>
									</div>
								</div>
								<div className={styles.addBtnWrapper}>
									<PrevButton
										handlePrev={() => {
											setStep(2,)
										}}
									/>
									<Button<ButtonType.TEXT>
										type='submit'
										disabled={Boolean(submitting,)}
										additionalProps={{
											btnType: ButtonType.TEXT,
											text:    'Add bank account',
											size:    Size.MEDIUM,
										}}
									/>
								</div>
							</div>
						</div>
					</form>
				)
			}
			}
		/>
	)
}