/* eslint-disable max-lines */
/* eslint-disable complexity */
import React from 'react'
import {
	Form,
} from 'react-final-form'
import type {
	TransactionFormValues,
} from '../transaction.types'
import {
	validateTransactionTypeForm,
} from '../transaction.validator'
import type {
	IOptionType,
} from '../../../../shared/types'
import {
	useTransactionTypeById,
	useTransactionCategoryList,
	useCreateTransactionCategory,
	useUpdateTransactionType,
} from '../../../../shared/hooks/settings/transaction-settings.hook'
import {
	FormCollapse,
	FormField,
	SelectField,
	FormRadio,
	ToggleSwitch,
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../shared/components'
import {
	CreatebleSelectEnum,
} from '../../../../shared/constants'
import {
	CashFlow, PlType,
} from '../transaction.types'
import {
	TransactionCashFlow, AssetNamesType,
} from '../../../../shared/types'
import {
	Refresh,
} from '../../../../assets/icons'
import {
	isDeepEqual,
} from '../../../../shared/utils'
import {
	useUserStore,
} from '../../../../store/user.store'
import {
	Roles,
} from '../../../../shared/types'
import * as styles from './edit-transaction.style'

type Props = {
	onClose: () => void
	transactionTypeId: string | undefined
}

export const EditTransactionType: React.FC<Props> = ({
	onClose,
	transactionTypeId,
},) => {
	const {
		data: categoryList,
	} = useTransactionCategoryList()
	const {
		data: transactionInitial,
		isFetching: isTransactionInitialFetching,
	} = useTransactionTypeById(transactionTypeId ?? '',)
	const {
		mutateAsync: createCategory,
	} = useCreateTransactionCategory()
	const {
		mutateAsync: updateTransactionType, isPending: isUpdating,
	} = useUpdateTransactionType()
	const {
		userInfo,
	} = useUserStore()

	const [firstStepOpen, setFirstStepOpen,] = React.useState(false,)
	const [secondStepOpen, setSecondStepOpen,] = React.useState(false,)
	const [thirdStepOpen, setThirdStepOpen,] = React.useState(false,)
	const [fourthStepOpen, setFourthStepOpen,] = React.useState(false,)
	const [isAnnualTotalsOn, setIsAnnualTotalsOn,] = React.useState(false,)
	const [hasFomPermission, setHasFomPermission,] = React.useState<boolean>(false,)

	React.useEffect(() => {
		const permission = userInfo.roles.some((role,) => {
			return [Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		setHasFomPermission(permission,)
	}, [userInfo,],)

	const [transactionForm, setTransactionForm,] = React.useState<TransactionFormValues>({
		name:         undefined,
		cashFlow:     undefined,
		pl:           undefined,
		categoryType: undefined,
		comment:      undefined,
		annualAssets: undefined,
		isNewVersion: 'true',
	},)

	const categoryOptions = React.useMemo<Array<IOptionType<string>>>(() => {
		return (categoryList ?? []).map((o,) => {
			return {
				label: o.label, value: o.value,
			}
		},)
	}, [categoryList,],)

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

	const baselineInitial = React.useMemo<TransactionFormValues>(() => {
		if (!transactionInitial) {
			return transactionForm
		}

		let categoryType: IOptionType<string> | undefined
		if (transactionInitial.versions[0]?.categoryType) {
			categoryType = {
				value: transactionInitial.versions[0].categoryType.id!,
				label: transactionInitial.versions[0]?.categoryType.name ?? '',
			}
		} else if (transactionInitial.versions[0]?.categoryId) {
			categoryType = categoryOptions.find((o,) => {
				return o.value === transactionInitial.versions[0]?.categoryId
			},)
		}

		const annualAssets: Array<string> | undefined = Array.isArray(transactionInitial.versions[0]?.annualAssets,) ?
			transactionInitial.versions[0]?.annualAssets.filter(
				(v: unknown,): v is string => {
					return typeof v === 'string' && v.length > 0
				},
			) :
			undefined

		return {
			name:         transactionInitial.versions[0]?.name ?? undefined,
			cashFlow:     transactionInitial.versions[0]?.cashFlow ?? undefined,
			pl:           transactionInitial.versions[0]?.pl ?? undefined,
			categoryType,
			comment:      transactionInitial.versions[0]?.comment ?? undefined,
			annualAssets,
			isNewVersion: transactionForm.isNewVersion ?? 'true',
		}
	}, [transactionInitial, categoryOptions,],)

	React.useEffect(() => {
		if (!transactionInitial) {
			return
		}
		if (transactionForm.name !== undefined) {
			return
		}
		setTransactionForm(baselineInitial,)
	}, [transactionInitial, baselineInitial, transactionForm.name,],)

	React.useEffect(() => {
		const hasAnnual = Array.isArray(transactionForm.annualAssets,) ?
			transactionForm.annualAssets.filter((v,): v is string => {
				return typeof v === 'string' && v.length > 0
			},).length > 0 :
			false
		setIsAnnualTotalsOn(hasAnnual,)
	}, [transactionForm.annualAssets,],)

	const renderCashFlow = (cf?: string,): string => {
		if (cf === TransactionCashFlow.INFLOW) {
			return 'Cash In'
		}
		if (cf === TransactionCashFlow.OUTFLOW) {
			return 'Cash Out'
		}
		return 'N/A'
	}
	const renderPl = (pl?: string | null,): string => {
		if (pl === 'P') {
			return 'Profit'
		}
		if (pl === 'L') {
			return 'Loss'
		}
		return 'Neutral'
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

	const handleSubmit = async(): Promise<void> => {
		if (!transactionTypeId) {
			return
		}

		const annualAssets = Array.isArray(transactionForm.annualAssets,) ?
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
			userName:     userInfo.name,
			userRole:     userInfo.roles[0] ?? '',
			isNewVersion: String(transactionForm.isNewVersion,) === 'true',
		}
		await updateTransactionType({
			id:   transactionTypeId,
			body,
		},)
		setTransactionForm({
			name:         undefined,
			cashFlow:     undefined,
			pl:           undefined,
			categoryType: undefined,
			comment:      undefined,
			annualAssets: undefined,
			isNewVersion: 'true',
		},)
		onClose()
	}

	const formChanged = !isDeepEqual<TransactionFormValues>(transactionForm, baselineInitial,)
	const isPending = isTransactionInitialFetching || isUpdating

	return (
		<Form<TransactionFormValues>
			onSubmit={handleSubmit}
			validate={validateTransactionTypeForm}
			initialValues={transactionForm}
			render={({
				handleSubmit,
				form,
			},) => {
				return (
					<form className={styles.formContainer} onSubmit={handleSubmit}>
						<h3 className={styles.formHeader}>Edit transaction settings</h3>
						<div className={styles.fieldsContainer(firstStepOpen || secondStepOpen || thirdStepOpen,)}>
							<div className={styles.editFormWrapper}>
								<FormCollapse
									title='Basic information'
									info={[`${transactionForm.name ?? '—'}, ${transactionForm.categoryType?.label ?? '—'}`,]}
									isOpen={firstStepOpen}
									onClose={setFirstStepOpen}
								>
									<div className={styles.fieldBlock}>
										<p className={styles.fieldTitle}>Transaction name</p>
										<FormField
											name='name'
											placeholder='Enter name'
											onChange={(e,) => {
												const v = e.target.value
												setTransactionForm((prev,) => {
													return {
														...prev, name: v,
													}
												},)
											}}
											value={transactionForm.name ?? ''}
										/>
									</div>

									<div className={styles.fieldBlock}>
										<p className={styles.fieldTitle}>Transaction category</p>
										<SelectField<string>
											key={formChanged.toString()}
											name='categoryType'
											placeholder='Select or add new category'
											isDisabled={!categoryList}
											options={categoryOptions}
											isSearchable
											onChange={(select,) => {
												if (select && !Array.isArray(select,)) {
													setTransactionForm((prev,) => {
														return {
															...prev,
															categoryType: select as IOptionType<string>,
														}
													},)
												}
											}}
											value={transactionForm.categoryType}
											isCreateble
											createbleStatus={CreatebleSelectEnum.TRANSACTION_CATEGORY}
											createFn={handleCreateCategory}
										/>
									</div>
								</FormCollapse>

								<FormCollapse
									title='Financial details'
									info={[`${renderCashFlow(transactionForm.cashFlow,)}, ${renderPl(transactionForm.pl,)}`,]}
									isOpen={secondStepOpen}
									onClose={setSecondStepOpen}
								>
									<div className={styles.fieldBlock}>
										<p className={styles.fieldTitle}>Cashflow type</p>
										<div className={styles.radioBlock}>
											<FormRadio
												label='Cash In'
												value={CashFlow.INFLOW}
												name='cashFlow'
												checked={transactionForm.cashFlow === CashFlow.INFLOW}
												onChange={(e,) => {
													setTransactionForm((prev,) => {
														return {
															...prev,
															cashFlow: e.target.value as CashFlow,
														}
													},)
												}}
											/>
											<FormRadio
												label='Cash Out'
												value={CashFlow.OUTFLOW}
												name='cashFlow'
												checked={transactionForm.cashFlow === CashFlow.OUTFLOW}
												onChange={(e,) => {
													setTransactionForm((prev,) => {
														return {
															...prev,
															cashFlow: e.target.value as CashFlow,
														}
													},)
												}}
											/>
										</div>
									</div>

									<div className={styles.fieldBlock}>
										<p className={styles.fieldTitle}>P/L type</p>
										<div className={styles.radioBlock}>
											<FormRadio
												label='Profit'
												value={PlType.P}
												name='pl'
												checked={transactionForm.pl === PlType.P}
												onChange={(e,) => {
													setTransactionForm((prev,) => {
														return {
															...prev, pl: e.target.value as PlType,
														}
													},)
												}}
											/>
											<FormRadio
												label='Loss'
												value={PlType.L}
												name='pl'
												checked={transactionForm.pl === PlType.L}
												onChange={(e,) => {
													setTransactionForm((prev,) => {
														return {
															...prev, pl: e.target.value as PlType,
														}
													},)
												}}
											/>
											<FormRadio
												label='Neutral'
												value={PlType.N}
												name='pl'
												checked={transactionForm.pl === PlType.N}
												onChange={(e,) => {
													setTransactionForm((prev,) => {
														return {
															...prev, pl: e.target.value as PlType,
														}
													},)
												}}
											/>
										</div>
									</div>
								</FormCollapse>

								<FormCollapse
									title='Reporting'
									info={['Annual totals per assets, comment',]}
									isOpen={thirdStepOpen}
									onClose={setThirdStepOpen}
								>
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
										<div className={styles.fieldBlock}>
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
													setTransactionForm((prev,) => {
														return {
															...prev,
															annualAssets: selected.map((o,) => {
																return o.value
															},),
														}
													},)
												}}
											/>
										</div>
									)}

									<div className={styles.fieldBlock}>
										<p className={styles.fieldTitle}>Comment (optional)</p>
										<FormField
											name='comment'
											placeholder='Enter comment'
											onChange={(e,) => {
												const v = e.target.value
												setTransactionForm((prev,) => {
													return {
														...prev, comment: v.length ?
															v :
															undefined,
													}
												},)
											}}
											value={transactionForm.comment ?? ''}
										/>
									</div>
								</FormCollapse>

								<FormCollapse
									title='History'
									info={[`History choose`,]}
									isOpen={fourthStepOpen}
									onClose={setFourthStepOpen}
								>
									<div className={styles.historyBlock}>
										{hasFomPermission &&
											<FormRadio
												label='Update historical data of existing transactions within all portfolios'
												value={'false'}
												name='isNewVersion'
												checked={transactionForm.isNewVersion === 'false'}
												onChange={(e,) => {
													setTransactionForm((prev,) => {
														return {
															...prev,
															isNewVersion: e.target.value,
														}
													},)
												}}
											/>
										}
										<FormRadio
											label='Apply transaction only for future use, without impacting on history and keep historical transaction data without changes'
											value={'true'}
											name='isNewVersion'
											checked={transactionForm.isNewVersion === 'true'}
											onChange={(e,) => {
												setTransactionForm((prev,) => {
													return {
														...prev,
														isNewVersion: e.target.value,
													}
												},)
											}}
										/>
									</div>

								</FormCollapse>

								<div className={styles.editBtnWrapper}>
									<Button<ButtonType.TEXT>
										onClick={() => {
											setTransactionForm(baselineInitial,)
											form.reset(baselineInitial,)
										}}
										disabled={!formChanged || isPending}
										additionalProps={{
											btnType:  ButtonType.TEXT,
											text:     'Clear',
											size:     Size.MEDIUM,
											color:    Color.SECONDRAY_GRAY,
											leftIcon: <Refresh width={20} height={20} />,
										}}
									/>
									<Button<ButtonType.TEXT>
										type='submit'
										disabled={Boolean(!formChanged || isPending,)}
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
			}}
		/>
	)
}
