/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable complexity */
import React from 'react'
import {
	Form,
} from 'react-final-form'
import {
	FormField, SelectField,
} from '../../../../../shared/components'
import {
	validateOrderDetailsForm,
} from '../../utils/add-orders.validate'
import {
	currencyOptions,
} from '../../../../clients/portfolios/portfolio/components/drawer-content/components/form-asset'
import {
	Button, ButtonType, Size, Color,
} from '../../../../../shared/components'
import {
	PenEdit, Trash,
} from '../../../../../assets/icons'
import type {
	IOrderDetailsFormValues,
} from '../../utils/add-orders.validate'
import {
	useGetEquityStocksSecurityByIsin, useGetSecurityByIsin, useGetCurrencyByIsin, useGetMarketPriceByIsin,
} from '../../../../../shared/hooks/cbonds'
import {
	OrderType,
	type IOptionType, type IOrder, AssetNamesType,
} from '../../../../../shared/types'
import type {
	SelectValueType,
} from '../../../../../shared/types'
import type {
	CurrencyList,
} from '../../../../../shared/types'
import {
	useGetOrderUnits, useGetPortfolioIsins,
} from '../../../../../shared/hooks'

import * as styles from './edit-orders-form.style'

interface IOrderDetailsFormProps {
	initialValues?: Partial<IOrderDetailsFormValues>
	assetIndex: number
	emissionsIsins: Array<string>
	stocksIsins: Array<string>
	isinOptions?: Array<string>
	order: IOrder | undefined
	onChange?: (values: IOrderDetailsFormValues) => void
	onContinue: (values: IOrderDetailsFormValues) => void
	handleDeleteAsset: () => void
}

