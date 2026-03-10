/* eslint-disable max-lines */
/* eslint-disable max-depth */
/* eslint-disable complexity */
import * as React from 'react'
import {
	useClientGet,
} from '../../../../../clients/client-profiles/client-details/hooks'
import {
	ClientLists,
	CloseXIcon,
	PortfolioIcon,
} from '../../../../../../assets/icons'
import {
	progressButtonList,
	ProgressButton,
} from './components/progress-button'
import {
	BottomBlock,
} from './components/bottom-block/bottom-block.component'
import {
	TopBlock,
} from './components/top-block/top-block.component'
import {
	useAddPortfolioStore,
} from '../../store/step.store'
import {
	Form,
} from 'react-final-form'

import {
	validatePortfolio,
	FormPortfolio,
} from './components/form-portfolio'
import {
	FormEntity,
	validateEntity,
} from './components/form-entity'
import {
	useCreatePortfolioDraft,
	useCreateEntity,
	useCreateBank,
	useCreateAccount,
	useCreateAsset,
	useUpdateDraftToPortfolio,
} from '../../../../../../shared/hooks'
import {
	useCreateDocument,
} from '../../../../../../shared/hooks'
import {
	useDocumentStore,
} from '../../../../../../store/document.store'
import {
	FormBank,
	validateBank,
} from './components/form-bank'
import {
	FormAccount,
	validateAccount,
} from './components/form-account'
import {
	FormAsset,
} from './components/form-asset/form-asset.component'
import {
	validateAsset,
} from './components/form-asset/form-asset.validate'
import {
	toasterService,
} from '../../../../../../services/toaster'
import {
	FetchErrorMessages,
} from '../../../../../../shared/constants/messages.constants'
import {
	Button, ButtonType, Color, Size,
} from '../../../../../../shared/components'
import {
	transformValuesForPayload,
} from '../../utils/transform-payload.util'
import {
	formatToUTCISOString,
} from '../../../../../../shared/utils'
import {
	DocumentTypes,
} from '../../../../../../shared/types'

import type {
	IPortfolioFormValues,
	IPortfolioValidateValues,
} from './components/form-portfolio/form-portfolio.types'
import type {
	IBankValidateValues,
	IBankFormValues,
} from './components/form-bank'
import type {
	IAccountFormValues,
	IAccountValidateValues,
} from './components/form-account'
import type {
	IAssetValidateValues, IAssetFormValues,
} from './components/form-asset/form-asset.types'
import type {
	IPortfolio,
} from '../../../../../../shared/types'
import type {
	FormApi,
} from 'final-form'
import type {
	IEntityFormValues,
	IEntityValidateValues,
} from './components/form-entity/form-entity.types'
import {
	queryKeys,
} from '../../../../../../shared/constants'
import {
	queryClient,
} from '../../../../../../providers/query.provider'

import * as styles from './drawer-content.styles'

interface IDrawerContentProps {
   clientId: string
   onClose: () => void
	handleCloseDialogIsOpen: () => void
	toggleSuccessModalIsOpen?: () => void
	onSaveAsSraftClick?: () => void
	draftStep?: number
	portfolioDraft?: IPortfolio
	mainPortfolioId?: string
	mainPortfolioName?: string
}
export type FormStepTypes = {
	1: IPortfolioFormValues;
	2: IEntityFormValues;
	3: IBankFormValues;
	4: IAccountFormValues;
	5: IAssetFormValues;
  }
