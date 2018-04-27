import { Document } from './document';
import { Item } from './item';

export interface ApplicationState {
	document: Document | undefined
}

const initialState : ApplicationState = { 
	document: undefined
};