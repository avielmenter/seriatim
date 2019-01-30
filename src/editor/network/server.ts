import { List, Map } from 'immutable';

import { Item, ItemID } from '../store/data/item';
import { Document, ItemDictionary, updateItemIDs } from '../store/data/document';
import Style, { LengthUnit } from '../store/data/style';
import { Permissions } from '../store/data/permissions';
import { string } from 'prop-types';

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

type ServerDate = {
	secs_since_epoch: number
}

type ServerStyle = {
	property?: string,
	value_string?: string | null,
	value_number?: number | null,
	unit?: LengthUnit | null
}

type ServerItem = {
	item_id?: string,
	document_id?: string,
	parent_id?: string,
	text?: string,
	collapsed?: boolean,
	child_order?: number,
	styles?: { [key: string]: ServerStyle }
}

type ServerDocument = {
	document_id?: string,
	title?: string,
	parent_id?: string,
	root_item_id?: string,
	toc_item_id?: string | null,
	created_at?: ServerDate,
	modified_at?: ServerDate,
	items?: { [item_id: string]: ServerItem }
}

type ServerPermissions = {
	edit?: boolean
}

function parseServerStyle(sStyle: ServerStyle): Style | undefined {
	if (!sStyle.property)
		return undefined;

	switch (sStyle.property) {
		case "backgroundColor":
			return !sStyle.value_string ?
				undefined :
				{ property: "backgroundColor", value: sStyle.value_string };
		case "color":
			return !sStyle.value_string ?
				undefined :
				{ property: "color", value: sStyle.value_string };
		case "fontSize":
			return (!sStyle.value_number && sStyle.value_number != 0) || !sStyle.unit ?
				undefined :
				{ property: "fontSize", value: sStyle.value_number, unit: sStyle.unit };
		case "lineHeight":
			return (!sStyle.value_number && sStyle.value_number != 0) || !sStyle.unit ?
				undefined :
				{ property: "lineHeight", value: sStyle.value_number, unit: sStyle.unit };
		default:
			return undefined;
	}
}

function parseServerItem(sItem: ServerItem, root_id: string): Item | undefined {
	if (!sItem.item_id || sItem.parent_id === undefined || (sItem.text === undefined) || (sItem.child_order === undefined))
		return undefined;

	const itemID = sItem.item_id;
	const parentID = sItem.parent_id;
	const text = sItem.text;
	const collapsed = sItem.collapsed || false;

	if (itemID === undefined)
		return undefined;

	const styles = !sItem.styles ?
		Map<string, Style>() :
		Map<string, Style>(
			Object.values(sItem.styles).flatMap(ss => {
				const style = parseServerStyle(ss);
				return !style ? [] : [style];
			}).map(s => [s.property, s] as [string, Style])
		);

	return {
		itemID,
		parentID,
		text,
		view: {
			collapsed
		},
		children: List<ItemID>(),
		styles
	}
}

function parseServerPermissions(sPermissions: ServerPermissions): Permissions | undefined {
	if (sPermissions.edit === undefined)
		return undefined;

	return {
		edit: sPermissions.edit
	}
}

function parseServerDate(sDate: ServerDate | undefined): Date | undefined {
	return !sDate || !sDate.secs_since_epoch ? undefined : new Date(sDate.secs_since_epoch * 1000);
}

function parseServerDocument(sDoc: ServerDocument): Document | undefined {
	let serverItems = sDoc.items || {};

	const rootItemID = sDoc.root_item_id;
	const title = sDoc.title || "";

	const created_at = parseServerDate(sDoc.created_at);

	if (!rootItemID || !sDoc.document_id || !created_at)
		return undefined;

	let items = Object.keys(serverItems)
		.map(itemID => ({
			key: itemID,
			value: serverItems[itemID]
		}))
		.reduce((prev, curr) => {
			const item = parseServerItem(curr.value, rootItemID);

			if (!item)
				return prev;
			else
				return prev.set(curr.key, item);
		},
			Map<ItemID, Item>()
		);

	Object.keys(serverItems).forEach(k => {	// set up children arrays
		const curr = serverItems[k];
		if (curr.child_order === undefined || !curr.item_id)
			return;

		if (curr.parent_id && items.get(curr.parent_id)) {
			const parent = items.get(curr.parent_id);
			if (!parent)
				return;

			items = items.set(parent.itemID, {
				...parent,
				children: parent.children.set(curr.child_order, curr.item_id)
			});
		}
	});

	items.keySeq().toArray().forEach(itemID => { // collapse children arrays if they're for some reason sparse
		const item = items.get(itemID);
		if (!item)
			return;

		items = items.set(itemID, {
			...item,
			children: item.children.filter(child => child != undefined).toList()
		});
	});

	return {
		documentID: sDoc.document_id,
		lastModified: parseServerDate(sDoc.modified_at) || created_at,
		editedSinceSave: false,
		clipboard: undefined,
		selection: undefined,
		focusedItemID: rootItemID,
		rootItemID,
		tableOfContentsItemID: !sDoc.toc_item_id ? undefined : sDoc.toc_item_id,
		title,
		items
	}
}

