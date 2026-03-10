/* eslint-disable max-lines */
import type {
	MultiValue, SingleValue,
} from 'react-select'
import type {
	ChartData,
} from '../../modules/analytics/transactions/transactions.types'

// ----- Common types -----

const {
	VITE_INVESTMEN_ANALYST_ID,
	VITE_BACK_OFFICE_MANAGER_ID,
	VITE_FAMILY_OFFICE_MANAGER_ID,
	VITE_BOOKKEEPER_ID,
} = import.meta.env

export type PaginationResult<T> = {
	total: number
	list: Array<T>
}

export type GetListProps = {
	skip?: number
	take?: number
}

export interface IProgressBarStep {
	labelTitle: string
	labelDesc: string
}

export enum LogActionType {
   EDIT = 'Edit',
   TRANSFER = 'Transfer'
}

export const Roles = {
	INVESTMEN_ANALYST:     VITE_INVESTMEN_ANALYST_ID,
	FAMILY_OFFICE_MANAGER: VITE_FAMILY_OFFICE_MANAGER_ID,
	BACK_OFFICE_MANAGER:   VITE_BACK_OFFICE_MANAGER_ID,
	BOOKKEEPER:            VITE_BOOKKEEPER_ID,
} as const

export enum DocumentTypes {
	CLIENT = 'client',
	PORTFOLIO = 'portfolio',
	SUB_PORTFOLIO = 'sub-portfoliio',
	ENTITY = 'entity',
	ASSET = 'asset',
	REQUEST = 'request',
	TRANSACTION = 'transaction',
	REPORT = 'report',
}

export enum MetalList {
	XPT = 'XPT',
	XPD = 'XPD',
	XAG = 'XAG',
	XAU = 'XAU',
}

export enum CurrencyList {
	AED = 'AED',
	AUD = 'AUD',
	BRL = 'BRL',
	CAD = 'CAD',
	CHF = 'CHF',
	EUR = 'EUR',
	GBP = 'GBP',
	HKD = 'HKD',
	ILS = 'ILS',
	JPY = 'JPY',
	MXN = 'MXN',
	NOK = 'NOK',
	RUB = 'RUB',
	TRY = 'TRY',
	USD = 'USD',
	ZAR = 'ZAR',
	DKK = 'DKK',
	SEK = 'SEK',
	KRW = 'KRW',
	CNY = 'CNY',
	KZT = 'KZT',
}

export enum CryptoList {
	BTC = 'BTC',
	ETH = 'ETH',
}

export enum CryptoType {
	DIRECT_HOLD = 'Crypto Direct Hold',
	ETF = 'Crypto ETF',
}

export enum MetalType {
	DIRECT_HOLD = 'Metal Direct Hold',
	ETF = 'Metal ETF',
}

export enum AssetOperationType {
	BUY = 'Buy',
	SELL = 'Sell',
}

export enum IsinType {
	BOND = 'Bond',
	EQUITY = 'Equity',
	ETF = 'ETF',
}

export interface IMessage {
	message: string
}

export interface IOptionType<T = string> {
	label: string
	value: T
}

export type SelectOptionType = {
	id: string
	name: string
}

export type SelectValueType<T = string> =
	SingleValue<IOptionType<T>> |
	MultiValue<IOptionType<T>> |
	undefined

export enum SortOrder {
	ASC = 'asc',
	DESC = 'desc'
}

export type TExcelSheetType = Array<Array<string | number | Date>>

export type Client = {
	id: string
   firstName: string
   lastName: string
   residence: string
   country: string
   region: string
   city: string
   streetAddress: string
   buildingNumber: string
   postalCode: string
   emails: Array<string>
   contacts: Array<string>
   isActivated: boolean
   createdAt: string
   updatedAt: string
   files?: Array<File>
   comment?: string | null
   user?: IUserExtended | null
   totalAssets?: string
}

export type ClientDraft = {
	id?: string
   firstName?: string
   lastName?: string
   residence?: string
   country?: string
   region?: string
   city?: string
   streetAddress?: string
   buildingNumber?: string
   postalCode?: string
   emails?: Array<string>
   contacts?: Array<string>
   isActivated?: boolean
   createdAt?: string
   updatedAt?: string
   files?: Array<File>
   comment?: string | null
   user?: IUserExtended | null
   totalAssets?: string
}