export type FormValuesForStep<T extends keyof FormStepTypes> = FormStepTypes[T]
export type FormValues = IPortfolioFormValues | IEntityFormValues | IBankFormValues | IAccountFormValues | IAssetFormValues
export const DrawerContent: React.FC<IDrawerContentProps> = ({
	clientId,
	onClose,
	handleCloseDialogIsOpen,
	onSaveAsSraftClick,
	draftStep,
	portfolioDraft,
	mainPortfolioId,
	toggleSuccessModalIsOpen,
	mainPortfolioName,
},) => {
	const {
		data: userData,
	} = useClientGet(clientId,)
	const {
		step,
		setStep,
		subStep,
		setPortfolioId,
		portfolioId,
		clearPortfolioId,
		entityId,
		setEntityId,
		bankId,
		setBankId,
		accountId,
		setAccountId,
		setCreatedPortfolioId,
		setCreatedMainPortfolioId,
		reset,
	} = useAddPortfolioStore()
	React.useEffect(() => {
		if (draftStep) {
			setStep(draftStep,)
		}
	},[draftStep,],)
	const rawStep = step as 1 | 2 | 3 | 4 | 5
	const {
		mutateAsync: createPortfolioDraft,
	} = useCreatePortfolioDraft()
	const {
		mutateAsync: createPortfolioDocument,
	} = useCreateDocument(DocumentTypes.PORTFOLIO,)
	const {
		mutateAsync: createEntity,
	} = useCreateEntity()
	const {
		mutateAsync: createEntityDocument,
	} = useCreateDocument(DocumentTypes.ENTITY,)
	const {
		mutateAsync: createBank,
	} = useCreateBank()
	const {
		mutateAsync: createAccount,
	} = useCreateAccount()
	const {
		mutateAsync: createAssetEntity,
	} = useCreateAsset(false,)
	const {
		mutateAsync: createAssetDocument,
	} = useCreateDocument(DocumentTypes.ASSET,)
	const {
		mutateAsync: updateDraftToPortfolio,
	} = useUpdateDraftToPortfolio()
	const {
		documents: storeDocuments, clearDocuments,
	} = useDocumentStore()

	React.useEffect(() => {
		return () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.PORTFOLIO_LIST,],
			},)
			setPortfolioId(null,)
			setEntityId(null,)
			setBankId(null,)
			setAccountId(null,)
		}
	},[],)

	const handleSubmit = async({
		documents, ...data
	}: FormValues, form: FormApi<FormValues, Partial<FormValues>>,): Promise<void> => {
		try {
			if (step === 1) {
				const portfolioValues = data as IPortfolioFormValues
				const {
					id,
				} = await createPortfolioDraft({
					mainPortfolioId,
					clientId,
					name:        portfolioValues.portfolioName,
					type:        portfolioValues.portfolioType.value,
					resident:    portfolioValues.resident?.value,
					taxResident: portfolioValues.taxResident?.value,
				},)
				setPortfolioId(id,)
				const uploadDocuments = storeDocuments.map(async(document,) => {
					const formData = new FormData()
					formData.append('file', document.file,)
					formData.append('type', document.documentType,)
					formData.append('portfolioDraftId', id,)
					await createPortfolioDocument(formData,)
				},)
				await Promise.all(uploadDocuments,)
			}
			if (step === 2 && portfolioId) {
				const entityValues = data as IEntityFormValues
				const {
					id,
				} = await createEntity({
					portfolioDraftId:        portfolioId,
					name:                    entityValues.entityName,
					country:                 entityValues.country.value,
					authorizedSignatoryName: entityValues.authorizedSignatoryName,
					firstName:               entityValues.firstName,
					lastName:                entityValues.lastName,
					email:                   entityValues.email,
				},)
				setEntityId(id,)
				const uploadDocuments = storeDocuments.map(async(document,) => {
					const formData = new FormData()
					formData.append('file', document.file,)
					formData.append('type', document.documentType,)
					formData.append('entityId', id,)
					await createEntityDocument(formData,)
				},)
				await Promise.all(uploadDocuments,)
			}
			if (step === 2 && portfolioDraft) {
				const entityValues = data as IEntityFormValues
				const {
					id,
				} = await createEntity({
					portfolioDraftId:        portfolioDraft.id,
					name:                    entityValues.entityName,
					country:                 entityValues.country.value,
					authorizedSignatoryName: entityValues.authorizedSignatoryName,
					firstName:               entityValues.firstName,
					lastName:                entityValues.lastName,
					email:                   entityValues.email,
				},)
				setEntityId(id,)
				const uploadDocuments = storeDocuments.map(async(document,) => {
					const formData = new FormData()
					formData.append('file', document.file,)
					formData.append('type', document.documentType,)
					formData.append('entityId', id,)
					await createEntityDocument(formData,)
				},)
				await Promise.all(uploadDocuments,)
			}
			if (step === 3 && portfolioId && entityId) {
				const bankValues = data as IBankFormValues
				const newBank = await createBank({
					clientId,
					entityId,
					portfolioDraftId: portfolioId,
					bankName:         bankValues.bankName.value.name,
					bankListId:       bankValues.bankName.value.id,
					branchName:       bankValues.branchName,
					country:          bankValues.country.value,
					email:            bankValues.email,
					firstName:        bankValues.firstName,
					lastName:         bankValues.lastName,
				},)
				setBankId(newBank.id,)
			}
			if (step === 3 && portfolioDraft) {
				const bankValues = data as IBankFormValues
				const newBank = await createBank({
					clientId,
					entityId:         portfolioDraft.entities[0]?.id ?? entityId ?? '',
					portfolioDraftId: portfolioDraft.id,
					bankName:         bankValues.bankName.value.name,
					bankListId:       bankValues.bankName.value.id,
					branchName:       bankValues.branchName,
					country:          bankValues.country.value,
					email:            bankValues.email,
					firstName:        bankValues.firstName,
					lastName:         bankValues.lastName,
				},)
				setBankId(newBank.id,)
			}
			if (step === 4 && portfolioId && entityId && bankId) {
				const {
					dataCreated, ...accountValues
				} = data as IAccountFormValues
				const {
					id,
				} = await createAccount({
					...accountValues,
					dataCreated:      dataCreated ?
						formatToUTCISOString(dataCreated,) :
						undefined,
					portfolioDraftId: portfolioId,
					entityId,
					bankId,
				},)
				setAccountId(id,)
			}
			if (step === 4 && portfolioDraft) {
				const {
					dataCreated, ...accountValues
				} = data as IAccountFormValues
				const {
					id,
				} = await createAccount({
					...accountValues,
					dataCreated:      dataCreated ?
						formatToUTCISOString(dataCreated,) :
						undefined,
					portfolioDraftId: portfolioDraft.id,
					entityId:         portfolioDraft.entities[0]?.id ?? entityId ?? '',
					bankId:           portfolioDraft.banks[0]?.id ?? bankId ?? '',
				},)
				setAccountId(id,)
			}
			if (step === 5 && portfolioDraft) {
				const {
					assetName, ...assetValues
				} = data as IAssetFormValues
				const payload = JSON.stringify(transformValuesForPayload(assetValues,),)

				const {
					id,
				} = await createAssetEntity({
					clientId,
					assetName:        assetName.value,
					portfolioDraftId: portfolioDraft.id,
					payload,
					entityId:         portfolioDraft.entities[0]?.id ?? entityId ?? '',
					bankId:           portfolioDraft.banks[0]?.id ?? bankId ?? '',
					accountId:        portfolioDraft.accounts[0]?.id ?? accountId ?? '',
				},)
				const uploadDocuments = storeDocuments.map(async(document,) => {
					const formData = new FormData()
					formData.append('file', document.file,)
					formData.append('type', document.documentType,)
					formData.append('assetId', id,)
					await createAssetDocument(formData,)
				},)
				await Promise.all(uploadDocuments,)
				const {
					id: createdPortfolioId,
				} = await updateDraftToPortfolio(portfolioDraft.id,)
				setCreatedPortfolioId(createdPortfolioId,)
			}
			if (step === 5 && portfolioId && entityId && bankId && accountId) {
				const {
					assetName, ...assetValues
				} = data as IAssetFormValues
				const payload = JSON.stringify(transformValuesForPayload(assetValues,),)

				const uploadDocuments = storeDocuments.map(async(document,) => {
					const formData = new FormData()
					formData.append('file', document.file,)
					formData.append('type', document.documentType,)
					formData.append('assetId', id,)
					await createAssetDocument(formData,)
				},)
				await Promise.all(uploadDocuments,)
				const {
					mainPortfolioId,
					id: createdPortfolioId,
				} = await updateDraftToPortfolio(portfolioId,)
				const {
					id,
				} = await createAssetEntity({
					assetName:        assetName.value,
					portfolioId: createdPortfolioId,
					payload,
					entityId,
					bankId,
					accountId,
					clientId,
				},)

				setCreatedPortfolioId(createdPortfolioId,)
				if (mainPortfolioId) {
					setCreatedMainPortfolioId(mainPortfolioId,)
				}
			}
			clearDocuments()
			form.reset({
			},)
			if (step === 5) {
				if (onSaveAsSraftClick) {
					onSaveAsSraftClick()
				}
				if (toggleSuccessModalIsOpen) {
					toggleSuccessModalIsOpen()
				}
				setStep(1,)
			} else {
				setStep(step + 1,)
			}
		} catch (error) {
			toasterService.showErrorToast({
				message: FetchErrorMessages.PORTFOLIO_CREATION_ERROR,
			},)
		}
	}
	const validation = (rawStep: 1 | 2 | 3 | 4 | 5,) => {
		return (values: FormValuesForStep<typeof rawStep>,) => {
			switch (rawStep) {
			case 1:
				return validatePortfolio(values as IPortfolioValidateValues,)
			case 2:
				return validateEntity(values as IEntityValidateValues, subStep,)
			case 3:
				return validateBank(values as IBankValidateValues, subStep,)
			case 4:
				return validateAccount(values as IAccountValidateValues, subStep,)
			case 5:
				return validateAsset(values as IAssetValidateValues, subStep,)
			default:
				return validateAsset(values as IAssetValidateValues, subStep,)
			}
		}
	}
	const handleCloseCreation = async(): Promise<void> => {
		clearPortfolioId()
		reset()
		if (onSaveAsSraftClick) {
			onSaveAsSraftClick()
		}
	}
	return (
		<div className={styles.drawerWrapper}>
			<CloseXIcon className={styles.closeIcon} onClick={() => {
				if (portfolioId) {
					handleCloseDialogIsOpen()
				} else {
					onClose()
				}
			}
			}/>
			<div className={styles.leftBlockWrapper}>
				<div>
					<div className={styles.nameBlock}>
						{mainPortfolioId ?
							<PortfolioIcon width={32} height={32}/> :
							<ClientLists width={32} height={32}/>}
						{mainPortfolioName ?
							<p className={styles.nameSurnameText}>{mainPortfolioName}</p> :
							<p className={styles.nameSurnameText}>{userData?.firstName} {userData?.lastName}</p>}
					</div>
					<ul className={styles.buttonsList}>
						{progressButtonList.map((button,) => {
							return <ProgressButton key={button.id} id={button.id} name={button.name} step={step}/>
						},)}
					</ul>
				</div>
				{!portfolioDraft && <Button<ButtonType.TEXT>
					disabled={Boolean(!portfolioId,) && (!draftStep || draftStep === 1)}
					onClick={handleCloseCreation}
					additionalProps={{
						btnType:   ButtonType.TEXT,
						text:      'Save as draft',
						size:      Size.MEDIUM,
						color:     Color.NON_OUT_BLUE,
					}}
				/>}
			</div>
			<Form<FormValues>
				onSubmit={handleSubmit}
				validate={validation(rawStep,)}
				render={({
					handleSubmit,
					errors,
					values,
				},) => {
					return (
						<form onSubmit={handleSubmit} className={styles.rightBlockWrapper}>
							<TopBlock mainPortfolioId={mainPortfolioId}/>
							<div className={styles.formWrapper}>
								{step === 1 && <FormPortfolio values={values as IPortfolioFormValues}/>}
								{step === 2 && <FormEntity values={values as IEntityValidateValues}/>}
								{step === 3 && <FormBank values={values as IBankValidateValues}/>}
								{step === 4 && <FormAccount values={values as IAccountValidateValues}/>}
								{step === 5 && <FormAsset values={values as IAssetValidateValues}/>}
							</div>
							<BottomBlock
								portfolioDraftId={portfolioDraft?.id}
								errors={errors}
								onClose={onSaveAsSraftClick}
								toggleSuccessModalIsOpen={toggleSuccessModalIsOpen}
								assetName={(values as IAssetValidateValues).assetName}
							/>
						</form>
					)
				}}
			/>
		</div>
	)
}