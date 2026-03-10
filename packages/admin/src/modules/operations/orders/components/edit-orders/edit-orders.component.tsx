import React, {
	useEffect, useState,
} from 'react'
import {
	cx,
} from '@emotion/css'
import {
	Button, ButtonType, Size, Color, Drawer,
} from '../../../../../shared/components'
import {
	XmarkSecond,
	Refresh,
	PlusBlue,
} from '../../../../../assets/icons'
import type {
	IEditOrderProps,
	IOrderDetailForm,
} from '../../../../../shared/types'
import type {
	IOrderDetailsFormValues,
} from '../../utils/add-orders.validate'
import {
	useUpdateOrder, useOrderById, useDeleteOrderDetails,
} from '../../../../../shared/hooks/orders/orders.hook'
import {
	EditOrderDetailsForm,
} from './edit-orders-form.component'
import {
	OrderStatus,
} from '../../../../../shared/types'
import {
	useGetEmissionsIsins,
	useGetEquityStocksIsins,
} from '../../../../../shared/hooks'
import {
	AssetNamesType,
} from '../../../../../shared/types'
import * as styles from './edit-orders.style'

interface IEditOrdersProps {
	isOpen: boolean;
	onClose: () => void;
	orderId: number;
}

export enum FormStatus {
	DEFAULT = 'default',
	SUCCESS = 'success',
	ERROR = 'error',
}

