import { httpGet, parseHttpResponse } from './server';

interface RedirectURL {
	url?: string
}

const parseRedirectURL = (redirectURL: RedirectURL): string => redirectURL.url || '';

export type LoginMethod = "Facebook" | "Google" | "Twitter";

export async function verifyLogin(loginMethod: LoginMethod, queryString: string, merge: boolean): Promise<string> {
	const url = 'login/' +
		loginMethod.toLowerCase() +
		(merge ? '/merge' : '/callback') +
		(queryString.startsWith('?') ? queryString : '?' + queryString);

	const callbackResponse = await httpGet(url);
	const redirectURL = await parseHttpResponse(callbackResponse, parseRedirectURL);

	if (redirectURL.status == "error")
		throw redirectURL.error;

	return redirectURL.data;
}
