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

	APP_GOOGLE_API_CLIENT_ID: string,
	APP_GOOGLE_API_CLIENT_SECRET: string,
	APP_GOOGLE_API_SCOPES: any, // json
	APP_GOOGLE_API_TOKEN: any, // json
}

export default _env_
