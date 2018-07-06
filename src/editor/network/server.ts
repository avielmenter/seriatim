import { List, Map } from 'immutable';

import { Item, ItemID } from '../store/data/item';
import { Document, ItemDictionary, updateItemIDs } from '../store/data/document';

export type SeriatimSuccess<T> = {
	status: "success",
	data: T
}

export type SeriatimError = {
	status: "error",
	error: string
}

export type SeriatimResponse<T> = SeriatimSuccess<T> | SeriatimError;

type ServerDate = {
	secs_since_epoch: number
}

type ServerItem = {
	item_id: string,
	document_id: string,
	parent_id: string,
	text: string,
	collapsed: boolean,
	child_order: number
}

type ServerDocument = {
	document_id: string,
	title: string,
	parent_id: string,
	root_item_id: string,
	created_at: ServerDate,
	modified_at?: ServerDate,
	items?: { [item_id: string]: ServerItem }
}

function parseServerItem(sItem: ServerItem, root_id: string): Item {
	return {
		itemID: sItem.item_id,
		parentID: sItem.parent_id,
		text: sItem.text,
		view: {
			itemType: sItem.item_id == root_id ? "Title" : (
				sItem.text.match(/^#+\s+/i) ? "Header" : "Item"
			),
			collapsed: sItem.collapsed
		},
		children: List<ItemID>()
	}
}

function parseServerDocument(sDoc: ServerDocument): Document {
	let serverItems = sDoc.items || {};
	let items = Object.keys(serverItems)
		.map(itemID => ({
			key: itemID,
			value: serverItems[itemID]
		}))
		.reduce((prev, curr) => prev.set(curr.key, parseServerItem(curr.value, sDoc.root_item_id)),
			Map<ItemID, Item>()
		);

	Object.keys(serverItems).forEach(k => {	// set up children arrays
		const curr = serverItems[k];
		if (curr.parent_id && items.get(curr.parent_id)) {
			const parent = items.get(curr.parent_id);

			items = items.set(parent.itemID, {
				...parent,
				children: parent.children.set(curr.child_order, curr.item_id)
			});
		}
	});

	items.keySeq().toArray().forEach(itemID => { // collapse children arrays if they're for some reason sparse
		const item = items.get(itemID);
		items = items.set(itemID, {
			...item,
			children: item.children.filter(child => child != undefined).toList()
		});
	});

	return {
		clipboard: undefined,
		selection: undefined,
		focusedItemID: sDoc.root_item_id,
		rootItemID: sDoc.root_item_id,
		title: sDoc.title,
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
	console.log("SENDING TO " + url + ": " + JSON.stringify(body, null, '\t'));

	return fetch(SERIATIM_SERVER_URL + url, {
		credentials: 'include',
		method: 'POST',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});
}

async function parseHttpResponse<TParsed, TRaw>(response: Response, parse: (raw: TRaw) => TParsed): Promise<SeriatimResponse<TParsed>> {
	let responseJson = await response.json() as SeriatimResponse<TRaw>;
	console.log("RECEIVED FROM SERVER: " + JSON.stringify(responseJson, null, '\t'));

	if (responseJson.status == "error")
		return responseJson as SeriatimError;

	return {
		status: "success",
		data: parse(responseJson.data)
	}
}

export async function fetchDocument(documentID: string): Promise<SeriatimResponse<Document>> {
	let response = await httpGet('document/' + documentID);
	return parseHttpResponse(response, parseServerDocument);
}

type EditItem = {
	item_id: string,
	parent_id: string,
	child_order: number,
	item_text: string | undefined,
	children: string[]
}

type EditDocument = {
	root_item: string,
	items: { [item_id: string]: EditItem }
}

function toEditItem(item: Item, child_order: number): EditItem {
	return {
		item_id: item.itemID,
		parent_id: item.parentID,
		item_text: item.text,
		child_order,
		children: item.children.toArray()
	}
}

async function saveDocumentStructure(documentID: string, currDoc: Document): Promise<SeriatimResponse<Map<ItemID, ItemID>>> {
	const editItems = currDoc.items.valueSeq()
		.map(item => {
			const parent = item.parentID ? currDoc.items.get(item.parentID) : undefined;
			const order = parent ? parent.children.indexOf(item.itemID) : 0;

			return [item.itemID, toEditItem(item, order)];
		});

	const editDoc: EditDocument = {
		root_item: currDoc.rootItemID,
		items: Map<string, EditItem>(editItems).toObject()
	};

	const response = await httpPost('document/' + documentID + '/edit', editDoc);
	return await parseHttpResponse(response,
		(raw: { [item_id: string]: string }) => Map<ItemID, ItemID>(raw)
	);
}

async function saveDocumentText(documentID: string, currDoc: Document, ): Promise<SeriatimResponse<any>> {
	const textChanges = currDoc.items.valueSeq()
		.map(item => [item.itemID, item.text])
		.reduce((prev, curr) => prev.set(curr[0], curr[1]), Map<ItemID, string>())
		.toObject();

	const response = await httpPost('document/' + documentID + '/edit_text', textChanges);
	return await parseHttpResponse(response, (raw: any) => ({}));
}

export async function saveDocument(documentID: string, state: Document):
	Promise<SeriatimResponse<Map<ItemID, ItemID>>> {
	const structureResponse = await saveDocumentStructure(documentID, state);
	if (structureResponse.status == "error")
		return structureResponse;

	/*
const updatedState = updateItemIDs(state, structureResponse.data);

const textResponse = await saveDocumentText(documentID, updatedState);
if (textResponse.status == "error")
	return textResponse;*/

	return structureResponse;
}