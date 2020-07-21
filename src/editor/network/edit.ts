import * as io from 'socket.io-client';

import { DispatchProps } from '../store';

import { Event } from '../io/events';
import { parseEvent } from '../io/parse';

export const connect = (updateFromServer: (event: Event) => void): SocketIOClient.Socket => {
    const socket = io(SERIATIM_EDIT_URL);

    socket.on('edit', (sEvent: any) => {
        const event = parseEvent(sEvent);
        if (!event)
            return;

        updateFromServer(event);
    });

    return socket;
};

export const sendEvent = (socket: SocketIOClient.Socket) => (event: Event) => socket.emit('edit', JSON.stringify(event));