// ----- Analytics types -----

export type TAnalyticsChartData<T extends string | number = string> = {
	id?: string
	name: T
	value: number
	diff?: number
	productType?: CryptoType | MetalType
}

export type TAnalyticsTableData<T extends string | number = string> = {
	id?: string
	currency: T
	currencyValue: number
	usdValue: number
}

// ----- Auth types -----

export type TSignInProps = {
	accessToken: string
}

export type TCheckReturn = {
   auth: boolean
}

// ----- User types -----

export type IUser = {
	id: string
	clientId: string
	emailId: string
	username?: string | null
	avatar?: string | null
	roles: Array<string>
	createdAt: string
	updatedAt: string
}

export type IUserExtended = {
	client?: Email | null
	email?: Email | null
}

export type Email = {
	id: string
	clientId: string
	email: string
	token?: string | null
	isConfirmed: boolean
	createdAt: string
}

export type TAddUserProps = Partial<IUser>

export type TEditUserProps = Partial<IUser>

export type GetUserListProps = {
	skip: number
	take: number
}

// ----- Document types -----

export enum DocumentStatus {
	PENDING = 'PENDING',
	APPROVED = 'APPROVED',
	DECLINED = 'DECLINED',
}

export interface IDocument {
	id: string
	clientId?: string | null
	clientDraftId?: string | null
	portfolioId?: string | null
	portfolioDraftId?: string | null
	entityId?: string | null
	assetId?: string | null
	requestId?: string | null
	requestDraftId?: string | null
	transactionId?: string | null
	transactionDraftId?: string | null
	name: string
	type: string
	status: DocumentStatus
	format: string
	size: number
	comment?: string | null
	storageName: string
	preview: string
	createdAt: string
	updatedAt: string
}

export interface IDocumentExtended extends IDocument {
	client?: Client | null
	clientDraft?: ClientDraft | null
	portfolio?: IPortfolio | null
	portfolioDraft?: IPortfolio | null
	entity?: IEntity | null
	asset?: IAsset | null
	request?: IRequest | null
	requestDraft?: IRequestDraft | null
	transaction?: ITransaction | null
	transactionDraft?: ITransaction | null
}

export interface IPortfolioDetailsDocumentExtended extends IDocumentExtended {
	assetName?: string
	entityName?: string
}

// ----- List-hub types -----

export interface IFilterSelectBySourceIds {
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entityIds?: Array<string>
	bankIds?: Array<string>
	bankListIds?: Array<string>
	accountIds?: Array<string>
	metalProductType?: MetalType
	cryptoProductType?: CryptoType
}

export interface IListHubItemBody {
   name: string
	isinType?: IsinType
}

export interface IIsinCreateItemBody {
   name: string
	currency: CurrencyList
	isinType?: IsinType
}

export interface INewExpenseCategoryBody extends IListHubItemBody {
   clientId: string
}

export interface IListHubItemResponse {
   id: string
   name: string
   createdAt: string
   updatedAt: string
}

export interface ISelectListHubItemResponse {
	value: string
	label: string
}

export interface ITransactionListHubItemResponse {
   id: string
	name: string
	category: ITransactionTypeCategory
	pl: string
	cashFlow: string
	relatedTypeId?: string
	asset?: string
   createdAt: string
	updatedAt: string
}

export interface IPortfolioIsinsFilter {
	id: string
	assetName: AssetNamesType
}

// ----- Portfolio types ----

export enum PortfolioType {
	CORPORATE = 'corporate',
	JOINT = 'joint',
	PRIVATE = 'private',
 }

export interface IPortfolio {
	id: string;
	clientId: string;
	name: string;
	type: PortfolioType
	resident?: string | null;
	taxResident?: string | null;
	isActivated?: boolean
	createdAt: string;
	updatedAt: string;
	mainPortfolioId: string | null
	accounts: Array<IAccount>
	banks: Array<IBank>
	entities: Array<IEntity>
	documents: Array<IDocument>
	assets?: Array<IAsset>
	totalAssets?: number
 }

