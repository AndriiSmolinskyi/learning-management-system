import React from 'react'
import {
	BankSelect,
	EntitySelect,
	AssetDollarIcon,
} from '../../../../../../assets/icons'
import {
	PortfolioChartFilterEnum,
} from '../../../../../../services/portfolio'

export const filterButtons = [
	{
		id: PortfolioChartFilterEnum.ENTITY, label: 'Entity', icon: <EntitySelect width={18} height={18}/>,
	},
	{
		id: PortfolioChartFilterEnum.BANK, label: 'Bank', icon: <BankSelect width={18} height={18}/>,
	},
	{
		id: PortfolioChartFilterEnum.ASSET, label: 'Asset', icon: <AssetDollarIcon width={18} height={18}/>,
	},
]