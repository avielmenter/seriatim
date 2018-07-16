import * as React from 'react';
import { StateWithHistory } from 'redux-undo';

import { Store, createStore, combineReducers, AnyAction } from 'redux';

import { List } from 'immutable';

import * as DocumentReducers from './reducers/document';
import * as ErrorReducers from './reducers/errors';

import * as Document from './data/document';
import { Error } from './data/error';

export type ApplicationState = {
    errors: List<Error>,
    saving: boolean,
    document: StateWithHistory<Document.Document | null>
};

export const store = createStore(combineReducers({
    errors: ErrorReducers.reducer,
    document: DocumentReducers.reducer
}));

export type DispatchProps = {
    actions: {
        errors: ErrorReducers.DispatchProps,
        document: DocumentReducers.DispatchProps
    }
}

export type Dispatch = (action: AnyAction) => void;
export const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: {
        errors: ErrorReducers.creators(dispatch),
        document: DocumentReducers.creators(dispatch)
    }
});

export function handleClick<HTMLElement>(event: React.MouseEvent<HTMLElement>, callback: () => void): void {
    event.stopPropagation();
    callback();
}