export interface IPortfolioDetailed extends IPortfolio {
	accounts: Array<IAccount>
	banks: Array<IBank>
	entities: Array<IEntity>
	documents: Array<IDocument>
	assets: Array<IAsset>
	assetsAmount: number
	client: {
		lastName: string
		firstName: string
	}
 }

// ----- Entity types -----

export type IEntity = {
   id: string
   portfolioId?: string | null
   portfolioDraftId?: string | null
   name: string
   country: string
   authorizedSignatoryName: string
   firstName?: string | null
   lastName?: string | null
   email?: string | null
   totalAssets?: number
   createdAt: string
   updatedAt: string
}

export type IEntityExtended = {
	portfolio?: IPortfolio | null
	portfolioDraft?: IPortfolio | null
	banks?: Array<IBank>
	accounts?: Array<IAccount>
	assets?: Array<IAsset>
	requests?: Array<IRequest>
	requestDrafts?: Array<IRequestDraft>
	documents?: Array<IDocument>
}

export type TAddEntityProps = Omit<IEntity,
	'id' |
	'createdAt' |
	'updatedAt'
>

export type TEditEntityProps = Partial<Omit<IEntity,
	'portfolioDraftId' |
	'portfolioId' |
	'createdAt' |
	'updatedAt'
>>

// ----- Bank types -----

export type IBank = {
   id: string
   portfolioId?: string | null
   portfolioDraftId?: string | null
   entityId: string
   clientId: string
	bankName: string
	bankListId: string | null
   country: string
   branchName: string
   firstName?: string | null
   lastName?: string | null
   email?: string | null
   totalAssets?: number
   createdAt: string
   updatedAt: string
}

export type IBankExtended = {
	portfolio?: IPortfolio | null
	portfolioDraft?: IPortfolio | null
	entity?: IEntity
	accounts?: Array<IAccount>
	assets?: Array<IAsset>
	bankList?: IListHubItemResponse | null
}

export type TAddBankProps = Omit<IBank, 'id' | 'createdAt' | 'updatedAt'>
export type TEditBankProps = Partial<Omit<IBank, 'portfolioDraftId'
	| 'portfolioId'
	| 'entityId'
	|	'createdAt'
	| 'updatedAt'
>>

// ----- Account types -----
type AccountsTotalTransactions = Record<CurrencyList, number>

export interface IAccount {
   id: string
   portfolioId?: string | null
   portfolioDraftId?: string | null
   entityId: string
   bankId: string
   accountName: string
   managementFee: string
   holdFee: string
   sellFee: string
   buyFee: string
   description?: string | null
	dataCreated?: string | null
	iban?: string | null
	accountNumber?: string | null
   comment?: string | null
   totalAssets?: number
	accountsTotalTransactions?: number
	accountsCurrencyTotals?: AccountsTotalTransactions
	assetsWithTotalAssetsValue?: Array<{assetName: AssetNamesType,totalAssets: number,portfolioId: string,entityId: string,bankId: string,accountId: string, currency?: CurrencyList}>
   createdAt: string
   updatedAt: string
}

export type IAccountExtended = IAccount & {
	portfolio?: IPortfolio | null
	portfolioDraft?: IPortfolio | null
	entity?: IEntity
	bank?: IBank
	assets?: Array<IAsset>
	requests?: Array<IRequest>
	requestDrafts?: Array<IRequestDraft>
	transactions?: Array<ITransaction>
	transactionDrafts?: Array<ITransaction>
}

export type TAddAccountProps = Omit<IAccount, 'id'
   | 'portfolio'
   | 'entity'
   | 'bank'
   | 'createdAt'
	| 'updatedAt'>

export type TEditAccountProps = Partial<Omit<IAccount, 'portfolioDraftId'
	| 'portfolioId'
	| 'entityId'
	| 'bankId'
	| 'entity'
	| 'bank'
	| 'portfolio'
	| 'createdAt'
	| 'updatedAt'
>>

// ----- Asset types -----

