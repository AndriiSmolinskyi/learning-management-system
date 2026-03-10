import * as React from 'react'
import {
	useNavigate,
} from 'react-router-dom'

import {
	PortfolioAnalyticsButtonBlock,
} from './components/button-block/button-block.component'
import {
	PortfolioChartFilterEnum,
} from '../../../../../../services/portfolio'
import {
	Button,
	ButtonType,
	Color,
	Loader,
	PieChart,
	Size,
} from '../../../../../../shared/components'
import {
	ArrowUpRight,
} from '../../../../../../assets/icons'
import {
	RouterKeys,
} from '../../../../../../router/keys'
import {
	usePortfolioChartAnalytics,
} from '../../../../../../shared/hooks/portfolio/portfolio.hook'

import * as styles from './analytics.styles'

interface IPortfolioDetailsHeaderProps{
	id: string
}
export const PortfolioAnalytics: React.FC<IPortfolioDetailsHeaderProps> = ({
	id,
},) => {
	const [selected, setSelected,] = React.useState<PortfolioChartFilterEnum>(PortfolioChartFilterEnum.ENTITY,)
	const {
		data,
		isPending,
	} = usePortfolioChartAnalytics({
		portfolioId: id,
		filterType:  selected,
	},)
	const navigate = useNavigate()
	const handleClick = (id: PortfolioChartFilterEnum,):void => {
		setSelected(id,)
	}
	return (
		<div className={styles.analyticsWrapper}>
			<PortfolioAnalyticsButtonBlock
				selected={selected}
				handleClick={handleClick}
			/>
			<div className={styles.chartBlock}>
				{isPending ?
					<Loader
						radius={6}
						width={150}
					/> :
					<PieChart data={data} wrapperClassName={styles.chartWrapper} />
				}
			</div>
			<Button<ButtonType.TEXT>
				onClick={() => {
					navigate(RouterKeys.ANALYTICS_OVERVIEW,{
						state: {
							portfolioId:  id,
						},
					},)
				}}
				className={styles.navigateButton}
				additionalProps={{
					btnType:   ButtonType.TEXT,
					text:      'View more',
					rightIcon: <ArrowUpRight width={20} height={20}/>,
					size:      Size.MEDIUM,
					color:     Color.SECONDRAY_COLOR,
				}}
			/>
		</div>

	)
}