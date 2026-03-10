export class RouterKeys {
	public static ALL_MATCH = '/*'

	public static ROOT = '/'

	public static ID = ':id'

	public static AUTH = '/auth'

	public static CLIENTS = '/clients'

	public static PORTFOLIO = '/portfolio'

	public static SUB_PORTFOLIO = 'sub-portfolio'

	public static COMPLIANCE_CHECK = 'compliance-check'

	public static OPERATIONS = '/operations'

	public static REQUESTS = `${this.OPERATIONS}/requests`

	public static ORDERS = `${this.OPERATIONS}/orders`

	public static TRANSACTIONS = `${this.OPERATIONS}/transactions`

	public static PAYMENTS = '/payments'

	public static REPORTS = '/reports'

	public static CUSTOM_REPORT = `custom`

	public static DOCUMENTS = '/documents'

	public static BUDGET_MANAGMENT = '/budget'

	public static ANALYTICS = '/analytics'

	public static ANALYTICS_OVERVIEW = `${this.ANALYTICS}/overview`

	public static ANALYTICS_CASH = `${this.ANALYTICS}/cash`

	public static ANALYTICS_DEPOSIT = `${this.ANALYTICS}/deposit`

	public static ANALYTICS_BONDS = `${this.ANALYTICS}/bonds`

	public static ANALYTICS_OPTIONS = `${this.ANALYTICS}/options`

	public static ANALYTICS_LOAN = `${this.ANALYTICS}/loan`

	public static ANALYTICS_EQUITIES = `${this.ANALYTICS}/equities`

	public static ANALYTICS_METALS = `${this.ANALYTICS}/metals`

	public static ANALYTICS_PRIVATE_EQUITY = `${this.ANALYTICS}/private-equity`

	public static ANALYTICS_CRYPTO = `${this.ANALYTICS}/crypto`

	public static ANALYTICS_REAL_ESTATE = `${this.ANALYTICS}/real-estate`

	public static ANALYTICS_OTHER_INVESTMENTS = `${this.ANALYTICS}/other-investments`

	public static ANALYTICS_TRANSACTIONS = `${this.ANALYTICS}/transactions`

	public static TEST = '/test'

	public static SETTINGS = 'settings'

	public static SETTINGS_TRANSACTIONS = `${this.SETTINGS}/transactions`
}