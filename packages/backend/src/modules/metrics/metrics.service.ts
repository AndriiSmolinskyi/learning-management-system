import type { OnModuleInit,} from '@nestjs/common'
import { Injectable, } from '@nestjs/common'
import { InjectMetric, } from '@willsoto/nestjs-prometheus'
import { collectDefaultMetrics, Registry, Summary, } from 'prom-client'

@Injectable()
export class MetricsService implements OnModuleInit {
	constructor(
    @InjectMetric('Metrics',)
    private summary: Summary<string>,
	) {}

	public async onModuleInit():Promise<void> {
		collectDefaultMetrics({ register: this.registry, },)
	}

	private readonly registry = new Registry()

	public readonly httpSummary = new Summary({
		name:        'http_request_duration_seconds',
		help:        'HTTP request duration in seconds',
		labelNames:  ['method', 'path', 'status',],
		percentiles: [0.5, 0.9, 0.99,],
		registers:   [this.registry,],
	},)

	public getRegistry(): Registry {
		return this.registry
	}

	public recordRequest(method: string, route: string, statusCode: number, duration: number,): void {
		this.summary.labels(method, route, statusCode.toString(),).observe(duration,)
	}
}
