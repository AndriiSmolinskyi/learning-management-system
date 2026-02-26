import type { Account, Asset, Bank, CurrencyDataList, Entity, } from '@prisma/client'
import type { AssetNamesType, } from '../../modules/asset/asset.types'

type AccountsTotalTransactions = Record<CurrencyDataList, number>

export type EntityWithTotalAssets = Entity & { totalAssets: number, totalUnits?: number }
export type BankWithTotalAssets = Bank & { totalAssets: number, totalUnits?: number  }
export type AccountWithTotalAssets = Account & { totalAssets: number, totalUnits?: number, accountsTotalTransactions: number, accountsCurrencyTotals: AccountsTotalTransactions  }
export type AssetWithTotalAssets = Asset & { totalAssets: number, totalUnits?: number  }
export type InstancesTotalAssets = {
	entitiesWithTotalAssetsValue: Array<EntityWithTotalAssets>;
	banksWithTotalAssetsValue: Array<BankWithTotalAssets>;
	accountsWithTotalAssetsValue: Array<AccountWithTotalAssets>;
	assetsWithTotalAssetsValue: Array<AssetWithTotalAssets>;
}

export type RefactoredInstancesTotalAssets = {
	entitiesWithTotalAssetsValue: Array<EntityWithTotalAssets>;
	banksWithTotalAssetsValue: Array<BankWithTotalAssets>;
	accountsWithTotalAssetsValue: Array<AccountWithTotalAssets>;
	assetsWithTotalAssetsValue: Array<{ assetName: AssetNamesType, totalAssets: number  }>;
}