export const enum AssetNamesType {
   BONDS = 'Bonds',
   CASH = 'Cash',
	CASH_DEPOSIT = 'Deposit',
	COLLATERAL = 'Collateral',
   CRYPTO = 'Crypto',
	EQUITY_ASSET = 'Equity asset',
	OTHER = 'Other investments',
   METALS = 'Metals',
	OPTIONS = 'Options',
	PRIVATE_EQUITY = 'Private equity',
   REAL_ESTATE = 'Real estate',
	LOAN = 'Loan'
}

export enum PrivateEquityStatusEnum {
	CLOSED = 'Closed',
	OPEN = 'Open',
}

export interface IOtherInvestmentsSelects {
	serviceProviders: Array<string>
	investmentAssetNames: Array<string>
}

export type TAssetSelectItem = {
  label: string
  value: {
    id: string
    name: string
  }
}

export interface IAsset {
	id: string
	portfolioId?: string | null
	portfolioDraftId?: string | null
	entityId: string
	bankId: string
	bankListId?: string
	clientId: string
	accountId: string
	assetName: AssetNamesType
	payload: string
	totalAssets?: number
	currency?: CurrencyList
	createdAt: string
	updatedAt: string
	assetMainId?: string
	mainAssetId?: string
	groupId?: string
	totalUnitsToTransfer?: number
}

export interface IAssetWithRelationsDecrypted extends IAsset {
	portfolio: { name: string }
	entity: { name: string }
	bank: { bankName: string }
	account: { accountName: string }
}

export interface IAssetExtended extends IAsset {
	portfolio?: IPortfolio | null
	portfolioDraft?: IPortfolio | null
	entity?: IEntity | null
	bank?: IBank | null
	account?: IAccount | null
	documents?: Array<IDocument>
}

export type TAssetCreateBody = Omit<IAsset, 'id' |
	'createdAt' |
	'updatedAt' |
	'mainPortfolioId'
>

export type TEditAssetProps = Partial<Omit<IAsset,
	'mainPortfolioId' |
	'portfolioDraftId' |
	'portfolioId' |
	'entityId' |
	'bankId' |
	'accountId' |
	'createdAt' |
	'updatedAt'
>> & {
  isVersion?: boolean
  userInfo: {
		name: string
		email: string | null
		reason: string
	}
}

export type TAssetGetTotalUnits = {
	assetName: string
	currency: CurrencyList
	isin?: string
	accountId: string
	metalType?: MetalList
}

export type TDeleteRefactoredAssetPayload = {
	assetName: AssetNamesType
	id: string
	userInfo: {
		name: string
		email: string | null
		reason: string
	}
}

export type TAssetTransfer = {
	id: string
	clientId: string
	portfolioId: string
	entityId: string
	bankId: string
	accountId: string
	isin: string
	assetName: string
	isVersion?: boolean
	security?: string
	units?: string
	totalUnitsToTransfer?: number
}

export type TAssetTransferRequest = Omit<TAssetTransfer, 'isin' | 'assetName' | 'security' | 'units'>

// ----- Request types -----

export enum RequestType {
	SELL= 'Sell',
	BUY = 'Buy',
	DEPOSIT = 'Deposit',
	OTHER= 'Other'
}

export enum RequestStatusType {
	NOT_STARTED = 'Not started',
	IN_PROGRESS = 'In progress',
	SENT_TO_CLIENT = 'Sent to client',
	SIGNED = 'Signed',
	CANCELED = 'Canceled',
	APPROVED = 'Approved'
}

export interface IRequest {
	id: number
	type: RequestType
	clientId: string
	accountId: string
	portfolioId: string
	bankId: string
	entityId: string
	status: RequestStatusType
	amount: string | null
   assetId: string | null
   comment: string | null
	createdAt: string
	updatedAt: string
}

export interface IRequestExtended extends IRequest {
	client?: Client | null
	portfolio?: IPortfolio | null
	entity?: IEntity | null
	bank?: IBank | null
	account?: IAccount | null
	asset?: IAsset | null
	documents?: Array<IDocument>
}

export interface IRequestDraft {
	id: number
	type: RequestType
	clientId?: string
	portfolioId?: string
	entityId?: string
	bankId?: string
	accountId?: string
	assetId?: string | null
	amount?: string
   comment?: string | null
	createdAt: string
	updatedAt: string
	assetName?: string
}

