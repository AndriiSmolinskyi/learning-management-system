import type {
	TBankAnalytics,
} from '../../../services/analytics/analytics.types'

// eslint-disable-next-line complexity
export const handleBankClickLogic = (
	data: TBankAnalytics,
	banksTableData: Array<TBankAnalytics>,
	filter: { tableAccountIds?: Array<string>; tableBankIds?: Array<string> },
	setTableAccountIds: (ids?: Array<string>) => void,
	setTableBankIds: (ids?: Array<string>) => void,
): void => {
	const bankEntries = banksTableData.filter((item,) => {
		return item.id === data.id
	},)

	const uniqueAccountIds = new Set(
		bankEntries
			.filter((item,) => {
				return item.accountId
			},)
			.map((item,) => {
				return item.accountId!
			},),
	)
	const hasMultipleAccounts = uniqueAccountIds.size > 1

	if (hasMultipleAccounts) {
		const bankAccountIds = Array.from(uniqueAccountIds,)

		const allAccountsSelected = bankAccountIds.every((accountId,) => {
			return filter.tableAccountIds?.includes(accountId,)
		},)

		if (allAccountsSelected) {
			const remainingAccounts = filter.tableAccountIds?.filter((accountId,) => {
				return !bankAccountIds.includes(accountId,)
			},)
			setTableAccountIds(remainingAccounts?.length ?
				remainingAccounts :
				undefined,)
		} else {
			const newAccountIds = [
				...(filter.tableAccountIds ?? []).filter((accountId,) => {
					return !bankAccountIds.includes(accountId,)
				},),
				...bankAccountIds,
			]
			setTableAccountIds(newAccountIds,)
		}
	} else if (uniqueAccountIds.size === 1) {
		const accountId = Array.from(uniqueAccountIds,)[0]!
		const isAccountSelected = filter.tableAccountIds?.includes(accountId,)

		if (isAccountSelected) {
			const remainingAccounts = filter.tableAccountIds?.filter((id,) => {
				return id !== accountId
			},)
			setTableAccountIds(remainingAccounts?.length ?
				remainingAccounts :
				undefined,)
		} else {
			setTableAccountIds([...(filter.tableAccountIds ?? []), accountId,],)
		}
	} else {
		const isSelected = filter.tableBankIds?.includes(data.id,)
		const currentBankIds = filter.tableBankIds ?? []
		let newBankIds: Array<string> | undefined

		if (isSelected) {
			newBankIds = currentBankIds.length === 1 ?
				undefined :
				currentBankIds.filter((item,) => {
					return item !== data.id
				},)
		} else {
			newBankIds = [...currentBankIds, data.id,]
		}

		setTableBankIds(newBankIds,)
	}
}
