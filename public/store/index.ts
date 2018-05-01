import { Store, createStore, combineReducers, AnyAction } from 'redux';

import * as DocumentReducers from './reducers/document';
import undoable, { StateWithHistory } from 'redux-undo';

import * as Document from './data/document';

export type Store = Store<any, AnyAction>;

export type ApplicationState = {
    document: StateWithHistory<Document.Document | undefined>
};

export const store = createStore(combineReducers({
    document: undoable(DocumentReducers.reducer, {
        ignoreInitialState: true,
        filter: (action, curr, prev) => !curr ? true : !Document.equals(curr, prev._latestUnfiltered)
    })
}));

export type Action = DocumentReducers.Action;

export type DispatchProps = {
    actions : {
        document : DocumentReducers.DispatchProps
    }
}

export type Dispatch = (action: AnyAction) => void;
export const mapDispatchToProps = (dispatch : Dispatch) => ({
    actions: {
        document: DocumentReducers.creators(dispatch)
    }
});