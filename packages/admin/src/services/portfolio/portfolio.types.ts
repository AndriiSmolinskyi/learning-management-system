export enum PortfolioChartFilterEnum {
	ENTITY = 'Entity',
	BANK = 'Bank',
	ASSET = 'Asset',
}

export interface IPortfolioCreateBody {
    mainPortfolioId?: string
    clientId: string
    name: string;
    type: string;
    resident?: string;
    taxResident?: string;
}

export interface IPortfolioActivate {
  id: string
  isActivated?: boolean
  name?: string
  type?: string
  resident?: string
  taxResident?: string
  oldDocumentsIds?: Array<string>
}

export interface IPortfolioChartFilter {
  filterType: PortfolioChartFilterEnum
  portfolioId: string
}

export interface IPortfolioChartResponse {
  id: string
  name: string
  value: number
}