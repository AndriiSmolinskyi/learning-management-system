import * as React from 'react'

import {
	ComplianceCheckbox,
} from '../checkbox/checkbox.component'
import type {
	IStoreEntity,
} from '../../../../../../store/compliance-check.store'
import {
	useComplianceCheckStore,
} from '../../../../../../store/compliance-check.store'
import {
	EntitySelect,
} from '../../../../../../assets/icons'
import {
	Collapse,
} from '@blueprintjs/core'
import {
	CollapseArrowIcon,
} from '../../../../../../assets/icons'
import {
	AssetDocumentsList,
} from './asset-documents-list.component'
import type {
	IStorePortfolio,
} from '../../../../../../store/compliance-check.store'
import * as styles from './documents-list.styles'

interface IEntityDocumentsListProps {
	entity : IStoreEntity
	portfolioId: string
	portfolioName: string
	portfolio : IStorePortfolio
}

export const EntityDocumentsList: React.FC<IEntityDocumentsListProps> = ({
	entity,
	portfolioId,
	portfolioName,
	portfolio,
},) => {
	const [isOpen, setIsOpen,] = React.useState<boolean>(false,)
	const {
		toggleEntityItem,
		toggleEntitySelectAll,
	} = useComplianceCheckStore()

	const sortedItems = [...entity.documents,].sort((a, b,) => {
		return new Date(b.updatedAt,).getTime() - new Date(a.updatedAt,).getTime()
	},)

	const handleSelectAllChange = (): void => {
		toggleEntitySelectAll(portfolioId, entity.id,)
	}
	React.useEffect(() => {
		if (entity.isCheckedAll) {
			setIsOpen(true,)
		}
	}, [entity.isCheckedAll,],)
	return (
		<div className={styles.entityListWrapper(Boolean(portfolio.documents.length === 0,),)}>
			{Boolean(entity.documents.length > 0,) &&
				<div className={styles.topHeader}>
					<div className={styles.selectAllBlock(Boolean(entity.documents.length === 0,),)}>
						{Boolean(entity.documents.length > 0,) && <ComplianceCheckbox
							key={entity.id}
							label={entity.id}
							isChecked={entity.isCheckedAll}
							onChange={() => {
								handleSelectAllChange()
							}}
							isSelectAll
						/>}
						<div>
							<p className={styles.iconClientText}><EntitySelect className={styles.usersIcon}/><span>Entity</span></p>
							<p className={styles.clientNameText}>{entity.name}</p>
						</div>
					</div>
					{Boolean(entity.documents.length > 0,) && <button className={styles.collapseArrowButton(isOpen,)} type='button' onClick={() => {
						setIsOpen(!isOpen,)
					}}><CollapseArrowIcon/></button>}
				</div>
			}
			<div className={styles.portfolioInnerContent(Boolean(entity.documents.length === 0,),)}>
				{Boolean(entity.documents.length > 0,) &&
					<Collapse isOpen={isOpen}>
						<ul className={styles.checkboxList}>
							{entity.documents.map((item,) => {
								return (
									<ComplianceCheckbox
										key={item.id}
										file={item}
										label={item.label}
										isChecked={item.isChecked}
										onChange={() => {
											toggleEntityItem(portfolioId, entity.id, item.id,)
										}}
										title={`${portfolioName} / ${entity.name}`}
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
				{entity.assets.map((asset,) => {
					const hasDocuments = asset.documents.length > 0
					return hasDocuments && <AssetDocumentsList
						key={asset.id}
						entity={entity}
						portfolioId={portfolioId}
						entityId={entity.id}
						asset={asset}
						portfolioName={portfolioName}
						entityName={entity.name}
					/>
				},)}
			</div>
		</div>
	)
}