import * as React from 'react';
import { StateWithHistory } from 'redux-undo';

import { Store, createStore, combineReducers, AnyAction } from 'redux';

import { List } from 'immutable';

import * as DocumentReducers from './reducers/document';
import * as ErrorReducers from './reducers/error';
import * as ItemReducers from './reducers/item';
import * as StateReducers from './reducers';

import * as Document from '../io/document';
import { Error } from '../network/error';
import { Permissions } from '../../server';

export type ApplicationState = {
    errors: List<Error>,
    saving: boolean,
    permissions: Permissions | null,
    document: StateWithHistory<Document.Document | null>,
    clipboard: Document.Document | null
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
        document: DocumentReducers.DispatchProps,
        item: ItemReducers.DispatchProps,
    }
}

export type Dispatch = (action: AnyAction) => void;
export const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    actions: {
        ...StateReducers.creators(dispatch),
        errors: ErrorReducers.creators(dispatch),
        document: DocumentReducers.creators(dispatch),
        item: ItemReducers.creators(dispatch),
    }
});

export function handleClick<HTMLElement>(callback: (event: React.MouseEvent<HTMLElement>) => void) {
    return (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        callback(event);
    };
}