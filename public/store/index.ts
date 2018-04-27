import { Store, createStore, combineReducers, AnyAction } from 'redux';

import * as DocumentReducers from './reducers/document';
import { ApplicationState } from './data';

export type Store = Store<any, AnyAction>;

export type ApplicationState = ApplicationState;

export const store : Store = createStore(combineReducers<ApplicationState>({
    document: DocumentReducers.reducer
}));

export type Action = DocumentReducers.Action;

export type DispatchProps = {
    actions : {
        document : DocumentReducers.DispatchProps
    }
}

export type Dispatch = (action: Action) => void;
export const mapDispatchToProps = (dispatch : Dispatch) => ({
    actions: {
        document: DocumentReducers.creators(dispatch)
    }
});