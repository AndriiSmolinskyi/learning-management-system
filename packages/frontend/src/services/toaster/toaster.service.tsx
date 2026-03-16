import React from 'react'
import {
	match,
} from 'ts-pattern'
import type {
	Toaster,
} from '@blueprintjs/core'
import {
	Intent,
} from '@blueprintjs/core'

import Toast from '../../shared/components/toast/toast.component'

import {
	createToaster,
} from './toaster.utils'
import type {
	ToastType,
} from './toaster.types'
import type {
	IToastProps,
} from '../../shared/components/toast/toast.component'

class ToasterService {
	private toasterInstance: Toaster | null = null

	private async getToaster(): Promise<Toaster> {
		if (!this.toasterInstance) {
			this.toasterInstance = await createToaster()
		}
		return this.toasterInstance
	}

	private async showToast(message: React.ReactNode, toastType: ToastType,): Promise<void> {
		const intent = match(toastType,)
			.with('success', () => {
				return Intent.SUCCESS
			},)
			.with('error', () => {
				return Intent.DANGER
			},)
			.run()

		const toaster = await this.getToaster()

		toaster.show({
			message,
			intent,
		},)
	}

	public async showSuccessToast({
		message,
	}: Partial<IToastProps>,): Promise<void> {
		await this.showToast(
			<Toast
				message={message}
				toastType='success'
			/>,
			'success',
		)
	}

	public async showErrorToast({
		message,
	}: Partial<IToastProps>,): Promise<void> {
		await this.showToast(
			<Toast
				message={message}
				toastType='error'
			/>,
			'error',
		)
	}
}

export const toasterService = new ToasterService()
