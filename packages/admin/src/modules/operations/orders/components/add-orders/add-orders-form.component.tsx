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
	Trash, PenEdit,
} from '../../../../../assets/icons'
import type {
	IOrderDetailsFormValues,
} from '../../utils/add-orders.validate'
import {
	useGetSecurityByIsin,
	useCreateIsin,
	useGetOrderUnits,
	useGetPortfolioIsins,
} from '../../../../../shared/hooks'
import {
	OrderType,
	type CurrencyList,
	type IOptionType,
	type IRequestExtended,
	AssetNamesType,
} from '../../../../../shared/types'
import type {
	SelectValueType,
} from '../../../../../shared/types'
import {
	CreatebleSelectEnum,
} from '../../../../../shared/constants'
import {
	useGetEquityStocksSecurityByIsin, useGetCurrencyByIsin, useGetMarketPriceByIsin,
} from '../../../../../shared/hooks'
import * as styles from './add-orders-form.style'

interface IOrderDetailsFormProps {
	initialValues?: Partial<IOrderDetailsFormValues>;
	assetIndex: number
	length: number
	isinOptions?: Array<string>
	request: IRequestExtended
	emissionsIsins: Array<string>
	stocksIsins: Array<string>
	orderType?: OrderType
	onChange?: (values: IOrderDetailsFormValues) => void;
	onContinue: (values: IOrderDetailsFormValues) => void
	handleDeleteAsset: () => void
}

export enum FormStatus {
	DEFAULT = 'default',
	SUCCESS = 'success',
	ERROR = 'error',
}

export const OrderDetailsForm: React.FC<IOrderDetailsFormProps> = ({
	initialValues = {
	},
	assetIndex,
	length,
	isinOptions = [],
	request,
	emissionsIsins,
	stocksIsins,
	orderType = OrderType.SELL,
	onChange,
	onContinue,
	handleDeleteAsset,
},) => {
	const [isOpen, setIsOpen,] = React.useState(true,)
	const {
		mutateAsync: createIsin,
		isPending: isinAddLoading,
	} = useCreateIsin()

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
	const [currencyValue, setCurrencyValue,] = React.useState<CurrencyList | null>(null,)

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
	const pickedIsin = isinStockValue ?? isinBondsValue ?? undefined

	const {
		data: currency,
	} = useGetCurrencyByIsin(pickedIsin,)

	const {
		data: marketPrice,
	} = useGetMarketPriceByIsin(pickedIsin,)

	const {
		data: securityBonds,
	} = useGetSecurityByIsin(isinBondsValue ?? '',)
	const {
		data: securityEquity,
	} = useGetEquityStocksSecurityByIsin(isinStockValue ?? '',)
	const {
		data: portfolioIsins,
	} = useGetPortfolioIsins(orderType === OrderType.SELL && request.asset ?
		{
			id:        request.portfolioId,
			assetName:   request.asset.assetName,
		} :
		undefined,)
	const isIsinSelected = isinStockValue ?? isinBondsValue
	const {
		data: orderUnits,
	} = useGetOrderUnits(request.asset && isIsinSelected ?
		{
			assetName:   request.asset.assetName,
			portfolioId: request.portfolioId,
			isin:        isinStockValue ?? isinBondsValue ?? '',
		} :
		undefined,)
	const isinOptionsSelect = orderType === OrderType.SELL && portfolioIsins ?
		portfolioIsins.map((isin,) => {
			return {
				value: isin,
				label: isin,
			}
		},) :
		isinOptions.map((isin,) => {
			return {
				value: isin,
				label: isin,
			}
		},)

	const handleCreateIsin = async(isin : string,): Promise<void> => {
		if (currencyValue) {
			await createIsin({
				name:     isin,
				currency: currencyValue,
			},)
		}
	}

	const trashButton = assetIndex > 1 || length > 1

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

	const lastSecurityRef = React.useRef<string>(initialValues.security ?? '',)

	const securityStable = React.useMemo(() => {
		const current =
    (securityBonds as string | undefined) ??
    (securityEquity as string | undefined) ??
    (initialValues.security) ??
    ''
		if (current) {
			lastSecurityRef.current = current
		}
		return lastSecurityRef.current
	}, [securityBonds, securityEquity, initialValues.security,],)

	return (
		<div
			className={styles.orderDetails}
		>
			{!isOpen &&
				<div className={styles.orderDetailsHeader}>
					<div>
						<div className={styles.orderDetailsHeaderReq}>
							{securityBonds ?? securityEquity ?? initialValues.security ?? `Asset ${assetIndex}`}
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
						handleSubmit, form, valid, pristine, values, hasValidationErrors, touched,
					},) => {
						React.useEffect(() => {
							if (onChange) {
								onChange(values,)
							}
						}, [values,],)
						React.useEffect(() => {
							if (securityStable) {
								form.change('security', securityStable,)
							}
						}, [securityStable,],)

						React.useEffect(() => {
							if (currency?.value) {
								form.change('currency', {
									value: currency.value as CurrencyList, label: currency.label,
								},)
								setCurrencyValue(currency.value as CurrencyList,)
							}
						}, [currency?.value, currency?.label,],)

						const isMarket = values.priceType?.value === 'Market price'

						const priceTypeBoolean = Boolean(values.priceType,)

						React.useEffect(() => {
							if (isMarket && marketPrice) {
								form.change('price', marketPrice.marketPrice,)
							}
							if (isMarket && !marketPrice) {
								form.change('price', undefined,)
							}
						}, [isMarket, marketPrice,],)

						React.useEffect(() => {
							if (values.priceType?.value === 'User price') {
								form.change('price', undefined,)
							}
						}, [values.priceType,],)

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
										isCreateble
										isSearchable
										createbleStatus={CreatebleSelectEnum.ISIN}
										createFn={handleCreateIsin}
										isLoading={isinAddLoading}
									/>
								</div>
								<div className={styles.orderDetailsItem}>
									<p className={styles.orderDetailsLabel}>Security</p>
									<FormField name='security' placeholder='Enter security'
										initiaValue={String(securityBonds ?? securityEquity ?? initialValues.security ?? '',)}
										readOnly
									/>
								</div>
								<div className={styles.orderDetailsItem}>
									<p className={styles.orderDetailsLabel}>Units</p>
									<FormField name='units' placeholder='Enter units' isNumber={true} error={orderUnits && orderType === OrderType.SELL && orderUnits.units < Number(values.units,) ?
										'Units cannot exceed remaining units' :
										undefined}
									validate={(value,) => {
										if (!value) {
											return 'Units are required'
										}
										if (orderType === OrderType.SELL && orderUnits && orderUnits.units < Number(value,)) {
											return 'Units cannot exceed remaining units'
										}
										return undefined
									}}/>
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
									<SelectField<CurrencyList>
										name='currency'
										options={currencyOptions}
										placeholder='Select currency'
										isSearchable
										isDisabled={true}
									/>
								</div>
								{request.asset?.assetName === AssetNamesType.BONDS && orderType === OrderType.BUY &&
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
										disabled={!trashButton}
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