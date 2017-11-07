declare const _env_: {
	NODE_ENV: string,

	APP_IS_PRODUCTION: boolean,
	APP_ROOT_PATH: string,
	APP_VERSION: string,

	APP_GRACEFUL_SHUTDOWN_TIMEOUT_MS: number, // integer
	APP_GRACEFUL_SHUTDOWN_HTTP_CONNECTION_TIMEOUT_MS: number, // integer

	APP_HTTP_IP: string,
	APP_HTTP_PORT: number, // integer

	APP_BASIC_AUTH_REALM: string,
	APP_BASIC_AUTH_NAME: string,
	APP_BASIC_AUTH_PASSWORD: string,

	APP_DATABASE_HOST: string,
	APP_DATABASE_PORT: number, // integer
	APP_DATABASE_NAME: string,
	APP_DATABASE_USERNAME: string,
	APP_DATABASE_PASSWORD: string,
	APP_DATABASE_POOL_MIN: number, // integer
	APP_DATABASE_POOL_MAX: number, // integer

	APP_EVENTBRITE_PERSONAL_TOKEN: string,

	APP_GOOGLE_API_CLIENT_ID: string,
	APP_GOOGLE_API_CLIENT_SECRET: string,
	APP_GOOGLE_API_REDIRECT_URI: string,
	APP_GOOGLE_API_REDIRECT_SCOPES: any, // json

	APP_CONTACT_EMAIL: string,
}

export default _env_
