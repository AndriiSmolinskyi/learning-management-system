/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-unused-vars */

interface ImportMetaEnv {
   readonly VITE_PORT: number
	readonly VITE_BACKEND_URL: string
	readonly VITE_CLIENT_PORTAL: string

   readonly VITE_CLOUD_INSTANCE: string
   readonly VITE_TENANT_ID: string
   readonly VITE_CLIENT_ID: string
   readonly VITE_REDIRECT_URI: string
	readonly VITE_GRAPH_API_ENDPOINT: string
	readonly VITE_FAMILY_OFFICE_MANAGER_ID: string
	readonly VITE_BACK_OFFICE_MANAGER_ID: string
	readonly VITE_INVESTMEN_ANALYST_ID: string
	readonly VITE_BOOKKEEPER_ID: string

   readonly VITE_TINY_MCE_API_KEY: string
}

interface ImportMeta {
   readonly env: ImportMetaEnv
}