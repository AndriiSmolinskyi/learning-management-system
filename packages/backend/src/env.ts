import {
	cleanEnv,
	str,
	num,
} from 'envalid'

export default function checkEnv(): void {
	cleanEnv(process.env, {
		PORT:     num(),
		NODE_ENV: str(),

		FRONTEND_URL: str(),
		ADMIN_URL:    str(),
		DOMAIN_URL:   str(),

		DATABASE_URL: str(),

		JWT_ACCESS_SECRET:  str(),
		JWT_REFRESH_SECRET: str(),
		JWT_ACCESS_TTL:     str(),
		JWT_REFRESH_TTL:    str(),

		REDIS_HOST: str(),
		REDIS_PORT: num(),

		MAILGUN_API_KEY:        str(),
		MAILGUN_SENDER_ADDRESS: str(),
		MAILGUN_DOMAIN:         str(),
		MAILGUN_BASE_URL:       str(),
	},)
}