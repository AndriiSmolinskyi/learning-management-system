/* eslint-disable max-lines */
/* eslint-disable complexity */
import * as React from 'react'
import {
	cx,
} from '@emotion/css'
import ReactCountryFlag from 'react-country-flag'
import {
	ChevronDown,
	ChevronUpBlue,
	PenSquareGray,
	MiniBank,
	BondIcon,
	EntityIcon,
} from '../../../../../../assets/icons'
import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../../../shared/components'
import {
	localeString,
} from '../../../../../../shared/utils'
import accountIcon from '../../../../../../assets/images/account-image.png'
import * as styles from './test-list.style'

export const TestList: React.FC = () => {
	const [isOpen, setIsOpen,] = React.useState(true,)
	const [isOpenAccount, setIsOpenAccount,] = React.useState(true,)
	const [isOpenEntity, setIsOpenEntity,] = React.useState(false,)
	const [isOpenEntity2, setIsOpenEntity2,] = React.useState(false,)

	const toggleEntity = (): void => {
		setIsOpenEntity((prev,) => {
			return !prev
		},)
	}

	const toggleEntity2 = (): void => {
		setIsOpenEntity2((prev,) => {
			return !prev
		},)
	}

	const toggle = (): void => {
		setIsOpen((prev,) => {
			return !prev
		},)
	}

	const toggleAccount = (): void => {
		setIsOpenAccount((prev,) => {
			return !prev
		},)
	}

	return (
		<div className={styles.wrapper}>
			<div className={styles.subItemList}>
				<div className={styles.subItemFlex}>
					<div className={styles.subItemListBlock}>
						<div className={styles.entityBlock}>
							<div className={styles.subItemListItemInside}>
								<EntityIcon width={32} height={32} />
								<div>
									<p className={styles.subItemListItemName}>
										Entity name
										<ReactCountryFlag
											countryCode={'US'}
											svg
											style={{
												width:  '20px',
												height: '10px',
											}}
										/>
									</p>
									<p className={styles.subItemMoney}>${localeString(47676.36, '', 2, false,)}</p>
								</div>
							</div>
							<Button
								additionalProps={{
									btnType: ButtonType.ICON,
									size:    Size.SMALL,
									icon:    <PenSquareGray width={20} height={20} />,
									color:   Color.SECONDRAY_GRAY,
								}}
							/>
						</div>
						<Button
							className={styles.chevronButton}
							onClick={toggleEntity}
							additionalProps={{
								btnType: ButtonType.ICON,
								size:    Size.SMALL,
								icon:    isOpenEntity ?
									(
										<ChevronUpBlue width={20} height={20} />
									) :
									(
										<ChevronDown width={20} height={20} />
									),
								color: Color.NONE,
							}}
						/>
					</div>
					{isOpenEntity && (
						<div className={styles.borderBig}>
							<div className={styles.listItemFull}>
								<div className={styles.subItemListBlock}>
									<div className={styles.bankBlock}>
										<div className={styles.subItemListItemInside}>
											<MiniBank width={32} height={32} />
											<div>
												<p className={styles.subItemListItemName}>
									Bank name
													<ReactCountryFlag
														countryCode={'US'}
														svg
														style={{
															width:  '20px',
															height: '10px',
														}}
													/>
												</p>
												<p className={styles.subItemMoney}>${localeString(47676.36, '', 2, false,)}</p>
											</div>
										</div>
										<Button
											additionalProps={{
												btnType: ButtonType.ICON,
												size:    Size.SMALL,
												icon:    <PenSquareGray width={20} height={20} />,
												color:   Color.SECONDRAY_GRAY,
											}}
										/>
									</div>
									<Button
										className={styles.chevronButton}
										onClick={toggle}
										additionalProps={{
											btnType: ButtonType.ICON,
											size:    Size.SMALL,
											icon:    isOpen ?
												(
													<ChevronUpBlue width={20} height={20} />
												) :
												(
													<ChevronDown width={20} height={20} />
												),
											color: Color.NONE,
										}}
									/>
								</div>
								{isOpen && (
									<div className={cx(styles.borderBig, styles.accounts,)}>
										<div className={styles.listItemFull}>
											<div className={styles.subItemListBlock}>
												<div className={styles.bankAccountBlock}>
													<div className={styles.subItemListItemInside}>
														<img src={accountIcon} className={styles.accountIconStyle} alt='account icon' />

														<div>
															<p className={styles.subItemListItemName}>Account name</p>
															<p className={styles.subItemMoney}>${localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
													<Button
														additionalProps={{
															btnType: ButtonType.ICON,
															size:    Size.SMALL,
															icon:    <PenSquareGray width={20} height={20} />,
															color:   Color.SECONDRAY_GRAY,
														}}
													/>
												</div>
												<Button
													className={styles.chevronButton}
													onClick={toggleAccount}
													additionalProps={{
														btnType: ButtonType.ICON,
														size:    Size.SMALL,
														icon:    isOpenAccount ?
															(
																<ChevronUpBlue width={20} height={20} />
															) :
															(
																<ChevronDown width={20} height={20} />
															),
														color: Color.NONE,
													}}
												/>
											</div>
											{isOpenAccount && <div className={cx(
												styles.borderBig, styles.assetsBlock,)}>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
											</div>
											}
										</div>
									</div>
								)}
								{isOpen && (
									<div className={cx(styles.borderBig, styles.accounts,)}>
										<div className={styles.listItemFull}>
											<div className={styles.subItemListBlock}>
												<div className={styles.bankAccountBlock}>
													<div className={styles.subItemListItemInside}>
														<img src={accountIcon} className={styles.accountIconStyle} alt='account icon' />

														<div>
															<p className={styles.subItemListItemName}>Account name</p>
															<p className={styles.subItemMoney}>${localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
													<Button
														additionalProps={{
															btnType: ButtonType.ICON,
															size:    Size.SMALL,
															icon:    <PenSquareGray width={20} height={20} />,
															color:   Color.SECONDRAY_GRAY,
														}}
													/>
												</div>
												<Button
													className={styles.chevronButton}
													onClick={toggleAccount}
													additionalProps={{
														btnType: ButtonType.ICON,
														size:    Size.SMALL,
														icon:    isOpenAccount ?
															(
																<ChevronUpBlue width={20} height={20} />
															) :
															(
																<ChevronDown width={20} height={20} />
															),
														color: Color.NONE,
													}}
												/>
											</div>
											{isOpenAccount && <div className={cx(
												styles.borderBig, styles.assetsBlock,)}>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
											</div>
											}
										</div>
									</div>
								)}
							</div>
						</div>
					)}
					{isOpenEntity && (
						<div className={styles.borderBig}>
							<div className={styles.listItemFull}>
								<div className={styles.subItemListBlock}>
									<div className={styles.bankBlock}>
										<div className={styles.subItemListItemInside}>
											<MiniBank width={32} height={32} />
											<div>
												<p className={styles.subItemListItemName}>
									Bank name
													<ReactCountryFlag
														countryCode={'US'}
														svg
														style={{
															width:  '20px',
															height: '10px',
														}}
													/>
												</p>
												<p className={styles.subItemMoney}>${localeString(47676.36, '', 2, false,)}</p>
											</div>
										</div>
										<Button
											additionalProps={{
												btnType: ButtonType.ICON,
												size:    Size.SMALL,
												icon:    <PenSquareGray width={20} height={20} />,
												color:   Color.SECONDRAY_GRAY,
											}}
										/>
									</div>
									<Button
										className={styles.chevronButton}
										onClick={toggle}
										additionalProps={{
											btnType: ButtonType.ICON,
											size:    Size.SMALL,
											icon:    isOpen ?
												(
													<ChevronUpBlue width={20} height={20} />
												) :
												(
													<ChevronDown width={20} height={20} />
												),
											color: Color.NONE,
										}}
									/>
								</div>
								{isOpen && (
									<div className={cx(styles.borderBig, styles.accounts,)}>
										<div className={styles.listItemFull}>
											<div className={styles.subItemListBlock}>
												<div className={styles.bankAccountBlock}>
													<div className={styles.subItemListItemInside}>
														<img src={accountIcon} className={styles.accountIconStyle} alt='account icon' />

														<div>
															<p className={styles.subItemListItemName}>Account name</p>
															<p className={styles.subItemMoney}>${localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
													<Button
														additionalProps={{
															btnType: ButtonType.ICON,
															size:    Size.SMALL,
															icon:    <PenSquareGray width={20} height={20} />,
															color:   Color.SECONDRAY_GRAY,
														}}
													/>
												</div>
												<Button
													className={styles.chevronButton}
													onClick={toggleAccount}
													additionalProps={{
														btnType: ButtonType.ICON,
														size:    Size.SMALL,
														icon:    isOpenAccount ?
															(
																<ChevronUpBlue width={20} height={20} />
															) :
															(
																<ChevronDown width={20} height={20} />
															),
														color: Color.NONE,
													}}
												/>
											</div>
											{isOpenAccount && <div className={cx(
												styles.borderBig, styles.assetsBlock,)}>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
											</div>
											}
										</div>
									</div>
								)}
								{isOpen && (
									<div className={cx(styles.borderBig, styles.accounts,)}>
										<div className={styles.listItemFull}>
											<div className={styles.subItemListBlock}>
												<div className={styles.bankAccountBlock}>
													<div className={styles.subItemListItemInside}>
														<img src={accountIcon} className={styles.accountIconStyle} alt='account icon' />

														<div>
															<p className={styles.subItemListItemName}>Account name</p>
															<p className={styles.subItemMoney}>${localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
													<Button
														additionalProps={{
															btnType: ButtonType.ICON,
															size:    Size.SMALL,
															icon:    <PenSquareGray width={20} height={20} />,
															color:   Color.SECONDRAY_GRAY,
														}}
													/>
												</div>
												<Button
													className={styles.chevronButton}
													onClick={toggleAccount}
													additionalProps={{
														btnType: ButtonType.ICON,
														size:    Size.SMALL,
														icon:    isOpenAccount ?
															(
																<ChevronUpBlue width={20} height={20} />
															) :
															(
																<ChevronDown width={20} height={20} />
															),
														color: Color.NONE,
													}}
												/>
											</div>
											{isOpenAccount && <div className={cx(
												styles.borderBig, styles.assetsBlock,)}>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
											</div>
											}
										</div>
									</div>
								)}
							</div>
						</div>
					)}

				</div>
				<div className={styles.subItemFlex}>
					<div className={styles.subItemListBlock}>
						<div className={styles.entityBlock}>
							<div className={styles.subItemListItemInside}>
								<EntityIcon width={32} height={32} />
								<div>
									<p className={styles.subItemListItemName}>
										Entity name
										<ReactCountryFlag
											countryCode={'US'}
											svg
											style={{
												width:  '20px',
												height: '10px',
											}}
										/>
									</p>
									<p className={styles.subItemMoney}>${localeString(47676.36, '', 2, false,)}</p>
								</div>
							</div>
							<Button
								additionalProps={{
									btnType: ButtonType.ICON,
									size:    Size.SMALL,
									icon:    <PenSquareGray width={20} height={20} />,
									color:   Color.SECONDRAY_GRAY,
								}}
							/>
						</div>
						<Button
							className={styles.chevronButton}
							onClick={toggleEntity2}
							additionalProps={{
								btnType: ButtonType.ICON,
								size:    Size.SMALL,
								icon:    isOpenEntity2 ?
									(
										<ChevronUpBlue width={20} height={20} />
									) :
									(
										<ChevronDown width={20} height={20} />
									),
								color: Color.NONE,
							}}
						/>
					</div>
					{isOpenEntity2 && (
						<div className={styles.borderBig}>
							<div className={styles.listItemFull}>
								<div className={styles.subItemListBlock}>
									<div className={styles.bankBlock}>
										<div className={styles.subItemListItemInside}>
											<MiniBank width={32} height={32} />
											<div>
												<p className={styles.subItemListItemName}>
									Bank name
													<ReactCountryFlag
														countryCode={'US'}
														svg
														style={{
															width:  '20px',
															height: '10px',
														}}
													/>
												</p>
												<p className={styles.subItemMoney}>${localeString(47676.36, '', 2, false,)}</p>
											</div>
										</div>
										<Button
											additionalProps={{
												btnType: ButtonType.ICON,
												size:    Size.SMALL,
												icon:    <PenSquareGray width={20} height={20} />,
												color:   Color.SECONDRAY_GRAY,
											}}
										/>
									</div>
									<Button
										className={styles.chevronButton}
										onClick={toggle}
										additionalProps={{
											btnType: ButtonType.ICON,
											size:    Size.SMALL,
											icon:    isOpen ?
												(
													<ChevronUpBlue width={20} height={20} />
												) :
												(
													<ChevronDown width={20} height={20} />
												),
											color: Color.NONE,
										}}
									/>
								</div>
								{isOpen && (
									<div className={cx(styles.borderBig, styles.accounts,)}>
										<div className={styles.listItemFull}>
											<div className={styles.subItemListBlock}>
												<div className={styles.bankAccountBlock}>
													<div className={styles.subItemListItemInside}>
														<img src={accountIcon} className={styles.accountIconStyle} alt='account icon' />

														<div>
															<p className={styles.subItemListItemName}>Account name</p>
															<p className={styles.subItemMoney}>${localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
													<Button
														additionalProps={{
															btnType: ButtonType.ICON,
															size:    Size.SMALL,
															icon:    <PenSquareGray width={20} height={20} />,
															color:   Color.SECONDRAY_GRAY,
														}}
													/>
												</div>
												<Button
													className={styles.chevronButton}
													onClick={toggleAccount}
													additionalProps={{
														btnType: ButtonType.ICON,
														size:    Size.SMALL,
														icon:    isOpenAccount ?
															(
																<ChevronUpBlue width={20} height={20} />
															) :
															(
																<ChevronDown width={20} height={20} />
															),
														color: Color.NONE,
													}}
												/>
											</div>
											{isOpenAccount && <div className={cx(
												styles.borderBig, styles.assetsBlock,)}>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
											</div>
											}
										</div>
									</div>
								)}
								{isOpen && (
									<div className={cx(styles.borderBig, styles.accounts,)}>
										<div className={styles.listItemFull}>
											<div className={styles.subItemListBlock}>
												<div className={styles.bankAccountBlock}>
													<div className={styles.subItemListItemInside}>
														<img src={accountIcon} className={styles.accountIconStyle} alt='account icon' />

														<div>
															<p className={styles.subItemListItemName}>Account name</p>
															<p className={styles.subItemMoney}>${localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
													<Button
														additionalProps={{
															btnType: ButtonType.ICON,
															size:    Size.SMALL,
															icon:    <PenSquareGray width={20} height={20} />,
															color:   Color.SECONDRAY_GRAY,
														}}
													/>
												</div>
												<Button
													className={styles.chevronButton}
													onClick={toggleAccount}
													additionalProps={{
														btnType: ButtonType.ICON,
														size:    Size.SMALL,
														icon:    isOpenAccount ?
															(
																<ChevronUpBlue width={20} height={20} />
															) :
															(
																<ChevronDown width={20} height={20} />
															),
														color: Color.NONE,
													}}
												/>
											</div>
											{isOpenAccount && <div className={cx(
												styles.borderBig, styles.assetsBlock,)}>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
											</div>
											}
										</div>
									</div>
								)}
							</div>
						</div>
					)}
					{isOpenEntity2 && (
						<div className={styles.borderBig}>
							<div className={styles.listItemFull}>
								<div className={styles.subItemListBlock}>
									<div className={styles.bankBlock}>
										<div className={styles.subItemListItemInside}>
											<MiniBank width={32} height={32} />
											<div>
												<p className={styles.subItemListItemName}>
									Bank name
													<ReactCountryFlag
														countryCode={'US'}
														svg
														style={{
															width:  '20px',
															height: '10px',
														}}
													/>
												</p>
												<p className={styles.subItemMoney}>${localeString(47676.36, '', 2, false,)}</p>
											</div>
										</div>
										<Button
											additionalProps={{
												btnType: ButtonType.ICON,
												size:    Size.SMALL,
												icon:    <PenSquareGray width={20} height={20} />,
												color:   Color.SECONDRAY_GRAY,
											}}
										/>
									</div>
									<Button
										className={styles.chevronButton}
										onClick={toggle}
										additionalProps={{
											btnType: ButtonType.ICON,
											size:    Size.SMALL,
											icon:    isOpen ?
												(
													<ChevronUpBlue width={20} height={20} />
												) :
												(
													<ChevronDown width={20} height={20} />
												),
											color: Color.NONE,
										}}
									/>
								</div>
								{isOpen && (
									<div className={cx(styles.borderBig, styles.accounts,)}>
										<div className={styles.listItemFull}>
											<div className={styles.subItemListBlock}>
												<div className={styles.bankAccountBlock}>
													<div className={styles.subItemListItemInside}>
														<img src={accountIcon} className={styles.accountIconStyle} alt='account icon' />

														<div>
															<p className={styles.subItemListItemName}>Account name</p>
															<p className={styles.subItemMoney}>${localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
													<Button
														additionalProps={{
															btnType: ButtonType.ICON,
															size:    Size.SMALL,
															icon:    <PenSquareGray width={20} height={20} />,
															color:   Color.SECONDRAY_GRAY,
														}}
													/>
												</div>
												<Button
													className={styles.chevronButton}
													onClick={toggleAccount}
													additionalProps={{
														btnType: ButtonType.ICON,
														size:    Size.SMALL,
														icon:    isOpenAccount ?
															(
																<ChevronUpBlue width={20} height={20} />
															) :
															(
																<ChevronDown width={20} height={20} />
															),
														color: Color.NONE,
													}}
												/>
											</div>
											{isOpenAccount && <div className={cx(
												styles.borderBig, styles.assetsBlock,)}>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
											</div>
											}
										</div>
									</div>
								)}
								{isOpen && (
									<div className={cx(styles.borderBig, styles.accounts,)}>
										<div className={styles.listItemFull}>
											<div className={styles.subItemListBlock}>
												<div className={styles.bankAccountBlock}>
													<div className={styles.subItemListItemInside}>
														<img src={accountIcon} className={styles.accountIconStyle} alt='account icon' />

														<div>
															<p className={styles.subItemListItemName}>Account name</p>
															<p className={styles.subItemMoney}>${localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
													<Button
														additionalProps={{
															btnType: ButtonType.ICON,
															size:    Size.SMALL,
															icon:    <PenSquareGray width={20} height={20} />,
															color:   Color.SECONDRAY_GRAY,
														}}
													/>
												</div>
												<Button
													className={styles.chevronButton}
													onClick={toggleAccount}
													additionalProps={{
														btnType: ButtonType.ICON,
														size:    Size.SMALL,
														icon:    isOpenAccount ?
															(
																<ChevronUpBlue width={20} height={20} />
															) :
															(
																<ChevronDown width={20} height={20} />
															),
														color: Color.NONE,
													}}
												/>
											</div>
											{isOpenAccount && <div className={cx(
												styles.borderBig, styles.assetsBlock,)}>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
												<div className={styles.assetBlock}>
													<div className={styles.assetLeft}>
														<div className={styles.assetIcon}>
															<BondIcon width={18} height={18} />
														</div>
														<div>
															<p className={styles.assetType}>Bonds</p>
															<p className={styles.assetMoney}>${
																localeString(47676.36, '', 2, false,)}</p>
														</div>
													</div>
												</div>
											</div>
											}
										</div>
									</div>
								)}
							</div>
						</div>
					)}

				</div>
			</div>

		</div>
	)
}

export default TestList
