// tslint:disable:max-classes-per-file

declare module 'googleapis' {
	namespace google {
		namespace auth {
			class OAuth2 {
				public credentials: object
				constructor(clientId: string, clientSecret: string, redirectUri: string)

				generateAuthUrl(params: object): string

				getToken(code: string, callback: (err: Error | null, result: string) => void): void
			}
		}
		class SheetsApi {
			public spreadsheets: {
				values: {
					get(params: {
						auth: auth.OAuth2,
						spreadsheetId: string,
						range: string,
					}, callback: (err: Error | null, result: {
						values: string[][],
					}) => void): void,
				},
			}
		}

		function sheets(apiVersion: string): SheetsApi
	}

	export = google
}
