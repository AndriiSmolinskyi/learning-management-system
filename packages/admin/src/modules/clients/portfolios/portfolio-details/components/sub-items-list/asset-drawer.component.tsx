import React from 'react'
import {
	type IAsset,
	Roles,
} from '../../../../../../shared/types'
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
	useGetDocumentTypes,
} from '../../../../../../shared/hooks/list-hub'
import {
	useGetDocumentsByAssetId,
} from '../../../../../../shared/hooks'
import {
	useUserStore,
} from '../../../../../../store/user.store'
import {
	renderAssetDetails,
} from './asset-types/asset-details.utils'
import {
	handleDownload,
} from '../../../../../../services/document/document.util'

import * as styles from './sub-items.style'

interface IAssetDrawerProps {
		isOpen: boolean;
		onClose: () => void;
		asset: IAsset;
		onEditAsset?: (asset: IAsset) => void
		onTransferClick?: () => void
}

export const AssetDrawer: React.FC<IAssetDrawerProps> = ({
	isOpen, onClose, asset, onEditAsset, onTransferClick,
},) => {
	const [isAllowed, setIsAllowed,] = React.useState<boolean>(false,)

	const {
		userInfo,
	} = useUserStore()

	const {
		data: documentTypes,
	} = useGetDocumentTypes()
	const {
		data: assetDocs,
	} = useGetDocumentsByAssetId(asset.id,)

	const updatedDocumentTypes = documentTypes?.map((type,) => {
		return {
			label: type.name,
			value: type.name,
		}
	},)
	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		if (hasPermission) {
			setIsAllowed(true,)
		}
	}, [],)
	return (
		<Drawer
			isOpen={isOpen}
			onClose={onClose}
		>
			<div
				className={styles.drawerBlock}
				onClick={(e,) => {
					e.stopPropagation()
				}}
			>
				<div className={styles.drawerHeader}>
					<h2 className={styles.drawerHeaderTitle}>Asset details</h2>
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
				<div className={styles.drawerBody}>
					{renderAssetDetails(asset,)}
					<div className={styles.docsBlock}>
						{assetDocs && assetDocs.length !== 0 && assetDocs.map((doc, index,) => {
							const docTypeLabel = updatedDocumentTypes?.find((type,) => {
								return type.value === doc.type
							},)?.label ?? 'Unknown'
							return (
								<div key={index} className={styles.oldDoc}>
									<div className={styles.oldDocLeft}>
										<DocsIcon className={styles.docsIcon} />
										<div className={styles.oldDocTextBlock}>
											<span className={styles.oldDocTextType}>{docTypeLabel}</span>
											<span className={styles.oldDocTextFormat}>
												{doc.format.toLocaleUpperCase()}
											</span>
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
						},)}
					</div>
				</div>
				<div className={styles.drawerFooter}>
					{isAllowed && onTransferClick && <Button
						disabled
						additionalProps={{
							btnType:  ButtonType.TEXT,
							size:     Size.MEDIUM,
							text:     'Transfer',
							color:    Color.SECONDRAY_COLOR,
							leftIcon: <PenSquare width={20} height={20}/>,
						}}
						onClick={onTransferClick}
					/>}
					{isAllowed && <Button
						onClick={() => {
							onEditAsset?.(asset,)
						}}
						disabled
						additionalProps={{
							btnType:  ButtonType.TEXT,
							size:     Size.MEDIUM,
							text:     'Edit',
							color:    Color.SECONDRAY_COLOR,
							leftIcon: <PenSquare width={20} height={20}/>,
						}}
					/>}
				</div>
			</div>
		</Drawer>
	)
}
