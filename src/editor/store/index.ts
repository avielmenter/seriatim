import * as React from 'react';

import { Cmd, install, loop, Loop } from 'redux-loop';
import { StateWithHistory } from 'redux-undo';

import { compose, createStore, AnyAction, Reducer } from 'redux';

import { List } from 'immutable';

import * as DocumentReducers from './reducers/document';
import * as ErrorReducers from './reducers/error';
import * as ItemReducers from './reducers/item';
import * as StateReducers from './reducers';

import * as Document from '../io/document';
import { Event } from '../io/events';
import { Action as DocumentAction } from '../io/document/reducers';

import { Error } from '../network/error';
import { Permissions } from '../../server';

// TYPES

export type ApplicationState = {
    errors: List<Error>,
    saving: boolean,
    socket: SocketIOClient.Socket | undefined,
    permissions: Permissions | null,
    document: StateWithHistory<Document.Document | null>,
    clipboard: Document.Document | null
};

// REDUCER

const isDocumentAction = (action: AnyAction): action is DocumentAction => action.type == "AddItemAfterSibling"
    || action.type == "AddTableOfContents"
    || action.type == "AddItemToParent"
    || action.type == "DecrementFocus"
    || action.type == "IncrementFocus"
    || action.type == "IndentItem"
    || action.type == "IndentSelection"
    || action.type == "InitializeDocument"
    || action.type == "MakeHeader"
    || action.type == "MakeItem"
    || action.type == "MakeSelectionHeader"
    || action.type == "MakeSelectionItem"
    || action.type == "MarkSaved"
    || action.type == "MarkUnsaved"
    || action.type == "MultiSelect"
    || action.type == "Paste"
    || action.type == "RefreshTableOfContents"
    || action.type == "RemoveItem"
    || action.type == "RemoveSelection"
    || action.type == "SetFocus"
    || action.type == "ToggleItemCollapse"
    || action.type == "UnindentItem"
    || action.type == "UnindentSelection"
    || action.type == "UpdateItem"
    || action.type == "UpdateItemIDs"
    || action.type == "UpdateSelection";

const sendEditEvent = (socket: SocketIOClient.Socket, event: Event) => () => socket.send('edit', event);

const reducer = (state: ApplicationState | undefined, action: AnyAction): Loop<ApplicationState> => {
    const appState = StateReducers.reducer(state, action);

    const cmd = isDocumentAction(action) && state?.socket
        ? Cmd.run(sendEditEvent(state.socket, { code: "UPDATE_DOCUMENT", data: action }))
        : Cmd.none;

    return loop({
        ...appState,
        errors: ErrorReducers.reducer(appState.errors, action),
        document: DocumentReducers.reducer(appState.document, action)
    }, cmd);
};

export const store = createStore(reducer as any as Reducer<ApplicationState, AnyAction>, undefined, compose(install()));

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