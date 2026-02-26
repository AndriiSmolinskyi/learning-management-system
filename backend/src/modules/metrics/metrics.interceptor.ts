import type {
	CallHandler,
	ExecutionContext,
	NestInterceptor,} from '@nestjs/common'
import {
	Injectable,
} from '@nestjs/common'
import type { Observable,} from 'rxjs'
import { tap, } from 'rxjs'
import { MetricsService, } from './metrics.service'
import { Summary, } from 'prom-client'
import { InjectMetric, } from '@willsoto/nestjs-prometheus'

 @Injectable()
export class MetricsInterceptor implements NestInterceptor {
	constructor(
private readonly metricsService: MetricsService,
		@InjectMetric('Metrics',)
	private readonly summary: Summary<string>,
	) {}

	public intercept(context: ExecutionContext, next: CallHandler,): Observable<unknown> {
		const now = Date.now()
		const req = context.switchToHttp().getRequest()
		const {method,} = req
		const route = req.route?.path ?? req.url

		return next.handle().pipe(
			tap(() => {
				const duration = Date.now() - now
				const res = context.switchToHttp().getResponse()
				const {statusCode,} = res
				this.metricsService.recordRequest(method, route, statusCode, duration,)
			},),
		)
	}
}
