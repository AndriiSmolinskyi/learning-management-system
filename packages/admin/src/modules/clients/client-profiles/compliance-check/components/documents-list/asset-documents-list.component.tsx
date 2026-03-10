import * as React from 'react'

import {
	ComplianceCheckbox,
} from '../checkbox/checkbox.component'
import type {
	IStoreAsset,
} from '../../../../../../store/compliance-check.store'
import {
	useComplianceCheckStore,
} from '../../../../../../store/compliance-check.store'
import {
	renderSelectIcon,
} from '../../../../portfolios/portfolio/components/drawer-content/components/form-asset'
import {
	Collapse,
} from '@blueprintjs/core'
import {
	CollapseArrowIcon,
} from '../../../../../../assets/icons'
import type {
	IStoreEntity,
} from '../../../../../../store/compliance-check.store'
import * as styles from './documents-list.styles'

interface IAssetDocumentsListProps {
	asset : IStoreAsset
	portfolioId: string
	entityId: string
	portfolioName: string
	entityName: string
	entity : IStoreEntity
}

export const AssetDocumentsList: React.FC<IAssetDocumentsListProps> = ({
	asset,
	portfolioId,
	entityId,
	portfolioName,
	entityName,
	entity,
},) => {
	const [isOpen, setIsOpen,] = React.useState<boolean>(false,)
	const {
		toggleAssetSelectAll,
		toggleAssetItem,
	} = useComplianceCheckStore()

	const sortedItems = [...asset.documents,].sort((a, b,) => {
		return new Date(b.updatedAt,).getTime() - new Date(a.updatedAt,).getTime()
	},)

	const handleSelectAllChange = (): void => {
		toggleAssetSelectAll(portfolioId, entityId, asset.id,)
	}
	React.useEffect(() => {
		if (asset.isCheckedAll) {
			setIsOpen(true,)
		}
	}, [asset.isCheckedAll,],)
	return (
		<div className={styles.assetListWrapper(Boolean(entity.documents.length === 0,),)}>
			<div className={styles.topHeader}>
				<div className={styles.selectAllBlock(Boolean(asset.documents.length === 0,),)}>
					{Boolean(asset.documents.length > 0,) && <ComplianceCheckbox
						key={asset.id}
						label={asset.id}
						isChecked={asset.isCheckedAll}
						onChange={() => {
							handleSelectAllChange()
						}}
						isSelectAll
					/>}
					<div>
						<p className={styles.iconClientText}><span className={styles.assetIcon}>{renderSelectIcon(asset.assetName,)}</span><span>Asset</span></p>
						<p className={styles.clientNameText}>{asset.assetName}</p>
					</div>
				</div>
				{Boolean(asset.documents.length > 0,) && <button className={styles.collapseArrowButton(isOpen,)} type='button' onClick={() => {
					setIsOpen(!isOpen,)
				}}><CollapseArrowIcon/></button>}
			</div>
			<div className={styles.portfolioInnerContent(Boolean(asset.documents.length === 0,),)}>
				<Collapse isOpen={isOpen}>
					<ul className={styles.checkboxList}>
						{asset.documents.map((item,) => {
							return (
								<ComplianceCheckbox
									key={item.id}
									file={item}
									label={item.label}
									isChecked={item.isChecked}
									onChange={() => {
										toggleAssetItem(portfolioId, entityId, asset.id, item.id,)
									}}
									title={`${portfolioName} / ${entityName} / ${asset.assetName}`}
									isNew={
										sortedItems[0]?.updatedAt === item.updatedAt &&
								(new Date().getTime() - new Date(item.updatedAt,).getTime()) <= 12 * 60 * 60 * 1000
									}
								/>
							)
						},)}
					</ul>
				</Collapse>
			</div>
		</div>
	)
}