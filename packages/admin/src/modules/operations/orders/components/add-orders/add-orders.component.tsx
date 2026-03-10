/* eslint-disable max-depth */
/* eslint-disable complexity */
import React, {
	useState,
} from 'react'
import {
	Button,
	ButtonType,
	Size,
	Color,
	Drawer,
	Dialog,
} from '../../../../../shared/components'
import {
	XmarkSecond,
	PlusBlue,
	Indent,
} from '../../../../../assets/icons'
import type {
	IRequest,
	IOrderDraftDetail,
	IOrderDraft,
	IRequestExtended,
} from '../../../../../shared/types'
import {
	OrderDetailsForm,
} from './add-orders-form.component'
import type {
	IOrderDetailsFormValues,
} from '../../utils/add-orders.validate'
import type {
	ICreateOrderDetail,
	IAddOrderProps,
} from '../../../../../shared/types'
import {
	useCreateOrder,
} from '../../../../../shared/hooks/orders/orders.hook'
import {
	useCreateOrderDraft,
} from '../../../../../shared/hooks/orders/orders.hook'
import {
	toggleState,
} from '../../../../../shared/utils'
import {
	OrdersSelectExit,
} from './orders-select-exit.component'
import {
	useDeleteOrderDraft,
} from '../../../../../shared/hooks/orders/orders.hook'
import {
	useCreatedOrderStore,
} from '../create-order.store'
import {
	useUpdateOrderDraft,
} from '../../../../../shared/hooks/orders/orders.hook'
import {
	useGetEmissionsIsins,
	useGetEquityStocksIsins,
} from '../../../../../shared/hooks'
import {
	AssetNamesType,
} from '../../../../../shared/types'
import * as styles from './add-orders.style'

enum OrderType {
    SELL = 'Sell',
    BUY = 'Buy',
}

interface IAddOrdersProps {
   isOpen: boolean
   onClose: () => void
   requests: IRequestExtended
	onSelectRequests: (requests: IRequest | null) => void
	orderType?: OrderType
	toggleModalSuccessful?: () => void
	isDraft?: boolean;
	draftValues?: Array<IOrderDraftDetail>;
	draftId?: number
}

