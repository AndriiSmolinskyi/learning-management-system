/* eslint-disable no-nested-ternary */
/* eslint-disable max-lines */
/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	Dialog, FormField, SelectField, FormRadio, ToggleSwitch, Button, ButtonType, Size,
} from '../../../../shared/components'
import {
	ExitTransactionTypeUnsavedDialog,
} from './exit-unsaved-dialog.component'
import {
	LabeledProgressBar,
} from '../../../../shared/components'
import type {
	TransactionFormValues, StepType,
} from '../transaction.types'
import {
	Form,
} from 'react-final-form'
import {
	validateTransactionTypeForm,
} from '../transaction.validator'
import {
	getTransactionTypeFormSteps,
} from '../transaction.utils'
import {
	SaveDraftButton,
} from '../../../../modules/operations/requests/components/save-draft-btn.component'
import {
	NextButton,
} from '../../../../shared/components'
import {
	useTransactionCategoryList,
	useCreateTransactionCategory,
	useCreateTransactionType,
	useUpdateTransactionTypeDraft,
	useTransactionTypeDraftById,
} from '../../../../shared/hooks/settings/transaction-settings.hook'
import type {
	IOptionType,
} from '../../../../shared/types'
import {
	CreatebleSelectEnum,
} from '../../../../shared/constants'
import {
	CashFlow, PlType,
} from '../transaction.types'
import {
	PrevButton,
} from '../../../../shared/components'
import {
	AssetNamesType,
} from '../../../../shared/types'
import {
	useCreateTransactionTypeDraft,
} from '../../../../shared/hooks/settings/transaction-settings.hook'
import type {
	TransactionCashFlow,
} from '../../../../shared/types'
import {
	useUserStore,
} from '../../../../store/user.store'
import {
	Roles,
} from '../../../../shared/types'
import * as styles from './add-transaction.style'

type Props = {
	onClose: (id?: number) => void
	toggleSuccessDialogVisible: () => void
	toggleExitDialogVisible: () => void
	handleSetTransactionId: (id: string) => void
	handleCloseSaveExit: () => void
	setDraftId?: React.Dispatch<React.SetStateAction<string | undefined>>
	handleSetTransactionTypeId?: (id: string) => void
	isExitDialogOpen: boolean
	draftId?: string
	isRelationsOpen?: boolean
}

