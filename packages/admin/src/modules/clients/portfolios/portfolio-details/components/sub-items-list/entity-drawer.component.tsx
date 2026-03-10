/* eslint-disable complexity */
import React from 'react'

import {
	Button,
	ButtonType,
	Size,
	Color,
	Drawer,
} from '../../../../../../shared/components'
import {
	PenSquare,
	XmarkSecond,
	Download,
	DocsIcon,
} from '../../../../../../assets/icons'
import {
	cx,
} from '@emotion/css'
import {
	useGetDocumentsByEntityId,
} from '../../../../../../shared/hooks'
import {
	useGetDocumentTypes,
} from '../../../../../../shared/hooks/list-hub'
import type {
	IPortfolio,
} from '../../../../../../shared/types'
import type {
	IEntity,
} from '../../../../../../shared/types'
import {
	handleDownload,
} from '../../../../../../services/document/document.util'

import * as styles from './sub-items.style'

interface IEntityDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	entity: IEntity;
	portfolio?: IPortfolio
	onEditEntity?: (entity: IEntity) => void
	isAllowed: boolean
}

export const EntityDrawer: React.FC<IEntityDrawerProps> = ({
	isOpen, onClose, entity, onEditEntity, isAllowed,
},) => {
	const {
		data: documentTypes,
	} = useGetDocumentTypes()
	const {
		data: entityDocs,
	} = useGetDocumentsByEntityId(entity.id,)

	const updatedDocumentTypes = documentTypes?.map((type,) => {
		return {
			label: type.name,
			value: type.name,
		}
	},)

	return (
		<Drawer
			isOpen={isOpen}
			onClose={onClose}
		>
			<div className={styles.drawerBlock}>
				<div className={styles.drawerHeader}>
					<h2 className={styles.drawerHeaderTitle}>Entity details</h2>
					<Button<ButtonType.ICON>
						onClick={onClose}
						additionalProps={{
							btnType:  ButtonType.ICON,
							icon:     <XmarkSecond width={20} height={20}/>,
							size:     Size.SMALL,
							color:    Color.NONE,
						}}
					/>
				</div>
				<div className={styles.drawerContainer}>
					<div className={styles.drawerContent}>
						<div className={styles.drawerItemBorder}>
							<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
								<p className={styles.drawerTypeText}>Name</p>
								<p className={styles.drawerText}>{entity.name}</p>
							</div>
							<div className={styles.drawerTextBlock}>
								<p className={styles.drawerTypeText}>Country</p>
								<p className={styles.drawerText}>{entity.country}</p>
							</div>
						</div>
						{ isAllowed &&
						<div className={cx(styles.drawerTextBlock, styles.drawerItemBorder,)}>
							<p className={styles.drawerTypeText}>Authorized signatory</p>
							<p className={styles.drawerText}>{entity.authorizedSignatoryName}</p>
						</div>
						}
						{isAllowed &&
							<div className={styles.drawerItemBorder}>
								{entity.email &&
									<div className={cx(
										styles.drawerTextBlock,
										entity.email && styles.drawerBorderBottom,
									)}>
										<p className={styles.drawerTypeText}>Authorized person</p>
										<p className={styles.drawerText}>{entity.firstName} {entity.lastName}</p>
									</div>
								}
								{entity.email &&
									<div className={styles.drawerTextBlock}>
										<p className={styles.drawerTypeText}>Email</p>
										<p className={styles.drawerText}>{entity.email}</p>
									</div>
								}
							</div>
						}
					</div>
					<div className={styles.docsBlock}>
						{entityDocs?.length ?
							(
								entityDocs.map((doc, index,) => {
									const docTypeLabel = updatedDocumentTypes?.find((type,) => {
										return type.value === doc.type
									},)?.label ?? 'Unknown'
									return (
										<div key={index} className={styles.oldDoc}>
											<div className={styles.oldDocLeft}>
												<DocsIcon className={styles.docsIcon} />
												<div className={styles.oldDocTextBlock}>
													<span className={styles.oldDocTextType}>{docTypeLabel}</span>
													<span className={styles.oldDocTextFormat}>{doc.format.toLocaleUpperCase()}</span>
												</div>
											</div>
											<Button
												type='button'
												onClick={async() => {
													return handleDownload(doc.storageName,)
												}}
												disabled={false}
												additionalProps={{
													btnType: ButtonType.ICON,
													size:    Size.SMALL,
													color:   Color.SECONDRAY_GRAY,
													icon:    <Download />,
												}}
											/>
										</div>
									)
								},)
							) :
							null}
					</div>
				</div>

				<div className={styles.drawerFooter}>
					{ isAllowed &&
						<Button
							onClick={() => {
								onClose()
								onEditEntity?.(entity,)
							}}
							additionalProps={{
								btnType:  ButtonType.TEXT,
								size:     Size.MEDIUM,
								text:     'Edit',
								color:    Color.SECONDRAY_COLOR,
								leftIcon: <PenSquare width={20} height={20}/>,
							}}
						/>
					}
				</div>
			</div>
		</Drawer>
	)
}