export const AddOrders: React.FC<IAddOrdersProps> = ({
	isOpen,
	onClose,
	requests,
	onSelectRequests,
	orderType = OrderType.SELL,
	draftValues,
	draftId,
	toggleModalSuccessful,
},) => {
	const {
		data: emissionsIsins,
	} = useGetEmissionsIsins()
	const {
		data: stocksIsins,
	} = useGetEquityStocksIsins()

	const {
		setCreatedOrder,
	} = useCreatedOrderStore()
	const {
		mutate: createOrderDraft,
	} = useCreateOrderDraft()
	const {
		mutate: deleteDraft,
	} = useDeleteOrderDraft()
	const {
		mutate: updateOrderDraft,
	} = useUpdateOrderDraft()
	const [formValues, setFormValues,] = useState<Record<string, IOrderDetailsFormValues>>({
	},)
	const [isModalOpen, setIsModalOpen,] = useState<boolean>(false,)
	const [createdOrders, setCreatedOrders,] = useState<Array<ICreateOrderDetail>>([],)
	const [isFormCompleted, setIsFormCompleted,] = useState<boolean>(false,)
	const {
		mutate: createOrder,
	} = useCreateOrder()

	const toggleModal = toggleState(setIsModalOpen,)

	React.useEffect(() => {
		if (isOpen) {
			if (Object.keys(formValues,).length === 0) {
				if (draftValues && draftValues.length > 0) {
					const initialFormValues = draftValues.reduce<Record<string, IOrderDetailsFormValues>>((acc, draftDetail,) => {
						const newId = draftDetail.id ?? ''
						acc[newId] = {
							security:      draftDetail.security ?? '',
							isin:          draftDetail.isin ?
								{
									value: draftDetail.isin, label: draftDetail.isin,
								} :
								undefined,
							units:     draftDetail.units ?? '',
							priceType:     draftDetail.priceType ?
								{
									value: draftDetail.priceType, label: draftDetail.priceType,
								} :
								undefined,
							price:         draftDetail.price ?? '',
							currency:      draftDetail.currency ?
								{
									value: draftDetail.currency, label: draftDetail.currency,
								} :
								undefined,
							yield:         draftDetail.yield ?? '',
							unitExecuted:  draftDetail.unitExecuted ?? '',
							priceExecuted: draftDetail.priceExecuted ?? '',
						}
						return acc
					}, {
					},)
					setFormValues(initialFormValues,)
				} else {
					const newId = 1
					setFormValues({
						[newId]: {
							security:      '',
							isin:          undefined,
							units:         '',
							priceType:     undefined,
							price:         '',
							currency:      undefined,
							yield:         '',
							unitExecuted:  '',
							priceExecuted: '',
						},
					},)
				}
			}
		}
		setIsFormCompleted(false,)
	}, [isOpen, formValues, draftValues,],)
	const handleOrderContinue = (values: IOrderDetailsFormValues, index: number,): void => {
		const newOrder: ICreateOrderDetail = {
			security:       values.security,
			isin:           values.isin?.label ?? '',
			units:         String(values.units,),
			priceType:     values.priceType?.value ?? '',
			price:          String(values.price,),
			currency:      values.currency?.label ?? '',
			yield:         String(values.yield,),
			unitExecuted:   String(values.unitExecuted,),
			priceExecuted:  String(values.priceExecuted,),
		}
		setCreatedOrders((prev,) => {
			const updatedOrders = [...prev,]
			updatedOrders[index] = newOrder
			return updatedOrders
		},)
		const allFormsCompleted = Object.keys(formValues,).length === createdOrders.length + 1
		setIsFormCompleted(allFormsCompleted,)
	}

	React.useEffect(() => {
		setIsFormCompleted(Object.keys(formValues,).length === createdOrders.length,)
	}, [formValues, createdOrders,],)

	const handleAddOrder = (): void => {
		const newOrder: IAddOrderProps = {
			type:        orderType,
			requestId:   requests.id,
			portfolioId: requests.portfolioId,
			details:     createdOrders,
		}
		createOrder(newOrder, {
			onSuccess: (data,) => {
				setCreatedOrder(data,)
				setCreatedOrders([],)
				setFormValues({
				},)
				if (draftId) {
					deleteDraft(draftId,)
				}
				onClose()
				onSelectRequests(null,)
				if (toggleModalSuccessful) {
					toggleModalSuccessful()
				}
			},
		},)
	}

	const handleSaveAsDraft = (): void => {
		if (!draftId) {
			const newDraft: IOrderDraft = {
				type:        orderType,
				requestId:   requests.id,
				portfolioId: requests.portfolioId,
				details:     Object.values(formValues,).map((formValue,) => {
					return {
						security:      formValue.security,
						isin:          formValue.isin?.label ?? '',
						units:         String(formValue.units,),
						price:         String(formValue.price,),
						currency:      formValue.currency?.label ?? '',
						yield:         String(formValue.yield,),
						unitExecuted:  String(formValue.unitExecuted,),
						priceExecuted: String(formValue.priceExecuted,),
					}
				},),
			}

			createOrderDraft(newDraft, {
				onSuccess: (data,) => {
					setCreatedOrders([],)
					setFormValues({
					},)
					onClose()
					onSelectRequests(null,)
				},
			},)
		}
		if (draftId) {
			const draftData: IOrderDraft = {
				type:        orderType,
				requestId:   requests.id,
				portfolioId: requests.portfolioId,
				details:     Object.entries(formValues,).map(([key, formValue,],) => {
					const matchingDraft = draftValues?.find((draft,) => {
						return draft.id === key
					},)
					const baseData = {
						security:      formValue.security,
						isin:          formValue.isin?.label ?? '',
						units:         String(formValue.units,),
						price:         String(formValue.price,),
						currency:      formValue.currency?.label ?? '',
						yield:         String(formValue.yield,),
						unitExecuted:  String(formValue.unitExecuted,),
						priceExecuted: String(formValue.priceExecuted,),
					}
					if (matchingDraft) {
						return {
							...baseData,
							id: key,
						}
					}
					return baseData
				},),
			}
			updateOrderDraft({
				draftId,
				body: draftData,
			}, {
				onSuccess: () => {
					setFormValues({
					},)
					setCreatedOrders([],)
					onClose()
					onSelectRequests(null,)
				},
			},)
		}
	}

	const handleClose = (): void => {
		setFormValues({
		},)
		setCreatedOrders([],)
		setIsModalOpen(false,)
		onClose()
	}

	const handleAddAsset = (): void => {
		const newId = (Math.max(...Object.keys(formValues,).map(Number,),) + 1).toString()
		setFormValues((prev,) => {
			return {
				...prev,
				[newId]: {
					security:      '',
					isin:          undefined,
					units:         '',
					priceType:     undefined,
					price:         '',
					currency:      undefined,
					yield:         '',
					unitExecuted:  '',
					priceExecuted: '',
				},
			}
		},)
		setIsFormCompleted(false,)
	}

	const handleFormChange = (id: string, values: IOrderDetailsFormValues,): void => {
		setFormValues({
			...formValues,
			[id]: values,
		},)
	}

	const handleDeleteAsset = (id: string,): void => {
		setFormValues((prev,) => {
			const updatedFormValues = Object.fromEntries(
				Object.entries(prev,).filter(([key,],) => {
					return key !== id
				},),
			)
			return updatedFormValues
		},)

		const isinToRemove = formValues[id]?.isin?.label
		if (!isinToRemove) {
			return
		}

		setCreatedOrders((prev,) => {
			return prev.filter((order,) => {
				return order.isin !== isinToRemove
			},)
		},)
	}

	const {
		length,
	} = Object.keys(formValues,)

	const isDraftDisabled = Object.values(formValues,).every(
		(form,) => {
			return !form.security &&
   !form.isin &&
   !form.units &&
   !form.price &&
	!form.currency &&
   !form.yield &&
   !form.unitExecuted &&
   !form.priceExecuted
		},
	)
	return (
		<Drawer
			isOpen={isOpen}
			onClose={toggleModal}
		>
			<div className={styles.drawerContainer}>
				<div className={styles.drawerHeader}>
					<h2 className={styles.drawerHeaderTitle}>Add {orderType} order</h2>
					<Button<ButtonType.ICON>
						onClick={toggleModal}
						additionalProps={{
							btnType: ButtonType.ICON,
							icon:    <XmarkSecond width={20} height={20} />,
							size:    Size.SMALL,
							color:   Color.NONE,
						}}
					/>
				</div>
				<div className={styles.requestAdd}>
					<Indent width={16} height={16} />
					<p>
                  Request ID: {requests.id} ({requests.portfolio?.name ?? 'No Portfolio'})
					</p>
				</div>
				<div className={styles.drawerContent}>
					{Object.keys(formValues,).map((key, index,) => {
						const formValue = formValues[key]
						return (
							<OrderDetailsForm
								key={key}
								initialValues={formValue}
								onContinue={(vals,) => {
									handleOrderContinue(vals, index,)
								}}
								onChange={(vals,) => {
									handleFormChange(key, vals,)
								}}
								handleDeleteAsset={() => {
									handleDeleteAsset(key,)
								}}
								assetIndex={index + 1}
								length={length}
								isinOptions={
									requests.asset?.assetName === AssetNamesType.BONDS ?
										emissionsIsins :
										stocksIsins
								}
								emissionsIsins={emissionsIsins ?? []}
								stocksIsins={stocksIsins ?? []}
								request={requests}
								orderType={orderType}
							/>
						)
					},)}

					<div className={styles.addAnotherBtn}>
						<Button<ButtonType.TEXT>
							onClick={handleAddAsset}
							disabled={!isFormCompleted}
							additionalProps={{
								btnType:  ButtonType.TEXT,
								text:     'Add asset',
								size:     Size.SMALL,
								color:    Color.NON_OUT_BLUE,
								leftIcon: <PlusBlue width={20} height={20}/>,
							}}
						/>
					</div>
				</div>
				<div className={styles.addOrdersFooter}>
					<Button<ButtonType.TEXT>
						disabled={isDraftDisabled}
						onClick={handleSaveAsDraft}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							size:     Size.MEDIUM,
							text:     'Save as draft',
							color:    Color.NON_OUT_BLUE,
						}}
					/>
					<Button<ButtonType.TEXT>
						onClick={handleAddOrder}
						disabled={!isFormCompleted}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							size:     Size.MEDIUM,
							text:     'Add order',
							color:    Color.BLUE,
						}}
					/>
				</div>
				<Dialog
					open={isModalOpen}
					onClose={toggleModal}
				>
					<OrdersSelectExit
						onClose={toggleModal}
						handleClose={handleClose}
						handleSaveAsDraft={handleSaveAsDraft}
						isDraftDisabled={isDraftDisabled}
					/>
				</Dialog>
			</div>
		</Drawer>
	)
}