export interface IRequestDraftExtended extends IRequestDraft {
	client?: Client | null
	portfolio?: IPortfolio | null
	entity?: IEntity | null
	bank?: IBank | null
	account?: IAccount | null
	asset?: IAsset | null
	documents?: Array<IDocument>
}

export type TAddRequestProps = Omit<IRequest,
	'id' |
	'createdAt' |
	'updatedAt' |
	'amount' |
	'assetId' |
	'comment' |
	'status'
	> & {
	comment?: string | null
	amount?: string
   assetId?: string
	requestDraftId?: number
	assetName?: string
}

export type TEditRequestProps = Partial<TAddRequestProps> & {
	status?: RequestStatusType
	assetName?: string
	id: number
}

export type TUpdateRequestStatusProps = Pick<IRequest, 'status' | 'id'>

export type TAddRequestDraftProps = Omit<IRequestDraft,
	'id' |
	'status' |
	'createdAt' |
	'updatedAt'
>

export type TEditRequestDraftProps = TAddRequestDraftProps & {
	id: number
}

export type TRequestListRes = PaginationResult<IRequestExtended>

export type TRequestFilter = {
	sortBy?: keyof Pick<IRequest, 'id' | 'updatedAt'> | undefined
	sortOrder?: SortOrder | undefined
	search?: string
	type?: RequestType
	clientIds?: Array<string> | undefined
	portfolioIds?: Array<string>
	entityIds?: Array<string>
	bankIds?: Array<string>
	bankListIds?: Array<string>
	accountsIds?: Array<string>
	statuses?: Array<RequestStatusType>
}

// ----- Order types -----

export interface IOrder {
   id: number;
   type: OrderType;
   status: OrderStatus;
   createdAt: string;
   updatedAt: string;
	details: Array<IOrderDetail>;
	requestId?: number;
	portfolioId?: string;
	request?: IRequestExtended | null;
	portfolio?: IPortfolio | null;
	cashValue?: number
}

export type TOrderFilter = {
	sortBy?: keyof Pick<IOrder, 'id' | 'updatedAt'> | undefined
	sortOrder?: SortOrder | undefined
	search?: string
	type?: OrderType
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entityIds?: Array<string>
	bankIds?: Array<string>
	bankListIds?: Array<string>
	accountIds?: Array<string>
	isins?: Array<string>
	securities?: Array<string>
	statuses?: Array<OrderStatus>
}

export interface ICreateOrder {
   type: OrderType;
   details: Array<ICreateOrderDetail>;
}

export interface IOrderDetail {
   id?: string;
   orderId: string;
   security: string;
   isin: string;
	units: string;
	priceType: string
   price: string;
   currency: string;
   unitExecuted?: string;
	priceExecuted?: string;
	yield?: string
   createdAt: string;
   updatedAt: string;
}

export type ICreateOrderDetail = Omit<
    IOrderDetail,
    'id' | 'orderId' | 'createdAt' | 'updatedAt'
	>

export interface IOrderDetailForm {
   id?: string
   security: string
   isin: string
	units: string
	priceType: string
   price: string
   currency: string
   unitExecuted?: string
	priceExecuted?: string
	yield?: string
}

export type IEditOrderDetail = Omit<
    IOrderDetail,
    'orderId' | 'createdAt' | 'updatedAt'
>

export interface IOrderDraft {
   id?: number;
   type?: OrderType;
   createdAt?: string;
   updatedAt?: string;
	details?: Array<IOrderDraftDetail>;
	requestId?: number;
	portfolioId?: string;
	request?: IRequest | null;
	portfolio?: IPortfolio | null;
	status?: OrderStatus;
}

export interface IOrderDraftDetail {
   id?: string;
   orderDraftId?: string;
   security?: string;
   isin?: string;
	units?: string;
	priceType?: string
   price?: string;
   currency?: string;
	unitExecuted?: string;
	priceExecuted?: string;
	yield?: string
   createdAt?: string;
	updatedAt?: string;
}

export interface IAddOrderProps {
	type: OrderType;
	requestId?: number;
	portfolioId?: string;
   details: Array<Omit<IOrderDetail, 'id' | 'orderId' | 'createdAt' | 'updatedAt'>>;
}

