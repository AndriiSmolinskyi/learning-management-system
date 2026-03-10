import React, {
	useState,
} from 'react'
import {
	Button, ButtonType, Size, Color,
} from '../../../../../shared/components'
import {
	XmarkSecond,
	RequestTitleIcon,
	Indent,
} from '../../../../../assets/icons'
import {
	useRequestsList,
} from '../../../../../shared/hooks/requests'
import type {
	IRequest,
} from '../../../../../shared/types'
import {
	OrderType,
} from '../../../../../shared/types'
import type {
	RequestType,
} from '../../../../../shared/types'
import {
	SelectComponent,
} from '../../../../../shared/components'
import * as styles from './modal-style'

interface IOrdersSelectReqProps {
   onClose: () => void;
   handleOpenDrawer: () => void;
   onSelectRequests: (requests: IRequest | null) => void;
	orderType?: OrderType;
}

interface IOptionType {
    value: number;
    label: string;
}

export const OrdersSelectReq: React.FC<IOrdersSelectReqProps> = ({
	onClose,
	handleOpenDrawer,
	onSelectRequests,
	orderType = OrderType.SELL,
},) => {
	const {
		data: allRequestList,
	} = useRequestsList()

	const [selectedRequest, setSelectedRequest,] = useState<IRequest | null>(null,)

	const isRequestType = (type: string,): type is RequestType => {
		return type === 'Sell' || type === 'Buy'
	}
	const requestList = allRequestList?.filter((request,) => {
		return isRequestType(orderType,) && request.type === orderType && request.client?.isActivated && request.portfolio?.isActivated
	},) ?? []

	const handleContinue = (): void => {
		if (!selectedRequest) {
			return
		}
		handleOpenDrawer()
		onClose()
	}

	const formattedRequestList: Array<IOptionType> = requestList.map((request,) => {
		return {
			value: request.id,
			label: `${request.id}`,
		}
	},)

	return (
		<div className={styles.addModalBlock}>
			<div className={styles.addModalCancel}>
				<Button<ButtonType.ICON>
					onClick={onClose}
					additionalProps={{
						btnType: ButtonType.ICON,
						icon:    <XmarkSecond width={24} height={24} />,
						size:    Size.MEDIUM,
						color:   Color.NONE,
					}}
				/>
			</div>
			<RequestTitleIcon width={42} height={42} className={styles.addModalImg} />
			<h3 className={styles.addModalTitle}>Select {orderType.toLowerCase()} requests</h3>
			<p className={styles.addModalText}>
				Please select one request (enter request ID or portfolio name) to continue with {orderType.toLowerCase()} order creation.
			</p>
			<SelectComponent
				placeholder='Select requests'
				options={formattedRequestList}
				onChange={(option,) => {
					if (!option || 'length' in option) {
						setSelectedRequest(null,)
						return
					}
					const foundRequest = requestList.find((req,) => {
						return req.id === option.value
					},) ?? null
					setSelectedRequest(foundRequest,)
					onSelectRequests(foundRequest,)
				}}
				leftIcon={<Indent width={18} height={18} />}
			/>

			<div className={styles.addModalBtns}>
				<Button<ButtonType.TEXT>
					onClick={onClose}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Cancel',
						size:    Size.MEDIUM,
						color:   Color.SECONDRAY_GRAY,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={handleContinue}
					disabled={!selectedRequest}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Continue',
						size:    Size.MEDIUM,
						color:   Color.BLUE,
					}}
				/>
			</div>
		</div>
	)
}
