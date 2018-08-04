import * as React from 'react';
import { StateWithHistory } from 'redux-undo';

import { Store, createStore, combineReducers, AnyAction } from 'redux';

import { List } from 'immutable';

import * as DocumentReducers from './reducers/document';
import * as ErrorReducers from './reducers/errors';
import * as StateReducers from './reducers';

import * as Document from './data/document';
import { Error } from './data/error';
import { Permissions } from './data/permissions';

export type ApplicationState = {
    errors: List<Error>,
    saving: boolean,
    permissions: Permissions | null,
    document: StateWithHistory<Document.Document | null>
};

const rootReducer = (state: ApplicationState | undefined, action: AnyAction): ApplicationState => {
    let appState = StateReducers.reducer(state, action);

    return {
        ...appState,
        errors: ErrorReducers.reducer(appState.errors, action),
        document: DocumentReducers.reducer(appState.document, action)
    };
};

export const store = createStore(rootReducer);

export type DispatchProps = {
    actions: StateReducers.DispatchProps & {
        errors: ErrorReducers.DispatchProps,
        document: DocumentReducers.DispatchProps
    }
}

export type Dispatch = (action: AnyAction) => void;
export const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: {
        ...StateReducers.creators(dispatch),
        errors: ErrorReducers.creators(dispatch),
        document: DocumentReducers.creators(dispatch)
    }
});

export function handleClick<HTMLElement>(event: React.MouseEvent<HTMLElement>, callback: () => void): void {
    event.stopPropagation();
    callback();
}