export interface IEditOrderProps {
   type: OrderType;
	requestId?: number;
	portfolioId?: string;
   details: Array<Omit<IOrderDetail, 'orderId' | 'createdAt' | 'updatedAt'>>;
}

export interface ITOrderListRes {
   total: number;
   list: Array<IOrder>;
}

export interface IOrderUnits {
   units: number;
}

export enum OrderType {
    BUY = 'Buy',
    SELL = 'Sell',
}

export enum OrderStatus {
    IN_PROGRESS = 'In progress',
    APPROVED = 'Approved',
    CANCELED = 'Canceled',
}

export interface IOrderUnitsFilter {
   assetName: AssetNamesType;
   portfolioId: string;
   isin: string;
}

// ----- Transaction types -----
export enum TransactionCashFlow {
	INFLOW = 'Inflow',
	OUTFLOW = 'Outflow'
}

export enum PlType {
	P = 'P',
	L = 'L',
	N = ''
}

export interface ITransactionTypeCategory {
   id?: string
	name?: string
	isDeleted?: boolean
   createdAt?: string
   updatedAt?: string
}

export interface ITransactionTypeVersion{
	id?: string
	name?: string
   cashFlow?: TransactionCashFlow
	pl?: string | null
   comment?: string | null
	annualAssets?: Array<string>
	categoryId?: string | null
	categoryType?: ITransactionTypeCategory
}

export interface ITransactionType {
	id?: string
   category?: string | null
   createdAt?: string
   updatedAt?: string
	relatedTypeId?: string | null
	relatedType?: ITransactionType
	assetId?: string | null
	asset?: string

	isActivated?: boolean
	versions: Array<ITransactionTypeVersion>
}

export interface IOldTransactionType {
   id?: string
   name?: string
   category?: string | null
   cashFlow?: TransactionCashFlow
   pl?: string | null
   createdAt?: string
   updatedAt?: string
   comment?: string | null
	relatedTypeId?: string | null
	assetId?: string | null
	asset?: string
	categoryId?: string | null
	categoryType?: ITransactionTypeCategory
	isActivated?: boolean
	annualAssets?: Array<string>
}

export enum TransactionTypeAuditType {
	ADDED = 'Added',
	EDITED = 'Edited',
	RELATION = 'Relation',
	DELETED = 'Deleted',
	RESTORED = 'Restored',
	ARCHIVED = 'Archived'
}

export type TAddTransactionType = Omit<IOldTransactionType,
	'id' |
	'createdAt' |
	'updatedAt' |
	'relatedType' |
	'relatedTypeId' |
	'asset' |
	'categoryType'& {
		draftId?: string
		userName?: string
		userRole?: string
	}
>

export enum TransactionTypeSortBy {
  NAME = 'name',
  CATEGORY_ID = 'categoryId',
  CASH_FLOW = 'cashFlow',
  PL = 'pl',
  RELATED_TYPE_ID = 'relatedTypeId',
  ASSET = 'asset',
}

export type TransactionTypeFilter = {
	sortBy?: TransactionTypeSortBy
	sortOrder?: 'asc' | 'desc'
	search?: string
   assets?: Array<string>
	categoryIds?: Array<string>
	cashFlows?: Array<TransactionCashFlow>
	pls?: Array<PlType>
	isActivated?: boolean
	isDeactivated?: boolean
}

export type TRelationsResponse = {
  id: string
  relatedType: { value: string; label: string } | null
  asset: { value: string; label: string } | null
}

export type TChangeRelationsBody = {
  relatedTypeId?: string | null
  asset?: string | null
  userName: string
  userRole: string
}

