import React from 'react'
import type {
	Client,
} from '../../../../../../shared/types'
import {
	localeString,
} from '../../../../../../shared/utils'

import * as styles from '../../clients.style'

interface IClientListItemProps {
	client: Client
}

export const ClientMockupListItem: React.FC<IClientListItemProps> = ({
	client,
},) => {
	return (
		<div className={styles.bodyMockupClientItem}>
			<div className={styles.bodyClientListItem}>
				<p className={styles.bodyClientListItemName(client.isActivated,)}>
					{client.firstName} {client.lastName}
				</p>
			</div>
			<div className={styles.bodyClientListItem}>
				<p className={styles.bodyClientListItemText(client.isActivated,)}>
					{client.emails[0]}
				</p>
			</div>
			<div className={styles.bodyClientListItem}>
				<p className={styles.bodyClientListItemText(client.isActivated,)}>
					{client.contacts[0]}
				</p>
			</div>
			<div className={styles.bodyClientListItem}>
				<p className={styles.bodyClientListItemText(client.isActivated,)}>
					{localeString(Number(0,), 'USD', 0, false,)}
				</p>
			</div>
			<div className={styles.bodyClientListItem}>
				<p className={styles.bodyClientListItemText(client.isActivated,)}>
					{new Date(client.createdAt,).toLocaleDateString('en-GB', {
						year:  'numeric',
						month: '2-digit',
						day:   '2-digit',
					},)
						.replace(/\//g, '.',)}
				</p>
			</div>
			<div className={styles.bodyClientListItem}>
				<p className={styles.bodyClientListItemText(client.isActivated,)}>Creating<span className={styles.dotAnimation()}/></p>
			</div>
		</div>
	)
}
