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
	EditClientForm,
} from './edit-client-form.component'
import {
	useClientGet,
} from '../../hooks/use-client-get.hook'
import {
	useOldDocumentStore,
} from '../../store/edit-client-docs.store'
import {
	useDocumentStore,
} from '../../../../../../store/document.store'
import * as styles from './edit-client.style'

interface IEditClientDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  id: string
}

export const EditClientDrawer: React.FunctionComponent<IEditClientDrawerProps> = ({
	isOpen, onClose, id,
},) => {
	const {
		data,
	} = useClientGet(id,)
	const {
		clearDocuments,
	} = useDocumentStore()
	const {
		clearOldDocuments,
	} = useOldDocumentStore()

	const clientData = data ?
		data :
		null

	const handleClose = (): void => {
		clearDocuments()
		clearOldDocuments()
		onClose()
	}

	return (
		<div className={styles.EdiContainer}>
			<div className={styles.editHeader}>
				<h2 className={styles.editHeaderTitle}>Edit Client</h2>
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

			{clientData &&
					(
						<EditClientForm onClose={handleClose} clientData={clientData} />
					)}
		</div>
	)
}
