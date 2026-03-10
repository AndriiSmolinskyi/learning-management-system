import * as React from 'react'

import {
	ComplianceCheckbox,
} from '../checkbox/checkbox.component'
import type {
	IStorePortfolio,
} from '../../../../../../store/compliance-check.store'
import {
	useComplianceCheckStore,
} from '../../../../../../store/compliance-check.store'
import {
	Briefcase,
} from '../../../../../../assets/icons'
import {
	Collapse,
} from '@blueprintjs/core'
import {
	CollapseArrowIcon,
} from '../../../../../../assets/icons'
import {
	EntityDocumentsList,
} from './entity-documents-list.component'

import * as styles from './documents-list.styles'

interface IPortfolDocumentsListProps {
	portfolio : IStorePortfolio
}

export const PortfolioDocumentsList: React.FC<IPortfolDocumentsListProps> = ({
	portfolio,
},) => {
	const [isOpen, setIsOpen,] = React.useState<boolean>(false,)
	const {
		togglePortfolioItem,
		togglePortfolioSelectAll,
	} = useComplianceCheckStore()

	const sortedItems = [...portfolio.documents,].sort((a, b,) => {
		return new Date(b.updatedAt,).getTime() - new Date(a.updatedAt,).getTime()
	},)

	const handleSelectAllChange = (): void => {
		togglePortfolioSelectAll(portfolio.id,)
	}
	React.useEffect(() => {
		if (portfolio.isCheckedAll) {
			setIsOpen(true,)
		}
	}, [portfolio.isCheckedAll,],)

	return (
		<div className={styles.listWrapper} key={portfolio.id}>
			{Boolean(portfolio.documents.length > 0,) && <div className={styles.topHeader}>
				<div className={styles.selectAllBlock(Boolean(portfolio.documents.length === 0,),)}>
					{Boolean(portfolio.documents.length > 0,) && <ComplianceCheckbox
						key={portfolio.id}
						label={portfolio.id}
						isChecked={portfolio.isCheckedAll}
						onChange={() => {
							handleSelectAllChange()
						}}
						isSelectAll
					/>}
					<div>
						<p className={styles.iconClientText}><Briefcase className={styles.usersIcon}/><span>{portfolio.mainPortfolioId ?
							'Sub-portfolio' :
							'Portfolio'}</span></p>
						<p className={styles.clientNameText}>{portfolio.name}</p>
					</div>
				</div>
				{Boolean(portfolio.documents.length > 0,) && <button className={styles.collapseArrowButton(isOpen,)} type='button' onClick={() => {
					setIsOpen(!isOpen,)
				}}><CollapseArrowIcon/></button>}
			</div>}
			<div className={styles.portfolioInnerContent(Boolean(portfolio.documents.length === 0,),)}>
				{Boolean(portfolio.documents.length > 0,) &&
					<Collapse isOpen={isOpen}>
						<ul className={styles.checkboxList}>
							{portfolio.documents.map((item,) => {
								return (
									<ComplianceCheckbox
										key={item.id}
										file={item}
										label={item.label}
										isChecked={item.isChecked}
										onChange={() => {
											togglePortfolioItem(item.id,)
										}}
										title={portfolio.name}
										isNew={
											sortedItems[0]?.updatedAt === item.updatedAt &&
								(new Date().getTime() - new Date(item.updatedAt,).getTime()) <= 12 * 60 * 60 * 1000
										}
									/>
								)
							},)}
						</ul>
					</Collapse>
				}
				{portfolio.entities.map((entity,) => {
					const hasDocuments =
				entity.documents.length > 0 ||
				entity.assets.some((asset,) => {
					return asset.documents.length > 0
				},)
					return hasDocuments && <EntityDocumentsList key={entity.id} portfolio={portfolio} portfolioId={portfolio.id} entity={entity} portfolioName={portfolio.name}/>
				},)}
			</div>
		</div>
	)
}