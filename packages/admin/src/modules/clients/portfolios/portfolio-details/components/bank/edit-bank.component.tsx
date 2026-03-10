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
	SelectField,
	ButtonType,
	Button,
	Size,
	FormCollapse,
	Color,
} from '../../../../../../shared/components'
import {
	Flag,
	FolderOpenIcon,
	Refresh,
} from '../../../../../../assets/icons'

import {
	useEditBank,
} from '../../../../../../shared/hooks'
import {
	useCreateBankListItem,
	useGetBankList,
} from '../../../../../../shared/hooks/list-hub'
import type {
	BankFormValues,
} from './add-bank.types'
import type {
	IOptionType,
	SelectValueType,
	IBank,
	SelectOptionType,
} from '../../../../../../shared/types'
import {
	validateAddBankForm,
} from './add-bank.validator'
import {
	email,
} from '../../../../../../shared/utils/validators'
import {
	CreatebleSelectEnum,
	filteredCountries,
} from '../../../../../../shared/constants'
import {
	isDeepEqual,
} from '../../../../../../shared/utils'

import * as styles from './bank.styles'

const countriesOptions = filteredCountries.map((name,) => {
	return {
		value: name,
		label: name,
	}
},)

type Props = {
	onClose: () => void
	bankModalData: IBank
	portfolioName: string
	entityName: string
}

export const EditBank: React.FC<Props> = ({
	onClose,
	bankModalData,
	portfolioName,
	entityName,
},) => {
	const {
		mutateAsync: editBank,
	} = useEditBank()
	const {
		data: bankList,
	} = useGetBankList()
	const {
		mutateAsync: addBankItem,
		isPending: bankAddLoading,
	} = useCreateBankListItem()
	const [firstStepOpen, setFirstStepOpen,] = React.useState<boolean>(false,)
	const [secondStepOpen, setSecondStepOpen,] = React.useState<boolean>(false,)
	const [thirdStepOpen, setThirdStepOpen,] = React.useState<boolean>(false,)

	const handleCreateBank = async(name : string,): Promise<void> => {
		await addBankItem({
			name,
		},)
	}

	const initialValues: BankFormValues = {
		branchName: bankModalData.branchName,
		email:                   bankModalData.email ?? '',
		firstName:               bankModalData.firstName ?? '',
		lastName:                bankModalData.lastName ?? '',
		bankName:   {
			label: bankModalData.bankName,
			value: {
				name: bankModalData.bankName,
				id:   bankModalData.bankListId ?? '',
			},
		},
		country:                 {
			label: bankModalData.country,
			value: bankModalData.country,
		},
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

	const [formState, setFormState,] = React.useState<BankFormValues>(initialValues,)

	const handleSubmit = async(values: BankFormValues, form: FormApi<BankFormValues, Partial<BankFormValues>>,): Promise<void> => {
		const updatedBankData = {
			...values,
			country:    values.country?.value ?? '',
			bankName:   values.bankName?.value.name ?? '',
			bankListId: values.bankName?.value.id ?? '',
			id:         bankModalData.id ,
		}

		if (updatedBankData.firstName === '') {
			delete updatedBankData.firstName
		}
		if (updatedBankData.lastName === '') {
			delete updatedBankData.lastName
		}
		if (updatedBankData.email === '') {
			delete updatedBankData.email
		}
		await editBank(updatedBankData,)

		onClose()
		form.reset()
	}

	const isFormPristine = isDeepEqual<BankFormValues>(formState, initialValues,)

	return (
		<Form<BankFormValues>
			onSubmit={handleSubmit}
			validate={validateAddBankForm}
			initialValues={formState}
			render={({
				handleSubmit,
				submitting,
				hasValidationErrors,
				values,
				form,
			},) => {
				const clearBtnDisabled = Object.values(values,).every((field,) => {
					return !Boolean(field,)
				},)
				return (
					<form className={styles.container} onSubmit={handleSubmit}>
						<h3 className={styles.header}>Edit bank</h3>
						<div className={styles.fieldsContainer}>
							<div className={styles.editFormWrapper}>
								<div className={styles.title}>
									<FolderOpenIcon width={16} height={16}/>
									<p className={styles.bankName}>{portfolioName}</p>
									<p>/</p>
									<p className={styles.bankName}>{entityName}</p>
									{values.bankName && (
										<>
											<p>/</p>
											<p className={styles.bankName}>{values.bankName.value.name}</p>
										</>
									)}
								</div>
								<FormCollapse
									title='Bank name'
									info={[values.bankName?.value.name,]}
									isOpen={firstStepOpen}
									onClose={setFirstStepOpen}
								>
									<SelectField<SelectOptionType>
										name='bankName'
										placeholder='Select or add new bank'
										options={bankListOptions}
										isSearchable
										isCreateble
										createbleStatus={CreatebleSelectEnum.BANK}
										value={formState.bankName}
										onChange={(e: SelectValueType<SelectOptionType>,) => {
											if (e && !Array.isArray(e,)) {
												setFormState({
													...values,
													bankName: {
														value: {
															name: (e as IOptionType<SelectOptionType>).value.name,
															id:   (e as IOptionType<SelectOptionType>).value.id,
														},
														label: (e as IOptionType<SelectOptionType>).label,
													} ,
												},)
											}
										}}
										createFn={handleCreateBank}
										isLoading={bankAddLoading}
									/>
								</FormCollapse>
								<FormCollapse
									title='Bank details'
									info={[values.country?.value, values.branchName,]}
									isOpen={secondStepOpen}
									onClose={setSecondStepOpen}
								>
									<div>
										<p className={styles.fieldTitle}>Location</p>
										<SelectField
											name='country'
											placeholder='Select country'
											options={countriesOptions}
											leftIcon={<Flag width={18} height={18} />}
											isSearchable
											value={formState.country}
											onChange={(e: SelectValueType,) => {
												if (e && !Array.isArray(e,)) {
													setFormState({
														...values, country: {
															value: (e as IOptionType<string>).value,
															label: (e as IOptionType<string>).label,
														},
													},)
												}
											}}
										/>
									</div>
									<div>
										<p className={styles.fieldTitle}>Branch name</p>
										<FormField
											name='branchName'
											placeholder='Enter branch name'
											value={formState.branchName}
											onChange={(e,) => {
												setFormState({
													...values, branchName: e.target.value,
												},)
											}}
										/>
									</div>
								</FormCollapse>
								<FormCollapse
									title='Contact person'
									info={[`${values.firstName ?? ''} ${values.lastName ?? ''}`, values.email ?? '',]}
									isOpen={thirdStepOpen}
									onClose={setThirdStepOpen}
								>
									<FormField
										name='firstName'
										placeholder='First name'
										value={formState.firstName ?? ''}
										onChange={(e,) => {
											setFormState({
												...values, firstName: e.target.value || null,
											},)
										}}
									/>
									<FormField
										name='lastName'
										placeholder='Last name'
										value={formState.lastName ?? ''}
										onChange={(e,) => {
											setFormState({
												...values, lastName: e.target.value || null,
											},)
										}}
									/>
									<FormField
										name='email'
										placeholder='Email'
										value={formState.email ?? ''}
										onChange={(e,) => {
											setFormState({
												...values, email: e.target.value || null,
											},)
										}}
										validate={values.email?.trim() ?
											email :
											undefined}
									/>
								</FormCollapse>
								<div className={styles.editBtnWrapper}>
									<Button<ButtonType.TEXT>
										onClick={() => {
											setFormState(initialValues,)
											Object.keys(values,).forEach((key,) => {
												form.resetFieldState(key as keyof BankFormValues,)
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