// src/metrics/metrics.controller.ts
import { Controller, Get, Res, } from '@nestjs/common'
import { Response, } from 'express'
import { MetricsService, } from './metrics.service'

@Controller()
export class MetricsController {
	constructor(private readonly metricsService: MetricsService,) {}

    @Get('/metrics',)
	public async getMetrics(@Res() res: Response,): Promise<void> {
		const registry = this.metricsService.getRegistry()
		res.setHeader('Content-Type', registry.contentType,)
		res.end(await registry.metrics(),)
	}
}