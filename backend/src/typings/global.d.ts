/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-unused-vars */
declare namespace NodeJS {
    interface ProcessEnv {
      PORT: string
      NODE_ENV: string
      FRONTEND_URL: string
      ADMIN_URL: string
      DATABASE_URL: string
      JWT_PRIVATE_KEY: string
      JWT_PUBLIC_KEY: string
      JWT_PRIVATE_REFRESH_KEY: string
      JWT_PUBLIC_REFRESH_KEY: string
		MAILGUN_API_KEY: string
		MAILGUN_SENDER_ADDRESS: string
		MAILGUN_DOMAIN: string
		REDIS_HOST: string
		REDIS_PORT: string
    }
}
