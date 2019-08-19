export type Permissions = {
	readonly edit: boolean
}

export type ServerDate = {
	secs_since_epoch: number
}

export type ServerPermissions = {
	edit?: boolean
}

export type SeriatimSuccess<T> = {
	status: "success",
	permissions?: Permissions,
	timestamp: Date,
	data: T
}

export type SeriatimErrorCode
	= "INSUFFICIENT_PERMISSIONS"
	| "NOT_LOGGED_IN"
	| "TOO_FEW_LOGIN_METHODS"
	| "NOT_FOUND"
	| "DATABASE_ERROR"
	| "OTHER_ERROR";

export type SeriatimError = {
	status: "error",
	code: SeriatimErrorCode,
	error: string
}

export type SeriatimResponse<T> = SeriatimSuccess<T> | SeriatimError;

type SeriatimSuccessRaw<T> = {
	status: "success",
	permissions?: ServerPermissions,
	timestamp?: ServerDate,
	data: T
}

type SeriatimResponseRaw<T> = SeriatimSuccessRaw<T> | SeriatimError;

export function parseServerPermissions(sPermissions: ServerPermissions): Permissions | undefined {
	if (sPermissions.edit === undefined)
		return undefined;

	return {
		edit: sPermissions.edit
	}
}

export function parseServerDate(sDate: ServerDate | undefined): Date | undefined {
	return !sDate || !sDate.secs_since_epoch ? undefined : new Date(sDate.secs_since_epoch * 1000);
}

export function httpGet(url: string): Promise<Response> {
	return fetch(SERIATIM_SERVER_URL + url, {
		credentials: 'include',
		method: 'GET',
		mode: 'cors'
	});
}

export function httpPost(url: string, body: any): Promise<Response> {
	return fetch(SERIATIM_SERVER_URL + url, {
		credentials: 'include',
		method: 'POST',
		mode: 'cors',
		headers: !body ? undefined : {
			'Content-Type': 'application/json'
		},
		body: !body ? undefined : JSON.stringify(body)
	});
}

export async function parseHttpResponse<TParsed, TRaw>(response: Response, parse: (raw: TRaw) => TParsed | undefined): Promise<SeriatimResponse<TParsed>> {
	const responseJson = await response.json() as SeriatimResponseRaw<TRaw>;

	if (responseJson.status == "error")
		return responseJson as SeriatimError;

	const parsed = parse(responseJson.data);
	const timestamp = parseServerDate(responseJson.timestamp);

	if (!parsed || !timestamp) {
		return {
			status: "error",
			code: "OTHER_ERROR",
			error: "Could not parse response from server."
		}
	}

	return {
		status: "success",
		permissions: responseJson.permissions ? parseServerPermissions(responseJson.permissions) : undefined,
		timestamp,
		data: parsed
	}
}