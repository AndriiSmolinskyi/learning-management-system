/* eslint-disable complexity */
import React from 'react'
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
	FormCollapse,
	Color,
	CustomDatePickerField,
} from '../../../../../../shared/components'
import {
	FolderOpenIcon,
	Refresh,
} from '../../../../../../assets/icons'

import {
	useEditAccount,
} from '../../../../../../shared/hooks'
import type {
	AccountFormValues,
} from './add-account.types'
import {
	validateAddAccountForm,
} from './add-account.validator'
import type {
	IAccount,
} from '../../../../../../shared/types'
import {
	isDeepEqual,
} from '../../../../../../shared/utils'
import {
	validateIBAN,
} from '../../../portfolio/components/drawer-content/components/form-account'

import * as styles from './account.styles'

type Props = {
	onClose: () => void
	accountModalData: IAccount
	portfolioName: string
	entityName: string
	bankName: string
}

export const EditAccount: React.FC<Props> = ({
	onClose,
	accountModalData,
	portfolioName,
	entityName,
	bankName,
},) => {
	const {
		mutateAsync: editAccount,
	} = useEditAccount()

	const [firstStepOpen, setFirstStepOpen,] = React.useState<boolean>(false,)
	const [secondStepOpen, setSecondStepOpen,] = React.useState<boolean>(false,)
	const [thirdStepOpen, setThirdStepOpen,] = React.useState<boolean>(false,)

	const initialValues: AccountFormValues = {
		accountName:   accountModalData.accountName,
		managementFee: accountModalData.managementFee,
		holdFee:       accountModalData.holdFee,
		sellFee:       accountModalData.sellFee,
		buyFee:        accountModalData.buyFee,
		description:   accountModalData.description ?? '',
		iban:          accountModalData.iban ?? '',
		accountNumber: accountModalData.accountNumber ?? '',
		comment:       accountModalData.comment ?? '',
		dataCreated:   accountModalData.dataCreated ?
			new Date(accountModalData.dataCreated,) :
			null,
	}

	const [formState, setFormState,] = React.useState<AccountFormValues>(initialValues,)

	const handleSubmit = async(data: AccountFormValues, form: FormApi<AccountFormValues, Partial<AccountFormValues>>,): Promise<void> => {
		const utcISOString = data.dataCreated && new Date(Date.UTC(
			data.dataCreated.getFullYear(),
			data.dataCreated.getMonth(),
			data.dataCreated.getDate(),
			0, 0, 0, 0,
		),).toISOString()

		await editAccount({
			...data,
			dataCreated: utcISOString,
			id:          accountModalData.id ,
		},)
		onClose()
		form.reset()
	}

	return (
		<Form<AccountFormValues>
			onSubmit={handleSubmit}
			validate={validateAddAccountForm}
			initialValues={formState}
			render={({
				handleSubmit,
				submitting,
				hasValidationErrors,
				values,
				form,
			},) => {
				const isFormPristine = isDeepEqual<AccountFormValues>(values, initialValues,)
				const clearBtnDisabled = Object.values(values,).every((field,) => {
					return !Boolean(field,)
				},)
				const managementFeeInfo = values.managementFee.trim() ?
					`${values.managementFee}% (portfolio management), ` :
					''
				const holdFeeInfo = values.holdFee.trim() ?
					`${values.holdFee}% (account hold), ` :
					''
				const sellFeeInfo = values.sellFee.trim() ?
					`${values.sellFee}% (sell), ` :
					''
				const buyFeeInfo = values.buyFee.trim() ?
					`${values.buyFee}% (buy)` :
					''

				return (
					<form className={styles.container} onSubmit={handleSubmit}>
						<h3 className={styles.header}>Edit bank account</h3>
						<div className={styles.fieldsContainer}>
							<div className={styles.editFormWrapper}>
								<div className={styles.title}>
									<FolderOpenIcon width={16} height={16}/>
									<p className={styles.accountName}>{portfolioName}</p>
									<p>/</p>
									<p className={styles.accountName}>{entityName}</p>
									<p>/</p>
									<p className={styles.accountName}>{bankName}</p>
									{values.accountName && (
										<>
											<p>/</p>
											<p className={styles.accountName}>{values.accountName}</p>
										</>
									)}
								</div>
								<FormCollapse
									title='Account name'
									info={[values.accountName,]}
									isOpen={firstStepOpen}
									onClose={setFirstStepOpen}
								>
									<FormField
										name='accountName'
										placeholder='Enter account name'
										value={formState.accountName}
										onChange={(e,) => {
											setFormState({
												...values, accountName: e.target.value,
											},)
										}}
									/>
								</FormCollapse>
								<FormCollapse
									title='Bank fees'
									info={[`${managementFeeInfo}${holdFeeInfo}${sellFeeInfo}${buyFeeInfo}`,]}
									isOpen={secondStepOpen}
									onClose={setSecondStepOpen}
								>
									<div>
										<p className={styles.fieldTitle}>Portfolio Management fee %</p>
										<FormField
											name='managementFee'
											placeholder='Enter percentage'
											value={formState.managementFee}
											onChange={(e,) => {
												setFormState({
													...values, managementFee: e.target.value,
												},)
											}}
										/>
									</div>
									<div>
										<p className={styles.fieldTitle}>Account Hold fee %</p>
										<FormField
											name='holdFee'
											placeholder='Enter percentage'
											value={formState.holdFee}
											onChange={(e,) => {
												setFormState({
													...values, holdFee: e.target.value,
												},)
											}}
										/>
									</div>
									<div>
										<p className={styles.fieldTitle}>Sell fee %</p>
										<FormField
											name='sellFee'
											placeholder='Enter percentage'
											value={formState.sellFee}
											onChange={(e,) => {
												setFormState({
													...values, sellFee: e.target.value,
												},)
											}}
										/>
									</div>
									<div>
										<p className={styles.fieldTitle}>Buy fee %</p>
										<FormField
											name='buyFee'
											placeholder='Enter percentage'
											value={formState.buyFee}
											onChange={(e,) => {
												setFormState({
													...values, buyFee: e.target.value,
												},)
											}}
										/>
									</div>
								</FormCollapse>
								<FormCollapse
									title='Additional account details'
									info={[`${values.description ?? values.comment ?? ''}`,]}
									isOpen={thirdStepOpen}
									onClose={setThirdStepOpen}
								>
									<div>
										<p className={styles.fieldTitle}>Description</p>
										<FormField
											name='description'
											placeholder='Enter account description'
											value={formState.description ?? ''}
											onChange={(e,) => {
												setFormState({
													...values, description: e.target.value,
												},)
											}}
										/>
									</div>
									<div>
										<p className={styles.fieldTitle}>Date created</p>
										<CustomDatePickerField
											name='dataCreated'
											value={formState.dataCreated}
											onChange={(e,) => {
												setFormState({
													...values, dataCreated: e,
												},)
											}}
										/>
									</div>
									<div>
										<p className={styles.fieldTitle}>IBAN</p>
										<FormField
											name='iban'
											placeholder='IBAN'
											validate={validateIBAN}
											value={formState.iban ?? ''}
											onChange={(e,) => {
												setFormState({
													...values, iban: e.target.value,
												},)
											}}
										/>
									</div>
									<div>
										<p className={styles.fieldTitle}>Account number</p>
										<FormField
											name='accountNumber'
											placeholder='Enter account number'
											value={formState.accountNumber ?? ''}
											onChange={(e,) => {
												setFormState({
													...values, accountNumber: e.target.value,
												},)
											}}
										/>
									</div>
									<div>
										<p className={styles.fieldTitle}>Comment</p>
										<FormField
											name='comment'
											placeholder='Enter comment'
											value={formState.comment ?? ''}
											onChange={(e,) => {
												setFormState({
													...values, comment: e.target.value,
												},)
											}}
										/>
									</div>

								</FormCollapse>
								<div className={styles.editBtnWrapper}>
									<Button<ButtonType.TEXT>
										onClick={() => {
											setFormState(initialValues,)
											Object.keys(values,).forEach((key,) => {
												form.resetFieldState(key as keyof AccountFormValues,)
											},)
										}}
										disabled={clearBtnDisabled || isFormPristine}
										additionalProps={{
											btnType:  ButtonType.TEXT,
											text:     'Clear',
											size:     Size.MEDIUM,
											color:    Color.SECONDRAY_GRAY,
											leftIcon: <Refresh width={20} height={20} />,
										}}
									/>
									<Button<ButtonType.TEXT>
										disabled={Boolean(submitting || hasValidationErrors || isFormPristine,)}
										type='submit'
										additionalProps={{
											btnType: ButtonType.TEXT,
											text:    'Save edits',
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