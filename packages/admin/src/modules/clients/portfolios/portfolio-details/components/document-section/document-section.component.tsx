import React from 'react'
import type {
	IPortfolioDetailed,
} from '../../../../../../shared/types'
import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../../../shared/components'
import {
	Plus,
	DocsIcon,
	FolderOpen,
	XmarkMid,
	MoreVertical,
	ArrowUpRight,
} from '../../../../../../assets/icons'
import {
	useGetDocumentsForPortfolioDetails,
} from '../../../../../../shared/hooks'
import {
	DocumentDialog,
} from './document-dialog.component'
import {
	Drawer,
} from '../../../../../../shared/components'
import {
	EditEntity,
} from '../entity'
import {
	EntityDrawer,
} from '../sub-items-list/entity-drawer.component'
import type {
	IEntity,
} from '../../../../../../shared/types'
import {
	useUserStore,
} from '../../../../../../store/user.store'
import {
	Roles,
} from '../../../../../../shared/types'

import * as styles from './document-section.style'

interface IPortfolioDetailsHeaderProps {
  portfolio: IPortfolioDetailed
}

export const DocumentSection: React.FC<IPortfolioDetailsHeaderProps> = ({
	portfolio,
},) => {
	const {
		data: entityDocs,
	} = useGetDocumentsForPortfolioDetails(portfolio.id,)
	const [activeButton, setActiveButton,] = React.useState<string | null>(null,)
	const [isEditEntityDrawerOpen, setIsEditEntityDrawerOpen,] = React.useState<boolean>(false,)
	const [entityModalData, setEntityModalData,] = React.useState<IEntity | null>(null,)
	const [isViewDrawerOpen, setIsViewDrawerOpen,] = React.useState<boolean>(false,)
	const [viewEntityData, setViewEntityData,] = React.useState<IEntity | null>(null,)
	const [isAllowed, setIsAllowed,] = React.useState<boolean>(false,)
	const {
		userInfo,
	} = useUserStore()
	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		if (hasPermission) {
			setIsAllowed(true,)
		}
	}, [],)
	return (
		<div className={styles.documentSectionBlock}>
			<div className={styles.documentHeader}>
				<h3 className={styles.documentHeaderTitle}>Documents</h3>
				<Button<ButtonType.TEXT>
					type='button'
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Add new',
						size:     Size.SMALL,
						color:    Color.BLUE,
						leftIcon: <Plus width={20} height={20}/>,
					}}
				/>
			</div>
			<div className={styles.docsBlock}>
				{entityDocs && Boolean(entityDocs.length > 0,) && entityDocs.map((doc, index,) => {
					return (
						<div key={index} className={styles.oldDoc}>
							<div className={styles.oldDocLeft}>
								<DocsIcon className={styles.docsIcon} />
								<div className={styles.oldDocTextBlock}>
									<p className={styles.docRoute}>
										<FolderOpen className={styles.folderIcon} />
										<span className={styles.textWrapper}>
											{portfolio.name}
											{doc.entityName && <span>/</span>}
											{doc.entityName}
											{doc.assetName && <span>/</span>}
											{doc.assetName}
										</span>

									</p>
									<span className={styles.oldDocTextType}>{doc.name}</span>
								</div>
							</div>
							<DocumentDialog
								setDialogOpen={(isOpen,) => {
									setActiveButton(isOpen ?
										doc.id :
										null,)
								}}
								onViewEntity={() => {
									const entity = portfolio.entities.find((entity,) => {
										return entity.id === doc.entityId
									},)
									if (entity) {
										setViewEntityData(entity,)
										setIsViewDrawerOpen(true,)
									}
								}}
								file={doc}
								onEditEntity={() => {
									const entity = portfolio.entities.find((entity,) => {
										return entity.id === doc.entityId
									},)
									if (entity) {
										setEntityModalData(entity,)
										setIsEditEntityDrawerOpen(true,)
									}
								}}
							>
								<Button<ButtonType.ICON>
									onClick={() => {
										setActiveButton(activeButton === doc.id ?
											null :
											doc.id,)
									}}
									additionalProps={{
										btnType: ButtonType.ICON,
										size:    Size.SMALL,
										color:   Color.SECONDRAY_GRAY,
										icon:
										activeButton === doc.id ?
											(
												<XmarkMid width={20} height={20} />
											) :
											(
												<MoreVertical width={20} height={20} />
											),
									}}
								/>
							</DocumentDialog>
						</div>
					)
				},)}
			</div>
			<Button<ButtonType.TEXT>
				className={styles.footerBtn}
				type='button'
				additionalProps={{
					btnType:   ButtonType.TEXT,
					text:      'View more',
					size:      Size.MEDIUM,
					color:     Color.SECONDRAY_COLOR,
					rightIcon: <ArrowUpRight width={20} height={20}/>,
				}}
			/>

			<Drawer
				isOpen={isEditEntityDrawerOpen}
				onClose={() => {
					setIsEditEntityDrawerOpen(false,)
				}}
				onClosed={() => {
					setEntityModalData(null,)
				}}
				isCloseButtonShown
			>
				{entityModalData && (
					<EditEntity
						entityModalData={entityModalData}
						onClose={() => {
							setIsEditEntityDrawerOpen(false,)
						}}
						portfolioName={portfolio.name}
					/>
				)}
			</Drawer>
			<Drawer
				isOpen={isViewDrawerOpen}
				onClose={() => {
					setIsViewDrawerOpen(false,)
				}}
			>
				{viewEntityData && (
					<EntityDrawer
						isOpen={isViewDrawerOpen}
						onClose={() => {
							setIsViewDrawerOpen(false,)
						}}
						entity={viewEntityData}
						isAllowed={isAllowed}
					/>
				)}
			</Drawer>

		</div>
	)
}
