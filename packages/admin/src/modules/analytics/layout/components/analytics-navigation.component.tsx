/* eslint-disable complexity */
/* eslint-disable consistent-return */
import React from 'react'
import {
	useLocation,
	useNavigate,
} from 'react-router-dom'

import {
	BondIcon,
	CashIcon,
	CryptoIcon,
	DepositIcon,
	EquitiesIcon,
	LoanIcon,
	MetalsIcon,
	OptionIcon,
	OtherInvestmentsIcon,
	OverviewAnalytics,
	PrivateEquityIcon,
	RealEstateIcon,
	Send,
	ArrowRight,
	ArrowLeft,
} from '../../../../assets/icons'
import {
	Button, ButtonType, Size, Color,
} from '../../../../shared/components'
import {
	RouterKeys,
} from '../../../../router/keys'
import {
	AnalyticsFilter,
} from './analytics-filter/analytics-filter.component'
import {
	useAnalyticsAvailability,
} from '../../../../shared/hooks'
import {
	useAnalyticsFilterStore,
} from '../../analytics-store'
import type {
	TOverviewProps,
} from '../../../../services/analytics/analytics.types'

import * as styles from '../analytic-layout.styles'

export const AnalyticsNavigation: React.FC = () => {
	const navigate = useNavigate()
	const location = useLocation()

	const scrollRef = React.useRef<HTMLDivElement>(null,)

	const [isDown, setIsDown,] = React.useState(false,)
	const [startX, setStartX,] = React.useState(0,)
	const [scrollLeft, setScrollLeft,] = React.useState(0,)
	const {
		analyticsFilter,
	} = useAnalyticsFilterStore()

	const combinedFilter: TOverviewProps = React.useMemo(() => {
		return {
			clientIds:    analyticsFilter.clientIds?.map((client,) => {
				return client.value.id
			},),
			portfolioIds:	analyticsFilter.portfolioIds?.map((portfolio,) => {
				return portfolio.value.id
			},),
		}
	}, [analyticsFilter,],)
	const {
		data: availabilityData,
		isFetching: isAvailabilityFetching,
	} = useAnalyticsAvailability(combinedFilter,)

	const onMouseDown = (e: React.MouseEvent,): void => {
		if (!scrollRef.current) {
			return
		}
		setIsDown(true,)
		setStartX(e.pageX - scrollRef.current.offsetLeft,)
		setScrollLeft(scrollRef.current.scrollLeft,)
	}

	const onMouseLeave = (): void => {
		setIsDown(false,)
	}
	const onMouseUp = (): void => {
		setIsDown(false,)
	}

	const onMouseMove = (e: React.MouseEvent,): void => {
		if (!isDown || !scrollRef.current) {
			return
		}
		e.preventDefault()
		const x = e.pageX - scrollRef.current.offsetLeft
		const walk = (x - startX)
		scrollRef.current.scrollLeft = scrollLeft - walk
	}

	const scrollLeftButton = (): void => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({
				left:     -200,
				behavior: 'smooth',
			},)
		}
	}
	const scrollRightButton = (): void => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({
				left:     200,
				behavior: 'smooth',
			},)
		}
	}

	const [canScrollLeft, setCanScrollLeft,] = React.useState(false,)
	const [canScrollRight, setCanScrollRight,] = React.useState(false,)

	const updateScrollButtons = React.useCallback(() => {
		const el = scrollRef.current
		if (!el) {
			return
		} const {
			scrollLeft, scrollWidth, clientWidth,
		} = el

		const hasOverflow = scrollWidth > clientWidth + 1

		const left = hasOverflow && scrollLeft > 2

		const right = hasOverflow && scrollLeft + clientWidth < scrollWidth - 2

		setCanScrollLeft(left,)
		setCanScrollRight(right,)
	}, [],)

	React.useEffect(() => {
		updateScrollButtons()
		const el = scrollRef.current
		if (!el) {
			return
		} const onScroll = (): void => {
			updateScrollButtons()
		}
		const onResize = (): void => {
			updateScrollButtons()
		}
		el.addEventListener('scroll', onScroll, {
			passive: true,
		},)
		window.addEventListener('resize', onResize,)

		const id = window.setTimeout(updateScrollButtons, 0,)

		return () => {
			el.removeEventListener('scroll', onScroll,)
			window.removeEventListener('resize', onResize,)
			window.clearTimeout(id,)
		}
	}, [updateScrollButtons,],)
	// const hasFilter = Boolean(analyticsFilter.clientIds ?? analyticsFilter.portfolioIds,)
	const canShowNavigationButton = (
		availabilityFlag: boolean | undefined,
	): boolean => {
		if (isAvailabilityFetching) {
			return false
		}
		return Boolean(availabilityFlag,)
	}
	React.useEffect(() => {
		if (isAvailabilityFetching || !availabilityData) {
			return
		}
		const redirectMap: Record<string, boolean | undefined> = {
			[RouterKeys.ANALYTICS_CASH]:              availabilityData.hasCash,
			[RouterKeys.ANALYTICS_DEPOSIT]:           availabilityData.hasDeposit,
			[RouterKeys.ANALYTICS_BONDS]:             availabilityData.hasBond,
			[RouterKeys.ANALYTICS_EQUITIES]:          availabilityData.hasEquity,
			[RouterKeys.ANALYTICS_METALS]:            availabilityData.hasMetal,
			[RouterKeys.ANALYTICS_CRYPTO]:            availabilityData.hasCrypto,
			[RouterKeys.ANALYTICS_PRIVATE_EQUITY]:    availabilityData.hasPE,
			[RouterKeys.ANALYTICS_OTHER_INVESTMENTS]: availabilityData.hasOther,
			[RouterKeys.ANALYTICS_OPTIONS]:           availabilityData.hasOption,
			[RouterKeys.ANALYTICS_LOAN]:              availabilityData.hasLoan,
			[RouterKeys.ANALYTICS_REAL_ESTATE]:       availabilityData.hasRE,
		}
		const availability = redirectMap[location.pathname]
		if (availability === false) {
			navigate(RouterKeys.ANALYTICS_OVERVIEW, {
				replace: true,
			},)
		}
	}, [
		location.pathname,
		availabilityData,
		isAvailabilityFetching,
		navigate,
	],)

	const trueCount = Object.values(availabilityData ?? [],)
		.filter(Boolean,)
		.length
	return (
		<div className={styles.pageHeader}>
			<div className={styles.navContainer}>
				<div/>
				<nav className={styles.navWrapper}>
					<div>
						<button
							className={styles.navBtn(location.pathname.includes(RouterKeys.ANALYTICS_OVERVIEW,),)}
							type='button'
							onClick={() => {
								navigate(RouterKeys.ANALYTICS_OVERVIEW,)
							}}
						>
							<OverviewAnalytics className={styles.navButtonItem} />
								Overview
						</button>
					</div>
					<div
						ref={scrollRef}
						className={styles.navScrollContainer(Boolean(trueCount < 7,),)}
						onMouseDown={onMouseDown}
						onMouseLeave={onMouseLeave}
						onMouseUp={onMouseUp}
						onMouseMove={onMouseMove}
					>
						{canScrollLeft && (
							<div className={styles.leftButton}>
								<Button<ButtonType.ICON>
									onClick={scrollLeftButton}
									additionalProps={{
										btnType:      ButtonType.ICON,
										icon:         <ArrowLeft width={20} height={20} />,
										size:         Size.SMALL,
										color:        Color.SECONDRAY_COLOR,
									}}
								/>
							</div>
						)}
						{canShowNavigationButton(availabilityData?.hasCash,) && <div>
							<button
								className={styles.navBtn(location.pathname.includes(RouterKeys.ANALYTICS_CASH,),)}
								type='button'
								onClick={() => {
									navigate(RouterKeys.ANALYTICS_CASH,)
								}}
							>
								<CashIcon className={styles.navButtonItem} />
								Cash
							</button>
						</div>}
						{canShowNavigationButton(availabilityData?.hasDeposit,) && <div>
							<button
								className={styles.navBtn(location.pathname.includes(RouterKeys.ANALYTICS_DEPOSIT,),)}
								type='button'
								onClick={() => {
									navigate(RouterKeys.ANALYTICS_DEPOSIT,)
								}}
							>
								<DepositIcon className={styles.navButtonItem} />
								Deposit
							</button>
						</div>}
						{canShowNavigationButton(availabilityData?.hasBond,) && <div>
							<button
								className={styles.navBtn(location.pathname.includes(RouterKeys.ANALYTICS_BONDS,),)}
								type='button'
								onClick={() => {
									navigate(RouterKeys.ANALYTICS_BONDS,)
								}}
							>
								<BondIcon className={styles.navButtonItem} />
								Bonds
							</button>
						</div>}
						{canShowNavigationButton(availabilityData?.hasEquity,) && <div>
							<button
								className={styles.navBtn(location.pathname.includes(RouterKeys.ANALYTICS_EQUITIES,),)}
								type='button'
								onClick={() => {
									navigate(RouterKeys.ANALYTICS_EQUITIES,)
								}}
							>
								<EquitiesIcon className={styles.navButtonItem} />
								Equities
							</button>
						</div>}
						{canShowNavigationButton(availabilityData?.hasMetal,) && <div>
							<button
								className={styles.navBtn(location.pathname.includes(RouterKeys.ANALYTICS_METALS,),)}
								type='button'
								onClick={() => {
									navigate(RouterKeys.ANALYTICS_METALS,)
								}}
							>
								<MetalsIcon className={styles.navButtonItem} />
								Metals
							</button>
						</div>}
						{canShowNavigationButton(availabilityData?.hasCrypto,) && <div>
							<button
								className={styles.navBtn(location.pathname.includes(RouterKeys.ANALYTICS_CRYPTO,),)}
								type='button'
								onClick={() => {
									navigate(RouterKeys.ANALYTICS_CRYPTO,)
								}}
							>
								<CryptoIcon className={styles.navButtonItem} />
								Crypto
							</button>
						</div>}
						{canShowNavigationButton(availabilityData?.hasPE,) && <div>
							<button
								className={styles.navBtn(location.pathname.includes(RouterKeys.ANALYTICS_PRIVATE_EQUITY,),)}
								type='button'
								onClick={() => {
									navigate(RouterKeys.ANALYTICS_PRIVATE_EQUITY,)
								}}
							>
								<PrivateEquityIcon className={styles.navButtonItem} />
								Private equity
							</button>
						</div>}
						{canShowNavigationButton(availabilityData?.hasOther,) && <div>
							<button
								className={styles.navBtn(location.pathname.includes(RouterKeys.ANALYTICS_OTHER_INVESTMENTS,),)}
								type='button'
								onClick={() => {
									navigate(RouterKeys.ANALYTICS_OTHER_INVESTMENTS,)
								}}
							>
								<OtherInvestmentsIcon className={styles.navButtonItem} />
								Other investments
							</button>
						</div>}
						{canShowNavigationButton(availabilityData?.hasOption,) && <div>
							<button
								className={styles.navBtn(location.pathname.includes(RouterKeys.ANALYTICS_OPTIONS,),)}
								type='button'
								onClick={() => {
									navigate(RouterKeys.ANALYTICS_OPTIONS,)
								}}
							>
								<OptionIcon className={styles.navButtonItem} />
								Options
							</button>
						</div>}
						{canShowNavigationButton(availabilityData?.hasLoan,) && <div>
							<button
								className={styles.navBtn(location.pathname.includes(RouterKeys.ANALYTICS_LOAN,),)}
								type='button'
								onClick={() => {
									navigate(RouterKeys.ANALYTICS_LOAN,)
								}}
							>
								<LoanIcon className={styles.navButtonItem} />
								Loan
							</button>
						</div>}
						{canShowNavigationButton(availabilityData?.hasRE,) && <div>
							<button
								className={styles.navBtn(location.pathname.includes(RouterKeys.ANALYTICS_REAL_ESTATE,),)}
								type='button'
								onClick={() => {
									navigate(RouterKeys.ANALYTICS_REAL_ESTATE,)
								}}
							>
								<RealEstateIcon className={styles.navButtonItem} />
								Real estate
							</button>
						</div>}
						{canShowNavigationButton(availabilityData?.hasCash,) && <div className={styles.transactionBtn}>
							<button
								className={styles.navBtn(location.pathname.includes(RouterKeys.ANALYTICS_TRANSACTIONS,),)}
								type='button'
								onClick={() => {
									navigate(RouterKeys.ANALYTICS_TRANSACTIONS,)
								}}
							>
								<Send className={styles.navButtonItem} />
								Transactions
							</button>
						</div>}
						{canScrollRight && (
							<div className={styles.rightButton}>
								<Button<ButtonType.ICON>
									onClick={scrollRightButton}
									additionalProps={{
										btnType:      ButtonType.ICON,
										icon:         <ArrowRight width={20} height={20} />,
										size:         Size.SMALL,
										color:        Color.SECONDRAY_COLOR,
									}}
								/>
							</div>
						)}
					</div>

				</nav>
				<div/>
			</div>
			<AnalyticsFilter/>
		</div>
	)
}