import { Module, } from '@nestjs/common'
import { APP_INTERCEPTOR, } from '@nestjs/core'
import { PrometheusModule, makeSummaryProvider ,} from '@willsoto/nestjs-prometheus'
import { MetricsService, } from './metrics.service'
import { MetricsInterceptor, } from './metrics.interceptor'
import { MetricsController, } from './metrics.controller'

@Module({
	imports: [
		PrometheusModule.register({
			path:           '/metrics',
			defaultMetrics: {
				enabled: true,
			},
		},),
	],
	providers: [
		MetricsService,
		makeSummaryProvider({
			name:        'Metrics',
			help:        'Summary of HTTP request durations in ms',
			labelNames:  ['method', 'route', 'status_code',],
			percentiles: [],
		},),
		{
			provide:  APP_INTERCEPTOR,
			useClass: MetricsInterceptor,
		},
	],
	controllers: [MetricsController,],
	exports:     [
		MetricsService,
	],
},)
export class MetricsModule {}