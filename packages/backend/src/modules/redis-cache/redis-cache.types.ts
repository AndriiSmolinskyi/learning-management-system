import type { ParamsDictionary, } from 'express-serve-static-core'
import type { ParsedQs, } from 'qs'

export interface ICacheKeyInput extends Record<string, unknown> {
	method: string;
	url: string;
	body?: unknown;
	query?: ParsedQs;
	params?: ParamsDictionary;
	clientId?: string
 }

export type MutatingType = | 'portfolios'  | 'assets'  | 'clients'  | 'budgets'

export type CreatingType =  | 'assetsCreating'  | 'clientsCreating'  | 'budgetsCreating'

export type TRunWithRedisLock = {
	lockKey:  string,
	ttlMs:    number,
	callback: () =>  Promise<void>
}

export type TRedisLockKeyBuild = {
	context: string,
	operation: string,
	extra?: string | number,
}