export const AddTransactionType: React.FC<Props> = ({
	onClose,
	toggleSuccessDialogVisible,
	toggleExitDialogVisible,
	setDraftId,
	handleSetTransactionId,
	handleCloseSaveExit,
	handleSetTransactionTypeId,
	isExitDialogOpen,
	draftId,
	isRelationsOpen,
},) => {
	const {
		data: categoryList,
	} = useTransactionCategoryList()
	const {
		mutateAsync: createCategory,
	} = useCreateTransactionCategory()
	const {
		mutateAsync: createTransactionTypeDraft,
	} = useCreateTransactionTypeDraft()
	const {
		mutateAsync: updateTransactionTypeDraft,
	} = useUpdateTransactionTypeDraft()
	const {
		mutateAsync: createTransactionType,
	} = useCreateTransactionType()
	const {
		data: draft,
	} = useTransactionTypeDraftById(draftId ?? '',)
	const {
		userInfo,
	} = useUserStore()
	const [transactionForm, setTransactionForm,] = React.useState<TransactionFormValues>({
		name:         undefined,
		cashFlow:     undefined,
		pl:           undefined,
		categoryType: undefined,
		comment:      undefined,
		annualAssets: undefined,
	},)
	const [step, setStep,] = React.useState<StepType>(1,)
	const [isAnnualTotalsOn, setIsAnnualTotalsOn,] = React.useState<boolean>(false,)
	const [hasFomPermission, setHasFomPermission,] = React.useState<boolean>(false,)

	React.useEffect(() => {
		const permission = userInfo.roles.some((role,) => {
			return [Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		setHasFomPermission(permission,)
	}, [userInfo,],)

	React.useEffect(() => {
		const hasAnnual = Array.isArray(transactionForm.annualAssets,) ?
			transactionForm.annualAssets.filter((v,): v is string => {
				return typeof v === 'string' && v.length > 0
			},).length > 0 :
			false
		setIsAnnualTotalsOn(hasAnnual,)
	}, [transactionForm.annualAssets,],)

	React.useEffect(() => {
		if (draftId && draft) {
			const annualAssets: Array<string> | undefined = Array.isArray(draft.annualAssets,) ?
				draft.annualAssets.filter(
					(v: unknown,): v is string => {
						return typeof v === 'string' && v.length > 0
					},
				) :
				undefined
			setTransactionForm({
				name:         draft.name,
				cashFlow:     draft.cashFlow,
				pl:           draft.pl ?? '',
				categoryType: draft.categoryType ?
					{
						value: draft.categoryType.id!,
						label: draft.categoryType.name ?? '',
					} :
					(
						draft.categoryId ?
							categoryOptions.find((o,) => {
								return o.value === draft.categoryId
							},) :
							undefined
					),
				comment:      draft.comment,
				annualAssets,
			},)
		}
	}, [draftId, draft,],)

	const categoryOptions = React.useMemo<Array<IOptionType<string>>>(() => {
		return (categoryList ?? []).map((o,) => {
			return {
				label: o.label,
				value: o.value,
			}
		},)
	}, [categoryList,],)

	const handleCloseCleared = (): void => {
		setTransactionForm({
			name:         undefined,
			cashFlow:     undefined,
			pl:           undefined,
			categoryType: undefined,
			comment:      undefined,
			annualAssets: undefined,
		},)
		onClose()
		if (setDraftId) {
			setDraftId(undefined,)
		}
	}

	const handleSubmit = async(): Promise<void> => {
		const annualAssets =
		Array.isArray(transactionForm.annualAssets,) ?
			transactionForm.annualAssets.filter((v,): v is string => {
				return typeof v === 'string' && v.length > 0
			},) :
			undefined
		const body = {
			name:         transactionForm.name,
			categoryId:   transactionForm.categoryType?.value,
			cashFlow:     transactionForm.cashFlow as TransactionCashFlow,
			pl:           transactionForm.pl ?? '',
			annualAssets,
			comment:    transactionForm.comment ?? undefined,
			draftId,
			userName:   userInfo.name,
			userRole:   userInfo.roles[0] ?? '',
		}
		const result = await createTransactionType(body,)
		if (result.id && !isRelationsOpen) {
			handleSetTransactionId(result.id,)
		}
		if (result.id && isRelationsOpen && handleSetTransactionTypeId) {
			handleSetTransactionTypeId(result.id,)
		}
		handleCloseCleared()
		toggleSuccessDialogVisible()
	}

	const handleCreateDraft = async(): Promise<void> => {
		const annualAssets =
		Array.isArray(transactionForm.annualAssets,) ?
			transactionForm.annualAssets.filter((v,): v is string => {
				return typeof v === 'string' && v.length > 0
			},) :
			undefined
		const body = {
			name:         transactionForm.name,
			categoryId:   transactionForm.categoryType?.value,
			cashFlow:     transactionForm.cashFlow as TransactionCashFlow,
			pl:           transactionForm.pl,
			annualAssets,
			comment:      transactionForm.comment ?? undefined,
		}
		await createTransactionTypeDraft(body,)
		toggleExitDialogVisible()
		handleCloseCleared()
		handleCloseSaveExit()
	}

	const handleUpdateDraft = async(): Promise<void> => {
		const annualAssets =
		Array.isArray(transactionForm.annualAssets,) ?
			transactionForm.annualAssets.filter((v,): v is string => {
				return typeof v === 'string' && v.length > 0
			},) :
			undefined
		const body = {
			name:         transactionForm.name,
			categoryId:   transactionForm.categoryType?.value,
			cashFlow:     transactionForm.cashFlow as TransactionCashFlow,
			pl:           transactionForm.pl,
			annualAssets,
			comment:      transactionForm.comment ?? undefined,
		}
		if (draftId) {
			await updateTransactionTypeDraft({
				id: draftId, body,
			},)
		}
		toggleExitDialogVisible()
		handleCloseCleared()
		handleCloseSaveExit()
	}

	const handleCreateCategory = async(category: string,): Promise<void> => {
		const categoryType = await createCategory(category,)
		if (categoryType.id && categoryType.name) {
			setTransactionForm({
				...transactionForm,
				categoryType: {
					value: categoryType.id, label: categoryType.name,
				},
			},)
		}
	}

	const ASSET_NAMES: ReadonlyArray<AssetNamesType> = [
		AssetNamesType.BONDS,
		AssetNamesType.CASH_DEPOSIT,
		AssetNamesType.CRYPTO,
		AssetNamesType.EQUITY_ASSET,
		AssetNamesType.OTHER,
		AssetNamesType.METALS,
		AssetNamesType.OPTIONS,
		AssetNamesType.PRIVATE_EQUITY,
		AssetNamesType.REAL_ESTATE,
		AssetNamesType.LOAN,
	] as const

	const assetOptions = React.useMemo<Array<IOptionType<string>>>(() => {
		return ASSET_NAMES.map((label,) => {
			return {
				label, value: label,
			}
		},)
	}, [],)

	return (
		<Form<TransactionFormValues>
			onSubmit={handleSubmit}
			validate={validateTransactionTypeForm}
			initialValues={transactionForm}
			render={({
				handleSubmit,
				submitting,
				errors,
				values,
				hasValidationErrors,
			},) => {
				const isFormEmpty = !transactionForm.name &&
					!transactionForm.cashFlow &&
					!transactionForm.pl &&
					!transactionForm.categoryType &&
					!transactionForm.comment &&
					(!transactionForm.annualAssets || transactionForm.annualAssets.length === 0)

				// todo: clear if good
				// const firstStepDisabled = Boolean(errors?.['name'] ||
				// 	errors?.['categoryType'],)
				const firstStepDisabled = !values.name?.trim() || !values.categoryType?.value

				const secondStepDisabled = Boolean(errors?.['cashFlow'] ||
					errors?.['pl'],)

				return (
					<form className={styles.formContainer} onSubmit={handleSubmit}>
						<h3 className={styles.formHeader}>Add transaction</h3>
						<LabeledProgressBar
							currentStep={step}
							steps={getTransactionTypeFormSteps(values,)}
						/>
						<div className={cx(styles.addFormWrapper,)}>
							<div className={cx(step !== 1 && 'hidden-el',)}>
								<div className={styles.addInputBlock}>
									<div className={styles.depositBlock}>
										<p className={styles.fieldTitle}>Transaction name</p>
										<FormField
											name='name'
											placeholder='Enter name'
											onChange={(e,) => {
												setTransactionForm({
													...values,
													name:    e.target.value,
												},)
											}}
											value={transactionForm.name}
										/>
									</div>
									<div className={styles.depositBlock}>
										<p className={styles.fieldTitle}>Transaction category</p>
										<SelectField
											key={JSON.stringify(values,)}
											name='categoryType'
											placeholder='Select or add new category'
											isDisabled={!categoryList}
											options={categoryOptions}
											isSearchable
											onChange={(select,) => {
												if (select && !Array.isArray(select,)) {
													setTransactionForm({
														...values,
														categoryType: select as IOptionType,
													},)
												}
											}}
											value={transactionForm.categoryType}
											{ ...(hasFomPermission ?
												{
													isCreateble:     true as const,
													createbleStatus: CreatebleSelectEnum.TRANSACTION_CATEGORY as const,
													createFn:        handleCreateCategory,
												} :
												{
												})
											}
										/>
									</div>
								</div>
								<div className={styles.addBtnWrapper}>
									<SaveDraftButton
										disabled={isFormEmpty}
										onSaveDraft={() => {
											if (draftId) {
												handleUpdateDraft()
											} else {
												handleCreateDraft()
											}
										}}
									/>
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
									<div className={styles.depositBlock}>
										<p className={styles.fieldTitle}>Cashflow type</p>
										<div className={styles.radioBlock}>
											<FormRadio
												label='Cash In'
												value={CashFlow.INFLOW}
												name='cashFlow'
												checked={transactionForm.cashFlow === CashFlow.INFLOW}
												onChange={(e,) => {
													setTransactionForm({
														...values,
														cashFlow: e.target.value as CashFlow,
													},)
												}}
											/>
											<FormRadio
												label='Cash Out'
												value={CashFlow.OUTFLOW}
												name='cashFlow'
												checked={transactionForm.cashFlow === CashFlow.OUTFLOW}
												onChange={(e,) => {
													setTransactionForm({
														...values,
														cashFlow: e.target.value as CashFlow,
													},)
												}}
											/>
										</div>
									</div>
									<div className={styles.depositBlock}>
										<p className={styles.fieldTitle}>P/L type</p>
										<div className={styles.radioBlock}>
											<FormRadio
												label='Profit'
												value={PlType.P}
												name='pl'
												checked={transactionForm.pl === PlType.P}
												onChange={(e,) => {
													setTransactionForm({
														...values,
														pl: e.target.value as PlType,
													},)
												}}
											/>
											<FormRadio
												label='Loss'
												value={PlType.L}
												name='pl'
												checked={transactionForm.pl === PlType.L}
												onChange={(e,) => {
													setTransactionForm({
														...values,
														pl: e.target.value as PlType,
													},)
												}}
											/>
											<FormRadio
												label='Neutral'
												value={PlType.N}
												name='pl'
												checked={transactionForm.pl === PlType.N}
												onChange={(e,) => {
													setTransactionForm({
														...values,
														pl: e.target.value as PlType,
													},)
												}}
											/>
										</div>
									</div>
								</div>
								<div className={styles.addBtnWrapper}>
									<SaveDraftButton
										disabled={isFormEmpty}
										onSaveDraft={() => {
											if (draftId) {
												handleUpdateDraft()
											} else {
												handleCreateDraft()
											}
										}}
									/>
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
									<div className={styles.annualBlock}>
										<div className={styles.annualBlockHeader}>
											<p className={styles.fieldTitle}>Annual totals per asset</p>
											<ToggleSwitch
												checked={isAnnualTotalsOn}
												onChange={(checked,) => {
													setIsAnnualTotalsOn(checked,)
												}}
											/>
										</div>

										{isAnnualTotalsOn && (
											<div className={styles.depositBlock}>
												<p className={styles.fieldTitle}>Assets</p>
												<SelectField<string>
													name='annualAssets'
													placeholder='Select assets'
													options={assetOptions}
													isSearchable
													isMulti
													value={(transactionForm.annualAssets ?? [])
														.filter((v,): v is string => {
															return typeof v === 'string' && v.length > 0
														},)
														.map((v,) => {
															return {
																label: v, value: v,
															}
														},)}
													onChange={(select,) => {
														const selected = Array.isArray(select,) ?
															(select as Array<IOptionType<string>>) :
															[]
														setTransactionForm({
															...values,
															annualAssets: selected.map((o,) => {
																return o.value
															},),
														},)
													}}
												/>
											</div>
										)}
									</div>
									<div className={styles.depositBlock}>
										<p className={styles.fieldTitle}>Comment (optional)</p>
										<FormField
											name='comment'
											placeholder='Enter comment'
											onChange={(e,) => {
												setTransactionForm({
													...values,
													comment:    e.target.value,
												},)
											}}
											value={transactionForm.comment ?? undefined}
										/>
									</div>
								</div>
								<div className={styles.addBtnWrapper}>
									<SaveDraftButton
										disabled={isFormEmpty}
										onSaveDraft={() => {
											if (draftId) {
												handleUpdateDraft()
											} else {
												handleCreateDraft()
											}
										}}
									/>
									<PrevButton
										handlePrev={() => {
											setStep(2,)
										}}
									/>
									<Button<ButtonType.TEXT>
										type='submit'
										disabled={Boolean(hasValidationErrors,)}
										additionalProps={{
											btnType: ButtonType.TEXT,
											text:    'Add transaction',
											size:    Size.MEDIUM,
										}}
									/>
								</div>
							</div>
						</div>
						<Dialog
							onClose={toggleExitDialogVisible}
							open={isExitDialogOpen}
							isCloseButtonShown
							backdropClassName={styles.exitDialogBackdrop}
						>
							<ExitTransactionTypeUnsavedDialog
								onExit={() => {
									toggleExitDialogVisible()
									handleCloseCleared()
								}}
								onSaveDraft={() => {
									if (draftId) {
										handleUpdateDraft()
									} else {
										handleCreateDraft()
									}
								}}
								disabled={isFormEmpty}
							/>
						</Dialog>
					</form>

				)
			}
			}
		/>
	)
}