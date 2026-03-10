/* eslint-disable complexity */
import React from 'react'
import {
	BondDetails,
} from './bond-details.component'
import {
	AssetNamesType,
} from '../../../../../../../shared/types'
import type {
	IAsset,
} from '../../../../../../../shared/types'
import {
	RouterKeys,
} from '../../../../../../../router/keys'
import {
	CashDetails,
} from './cash-details.component'
import {
	CollateralDetails,
} from './collateral-details.component'
import {
	CryptoDetails,
} from './crypto-details.component'
import {
	EquityAssetDetails,
} from './equity-details.component'
import {
	LoanDetails,
} from './loan-details.component'
import {
	MetalsDetails,
} from './metals-details.component'
import {
	OpenCashDetails,
} from './open-cash-details.components'
import {
	OptionsDetails,
} from './options-details.component'
import {
	OtherDetails,
} from './other-details.component'
import {
	PrivateEquityDetails,
} from './private-equity-details.component'
import {
	RealEstateDetails,
} from './real-estate.component'

export const renderAssetDetails = (asset: IAsset,): React.ReactNode => {
	switch (asset.assetName) {
	case AssetNamesType.BONDS:
		return <BondDetails asset={asset}/>
	case AssetNamesType.CASH:
		return <CashDetails asset={asset}/>
	case AssetNamesType.CASH_DEPOSIT:
		return <OpenCashDetails asset={asset} />
	case AssetNamesType.COLLATERAL:
		return <CollateralDetails asset={asset}/>
	case AssetNamesType.CRYPTO:
		return <CryptoDetails asset={asset}/>
	case AssetNamesType.EQUITY_ASSET:
		return <EquityAssetDetails asset={asset}/>
	case AssetNamesType.OTHER:
		return <OtherDetails asset={asset}/>
	case AssetNamesType.METALS:
		return <MetalsDetails asset={asset}/>
	case AssetNamesType.OPTIONS:
		return <OptionsDetails asset={asset}/>
	case AssetNamesType.PRIVATE_EQUITY:
		return <PrivateEquityDetails asset={asset}/>
	case AssetNamesType.LOAN:
		return <LoanDetails asset={asset}/>
	case AssetNamesType.REAL_ESTATE:
		return <RealEstateDetails asset={asset}/>
	default:
		return null
	}
}

export const getRouteByAssetName = (assetName: AssetNamesType,): string | null => {
	switch (assetName) {
	case AssetNamesType.BONDS:
		return RouterKeys.ANALYTICS_BONDS
	case AssetNamesType.CASH:
		return RouterKeys.ANALYTICS_CASH
	case AssetNamesType.CASH_DEPOSIT:
		return RouterKeys.ANALYTICS_DEPOSIT
	case AssetNamesType.REAL_ESTATE:
		return RouterKeys.ANALYTICS_REAL_ESTATE
	case AssetNamesType.CRYPTO:
		return RouterKeys.ANALYTICS_CRYPTO
	case AssetNamesType.EQUITY_ASSET:
		return RouterKeys.ANALYTICS_EQUITIES
	case AssetNamesType.LOAN:
		return RouterKeys.ANALYTICS_LOAN
	case AssetNamesType.METALS:
		return RouterKeys.ANALYTICS_METALS
	case AssetNamesType.OPTIONS:
		return RouterKeys.ANALYTICS_OPTIONS
	case AssetNamesType.OTHER:
		return RouterKeys.ANALYTICS_OTHER_INVESTMENTS
	case AssetNamesType.PRIVATE_EQUITY:
		return RouterKeys.ANALYTICS_PRIVATE_EQUITY
	default:
		return null
	}
}
