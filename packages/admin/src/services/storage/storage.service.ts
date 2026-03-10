import type {
	STORAGE_KEYS,
} from './storage.types'

class StorageService {
	public setItem<T>(key: STORAGE_KEYS, data: T,): void {
		localStorage.setItem(key, JSON.stringify(data,),)
	}

	public removeItem(key: STORAGE_KEYS,): void {
		localStorage.removeItem(key,)
	}

	public getItem<T>(key: STORAGE_KEYS,): T | null {
		try {
			const serializedState = localStorage.getItem(key,)
			return serializedState ?
				JSON.parse(serializedState,) :
				null
		} catch (error) {
			this.setItem(key, null,)
			return null
		}
	}
}

export const storageService = new StorageService()