export interface ITransactionTypeAuditTrail {
	id: string
	userName: string | null
	userRole: string | null
	settingsType: TransactionTypeAuditType
	transactionTypeNameFrom?: string | null
	transactionTypeNameTo?: string | null
	transactionTypeCategoryFrom?: string | null
	transactionTypeCategoryTo?: string | null
	transactionTypeCashflowFrom?: string | null
	transactionTypeCashflowTo?: string | null
	transactionTypePlFrom?: string | null
	transactionTypePlTo?: string | null
	transactionTypeAnnualFrom: Array<string>
	transactionTypeAnnualTo: Array<string>
	transactionTypeCommentFrom?: string | null
	transactionTypeCommentTo?: string | null
	transactionTypeRelatedTypeFrom?: string | null
	transactionTypeRelatedTypeTo?: string | null
	transactionTypeRelatedAssetFrom?: string | null
	transactionTypeRelatedAssetTo?: string | null
	transactionTypeId?: string | null
	transactionType?: ITransactionType
	createdAt: string
	updatedAt: string
}

export type TAuditTrailFilter = {
	search?: string
	settingsType?: Array<TransactionTypeAuditType>
	userName?: Array<string>
	editCards?: boolean
}

export interface ITransaction {
   id: number
	transactionTypeId?: string
	transactionType?: ITransactionType
	typeVersion?: ITransactionTypeVersion
	expenseCategory?: IExpenseCategory | null
   clientId?: string
	client?: Client | null
	portfolioId?: string
   portfolio?: IPortfolio | null
   accountId?: string
	account?: IAccount | null
	entityId?: string
   entity?: IEntity | null
   bankId?: string
	bank?: IBank | null
	orderId?: number | null
	order?: IOrder | null
	isin?: string | null
	security?: string | null
	serviceProvider?: string
   currency?: string
   amount?: number
	rate?: number
	usdValue?: number
   transactionDate?: Date | string
   comment?: string | null
   customFields?: string
   documents?: Array<IDocument> | null
   createdAt: string
	updatedAt: string
}

export type TAddTransactionProps = Omit<ITransaction,
	'id' |
	'account' |
	'client' |
	'portfolio' |
	'bank' |
	'request' |
	'order' |
	'createdAt' |
	'updatedAt'
	> & {
	transactionDraftId?: number
	orderId?: number | undefined | null;
}

export type TEditTransactionProps = Partial<TAddTransactionProps> & {
	id: number
	assetId?: string
	assetName?: string
}

export type TAddTransactionDraftProps = Omit<ITransaction,
	'id' |
	'createdAt' |
	'updatedAt'
	>

export type TransactionAnalytics = {
	id: number
	transactionDate?: Date
	portfolioName?: string
	bankName?: string
	accountName?: string
	entityName?: string
	transactionType?: ITransactionListHubItemResponse | null
	typeVersion?: ITransactionTypeVersion
	currency?: string
	amount?: number,
	usdValue?: number
	isin?: string
	security?: string
	serviceProvider?: string
	comment?: string
}

export type TransactionPl = {
	total: number
	totalUsdValue: number
	totalCurrencyValue: number
	isins: Array<string>
	securities: Array<string>
	chartData: Array<ChartData>
	oldestDate: string | null
}

export type TransactionListAnalyticsRes = PaginationResult<TransactionAnalytics>

export type TransactionListRes = PaginationResult<ITransaction>

export type TransactionSortKey = 'id' | 'amount' | 'transactionDate'

export interface ITransactionFilteredSelects {
	serviceProviders: Array<ISelectListHubItemResponse>
	isins: Array<string>
	securities: Array<string>
	transactionNames: Array<ITransactionListHubItemResponse>
}

export type OperationTransactionFilter = {
	sortBy?: keyof Pick<ITransaction, TransactionSortKey> | undefined
	sortOrder?: SortOrder | undefined
	search?: string
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entityIds?: Array<string>
	bankIds?: Array<string>
	bankListIds?: Array<string>
	accountIds?: Array<string>
	transactionNames?: Array<string>
	currencies?: Array<string>
	skip?: number
	take?: number
	transactionTypes?: Array<string>
	isins?: Array<string>
	securities?: Array<string>
	dateRange?: [Date | null | string, Date | null | string] | undefined
	isError?: boolean
	transactionIds?: Array<number>
}

