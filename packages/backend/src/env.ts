import {
	cleanEnv,
	str,
	num,
} from 'envalid'

export default function checkEnv(): void {
	cleanEnv(process.env, {
		PORT:                          num(),
		NODE_ENV:                      str(),
		FRONTEND_URL:                  str(),
		ADMIN_URL:                     str(),
		DATABASE_URL:                  str(),
		JWT_PRIVATE_KEY:               str(),
		JWT_PUBLIC_KEY:                str(),
		JWT_PRIVATE_REFRESH_KEY:       str(),
		JWT_PUBLIC_REFRESH_KEY:        str(),
		AWS_S3_REGION:                 str(),
		AWS_ACCESS_KEY:                str(),
		AWS_SECRET_ACCESS_KEY:         str(),
		AWS_BUCKET_NAME:               str(),
		MSAL_GRAPH_API_ENDPOINT:       str(),
		MSAL_INVESTMEN_ANALYST_ID:     str(),
		MSAL_FAMILY_OFFICE_MANAGER_ID: str(),
		MSAL_BACK_OFFICE_MANAGER_ID:   str(),
		MSAL_BOOKKEEPER_ID:            str(),
		MAILGUN_API_KEY:               str(),
		MAILGUN_SENDER_ADDRESS:        str(),
		MAILGUN_DOMAIN:                str(),
		CBONDS_API_LOGIN:              str(),
		CBONDS_API_PASSWORD:           str(),
		SECRET_ENCRYPTION_KEY:         str(),
		REDIS_HOST:                    str(),
		REDIS_PORT:                    str(),
	},)
}
