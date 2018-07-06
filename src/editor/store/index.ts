import * as React from 'react';

import { Store, createStore, combineReducers, AnyAction } from 'redux';

import * as DocumentReducers from './reducers/document';
import undoable, { groupByActionTypes, StateWithHistory } from 'redux-undo';

import * as Document from './data/document';

export type ApplicationState = {
    document: StateWithHistory<Document.Document | undefined>
};

export const store = createStore(combineReducers({
    document: undoable(DocumentReducers.reducer, {
        groupBy: groupByActionTypes("UpdateItemText"),
        ignoreInitialState: true,
        filter: (action, curr, prev) => !curr ? true : !DocumentReducers.skipHistoryFor.includes(action.type) && !Document.equals(curr, prev._latestUnfiltered)
    })
}));

export type DispatchProps = {
    actions: {
        document: DocumentReducers.DispatchProps
    }
}

export type Dispatch = (action: AnyAction) => void;
export const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: {
        document: DocumentReducers.creators(dispatch)
    }
});

export function handleClick<HTMLElement>(event: React.MouseEvent<HTMLElement>, callback: () => void): void {
    event.stopPropagation();
    callback();
}