import * as React from 'react'

import {
	ButtonsBlock,
} from '../buttons-block/buttons-block.component'
import type {
	Client,
} from '../../../../../../shared/types'
import {
	useComplianceCheckStore,
} from '../../../../../../store/compliance-check.store'
import {
	ClientDocumentsList,
	PortfolioDocumentsList,
} from '../documents-list'

import * as styles from './main-block.styles'

interface IMainBlockProps {
	userData : Client
}

export const MainBlock: React.FC<IMainBlockProps> = ({
	userData,
},) => {
	const {
		portfolioItems, items,
	} = useComplianceCheckStore()
	return (
		<div className={styles.mainBlock}>
			<ButtonsBlock userData={userData}/>
			<div className={styles.listsWrapper}>
				{Boolean(items.length > 0,) && <ClientDocumentsList userData={userData}/>}
				{portfolioItems.map((portfolio,) => {
					const hasDocuments =
				portfolio.documents.length > 0 ||
				portfolio.entities.some(
					(entity,) => {
						return entity.documents.length > 0 ||
						entity.assets.some((asset,) => {
							return asset.documents.length > 0
						},)
					},
				)
					return (
						hasDocuments && (
							<PortfolioDocumentsList key={portfolio.id} portfolio={portfolio} />
						)
					)
				},
				)}
			</div>
		</div>
	)
}