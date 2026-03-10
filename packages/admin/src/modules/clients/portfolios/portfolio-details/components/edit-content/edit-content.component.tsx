import React from 'react'
import {
	ReactComponent as Xmark,
} from '../../../../../../assets/icons/xmark.svg'
import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../../../shared/components'
import {
	EditPortfolioForm,
} from './components/edit-form/edit-form.component'
import {
	useGetPortfolioById,
} from '../../../../../../shared/hooks'
import {
	useDocumentStore,
} from '../../../../../../store/document.store'
import {
	Drawer,
} from '../../../../../../shared/components'
import * as styles from './edit-content.styles'

interface IEditPortfolioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  id: string
}

export const EditPortfolioDrawer: React.FunctionComponent<IEditPortfolioDrawerProps> = ({
	isOpen, onClose, id,
},) => {
	const {
		data: portfolio,
	} = useGetPortfolioById(id,)
	const {
		clearDocuments,
	} = useDocumentStore()
	const handleClose = (): void => {
		onClose()
		clearDocuments()
	}
	return (
		<Drawer
			isOpen={isOpen}
			onClose={handleClose}
		>
			<div>
				<div className={styles.editHeader}>
					<h2 className={styles.editHeaderTitle}>{portfolio?.mainPortfolioId ?
						'Edit sub-portfolio' :
						'Edit portfolio'}</h2>
					<Button<ButtonType.ICON>
						onClick={handleClose}
						additionalProps={{
							btnType:   ButtonType.ICON,
							size:      Size.SMALL,
							icon:      <Xmark width={32} height={36} />,
							color:     Color.NONE,
						}}
					/>
				</div>
			</div>
			{portfolio && <EditPortfolioForm portfolio={portfolio} onClose={handleClose}/>}
		</Drawer>
	)
}
