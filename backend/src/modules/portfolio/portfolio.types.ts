import type { Account, Bank, Document, Entity, Prisma, Transaction,} from '@prisma/client'
import type { DocumentStatus,} from '@prisma/client'
import type {CryptoData, CurrencyData, MetalData, } from '@prisma/client'
import type { AssetNamesType, CBondsType, } from '../asset/asset.types'
import type { ITransactionSelected, TBondSelected, TEquitySelected, TEtfSelected, } from '../common/cache-sync/cache-sync.types'

export enum PortfolioChartFilterEnum {
	ENTITY = 'Entity',
	BANK = 'Bank',
	ASSET = 'Asset',
}

export type PortfolioWithRelations = Prisma.PortfolioGetPayload<{
	include: {
      documents: true;
      entities: true,
      banks: true;
      accounts: true;
      assets: true;
		client:{
			select: {
				lastName: true;
				firstName: true;
			};}
	};
  }>

export type RefactoredPortfolioWithRelations = Omit<
  Prisma.PortfolioGetPayload<{
    include: {
      documents: true;
      entities: true;
      banks: true;
      accounts: true;
      client: { select: { lastName: true; firstName: true } };
    };
  }>,
  'assets'
> & {
  assets: Array<{ assetName: AssetNamesType; totalAssets: number }>, assetsAmount: number
}

export type PortfolioWithExtendedRelations = Prisma.PortfolioGetPayload<{
	include: {
        documents: true;
        entities: {
			include: {
				assets: true;
				transactions: true;
			};
		}
        banks: {
			include: {
				assets: true;
				transactions: true;
			};
		}
        accounts: {
			include: {
				assets: true;
				transactions: true;
			};
		}
        assets: true;
		client:{
			select: {
				lastName: true;
				firstName: true;
			};
		}
	};
  }>

export interface IDocumentReq {
    type: string
    portfolioId?: string
    portfolioDraftId?: string

}

export interface IPortfolio {
   clientId: string;
   createdAt: Date;
   updatedAt: Date;
   id: string;
   name: string;
   resident: string | null;
   taxResident: string | null;
   type: string;
   isActivated?: boolean
   totalAssets?: number
}

export interface IPortfolioForFilteredList {
   clientId: string;
   createdAt: Date;
   updatedAt: Date;
   id: string;
   name?: string;
   resident?: string | null;
   taxResident?: string | null;
   type: string;
	documents: Array<Document>
	mainPortfolioId: string | null
	accounts: Array<Account>
	banks: Array<Bank>
	entities: Array<Entity>
   isActivated?: boolean
   totalAssets?: number
}

export interface IFilterProps {
	clients?: Array<string>
	types?: Array<string>
	isActivated?: string | undefined
	isDeactivated?: string | undefined
    search?: string
    range?: Array<string>
}

export interface IFilterConditionsProps {
    clientId?: { in: Array<string> };
    type?: { in: Array<string> };
    isActivated?: boolean;
    isDeactivated?: boolean;
    name?: { contains: string; mode: 'insensitive' }
}

export interface IPortfolioPatch {
    isActivated?: boolean
    name?: string
    type?: string
    resident?: string
    taxResident?: string
    oldDocumentsIds?: Array<string>
}

export interface IPortfolioDocumentUpdateStatus {
    documentsIds: Array<string>,
    status: DocumentStatus,
    comment?: string
}

export interface IPortfolioChartResponse {
    id?: string
    name: string
    value: number
}

export interface IPortfoliosFiltered {
	list : Array<IPortfolio>
}

export interface IAsyncPortfoliosFiltered {
	list : Array<IPortfolioForFilteredList>
}

export type TPortfolioForCalcsWithRelations = Prisma.PortfolioGetPayload<{
  include: {
    documents: true;
    banks: true;
    entities: true;
    accounts: true;
    transactions: true;
    assets: {
      include: {
        portfolio: true;
        entity: true;
        bank: {
          include: {
            bankList: true;
          };
        };
        account: true;
      };
    };
  };
}>

type PortfolioBase = Prisma.PortfolioGetPayload<{
  include: {
    banks: true
    entities: true
    accounts: true
    assets: {
      include: {
        portfolio: true
        entity: true
        bank: { include: { bankList: true } }
        account: true
      }
    }
  }
}>

export type TPortfolioForCalcsForCacheUpdate = PortfolioBase & {
  transactions: Array<ITransactionSelected>
}

export interface IPortfoliosThirdPartyList {
	portfolios: Array<TPortfolioForCalcsWithRelations>
	drafts: Array<IPortfolio>
	currencyList: Array<CurrencyData>,
	metalList: Array<MetalData>,
	cryptoList: Array<CryptoData>,
	cBonds: Array<CBondsType>,
}

export interface IPortfoliosThirdPartyListCBondsParted {
	portfolios: Array<TPortfolioForCalcsForCacheUpdate>
	drafts: Array<IPortfolio>
	currencyList: Array<CurrencyData>,
	metalList: Array<MetalData>,
	cryptoList: Array<CryptoData>,
	bonds: Array<TBondSelected>,
	equities: Array<TEquitySelected>,
	etfs: Array<TEtfSelected>,
}

export interface IPortfolioDetailedThirdPartyList {
	transactions: Array<Transaction>
	currencyList: Array<CurrencyData>,
	metalList: Array<MetalData>,
	cryptoList: Array<CryptoData>,
	cBonds: Array<CBondsType>,
}

export interface IPortfolioDetailedThirdPartyListCBondsParted {
	transactions: Array<ITransactionSelected>
	currencyList: Array<CurrencyData>,
	metalList: Array<MetalData>,
	cryptoList: Array<CryptoData>,
	bonds: Array<TBondSelected>,
	equities: Array<TEquitySelected>,
	etfs: Array<TEtfSelected>,
}