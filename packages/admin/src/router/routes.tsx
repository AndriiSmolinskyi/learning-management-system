import * as React from 'react'
import {
	Navigate,
	Outlet,
	Route,
} from 'react-router-dom'

import {
	RouterKeys,
} from './keys'

const Auth = React.lazy(async() => {
	return import('../modules/auth/auth.component')
},)
const AnalyticsLayout = React.lazy(async() => {
	return import('../modules/analytics/layout')
},)
const PagesLayout = React.lazy(async() => {
	return import('../shared/components/pages-layout')
},)
const AnalyticsOverview = React.lazy(async() => {
	return import('../modules/analytics/overview')
},)
const AnalyticsCash = React.lazy(async() => {
	return import('../modules/analytics/cash')
},)
const AnalyticsDeposit = React.lazy(async() => {
	return import('../modules/analytics/deposit')
},)
const AnalyticsBonds = React.lazy(async() => {
	return import('../modules/analytics/bonds')
},)
const AnalyticsOptions = React.lazy(async() => {
	return import('../modules/analytics/options')
},)
const AnalyticsLoan = React.lazy(async() => {
	return import('../modules/analytics/loan')
},)
const AnalyticsEquities = React.lazy(async() => {
	return import('../modules/analytics/equities')
},)
const AnalyticsMetals = React.lazy(async() => {
	return import('../modules/analytics/metals')
},)
const AnalyticsPrivateEquity = React.lazy(async() => {
	return import('../modules/analytics/private-equity')
},)
const AnalyticsCrypto = React.lazy(async() => {
	return import('../modules/analytics/crypto')
},)
const AnalyticsRealEstate = React.lazy(async() => {
	return import('../modules/analytics/real-estate')
},)
const AnalyticsOtherInvestments = React.lazy(async() => {
	return import('../modules/analytics/other-investments')
},)
const AnalyticsTransactions = React.lazy(async() => {
	return import('../modules/analytics/transactions')
},)
const ComplianceCheck = React.lazy(async() => {
	return import('../modules/clients/client-profiles/compliance-check/compliance-check.component')
},)
const ClientDetail = React.lazy(async() => {
	return import('../modules/clients/client-profiles/client-details/components/client-details/client-detail.component')
},)
const Clients = React.lazy(async() => {
	return import('../modules/clients/client-profiles/clients/clients.component')
},)
const Portfolio = React.lazy(async() => {
	return import('../modules/clients/portfolios/portfolio/portfolio.component')
},)
const PortfolioDetails = React.lazy(async() => {
	return import('../modules/clients/portfolios/portfolio-details/portfolio-details.component')
},)
const PortfolioLayout = React.lazy(async() => {
	return import('../shared/components/portfolio-layout/portfolio-layout.component')
},)
const OperationsLayout = React.lazy(async() => {
	return import('../modules/operations/layout')
},)
const Requests = React.lazy(async() => {
	return import('../modules/operations/requests')
},)
const Orders = React.lazy(async() => {
	return import('../modules/operations/orders')
},)
const Transactions = React.lazy(async() => {
	return import('../modules/operations/transactions')
},)
const BudgetPage = React.lazy(async() => {
	return import('../modules/budgets/budget/budget.component')
},)
const BudgetDetailsPage = React.lazy(async() => {
	return import('../modules/budgets/budget-details/budget-details.component')
},)
const Reports = React.lazy(async() => {
	return import('../modules/reports/reports-list')
},)
const CustomReport = React.lazy(async() => {
	return import('../modules/reports/custom-report')
},)
const TestList = React.lazy(async() => {
	return import('../modules/clients/portfolios/portfolio-details/components/sub-items-list/test-list.component')
},)
const TransactionSettings = React.lazy(async() => {
	return import('../modules/settings/transactions/transactions.component')
},)
const SettingsLayout = React.lazy(async() => {
	return import('../modules/settings/layout/settings-layout.component')
},)