export type OperationTransactionFilterRequest = {
	sortBy?: keyof Pick<ITransaction, TransactionSortKey>
	sortOrder?: SortOrder
	search?: string
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entityIds?: Array<string>
	bankIds?: Array<string>
	bankListIds?: Array<string>
	accountIds?: Array<string>
	transactionNames?: Array<string>
	currencies?: Array<string>
	skip?: number
	take?: number
	transactionTypes?: Array<string>
	isins?: Array<string>
	securities?: Array<string>
	dateRange?: [string | null, string | null] | undefined
	isError?: boolean
	serviceProviders?: Array<string>
	date?: string | undefined
}

export enum TTransactionTableSortVariants {
	AMOUNT = 'amount',
	ID = 'id',
	TRANSACTION_DATE = 'transactionDate',
	ISIN = 'isin',
	SECURITY = 'security',
	USD_VALUE = 'usdValue',
}

export type BudgetTransactionFilter = {
	clientId: string
	sortBy: TTransactionTableSortVariants
	sortOrder: SortOrder
	search?: string
}

export type TransactionCurrencyTotals = {
	accountId: string
	currency: string
}

export interface IBudgetTransaction extends ITransaction {
	transactionType: ITransactionType
	usdAmount: number
}

export interface IMetalAsset {
	id: string
	currency: MetalList
	rate: number
	createdAt: string
    updatedAt: string
}

// ----- Report types -----

export enum ReportType {
	CUSTOMER = 'Customer',
	INTERNAL = 'Internal'
}

export enum ReportCategory {
	BOND = 'Bond',
	CUSTOM = 'Custom',
	STATEMENT = 'Statement',
	STOCK = 'Stock',
}

export interface IReport {
	id: number
	type: ReportType
	category: ReportCategory
	clientId: string | null
	portfolioId: string | null
	isins: Array<string>
	name: string
	payload?: string
	createdBy: string | null
	createdAt: string
	updatedAt: string
}

export interface IReportDraft {
	id: number
	type: ReportType
	category: ReportCategory.CUSTOM
	clientId: string | null
	portfolioId: string | null
	isins: Array<string>
	name: string
	payload?: string
	createdBy: string | null
	createdAt: string
	updatedAt: string
}

export interface IReportExtended extends IReport {
	client?: Partial<Client> | null
	portfolio?: Partial<IPortfolio> | null
	documents: Array<IDocument>
}

export interface IReportDraftExtended extends IReportDraft {
	client?: Partial<Client> | null
	portfolio?: Partial<IPortfolio> | null
	documents: Array<IDocument>
}

export type TReportListRes = PaginationResult<IReport>

// ----- Budget types -----

export interface IBudgetPlan {
	id: string
	clientId: string
	name: string
	isActivated: boolean
	clientName: string
	totalBanks: number
	totalManage: number
	allocations: Array<IBudgetAllocation>
	client: Client
	budgetPlanBankAccounts?: Array<IBudgetPlanBankAccount>
}

export interface IBudgetAllocationCreateBody {
	budgetPlanId: string
	amount: number
	budget: number
	currency: CurrencyList
	accountId: string
}

export interface IBudgetDraftAllocationCreateBody {
	budgetPlanDraftId: string
	amount: number
	budget: number
	currency: CurrencyList
	accountId: string
}

export interface IBudgetPlanBankAccount {
	accountId: string
	account: IAccount
	bankId: string
	bank: IBank
	id: string
	budgetPlanId?: string
	budgetPlanDraftId?: string
}
export interface IBudgetDraft {
	id: string
	name: string
	clientId: string
	amount?: number
	allocations?: Array<IBudgetDraftAllocation>
	budgetPlanBankAccounts?: Array<IBudgetPlanBankAccount>
	createdAt: string
	updatedAt: string
	client: Client
	totalUSD?: number
	totalBanks?: number
}

export interface IBudgetAllocation extends IBudgetAllocationCreateBody{
	id: string
}

export interface IBudgetDraftAllocation extends IBudgetDraftAllocationCreateBody{
	id: string
}

export interface IExpenseCategoryTransactionType {
	id: string
	name: string
}

export interface IExpenseCategory {
	id:string
	budget: number
	name: string
	budgetPlanId: string
	available: number
	createdAt: string
	updatedAt: string
	transactionTypes: Array<IExpenseCategoryTransactionType>
	transactions: Array<IBudgetTransaction>
}
