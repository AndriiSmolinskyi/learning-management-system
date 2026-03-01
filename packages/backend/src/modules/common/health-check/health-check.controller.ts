import { Controller, Get, HttpStatus, Logger, } from '@nestjs/common'
import { HealthCheckRoutes, } from './health-check.constants'
import { ApiTags, } from '@nestjs/swagger'

interface IHealthCheckResponse {
  status: HttpStatus
  timestamp: string
  uptime: number
  message?: string
}

@Controller(HealthCheckRoutes.HEALTH_CHECK,)
@ApiTags('AWS Health Check',)
export class HealthCheckController {
	private readonly logger: Logger = new Logger(HealthCheckController.name,)

	/**
		* Handles GET requests for the AWS Health Check endpoint.
		* Returns the current service status as an IHealthCheckResponse object.
		*
		* Response fields:
		* - status: HTTP response status code (OK - 200)
		* - timestamp: current time in ISO format (UTC)
		* - uptime: Node.js process uptime in seconds
		*
		* Also logs the request and response details for monitoring purposes.
		*
		* @returns {Promise<IHealthCheckResponse>} An object containing the service health status
	*/
  @Get()
	public async getAWSHealthCheck(): Promise<IHealthCheckResponse> {
		const response: IHealthCheckResponse = {
			status:    HttpStatus.OK,
			timestamp: new Date().toISOString(),
			uptime:    process.uptime(),
		}
		this.logger.log(`AWS Health Check: ${JSON.stringify(response,)}`,)
		return response
	}
}