function httpGet(url: string): Promise<Response> {
	return fetch(SERIATIM_SERVER_URL + url, {
		credentials: 'include',
		method: 'GET',
		mode: 'cors'
	});
}

function httpPost(url: string, body: any): Promise<Response> {
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

async function parseHttpResponse<TParsed, TRaw>(response: Response, parse: (raw: TRaw) => TParsed | undefined): Promise<SeriatimResponse<TParsed>> {
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

export async function fetchDocument(documentID: string): Promise<SeriatimResponse<Document>> {
	const response = await httpGet('document/' + documentID);
	const parsed = await parseHttpResponse(response, parseServerDocument);

	return parsed;
}

type EditStyle = {
	property: string,
	value_string?: string,
	value_number?: number,
	unit?: LengthUnit
}

type EditItem = {
	item_id: string,
	parent_id: string,
	child_order: number,
	item_text: string | undefined,
	children: string[],
	styles: EditStyle[]
}

type EditDocument = {
	root_item: string,
	toc_item: string | undefined,
	items: { [item_id: string]: EditItem }
}

function toEditStyle(style: Style): EditStyle {
	return {
		property: style.property,
		value_string: isNaN(style.value as number) ? String(style.value) : undefined,
		value_number: isNaN(style.value as number) ? undefined : style.value as number,
		unit: (style as any).unit
	}
}

function toEditItem(item: Item, child_order: number): EditItem {
	return {
		item_id: item.itemID,
		parent_id: item.parentID,
		item_text: item.text,
		child_order,
		children: item.children.toArray(),
		styles: item.styles.map(toEditStyle).valueSeq().toArray()
	}
}

async function saveDocumentStructure(documentID: string, currDoc: Document): Promise<SeriatimResponse<Map<ItemID, ItemID>>> {
	const editItems = currDoc.items.valueSeq()
		.map(item => {
			const parent = item.parentID ? currDoc.items.get(item.parentID) : undefined;
			const order = parent ? parent.children.indexOf(item.itemID) : 0;

			return [item.itemID, toEditItem(item, order)];
		}).toArray() as [string, EditItem][];

	const editDoc: EditDocument = {
		root_item: currDoc.rootItemID,
		toc_item: currDoc.tableOfContentsItemID,
		items: Map<string, EditItem>(editItems).toObject()
	};

	const response = await httpPost('document/' + documentID + '/edit', editDoc);

	return await parseHttpResponse(response,
		(raw: { [item_id: string]: string }) => Map<ItemID, ItemID>(Object.keys(raw).map(k => [k, raw[k]]) as [string, string][])
	);
}

async function saveDocumentText(documentID: string, currDoc: Document): Promise<SeriatimResponse<any>> {
	const textChanges = currDoc.items.valueSeq()
		.map(item => [item.itemID, item.text])
		.reduce((prev, curr) => prev.set(curr[0], curr[1]), Map<ItemID, string>())
		.toObject();

	const response = await httpPost('document/' + documentID + '/edit_text', textChanges);
	return await parseHttpResponse(response, (raw: any) => ({}));
}

export async function saveDocument(documentID: string, state: Document): Promise<SeriatimResponse<Map<ItemID, ItemID>>> {
	const structureResponse = await saveDocumentStructure(documentID, state);

	if (structureResponse.status == "error")
		return structureResponse;

	return structureResponse;
}

export async function makeCopy(documentID: string): Promise<SeriatimResponse<Document>> {
	const response = await httpPost('document/' + documentID + '/copy', undefined);
	return await parseHttpResponse(response, parseServerDocument);
}