export const EditOrders: React.FC<IEditOrdersProps> = ({
	isOpen,
	onClose,
	orderId,
},) => {
	const {
		data: emissionsIsins,
	} = useGetEmissionsIsins()
	const {
		data: stocksIsins,
	} = useGetEquityStocksIsins()
	const [formValues, setFormValues,] = useState<Record<string, IOrderDetailsFormValues>>({
	},)
	const [createdOrders, setCreatedOrders,] = useState<Array<IOrderDetailForm>>([],)
	const [deletedOrderDetails, setDeletedOrderDetails,] = useState<Array<string>>([],)
	const [isFormCompleted, setIsFormCompleted,] = useState<boolean>(false,)
	const [isFormChanged, setIsFormChanged,] = useState<boolean>(false,)
	const [initialFormValues, setInitialFormValues,] = useState<Record<string, IOrderDetailsFormValues>>({
	},)
	const {
		data: existingOrder, isSuccess: isOrderLoaded,
	} = useOrderById(orderId,)

	const {
		mutate: updateOrder,
	} = useUpdateOrder()
	const {
		mutateAsync: deleteOrderDetails,
	} = useDeleteOrderDetails()

	const handleClearForm = (): void => {
		setFormValues({
			...initialFormValues,
		},)
		setIsFormChanged(false,)
		setDeletedOrderDetails([],)
		setIsFormCompleted(false,)
	}

	useEffect(() => {
		if (isOrderLoaded) {
			const initialValues = existingOrder.details.reduce<Record<string, IOrderDetailsFormValues>>(
				(acc, detail,) => {
					if (detail.id) {
						acc[detail.id] = {
							id:       detail.id,
							security: detail.security,
							isin:     {
								label: detail.isin, value: detail.isin,
							},
							units:     Number(detail.units,),
							priceType:     {
								label: detail.priceType, value: detail.priceType,
							},
							price:    Number(detail.price,),
							currency: {
								label: detail.currency, value: detail.currency,
							},
							yield:         detail.yield,
							unitExecuted:  detail.unitExecuted,
							priceExecuted: detail.priceExecuted,
						}
					}
					return acc
				},
				{
				},
			)
			setFormValues(initialValues,)
			setInitialFormValues(initialValues,)
		}
		setIsFormCompleted(false,)
	}, [existingOrder, isOrderLoaded,],)

	const handleOrderContinue = (values: IOrderDetailsFormValues, index: number | string,): void => {
		const newOrder: IOrderDetailForm = {
			id:            values.id ?? index.toString(),
			security:      values.security,
			isin:          values.isin?.label ?? '',
			units:         String(values.units,),
			priceType:     values.priceType?.value ?? '',
			price:         String(values.price,),
			currency:      values.currency?.label ?? '',
			yield:         String(values.yield,),
			unitExecuted:  String(values.unitExecuted,),
			priceExecuted: String(values.priceExecuted,),
		}
		setCreatedOrders((prev,) => {
			const existingOrderIndex = prev.findIndex((order,) => {
				return order.id === newOrder.id
			},)
			if (existingOrderIndex !== -1) {
				const updatedOrders = [...prev,]
				updatedOrders[existingOrderIndex] = newOrder
				return updatedOrders
			}
			return [...prev, newOrder,]
		},)
	}

	const handleSaveOrder = async(): Promise<void> => {
		if (!existingOrder?.type) {
			return
		}

		const filteredOrders = createdOrders.filter((order,) => {
			return !deletedOrderDetails.includes(order.id ?? '',)
		},)

		if (deletedOrderDetails.length > 0) {
			await deleteOrderDetails({
				ids: deletedOrderDetails,
			},)
		}

		const updatedDataOrder: IEditOrderProps = {
			type:    existingOrder.type,
			details: filteredOrders.map((formValue,) => {
				const matchingOrder = existingOrder.details.find((details,) => {
					return details.id === formValue.id
				},)
				const baseData = {
					security:      formValue.security,
					isin:          formValue.isin,
					units:         String(formValue.units,),
					priceType:     formValue.priceType,
					price:         String(formValue.price,),
					currency:      formValue.currency,
					yield:         String(formValue.yield,),
					unitExecuted:  String(formValue.unitExecuted,),
					priceExecuted: String(formValue.priceExecuted,),
				}
				if (matchingOrder) {
					return {
						...baseData,
						id: matchingOrder.id,
					}
				}
				return baseData
			},),
		}
		updateOrder(
			{
				orderId: existingOrder.id,
				body:    updatedDataOrder,
			},
			{
				onSuccess: () => {
					setCreatedOrders([],)
					setDeletedOrderDetails([],)
					setFormValues({
					},)
					onClose()
				},
			},
		)
		setIsFormChanged(false,)
		setIsFormCompleted(false,)
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
		setIsFormChanged(true,)
	}

	const handleDeleteAsset = (id?: string,): void => {
		setFormValues((prev,) => {
			const updatedFormValues = Object.fromEntries(
				Object.entries(prev,).filter(([key,],) => {
					return key !== id
				},),
			)
			return updatedFormValues
		},)
		if (id) {
			const existingDetail = existingOrder?.details.find((detail,) => {
				return detail.id === id
			},)
			if (existingDetail) {
				setDeletedOrderDetails((prevDeletedIds,) => {
					return [
						...prevDeletedIds,
						id,
					]
				},)
			}
		}
		setIsFormChanged(true,)
	}

	const handleCloseDrawer = (): void => {
		setFormValues({
		},)
		setCreatedOrders([],)
		setDeletedOrderDetails([],)
		setIsFormChanged(false,)
		setIsFormCompleted(false,)
		onClose()
	}

	useEffect(() => {
		const areFieldsComplete = Object.values(formValues,).every((formValue,) => {
			return (
				formValue.security &&
      formValue.isin?.label &&
      formValue.units &&
      formValue.price &&
      formValue.currency?.label
			)
		},)

		const areChangesPresent = createdOrders.length > 0 || deletedOrderDetails.length > 0

		const formCompleted = areFieldsComplete && areChangesPresent

		setIsFormCompleted(formCompleted,)
	}, [formValues, createdOrders, deletedOrderDetails,],)

	return (
		<Drawer
			isOpen={isOpen}
			onClose={handleCloseDrawer}
		>
			<div className={styles.drawerWrapper}>
				<div className={styles.drawerHeader}>
					<h2 className={styles.drawerHeaderTitle}>Edit order</h2>
					<Button<ButtonType.ICON>
						onClick={handleCloseDrawer}
						additionalProps={{
							btnType: ButtonType.ICON,
							icon:    <XmarkSecond width={20} height={20} />,
							size:    Size.SMALL,
							color:   Color.NONE,
						}}
					/>
				</div>
				<div className={styles.drawerContent}>
					<div className={styles.info}>
						<div>
							<p className={styles.infoLeftTitle}>Order ID, type</p>
							<p className={styles.infoLeftText}>{orderId}, {existingOrder?.type} </p>
						</div>
						<p
							className={cx(
								styles.infoBadge,
								existingOrder?.status === OrderStatus.APPROVED && styles.approvedBadge,
								existingOrder?.status === OrderStatus.CANCELED && styles.canceledBadge,
								existingOrder?.status === OrderStatus.IN_PROGRESS && styles.inProgressBadge,
							)}
						>{existingOrder?.status}</p>
					</div>
					{Object.keys(formValues,).map((key, index,) => {
						const formValue = formValues[key]
						return (
							<EditOrderDetailsForm
								key={key}
								initialValues={formValue}
								onContinue={(values,) => {
									handleOrderContinue(values, index,)
								}}
								onChange={(values,) => {
									handleFormChange(key, values,)
								}}
								handleDeleteAsset={() => {
									handleDeleteAsset(key,)
								}}
								isinOptions={
									existingOrder?.request?.asset?.assetName === AssetNamesType.BONDS ?
										emissionsIsins :
										stocksIsins
								}
								assetIndex={index + 1}
								emissionsIsins={emissionsIsins ?? []}
								stocksIsins={stocksIsins ?? []}
								order={existingOrder}
							/>
						)
					},)}
					<div className={styles.addAnotherBtn}>
						<Button<ButtonType.TEXT>
							onClick={handleAddAsset}
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
						disabled={!isFormChanged}
						onClick={handleClearForm}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							size:     Size.MEDIUM,
							text:     'Clear',
							color:    Color.SECONDRAY_GRAY,
							leftIcon: <Refresh width={20} height={20}/>,
						}}
					/>
					<Button<ButtonType.TEXT>
						disabled={!isFormCompleted}
						onClick={handleSaveOrder}
						additionalProps={{
							btnType: ButtonType.TEXT,
							size:    Size.MEDIUM,
							text:    'Save edits',
							color:   Color.BLUE,
						}}
					/>
				</div>
			</div>
		</Drawer>
	)
}