export const EditOrderDetailsForm: React.FC<IOrderDetailsFormProps> = ({
	initialValues = {
	},
	assetIndex,
	emissionsIsins,
	stocksIsins,
	isinOptions,
	order,
	onChange,
	onContinue,
	handleDeleteAsset,
},) => {
	const [isOpen, setIsOpen,] = React.useState(false,)

	const handleToggle = (): void => {
		setIsOpen((prevState,) => {
			return !prevState
		},)
	}

	const handleContinue = (values: IOrderDetailsFormValues,): void => {
		onContinue(values,)
		handleToggle()
	}

	const [isinStockValue, setIsinStockValue,] = React.useState<string | null>(null,)
	const [isinBondsValue, setIsinBondsValue,] = React.useState<string | null>(null,)
	const handleIsinChange = (selectedOption: SelectValueType,): void => {
		const {
			value,
		} = selectedOption as IOptionType
		if (emissionsIsins.includes(value,)) {
			setIsinBondsValue(value,)
			setIsinStockValue(null,)
		}
		if (stocksIsins.includes(value,)) {
			setIsinStockValue(value,)
			setIsinBondsValue(null,)
		}
	}

	const {
		data: securityBonds,
	} = useGetSecurityByIsin(isinBondsValue ?? '',)

	const {
		data: securityEquity,
	} = useGetEquityStocksSecurityByIsin(isinStockValue ?? '',)

	const pickedIsin = isinStockValue ?? isinBondsValue ?? initialValues.isin?.value ?? undefined

	const {
		data: currency,
	} = useGetCurrencyByIsin(pickedIsin,)

	const {
		data: marketPrice,
	} = useGetMarketPriceByIsin(pickedIsin,)

	const isIsinSelected = isinStockValue ?? isinBondsValue ?? initialValues.isin?.value
	const {
		data: portfolioIsins,
	} = useGetPortfolioIsins(order && order.type === OrderType.SELL && order.request?.asset ?
		{
			id:        order.request.portfolioId,
			assetName:   order.request.asset.assetName,
		} :
		undefined,)
	const {
		data: orderUnits,
	} = useGetOrderUnits(order?.request?.asset && isIsinSelected ?
		{
			assetName:   order.request.asset.assetName,
			portfolioId: order.request.portfolioId,
			isin:        isinStockValue ?? isinBondsValue ?? initialValues.isin?.value ?? '',
		} :
		undefined,)

	const isinOptionsSelect = order?.type === OrderType.SELL && portfolioIsins ?
		portfolioIsins.map((isin,) => {
			return {
				value: isin,
				label: isin,
			}
		},) :
		isinOptions?.map((isin,) => {
			return {
				value: isin,
				label: isin,
			}
		},) ?? []

	const priceTypeOptions = [
		{
			value: 'Market price',
			label: 'Market price',
		},
		{
			value: 'User price',
			label: 'User price',
		},
	]

	return (
		<div
			className={styles.orderDetails}
		>
			{!isOpen &&
				<div className={styles.orderDetailsHeader}>
					<div>
						<div className={styles.orderDetailsHeaderReq}>
							{securityBonds || securityEquity || initialValues.security || `Asset ${assetIndex}`}
						</div>
					</div>
					<Button<ButtonType.ICON>
						onClick={handleToggle}
						additionalProps={{
							btnType: ButtonType.ICON,
							size:    Size.SMALL,
							icon:    <PenEdit width={20} height={20} />,
							color:   Color.NONE,
						}}
					/>
				</div>
			}
			{isOpen && (
				<Form
					onSubmit={handleContinue}
					validate={validateOrderDetailsForm}
					initialValues={initialValues}
					render={({
						handleSubmit, form, valid, pristine, values, errors, touched,
					},) => {
						React.useEffect(() => {
							if (onChange) {
								onChange(values,)
							}
						}, [values,],)
						React.useEffect(() => {
							if (currency?.value) {
								form.change('currency', {
									value: currency.value as CurrencyList, label: currency.label,
								},)
							}
						}, [currency?.value, currency?.label,],)

						const isMarket = values.priceType?.value === 'Market price'

						const priceTypeBoolean = Boolean(values.priceType,)

						const prevPriceTypeRef = React.useRef<string | undefined>(values.priceType?.value,)

						React.useEffect(() => {
							if (isMarket && marketPrice) {
								form.change('price', marketPrice.marketPrice,)
							}
							if (isMarket && !marketPrice) {
								form.change('price', undefined,)
							}
						}, [isMarket, marketPrice,],)

						React.useEffect(() => {
							const prev = prevPriceTypeRef.current
							const curr = values.priceType?.value
							if (prev !== curr && curr === 'User price') {
								form.change('price', undefined,)
							}
							prevPriceTypeRef.current = curr
						}, [values.priceType?.value,],)

						return (
							<form className={styles.orderDetailsForm} onSubmit={handleSubmit}>
								<div className={styles.orderDetailsItem}>
									{orderUnits && <p className={styles.orderUnitsLabel}>(Total units remaining: {orderUnits.units})</p>}
									<p className={styles.orderDetailsLabel}>ISIN</p>
									<SelectField
										name='isin'
										options={isinOptionsSelect}
										placeholder='Select ISIN'
										onChange={handleIsinChange}
										isSearchable
									/>
								</div>
								<div className={styles.orderDetailsItem}>
									<p className={styles.orderDetailsLabel}>Security</p>
									<FormField name='security' placeholder='Enter security' 	initiaValue={String(securityBonds ?? securityEquity ?? initialValues.security ?? '',)} readOnly/>
								</div>
								<div className={styles.orderDetailsItem}>
									<p className={styles.orderDetailsLabel}>Units</p>
									<FormField name='units' placeholder='Enter units' isNumber={true}/>
								</div>
								<div className={styles.orderDetailsItem}>
									<p className={styles.orderDetailsLabel}>Price type</p>
									<SelectField
										name='priceType'
										options={priceTypeOptions}
										placeholder='Select price type'
										isSearchable
									/>
								</div>
								<div className={styles.orderDetailsItem}>
									<p className={styles.orderDetailsLabel}>Price</p>
									<FormField name='price' placeholder='Enter price' isNumber={true} readOnly={isMarket || !priceTypeBoolean} />
									{isMarket && !marketPrice && <p>Trade data is absent</p>}
								</div>
								<div className={styles.orderDetailsItem}>
									<p className={styles.orderDetailsLabel}>Currency</p>
									<SelectField
										name='currency'
										options={currencyOptions}
										placeholder='Select currency'
										isSearchable
										isDisabled={true}
									/>
								</div>
								{order?.request?.asset?.assetName === AssetNamesType.BONDS && order.type === OrderType.BUY &&
									<div className={styles.orderDetailsItem}>
										<p className={styles.orderDetailsLabel}>Yield</p>
										<FormField name='yield' placeholder='Enter yield' isNumber={true}/>
									</div>
								}
								<div className={styles.orderDetailsItem}>
									<p className={styles.orderDetailsLabel}>Unit Executed</p>
									<FormField name='unitExecuted' placeholder='Enter unit executed' isNumber={true}/>
								</div>
								<div className={styles.orderDetailsItem}>
									<p className={styles.orderDetailsLabel}>Price Executed</p>
									<FormField name='priceExecuted' placeholder='Enter price executed' isNumber={true}/>
								</div>
								<div className={styles.orderDetailsBtns}>
									<Button<ButtonType.ICON>
										onClick={handleDeleteAsset}
										className={styles.orderDetrailsTrash}
										additionalProps={{
											btnType: ButtonType.ICON,
											size:    Size.SMALL,
											icon:    <Trash width={20} height={20} />,
											color:   Color.NON_OUT_RED,
										}}
									/>
									<Button<ButtonType.TEXT>
										className={styles.orderDetailsCont}
										onClick={handleSubmit}
										disabled={!valid}
										additionalProps={{
											btnType: ButtonType.TEXT,
											size:    Size.MEDIUM,
											text:    'Continue',
											color:   Color.BLUE,
										}}
									/>
								</div>
							</form>
						)
					}}
				/>
			)}
		</div>
	)
}