export const publicRoutes = (
	<>
		<Route path={RouterKeys.AUTH} element={<Auth />}/>
		<Route path={RouterKeys.ALL_MATCH} element={<Navigate to={RouterKeys.AUTH} />} />
	</>
)

export const privateRoutes = (
	<Route element={<PagesLayout/>}>
		<Route element={<AnalyticsLayout />}>
			<Route path={RouterKeys.ANALYTICS_OVERVIEW} element={<AnalyticsOverview />}/>
			<Route path={RouterKeys.ANALYTICS_CASH} element={<AnalyticsCash />}/>
			<Route path={RouterKeys.ANALYTICS_DEPOSIT} element={<AnalyticsDeposit />}/>
			<Route path={RouterKeys.ANALYTICS_BONDS} element={<AnalyticsBonds />}/>
			<Route path={RouterKeys.ANALYTICS_OPTIONS} element={<AnalyticsOptions />}/>
			<Route path={RouterKeys.ANALYTICS_LOAN} element={<AnalyticsLoan />}/>
			<Route path={RouterKeys.ANALYTICS_EQUITIES} element={<AnalyticsEquities />}/>
			<Route path={RouterKeys.ANALYTICS_METALS} element={<AnalyticsMetals />}/>
			<Route path={RouterKeys.ANALYTICS_PRIVATE_EQUITY} element={<AnalyticsPrivateEquity />}/>
			<Route path={RouterKeys.ANALYTICS_CRYPTO} element={<AnalyticsCrypto />}/>
			<Route path={RouterKeys.ANALYTICS_REAL_ESTATE} element={<AnalyticsRealEstate />}/>
			<Route path={RouterKeys.ANALYTICS_OTHER_INVESTMENTS} element={<AnalyticsOtherInvestments />}/>
			<Route path={RouterKeys.ANALYTICS_TRANSACTIONS} element={<AnalyticsTransactions />}/>
		</Route>
		<Route path={RouterKeys.CLIENTS} element={<Outlet />} >
			<Route index element={<Clients />} />
			<Route path={RouterKeys.ID} element={<Outlet />}>
				<Route index element={<ClientDetail />} />
				<Route path={RouterKeys.COMPLIANCE_CHECK} element={<ComplianceCheck />} />
			</Route>
		</Route>
		<Route path={RouterKeys.PORTFOLIO} element={<PortfolioLayout />} >
			<Route index element={<Portfolio />} />
			<Route path={RouterKeys.ID} element={<Outlet />}>
				<Route index element={<PortfolioDetails />} />
				<Route path={`${RouterKeys.SUB_PORTFOLIO}/:subportfolioId`} element={<PortfolioDetails />} />
			</Route>
		</Route>
		<Route element={<OperationsLayout/>}>
			<Route path={RouterKeys.REQUESTS} element={<Requests />}/>
			<Route path={RouterKeys.ORDERS} element={<Orders />} />
			<Route path={RouterKeys.TRANSACTIONS} element={<Transactions />} />
		</Route>
		<Route element={<SettingsLayout/>}>
			<Route path={RouterKeys.SETTINGS_TRANSACTIONS} element={<TransactionSettings />}/>
		</Route>
		<Route path={RouterKeys.BUDGET_MANAGMENT} element={<Outlet />} >
			<Route index element={<BudgetPage />} />
			<Route path={RouterKeys.ID} element={<Outlet />}>
				<Route index element={<BudgetDetailsPage />} />
			</Route>
		</Route>
		<Route path={RouterKeys.REPORTS} element={<Outlet />} >
			<Route index element={<Reports />} />
			<Route path={RouterKeys.CUSTOM_REPORT} element={<CustomReport />} />
		</Route>
		<Route path={RouterKeys.ALL_MATCH} element={<Navigate to={RouterKeys.ANALYTICS_OVERVIEW} />} />
		<Route path={RouterKeys.TEST} >
			<Route index element={<TestList />} />
			<Route path={RouterKeys.TEST} element={<TestList />} />
		</Route>
	</Route>
)
